import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

const QAInvestigations = () => {
  const navigate = useNavigate();
  const [deviations, setDeviations] = useState([]);
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [deviationDetail, setDeviationDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchDeviations();
  }, []);

  const fetchDeviations = async () => {
    try {
      const response = await fetch('http://localhost:8000/deviations?role=QA Reviewer');
      const data = await response.json();
      setDeviations(data || []);
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
        body: JSON.stringify({ role: 'QA', comments: 'QA approved and forwarded to approver' }),
      });
      setActionResult({ type: 'success', message: 'Deviation approved and sent for final approval!' });
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
        body: JSON.stringify({ role: 'QA', comments: rejectReason }),
      });
      setActionResult({ type: 'warning', message: 'Deviation rejected and sent back to owner for rework.' });
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

  const pendingDeviations = deviations.filter(
    (d) => d.status === 'QA Review' || d.status === 'Pending QA Review'
  );

  const filteredDeviations = pendingDeviations.filter(
    (d) =>
      d.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.study.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Investigation Management
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Review AI-generated investigation memos — approve or reject deviations
        </Typography>
      </Box>

      {actionResult && (
        <Alert severity={actionResult.type} sx={{ mb: 3, borderRadius: 2 }}>
          {actionResult.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Side - Deviation List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: 3, height: '100%', overflow: 'auto', maxHeight: '80vh' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Pending QA Review ({filteredDeviations.length})
            </Typography>

            <TextField
              fullWidth
              placeholder="Search..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredDeviations.length > 0 ? (
                filteredDeviations.map((dev) => (
                  <Card
                    key={dev.id}
                    onClick={() => handleSelectDeviation(dev.id)}
                    sx={{
                      padding: 2,
                      cursor: 'pointer',
                      border: selectedDeviation?.id === dev.id ? `2px solid ${COLORS.primaryButton}` : `1px solid ${COLORS.borderLight}`,
                      backgroundColor: selectedDeviation?.id === dev.id ? '#E3F2FD' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      DEV-{String(dev.id).padStart(4, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1, color: COLORS.textMuted }}>
                      {dev.event}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={dev.status} size="small" sx={{ backgroundColor: '#E8EAF6', color: '#283593' }} />
                      <Chip
                        label={dev.severity}
                        size="small"
                        sx={{
                          backgroundColor: dev.severity === 'High' ? '#FFEBEE' : dev.severity === 'Medium' ? '#FFF3E0' : '#E8F5E9',
                          color: dev.severity === 'High' ? '#D32F2F' : dev.severity === 'Medium' ? '#F57C00' : '#388E3C',
                        }}
                      />
                    </Box>
                  </Card>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                    No deviations pending QA review
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Right Side - Investigation Detail with Memo */}
        <Grid item xs={12} md={8}>
          {selectedDeviation && deviationDetail ? (
            <Box>
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

              {/* Rejection history visible to QA */}
              <Card sx={{ p: 2.5, mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Rejection History
                </Typography>
                {(deviationDetail.history || []).filter((h) => h.action === 'approver_rejected' || h.action === 'qa_rejected').length === 0 ? (
                  <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                    No rejection comments available yet.
                  </Typography>
                ) : (
                  (deviationDetail.history || [])
                    .filter((h) => h.action === 'approver_rejected' || h.action === 'qa_rejected')
                    .slice()
                    .reverse()
                    .map((h, idx) => (
                      <Paper key={idx} sx={{ p: 1.5, mb: 1, backgroundColor: '#FFF8E1' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                          {h.action === 'approver_rejected' ? 'Approver Rejection' : 'QA Rejection'} - v{h.version}
                        </Typography>
                        <Typography variant="body2">{h.comments || 'No comments provided.'}</Typography>
                      </Paper>
                    ))
                )}
              </Card>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3, mb: 4 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={actionLoading}
                  sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3 }}
                >
                  Reject & Return to Owner
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CheckIcon />}
                  onClick={handleApprove}
                  disabled={actionLoading}
                  sx={{
                    textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 4,
                    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #1B5E20 0%, #0D3B0F 100%)' },
                  }}
                >
                  {actionLoading ? 'Processing...' : 'Approve & Send for Final Approval'}
                </Button>
              </Box>
            </Box>
          ) : loadingDetail ? (
            <Card sx={{ padding: 4, textAlign: 'center' }}>
              <CircularProgress size={36} />
              <Typography variant="body2" sx={{ mt: 2, color: COLORS.textMuted }}>
                Loading deviation details...
              </Typography>
            </Card>
          ) : (
            <Card sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
                Select a deviation from the list to review the AI-generated investigation
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Reject Deviation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: COLORS.textMuted }}>
            This will send the deviation back to the owner for rework. Please provide a reason.
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
              Confirm Rejection
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default QAInvestigations;
