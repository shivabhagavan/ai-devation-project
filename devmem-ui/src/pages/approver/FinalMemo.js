import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Paper,
  Grid,
  Divider,
  TextField,
} from '@mui/material';
import MainLayout from '../../components/Layout/MainLayout';
import DeviationTable from '../../components/Common/DeviationTable';
import { COLORS } from '../../styles/theme';
import { authService } from '../../utils/auth';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import ArchiveIcon from '@mui/icons-material/Archive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LockIcon from '@mui/icons-material/Lock';

const FinalMemo = () => {
  const [deviations, setDeviations] = useState([]);
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [signatures, setSignatures] = useState({});
  const [signatureDraft, setSignatureDraft] = useState('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  const currentUser = authService.getUser();

  useEffect(() => {
    const fetchDeviations = async () => {
      try {
        const response = await fetch('http://localhost:8000/deviations');
        const data = await response.json();
        const closed = data.filter((d) => d.status === 'Closed') || [];
        setDeviations(closed);
      } catch (err) {
        setDeviations([
          {
            id: 1,
            event: 'Temperature excursion in cold room',
            study: 'STUDY-001',
            date: '2024-01-15',
            severity: 'High',
            status: 'Closed',
          },
        ]);
      }
    };

    fetchDeviations();
  }, []);

  const handleViewMemo = async (id) => {
    const dev = deviations.find((d) => d.id === id);
    setSelectedDeviation(dev);
    setSignatureDraft(currentUser?.username || '');
    
    // Fetch signatures for this deviation
    try {
      const response = await fetch(`http://localhost:8000/deviation/${id}`);
      const data = await response.json();
      setSignatures(data.signatures || {});
    } catch (err) {
      console.error('Error fetching signatures:', err);
    }
  };

  const roleToSignatureKey = {
    'DM Owner': 'owner',
    'DM QA': 'qa',
    'DM Approver': 'approver',
  };

  const activeSignatureKey = roleToSignatureKey[currentUser?.role] || null;

  const handleSignatureSave = async () => {
    if (!activeSignatureKey || !signatureDraft.trim() || !selectedDeviation) {
      return;
    }

    setSignatureSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/deviation/${selectedDeviation.id}/signature`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: currentUser.role,
          name: signatureDraft.trim(),
        }),
      });
      const data = await response.json();
      setSignatures(data.signatures || {});
    } catch (err) {
      console.error('Error saving signature:', err);
    } finally {
      setSignatureSaving(false);
    }
  };

  const handleArchive = () => {
    alert(`Deviation ${selectedDeviation.id} archived to print library`);
  };

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Final Memo & Print Library
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Finalized reports and compliance memos
        </Typography>
      </Box>

      {deviations.length > 0 ? (
        <Grid container spacing={3}>
          {/* Left - Deviation List */}
          <Grid item xs={12} md={4}>
            <Card sx={{ padding: 3, height: '100%', overflow: 'auto', maxHeight: '80vh' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Closed Deviations ({deviations.length})
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {deviations.map((dev) => (
                  <Paper
                    key={dev.id}
                    onClick={() => handleViewMemo(dev.id)}
                    sx={{
                      padding: 2,
                      cursor: 'pointer',
                      border: selectedDeviation?.id === dev.id ? `2px solid ${COLORS.primaryButton}` : `1px solid ${COLORS.borderLight}`,
                      backgroundColor: selectedDeviation?.id === dev.id ? '#E3F2FD' : 'transparent',
                      borderRadius: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      DEV-{String(dev.id).padStart(4, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block', mb: 1 }}>
                      {dev.event}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label="Closed" size="small" sx={{ backgroundColor: '#E8F5E9', color: '#4CAF50' }} />
                      <ArchiveIcon sx={{ fontSize: 16, color: '#999' }} />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Card>
          </Grid>

          {/* Right - Memo Display */}
          <Grid item xs={12} md={8}>
            {selectedDeviation ? (
              <Card sx={{ padding: 4, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Header with Actions */}
                <Box sx={{ mb: 3, pb: 3, borderBottom: `2px solid ${COLORS.borderLight}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        Final Compliance Memo
                      </Typography>
                      <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                        DEV-{String(selectedDeviation.id).padStart(4, '0')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        size="small"
                        onClick={() => window.print()}
                      >
                        Print
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        size="small"
                        sx={{ backgroundColor: COLORS.primaryButton }}
                      >
                        Download PDF
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<ArchiveIcon />}
                        size="small"
                        onClick={handleArchive}
                        sx={{ backgroundColor: COLORS.sidebarDark }}
                      >
                        Archive
                      </Button>
                    </Box>
                  </Box>
                </Box>

                {/* Executive Summary */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.sidebarDark }}>
                    Executive Summary
                  </Typography>
                  <Box sx={{ padding: 2, backgroundColor: '#E3F2FD', borderRadius: 1, borderLeft: `4px solid ${COLORS.primaryButton}` }}>
                    <Typography variant="body2">
                      Deviation {String(selectedDeviation.id).padStart(4, '0')} has been thoroughly investigated and resolved. 
                      All necessary corrective and preventive actions have been identified and implemented. 
                      This report documents the complete investigation, root cause analysis, and CAPA plan as required by regulatory guidelines.
                    </Typography>
                  </Box>
                </Box>

                {/* Deviation Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.sidebarDark }}>
                    Deviation Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ backgroundColor: '#F5F7FA', padding: 2, borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block', mb: 0.5 }}>
                          Event
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedDeviation.event}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ backgroundColor: '#F5F7FA', padding: 2, borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block', mb: 0.5 }}>
                          Study
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedDeviation.study}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ backgroundColor: '#F5F7FA', padding: 2, borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block', mb: 0.5 }}>
                          Date Reported
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(selectedDeviation.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ backgroundColor: '#F5F7FA', padding: 2, borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block', mb: 0.5 }}>
                          Severity
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color:
                              selectedDeviation.severity === 'High'
                                ? '#D32F2F'
                                : selectedDeviation.severity === 'Medium'
                                ? '#F57C00'
                                : '#388E3C',
                          }}
                        >
                          {selectedDeviation.severity}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Findings & Actions */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.sidebarDark }}>
                        Root Cause Analysis
                      </Typography>
                      <Paper sx={{ padding: 2, backgroundColor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
                        <Typography variant="body2">
                          • Primary contributing factor identified and documented
                        </Typography>
                        <Typography variant="body2">
                          • Secondary factors assessed and verified
                        </Typography>
                        <Typography variant="body2">
                          • Systemic issues addressed through preventive measures
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.sidebarDark }}>
                        CAPA Measures
                      </Typography>
                      <Paper sx={{ padding: 2, backgroundColor: '#E8F5E9', borderLeft: '4px solid #4CAF50' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Corrective:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1.5 }}>
                          Immediate actions taken to address the deviation
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Preventive:
                        </Typography>
                        <Typography variant="body2">
                          Long-term measures to prevent recurrence
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Sign-Off Chain */}
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2A44' }}>
                      Sign-Off Chain
                    </Typography>
                    {currentUser && (
                      <Chip
                        icon={<Typography sx={{ fontSize: 12 }}>👤</Typography>}
                        label={`Logged in: ${currentUser.role}`}
                        sx={{
                          backgroundColor: '#E3F2FD',
                          color: '#1565C0',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Timeline connector line */}
                    <Box sx={{ position: 'absolute', top: 24, left: '10%', right: '10%', height: '2px', backgroundColor: '#E2E8F0', zIndex: 0 }} />
                    
                    {[
                      { key: 'owner', title: 'DM Owner Sign-Off', accent: '#1565C0', label: 'Owner Signature' },
                      { key: 'qa', title: 'QA Review Sign-Off', accent: '#6A1B9A', label: 'QA Signature' },
                      { key: 'approver', title: 'Final Approval Sign-Off', accent: '#2E7D32', label: 'Approver Signature' },
                    ].map((item) => {
                      const signature = signatures[item.key];
                      const isEditable = activeSignatureKey === item.key;
                      const isSigned = !!signature?.name;
                      
                      return (
                        <Box key={item.key} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                          {/* Status circle */}
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              backgroundColor: isSigned ? '#4CAF50' : '#F5F5F5',
                              border: isEditable ? `3px solid ${item.accent}` : `2px solid ${item.accent}33`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 2,
                              position: 'relative',
                              boxShadow: isSigned ? '0 2px 8px rgba(76, 175, 80, 0.2)' : isEditable ? `0 0 8px ${item.accent}40` : 'none',
                            }}
                          >
                            {isSigned ? (
                              <CheckCircleIcon sx={{ color: '#FFF', fontSize: 28 }} />
                            ) : isEditable ? (
                              <ScheduleIcon sx={{ color: item.accent, fontSize: 24, fontWeight: 'bold' }} />
                            ) : (
                              <ScheduleIcon sx={{ color: '#CCC', fontSize: 24 }} />
                            )}
                          </Box>

                          {/* Card */}
                          <Paper
                            sx={{
                              width: '100%',
                              p: 2,
                              borderRadius: 1.5,
                              border: isEditable ? `2px solid ${item.accent}` : '1px solid #E2E8F0',
                              backgroundColor: isEditable ? `${item.accent}08` : '#FAFBFC',
                              textAlign: 'center',
                              minHeight: 160,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: isEditable ? `0 0 12px ${item.accent}20` : 'none',
                              opacity: isEditable ? 1 : 0.85,
                            }}
                          >
                            <Box>
                              {/* Role & Status Badge */}
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: item.accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                                </Typography>
                                {isEditable && (
                                  <Chip
                                    size="small"
                                    label="YOUR ROLE"
                                    sx={{
                                      height: 18,
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      backgroundColor: `${item.accent}20`,
                                      color: item.accent,
                                      border: `1px solid ${item.accent}`,
                                    }}
                                  />
                                )}
                                {!isEditable && (
                                  <LockIcon sx={{ fontSize: 14, color: '#CCC' }} />
                                )}
                              </Box>
                              
                              <Typography sx={{ fontSize: 10, color: '#999', mb: 1, fontStyle: 'italic' }}>
                                {isEditable ? 'You have access' : `For ${item.key === 'owner' ? 'DM Owner' : item.key === 'qa' ? 'DM QA' : 'DM Approver'}`}
                              </Typography>
                            </Box>

                            {isEditable && !isSigned ? (
                              <Box>
                                <TextField
                                  placeholder="Paste or type your signature here..."
                                  value={signatureDraft}
                                  onChange={(e) => setSignatureDraft(e.target.value)}
                                  multiline
                                  rows={4}
                                  fullWidth
                                  autoFocus
                                  variant="outlined"
                                  sx={{
                                    mb: 1.5,
                                    '& .MuiOutlinedInput-root': {
                                      fontSize: '12px',
                                      backgroundColor: '#FFF',
                                      padding: '8px',
                                    },
                                    '& .MuiOutlinedInput-input': {
                                      padding: '8px !important',
                                      fontFamily: 'monospace',
                                    },
                                  }}
                                />
                                <Button
                                  variant="contained"
                                  onClick={handleSignatureSave}
                                  disabled={signatureSaving || !signatureDraft.trim()}
                                  size="small"
                                  sx={{
                                    backgroundColor: item.accent,
                                    '&:hover': { backgroundColor: item.accent, opacity: 0.9 },
                                    textTransform: 'none',
                                    fontSize: '12px',
                                    width: '100%',
                                    fontWeight: 700,
                                  }}
                                >
                                  {signatureSaving ? 'Signing...' : '✓ Sign Now'}
                                </Button>
                              </Box>
                            ) : isSigned ? (
                              <Box>
                                <Chip
                                  size="small"
                                  label="✓ Signed"
                                  sx={{
                                    backgroundColor: '#E8F5E9',
                                    color: '#2E7D32',
                                    fontWeight: 700,
                                    mb: 0.5,
                                  }}
                                />
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1F2A44', mb: 0.5 }}>
                                  {signature.name}
                                </Typography>
                                <Typography sx={{ fontSize: 10, color: '#999' }}>
                                  {new Date(signature.signed_at).toLocaleDateString()} {new Date(signature.signed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              </Box>
                            ) : (
                              <Box>
                                <Chip
                                  size="small"
                                  label="⏱ Pending"
                                  sx={{
                                    backgroundColor: '#FFF3E0',
                                    color: '#EF6C00',
                                    fontWeight: 700,
                                  }}
                                />
                              </Box>
                            )}
                          </Paper>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Card>
            ) : (
              <Card sx={{ padding: 4, textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
                  Select a closed deviation to view its final memo
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      ) : (
        <Card sx={{ padding: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            No Closed Deviations
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
            Approved deviations will appear here
          </Typography>
        </Card>
      )}
    </MainLayout>
  );
};

export default FinalMemo;
