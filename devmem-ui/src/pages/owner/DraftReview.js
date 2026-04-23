import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import MainLayout from '../../components/Layout/MainLayout';
import { COLORS } from '../../styles/theme';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const DraftReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deviation, setDeviation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMemo, setEditedMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachedFileName, setAttachedFileName] = useState('');

  useEffect(() => {
    const fetchDeviation = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/deviation/${id}`);
        setDeviation(response.data);
        setEditedMemo(response.data.deviation_memo_draft || '');
        setAttachedFileName(response.data.document_filename || '');
      } catch (err) {
        setError('Failed to load deviation details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeviation();
  }, [id]);

  const handleSaveMemo = async () => {
    setSaving(true);
    try {
      const payload = {
        memo: editedMemo,
      };

      if (selectedFile) {
        payload.document_filename = selectedFile.name;
        payload.document_content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result || '').toString().split(',')[1] || '');
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      await axios.put(`http://localhost:8000/deviation/${id}/update-memo`, payload);
      setDeviation((prev) => ({
        ...prev,
        deviation_memo_draft: editedMemo,
        document_filename: selectedFile ? selectedFile.name : prev.document_filename,
      }));
      if (selectedFile) {
        setAttachedFileName(selectedFile.name);
        setSelectedFile(null);
      }
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save memo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendForReview = async () => {
    setSending(true);
    try {
      // Save any edits first
      if (isEditing || selectedFile) {
        const payload = {
          memo: editedMemo,
          comments: 'Owner updated memo before submission',
        };

        if (selectedFile) {
          payload.document_filename = selectedFile.name;
          payload.document_content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result || '').toString().split(',')[1] || '');
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
        }

        await axios.put(`http://localhost:8000/deviation/${id}/update-memo`, payload);
      }

      // Rejected items must be resubmitted through Owner -> QA flow
      if (deviation?.status === 'Owner Review' || deviation?.status === 'Rework Required') {
        await axios.put(`http://localhost:8000/deviation/${id}/resubmit`, {
          role: 'DM Owner',
          comments: 'Owner revised memo and resubmitted to QA',
        });
      } else {
        await axios.put(`http://localhost:8000/deviation/${id}/send-for-review`, {
          comments: 'Owner submitted draft for QA review',
        });
      }

      setSent(true);
      setTimeout(() => {
        navigate('/owner/investigations');
      }, 2000);
    } catch (err) {
      setError('Failed to send for review.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteDraft = async () => {
    const confirmed = window.confirm('Delete this draft deviation? This action cannot be undone.');
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:8000/deviation/${id}`);
      navigate('/owner/investigations');
    } catch (err) {
      setError('Failed to delete draft deviation.');
    } finally {
      setDeleting(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setAttachedFileName(file.name);
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ ml: 2, color: COLORS.text.secondary }}>
            Loading AI-generated draft...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  if (error && !deviation) {
    return (
      <MainLayout>
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      </MainLayout>
    );
  }

  const rootCauses = deviation?.root_cause?.causes || deviation?.root_cause || [];
  const capa = deviation?.capa || {};
  const correctiveActions = deviation?.corrective_actions || (capa?.corrective || (Array.isArray(capa) ? capa : null)) || [];
  const preventiveActions = deviation?.preventive_actions || capa?.preventive || [];
  const rejectionHistory = (deviation?.history || [])
    .filter((h) => h.action === 'approver_rejected' || h.action === 'qa_rejected')
    .slice()
    .reverse();

  const renderActions = (actions) => {
    if (!actions || (Array.isArray(actions) && actions.length === 0)) return <Typography variant="body2">No actions available.</Typography>;
    if (Array.isArray(actions)) {
      return actions.map((action, idx) => (
        <Typography key={idx} variant="body2" sx={{ mb: idx < actions.length - 1 ? 1 : 0 }}>
          • {typeof action === 'string' ? action : JSON.stringify(action)}
        </Typography>
      ));
    }
    return <Typography variant="body2">{typeof actions === 'string' ? actions : JSON.stringify(actions, null, 2)}</Typography>;
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: 2,
              background: 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SmartToyIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.text.primary, letterSpacing: '-0.5px' }}>
                AI Draft Review
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                Review the AI-generated investigation memo before sending for QA review
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`DEV-${String(deviation?.id).padStart(4, '0')}`}
            sx={{ fontWeight: 700, fontSize: '0.85rem', backgroundColor: '#E3F2FD', color: '#1565C0' }}
          />
        </Box>
      </Box>

      {sent && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} icon={<CheckCircleIcon />}>
          Deviation sent for QA investigation! Redirecting...
        </Alert>
      )}
      {error && deviation && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Deviation Summary */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.text.primary }}>
              Deviation Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ backgroundColor: '#F5F7FA', p: 3, borderRadius: 1, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography variant="overline" sx={{ color: COLORS.text.secondary, letterSpacing: '0.1em' }}>
                    Product / Study
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.text.primary, mt: 1 }}>
                    {deviation?.study || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ backgroundColor: '#F5F7FA', p: 3, borderRadius: 1, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography variant="overline" sx={{ color: COLORS.text.secondary, letterSpacing: '0.1em' }}>
                    Date
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.text.primary, mt: 1 }}>
                    {deviation?.date || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#F5F7FA', p: 3, borderRadius: 1, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Typography variant="overline" sx={{ color: COLORS.text.secondary, letterSpacing: '0.1em' }}>
                        Severity
                      </Typography>
                      <Chip
                        label={deviation?.severity}
                        size="large"
                        sx={{
                          fontWeight: 700,
                          mt: 1,
                          py: 1.25,
                          px: 2,
                          fontSize: '1.1rem',
                          minHeight: 48,
                          backgroundColor: deviation?.severity === 'High' ? '#FFEBEE' : deviation?.severity === 'Medium' ? '#FFF3E0' : '#E8F5E9',
                          color: deviation?.severity === 'High' ? '#D32F2F' : deviation?.severity === 'Medium' ? '#F57C00' : '#388E3C',
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ backgroundColor: '#F5F7FA', p: 3, borderRadius: 1, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Typography variant="overline" sx={{ color: COLORS.text.secondary, letterSpacing: '0.1em' }}>
                        Status
                      </Typography>
                      <Chip
                        label={deviation?.status}
                        size="large"
                        sx={{
                          fontWeight: 700,
                          mt: 1,
                          py: 1.25,
                          px: 2,
                          fontSize: '1.1rem',
                          minHeight: 48,
                          backgroundColor: '#E8EAF6',
                          color: '#283593',
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* Root Cause Analysis */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.text.primary }}>
              Root Cause Analysis (AI-Generated)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper sx={{ p: 2, backgroundColor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
              {Array.isArray(rootCauses) ? rootCauses.map((cause, idx) => (
                <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>• {typeof cause === 'string' ? cause : JSON.stringify(cause)}</Typography>
              )) : (
                <Typography variant="body2">{typeof rootCauses === 'string' ? rootCauses : JSON.stringify(rootCauses, null, 2)}</Typography>
              )}
            </Paper>
          </Paper>

          {/* CAPA */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.text.primary }}>
              CAPA (AI-Generated)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, backgroundColor: '#E8F5E9', borderLeft: '4px solid #4CAF50' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Corrective Actions</Typography>
                  {renderActions(correctiveActions)}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, backgroundColor: '#E3F2FD', borderLeft: '4px solid #2196F3' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Preventive Actions</Typography>
                  {renderActions(preventiveActions)}
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* AI-Generated Memo - Editable */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3, border: '2px solid #7B1FA2' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToyIcon sx={{ color: '#7B1FA2', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.text.primary }}>
                  AI-Generated Compliance Memo
                </Typography>
              </Box>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#7B1FA2', color: '#7B1FA2' }}
                >
                  Edit Memo
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveMemo}
                  disabled={saving}
                  sx={{ textTransform: 'none', fontWeight: 600, background: '#7B1FA2' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                minRows={12}
                value={editedMemo}
                onChange={(e) => setEditedMemo(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    lineHeight: 1.8,
                  },
                }}
              />
            ) : (
              <Paper sx={{ p: 3, backgroundColor: '#F8F6FC', whiteSpace: 'pre-wrap', lineHeight: 1.8, borderRadius: 1.5 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8, fontFamily: 'inherit' }}>
                  {deviation?.deviation_memo_draft || 'No memo generated.'}
                </Typography>
              </Paper>
            )}

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                Upload / Attach
                <input type="file" hidden onChange={handleFileSelect} />
              </Button>
              <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                {attachedFileName ? `Attached: ${attachedFileName}` : 'No document attached'}
              </Typography>
            </Box>
          </Paper>

          {/* Rejection reasons visible to owner */}
          {rejectionHistory.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3, backgroundColor: '#FFF8E1' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: COLORS.text.primary }}>
                Rejection Reasons
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {rejectionHistory.map((h, idx) => (
                <Paper key={idx} sx={{ p: 2, mb: 1.5, backgroundColor: '#FFFFFF', borderLeft: '4px solid #F57C00' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    {h.action === 'approver_rejected' ? 'Approver Rejection' : 'QA Rejection'} - v{h.version}
                  </Typography>
                  <Typography variant="body2">{h.comments || 'No rejection reason provided.'}</Typography>
                </Paper>
              ))}
            </Paper>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/owner/dashboard')}
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3,
                borderColor: COLORS.text.secondary, color: COLORS.text.secondary,
              }}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteDraft}
              disabled={deleting || sending || sent || deviation?.status !== 'Draft'}
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3,
                borderColor: '#D32F2F', color: '#D32F2F',
                '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' },
              }}
            >
              {deleting ? 'Deleting...' : deviation?.status === 'Draft' ? 'Delete Draft' : 'Delete Disabled'}
            </Button>
            <Button
              variant="contained"
              size="large"
              endIcon={<SendIcon />}
              onClick={handleSendForReview}
              disabled={sending || sent}
              sx={{
                textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 4, minWidth: 260,
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #0D47A1 0%, #0A3A82 100%)' },
                '&:disabled': { background: '#ccc', boxShadow: 'none' },
              }}
            >
              {sending ? 'Sending...' : (deviation?.status === 'Owner Review' || deviation?.status === 'Rework Required') ? 'Resubmit to QA Investigation' : 'Send for QA Investigation'}
            </Button>
          </Box>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3, background: '#F8FAFC' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: COLORS.text.primary }}>
              Workflow Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {[
              { label: 'AI Analysis', desc: 'Draft generated', done: true },
              { label: 'Owner Review', desc: 'You are here', done: false, active: true },
              { label: 'QA Investigation', desc: 'Pending', done: false },
              { label: 'Final Approval', desc: 'Pending', done: false },
            ].map((step, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: step.done ? '#4CAF50' : step.active ? '#1565C0' : '#E0E0E0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                }}>
                  {step.done ? '✓' : i + 1}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: step.active ? '#1565C0' : COLORS.text.primary }}>{step.label}</Typography>
                  <Typography variant="caption" sx={{ color: COLORS.text.secondary }}>{step.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: '#FFFDE7' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <WarningAmberIcon sx={{ color: '#F9A825', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F57F17' }}>
                Review Checklist
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#5D4037', lineHeight: 1.8, display: 'block' }}>
              • Verify AI-identified root causes are accurate{'\n'}
              • Check CAPA recommendations are appropriate{'\n'}
              • Review the compliance memo for completeness{'\n'}
              • Edit any sections if needed before sending{'\n'}
              • Once sent, the QA team will investigate
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default DraftReview;
