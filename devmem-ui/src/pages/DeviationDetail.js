import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../utils/auth';
import {
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  TextField,
} from '@mui/material';
import { ArrowBack, Print, Save, Notifications, Settings, Person, CheckCircle, Schedule, Lock } from '@mui/icons-material';

const DeviationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deviation, setDeviation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signatures, setSignatures] = useState({});
  const [signatureDraft, setSignatureDraft] = useState('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  const currentUser = authService.getUser();

  useEffect(() => {
    fetchDeviationDetail();
  }, [id]);

  const fetchDeviationDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/deviation/${id}`);
      let data = response.data;
      // Parse root_cause and capa if they are JSON strings
      if (typeof data.root_cause === 'string') {
        try { data.root_cause = JSON.parse(data.root_cause); } catch {}
      }
      if (typeof data.capa === 'string') {
        try { data.capa = JSON.parse(data.capa); } catch {}
      }
      setDeviation(data);
      setSignatures(data.signatures || {});
      setSignatureDraft(currentUser?.username || '');
    } catch (err) {
      setError('Failed to load deviation details');
      console.error('Error fetching deviation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    alert('Memo saved!');
  };

  const roleToSignatureKey = {
    'DM Owner': 'owner',
    'DM QA': 'qa',
    'DM Approver': 'approver',
  };

  const activeSignatureKey = roleToSignatureKey[currentUser?.role] || null;

  const handleSignatureSave = async () => {
    if (!activeSignatureKey || !signatureDraft.trim()) {
      return;
    }

    setSignatureSaving(true);
    try {
      const response = await axios.put(`http://localhost:8000/deviation/${id}/signature`, {
        role: currentUser.role,
        name: signatureDraft.trim(),
      });
      setSignatures(response.data.signatures || {});
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save signature');
    } finally {
      setSignatureSaving(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const signatureConfig = [
    {
      key: 'owner',
      title: 'DM Owner Sign-Off',
      subtitle: 'Deviation initiator and memo preparer',
      accent: '#1565C0',
      label: 'Owner Signature',
    },
    {
      key: 'qa',
      title: 'QA Review Sign-Off',
      subtitle: 'Quality assessment and investigation verification',
      accent: '#6A1B9A',
      label: 'QA Signature',
    },
    {
      key: 'approver',
      title: 'Final Approval Sign-Off',
      subtitle: 'Final authorization for compliance closure',
      accent: '#2E7D32',
      label: 'Approver Signature',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <Toolbar sx={{ justifyContent: 'space-between', height: 60 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/investigations')} sx={{ color: '#1F2A44' }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2A44' }}>
              DevMem AI Investigator
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ color: '#1F2A44' }}><Notifications /></IconButton>
            <IconButton sx={{ color: '#1F2A44' }}><Settings /></IconButton>
            <IconButton sx={{ color: '#1F2A44' }}><Person /></IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 'calc(100vh - 60px)', backgroundColor: '#FFFFFF' }}>
        <Paper sx={{ width: '900px', maxWidth: '90vw', backgroundColor: '#FFFFFF', borderRadius: '10px', boxShadow: '0px 4px 20px rgba(0,0,0,0.08)', p: 5, border: '1px solid #E2E8F0' }}>
          {deviation?.status !== 'Closed' && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button variant="contained" startIcon={<Print />} onClick={handlePrint} sx={{ backgroundColor: '#2F3A4F', '&:hover': { backgroundColor: '#1a2533' }, borderRadius: '20px', textTransform: 'none' }}>
                Print / Save
              </Button>
            </Box>
          )}

          <Typography variant="h4" sx={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: '28px', color: '#1F2A44', letterSpacing: '0.5px', mb: 4 }}>
            COMPLIANCE MEMO
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, px: 2 }}>
            <Typography sx={{ fontWeight: 'bold', color: '#1F2A44' }}>
              CASE ID: <span style={{ fontWeight: 'normal' }}>CASE-{deviation.id}</span>
            </Typography>
            <Typography sx={{ fontWeight: 'bold', color: '#1F2A44' }}>
              DATE: <span style={{ fontWeight: 'normal' }}>{deviation.date}</span>
            </Typography>
            <Typography sx={{ fontWeight: 'bold', color: '#1F2A44' }}>
              SEVERITY: <Chip label={deviation.severity} color={getSeverityColor(deviation.severity)} size="small" />
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              Deviation Description
            </Typography>
            <Typography sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              {deviation.event}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              Product/Study
            </Typography>
            <Typography sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              {deviation.study}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              Investigation Summary
            </Typography>
            <Typography sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44', mb: 2 }}>
              <strong>Severity:</strong> {deviation.severity}
            </Typography>
            <Typography sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44', mb: 2 }}>
              <strong>Patient Safety Risk:</strong> {deviation.case_assessment?.patient_safety || 'N/A'}
            </Typography>
            <Typography sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44', mb: 2 }}>
              <strong>Regulatory Compliance Risk:</strong> {deviation.case_assessment?.regulatory_compliance || 'N/A'}
            </Typography>
            <Typography sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44', mb: 2 }}>
              <strong>Data Integrity Risk:</strong> {deviation.case_assessment?.data_integrity || 'N/A'}
            </Typography>
            <Typography sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              <strong>Product Quality Risk:</strong> {deviation.case_assessment?.product_quality || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              Root Cause Analysis
            </Typography>
            <Typography component="div" sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              {Array.isArray(deviation.root_cause) ?
                deviation.root_cause.map((cause, index) => (
                  <div key={index}>• {cause}</div>
                )) :
                (deviation.root_cause && deviation.root_cause.causes && Array.isArray(deviation.root_cause.causes)
                  ? deviation.root_cause.causes.map((cause, idx) => <div key={idx}>• {cause}</div>)
                  : <div>{deviation.root_cause ? JSON.stringify(deviation.root_cause) : 'N/A'}</div>
                )
              }
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              Corrective and Preventive Actions (CAPA)
            </Typography>
            <Typography component="div" sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              {Array.isArray(deviation.capa) ?
                deviation.capa.map((action, index) => (
                  <div key={index}>• {action}</div>
                )) :
                (deviation.capa && deviation.capa.actions && Array.isArray(deviation.capa.actions)
                  ? deviation.capa.actions.map((action, idx) => <div key={idx}>• {action}</div>)
                  : <div>{deviation.capa ? JSON.stringify(deviation.capa) : 'N/A'}</div>
                )
              }
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              AI-Generated Compliance Memo
            </Typography>
            <Paper sx={{ p: 3, backgroundColor: '#F8F9FA', border: '1px solid #E2E8F0' }}>
              <Typography
                component="pre"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#1F2A44',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}
              >
                {deviation.deviation_memo_draft || 'No memo available'}
              </Typography>
            </Paper>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
                Sign-Off Chain
              </Typography>
              {currentUser && (
                <Chip
                  icon={<Person sx={{ fontSize: 16 }} />}
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
              
              {signatureConfig.map((item, idx) => {
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
                        cursor: isEditable ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        boxShadow: isSigned ? '0 2px 8px rgba(76, 175, 80, 0.2)' : isEditable ? `0 0 8px ${item.accent}40` : 'none',
                      }}
                    >
                      {isSigned ? (
                        <CheckCircle sx={{ color: '#FFF', fontSize: 28 }} />
                      ) : isEditable ? (
                        <Schedule sx={{ color: item.accent, fontSize: 24, fontWeight: 'bold' }} />
                      ) : (
                        <Schedule sx={{ color: '#CCC', fontSize: 24 }} />
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
                        transition: 'all 0.2s ease',
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
                            <Lock sx={{ fontSize: 14, color: '#CCC' }} />
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
                            rows={5}
                            fullWidth
                            autoFocus
                            variant="outlined"
                            sx={{
                              mb: 1.5,
                              '& .MuiOutlinedInput-root': {
                                fontSize: '14px',
                                backgroundColor: '#FFF',
                                padding: '12px',
                              },
                              '& .MuiOutlinedInput-input': {
                                padding: '12px !important',
                                fontFamily: 'monospace',
                              },
                              '& .MuiOutlinedInput-input::placeholder': {
                                opacity: 0.6,
                              },
                            }}
                          />
                          <Button
                            variant="contained"
                            onClick={handleSignatureSave}
                            disabled={signatureSaving || !signatureDraft.trim()}
                            sx={{
                              backgroundColor: item.accent,
                              '&:hover': { backgroundColor: item.accent, opacity: 0.9 },
                              textTransform: 'none',
                              fontSize: '13px',
                              width: '100%',
                              fontWeight: 700,
                              py: 1.2,
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

          {deviation?.status !== 'Closed' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{
                  backgroundColor: '#2F80ED',
                  '&:hover': { backgroundColor: '#1a5dc7' },
                  textTransform: 'none',
                  borderRadius: '8px'
                }}
              >
                Save Memo
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default DeviationDetail;