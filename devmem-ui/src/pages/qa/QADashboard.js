import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import QuickStats from '../../components/Common/QuickStats';
import DeviationTable from '../../components/Common/DeviationTable';
import { COLORS } from '../../styles/theme';
import EditIcon from '@mui/icons-material/Edit';

const QADashboard = () => {
  const navigate = useNavigate();
  const [deviations, setDeviations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDeviations = async () => {
      try {
        const response = await fetch('http://localhost:8000/deviations?role=QA Reviewer');
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
            status: 'Open',
          },
          {
            id: 2,
            event: 'Batch record discrepancy',
            study: 'STUDY-002',
            date: '2024-01-14',
            severity: 'Medium',
            status: 'Under Investigation',
          },
        ]);
      }
    };

    fetchDeviations();
  }, []);

  const stats = [
    {
      label: 'Total Assigned',
      value: deviations.length,
      color: COLORS.primaryButton,
      change: 3,
    },
    {
      label: 'In Progress',
      value: deviations.filter((d) => d.status === 'Under Investigation').length,
      color: '#FFA726',
      change: 2,
    },
    {
      label: 'Pending Review',
      value: deviations.filter((d) => d.status === 'Pending QA Review' || d.status === 'QA Review').length,
      color: '#AB47BC',
      change: 1,
    },
    {
      label: 'Completed',
      value: deviations.filter((d) => d.status === 'Closed').length,
      color: '#66BB6A',
      change: 0,
    },
  ];

  const filteredDeviations = deviations.filter(
    (d) =>
      d.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.study.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditInvestigation = (id) => {
    navigate(`/qa/investigations?edit=${id}`);
  };

  const handleViewClick = (id) => {
    navigate(`/deviation/${id}`);
  };

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb:1 }}>
          QA Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Manage deviation investigations and QA reviews
        </Typography>
      </Box>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Investigation Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              My Investigations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ padding: 2, backgroundColor: '#FFF3E0', borderRadius: 1, borderLeft: '4px solid #FF9800' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Under Investigation
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9800' }}>
                  {deviations.filter((d) => d.status === 'Under Investigation').length}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Cases in progress
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#E3F2FD', borderRadius: 1, borderLeft: '4px solid #2196F3' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Pending QA Review
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196F3' }}>
                  {deviations.filter((d) => d.status === 'Pending QA Review' || d.status === 'QA Review').length}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Ready for submission
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Next Steps
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ padding: 2, backgroundColor: '#E8F5E9', borderRadius: 1, borderLeft: '4px solid #4CAF50' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  1. Investigate Deviation
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Gather all relevant information
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#FCE4EC', borderRadius: 1, borderLeft: '4px solid #E91E63' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  2. Add Root Cause
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Identify contributing factors
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#F3E5F5', borderRadius: 1, borderLeft: '4px solid #9C27B0' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  3. Propose CAPA
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Corrective and preventive actions
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Deviations Section */}
      <Card sx={{ padding: 3, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Assigned Deviations
          </Typography>
          <TextField
            placeholder="Search deviations..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>

        <DeviationTable
          deviations={filteredDeviations}
          onViewClick={handleViewClick}
          onEditClick={handleEditInvestigation}
          showActions={true}
        />
      </Card>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>QA Responsibilities:</strong> You are responsible for investigating deviations, identifying root causes, 
          and proposing CAPA. Your analysis forms the basis for management review and approval.
        </Typography>
      </Alert>
    </MainLayout>
  );
};

export default QADashboard;
