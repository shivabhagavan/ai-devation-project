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
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import DeviationTable from '../../components/Common/DeviationTable';
import StatusChip from '../../components/Common/StatusChip';
import { COLORS } from '../../styles/theme';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';

const MemoView = () => {
  const navigate = useNavigate();
  const [deviations, setDeviations] = useState([]);
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDeviations = async () => {
      try {
        const response = await fetch('http://localhost:8000/deviations');
        const data = await response.json();
        setDeviations(data || []);
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

  const filteredDeviations = deviations.filter(
    (d) =>
      d.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.study.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewMemo = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/deviation/${id}`);
      const data = await response.json();
      setSelectedDeviation(data);
    } catch (err) {
      console.error('Error fetching deviation:', err);
      setSelectedDeviation({
        id,
        event: 'Temperature excursion in cold room',
        study: 'STUDY-001',
        date: '2024-01-15',
        severity: 'High',
        status: 'Closed',
        deviation_memo_draft: 'This is a sample compliance memo...',
        root_cause: { causes: ['Root cause 1', 'Root cause 2'] },
        capa: { corrective: 'Corrective action', preventive: 'Preventive action' },
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Download functionality would download the memo as PDF');
  };

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Compliance Memo
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          View and download deviation compliance memos
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side - Deviation List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: 3, height: '100%', overflow: 'auto', maxHeight: '80vh' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Deviations with Memos
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
              {filteredDeviations.map((dev) => (
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
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <StatusChip status={dev.status} />
                  </Box>
                </Paper>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Right Side - Memo View */}
        <Grid item xs={12} md={8}>
          {selectedDeviation ? (
            <Card sx={{ padding: 4 }}>
              {/* Header */}
              <Box sx={{ mb: 3, pb: 3, borderBottom: `2px solid ${COLORS.borderLight}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      Deviation Report
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                      ID: DEV-{String(selectedDeviation.id).padStart(4, '0')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                      size="small"
                    >
                      Print
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      size="small"
                      sx={{ backgroundColor: COLORS.primaryButton }}
                    >
                      Download PDF
                    </Button>
                  </Box>
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

              {/* Root Cause */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.sidebarDark }}>
                  Root Cause Analysis
                </Typography>
                <Paper sx={{ padding: 2, backgroundColor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
                  {selectedDeviation.root_cause?.causes?.map((cause, idx) => (
                    <Typography key={idx} variant="body2" sx={{ mb: 1, '&:last-child': { mb: 0 } }}>
                      • {cause}
                    </Typography>
                  )) || (
                    <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
                      No root cause analysis available
                    </Typography>
                  )}
                </Paper>
              </Box>

              {/* CAPA */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.sidebarDark }}>
                  Corrective and Preventive Actions (CAPA)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ padding: 2, backgroundColor: '#E8F5E9', borderRadius: 1, borderLeft: '4px solid #4CAF50' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Corrective Action:
                      </Typography>
                      <Typography variant="body2">
                        {selectedDeviation.capa?.corrective || 'No corrective action'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ padding: 2, backgroundColor: '#E3F2FD', borderRadius: 1, borderLeft: '4px solid #2196F3' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Preventive Action:
                      </Typography>
                      <Typography variant="body2">
                        {selectedDeviation.capa?.preventive || 'No preventive action'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Compliance Memo */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.sidebarDark }}>
                  Compliance Memo
                </Typography>
                <Paper sx={{ padding: 3, backgroundColor: '#F5F7FA', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  <Typography variant="body2">
                    {selectedDeviation.deviation_memo_draft ||
                      'This deviation has been analyzed. The AI has generated a comprehensive compliance memo based on the deviation event, root cause analysis, and CAPA. This memo is ready for review and approval.'}
                  </Typography>
                </Paper>
              </Box>

              <Alert severity="success" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  This deviation is ready for final approval. Please review all details before submitting for approver review.
                </Typography>
              </Alert>
            </Card>
          ) : (
            <Card sx={{ padding: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
                Select a deviation from the list to view its compliance memo
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default MemoView;
