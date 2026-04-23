import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Chip,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import { COLORS } from '../../styles/theme';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ComplianceMemo from '../../components/Common/ComplianceMemo';

const ApprovalQueue = () => {
  const navigate = useNavigate();
  const [deviations, setDeviations] = useState([]);
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [deviationDetail, setDeviationDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchDeviations();
  }, []);

  const fetchDeviations = async () => {
    try {
      const response = await fetch('http://localhost:8000/deviations?role=Approver');
      const data = await response.json();
      const pendingApproval = (data || []).filter((d) => d.status === 'Pending Approval');
      setDeviations(pendingApproval);
    } catch (err) {
      console.error('Error fetching deviations:', err);
      setDeviations([]);
    }
  };

  const handleSelectDeviation = async (id) => {
    const dev = deviations.find((d) => d.id === id);
    setSelectedDeviation(dev);
    setDeviationDetail(null);
    setActionResult(null);
    setLoadingDetail(true);
    try {
      const response = await fetch(`http://localhost:8000/deviation/${id}`);
      const data = await response.json();
      setDeviationDetail(data);
    } catch (err) {
      console.error('Error fetching deviation detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await fetch(`http://localhost:8000/deviation/${selectedDeviation.id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'Approver', comments: 'Final approval granted' }),
      });
      setActionResult({ type: 'success', message: 'Deviation approved and closed successfully!' });
      setSelectedDeviation(null);
      setDeviationDetail(null);
      fetchDeviations();
    } catch (err) {
      setActionResult({ type: 'error', message: 'Failed to approve deviation.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await fetch(`http://localhost:8000/deviation/${selectedDeviation.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'Approver', comments: rejectReason }),
      });
      setActionResult({ type: 'warning', message: 'Deviation rejected and marked for rework.' });
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedDeviation(null);
      setDeviationDetail(null);
      fetchDeviations();
    } catch (err) {
      setActionResult({ type: 'error', message: 'Failed to reject deviation.' });
    } finally {
      setActionLoading(false);
    }
  };

  const parseJsonField = (field) => {
    if (!field) return null;
    if (typeof field === 'object') return field;
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  };

  const pendingDeviations = deviations;

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Approval Queue
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Review AI-generated memo and make final decisions on deviation investigations
        </Typography>
      </Box>

      {actionResult && (
        <Alert severity={actionResult.type} sx={{ mb: 3 }} onClose={() => setActionResult(null)}>
          {actionResult.message}
        </Alert>
      )}

      {pendingDeviations.length > 0 ? (
        <Grid container spacing={3}>
          {/* Left - Deviation List */}
          <Grid item xs={12} md={4}>
            <Card sx={{ padding: 3, height: '100%', overflow: 'auto', maxHeight: '80vh' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Cases for Final Approval ({pendingDeviations.length})
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {pendingDeviations.map((dev) => (
                  <Card
                    key={dev.id}
                    onClick={() => handleSelectDeviation(dev.id)}
                    sx={{
                      padding: 2,
                      cursor: 'pointer',
                      border: selectedDeviation?.id === dev.id ? `2px solid ${COLORS.primaryButton}` : `1px solid ${COLORS.borderLight}`,
                      backgroundColor: selectedDeviation?.id === dev.id ? '#E3F2FD' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      DEV-{String(dev.id).padStart(4, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1, color: COLORS.textMuted }}>
                      {dev.event}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={dev.severity}
                        size="small"
                        sx={{
                          backgroundColor: dev.severity === 'High' ? '#FFEBEE' : dev.severity === 'Medium' ? '#FFF3E0' : '#E8F5E9',
                          color: dev.severity === 'High' ? '#D32F2F' : dev.severity === 'Medium' ? '#F57C00' : '#388E3C',
                        }}
                      />
                      <Chip label="Pending Approval" size="small" sx={{ backgroundColor: '#FFF3E0', color: '#E65100' }} />
                    </Box>
                  </Card>
                ))}
              </Box>
            </Card>
          </Grid>

          {/* Right - Review Panel */}
          <Grid item xs={12} md={8}>
            {selectedDeviation ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Header Card */}
                <Card sx={{ padding: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        FINAL DECISION AUTHORITY
                      </Typography>
                      <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                        DEV-{String(selectedDeviation.id).padStart(4, '0')} — {selectedDeviation.event}
                      </Typography>
                    </Box>
                    <Chip label="Pending Approval" sx={{ backgroundColor: '#FFF3E0', color: '#E65100', fontWeight: 600 }} />
                  </Box>
                </Card>

                {loadingDetail ? (
                  <Card sx={{ padding: 4, textAlign: 'center' }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2, color: COLORS.textMuted }}>
                      Loading deviation details...
                    </Typography>
                  </Card>
                ) : deviationDetail ? (
                  <>
                    {/* Compliance Memo Document View */}
                    <ComplianceMemo deviation={deviationDetail} />

                    {/* Supporting Documents Section */}
                    {deviationDetail.document_filename && (
                      <Card sx={{ p: 2.5, mt: 2, backgroundColor: '#E3F2FD', borderLeft: '4px solid #2196F3' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                          <CloudDownloadIcon sx={{ color: '#2196F3', fontSize: 24 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Supporting Document
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 1.5 }}>
                          {deviationDetail.document_filename}
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<CloudDownloadIcon />}
                          onClick={() => {
                            if (deviationDetail.document_content) {
                              const link = document.createElement('a');
                              link.href = deviationDetail.document_content;
                              link.download = deviationDetail.document_filename;
                              link.click();
                            }
                          }}
                          sx={{
                            color: '#2196F3',
                            borderColor: '#2196F3',
                            '&:hover': {
                              backgroundColor: 'rgba(33, 150, 243, 0.05)',
                              borderColor: '#1976D2'
                            }
                          }}
                        >
                          Download Document
                        </Button>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => { setSelectedDeviation(null); setDeviationDetail(null); }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => setRejectDialogOpen(true)}
                        disabled={actionLoading}
                      >
                        DENY & REJECT
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: '#2E7D32' }}
                        startIcon={<CheckIcon />}
                        onClick={() => { setModalMode('approve'); setOpenModal(true); }}
                        disabled={actionLoading}
                      >
                        FINAL SIGN-OFF
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Card sx={{ padding: 4, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
                      Failed to load deviation details.
                    </Typography>
                  </Card>
                )}
              </Box>
            ) : (
              <Card sx={{ padding: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
                  Select a case from the list to review
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      ) : (
        <Card sx={{ padding: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            No Cases Pending Approval
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            All deviations have been reviewed. Great job keeping the queue current!
          </Typography>
        </Card>
      )}

      {/* Approve Confirmation Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Final Sign-Off</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to approve and close deviation DEV-{String(selectedDeviation?.id).padStart(4, '0')}?
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 3 }}>
            This will mark the deviation as <strong>Closed</strong>. This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#2E7D32' }}
              onClick={() => { setOpenModal(false); handleApprove(); }}
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Confirm Approval'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject & Return for Rework</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to reject deviation DEV-{String(selectedDeviation?.id).padStart(4, '0')}?
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 3 }}>
            This will send the deviation back with status <strong>QA Review</strong> so QA can assess and route to owner.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mb: 3 }}
          />
          <DialogActions>
            <Button variant="outlined" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Confirm Rejection'}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ApprovalQueue;
