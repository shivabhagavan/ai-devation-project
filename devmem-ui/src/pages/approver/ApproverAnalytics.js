import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
} from '@mui/material';
import MainLayout from '../../components/Layout/MainLayout';
import QuickStats from '../../components/Common/QuickStats';
import { COLORS } from '../../styles/theme';

const ApproverAnalytics = () => {
  const [deviations, setDeviations] = useState([]);

  useEffect(() => {
    const fetchDeviations = async () => {
      try {
        const response = await fetch('http://localhost:8000/deviations?role=Approver');
        const data = await response.json();
        setDeviations(data || []);
      } catch (err) {
        setDeviations([]);
      }
    };

    fetchDeviations();
  }, []);

  const stats = [
    {
      label: 'Cases Approved',
      value: deviations.filter((d) => d.status === 'Closed').length,
      color: COLORS.approveButton,
      change: 15,
    },
    {
      label: 'Cases Rejected',
      value: deviations.filter((d) => d.status === 'Rework Required').length,
      color: COLORS.rejectButton,
      change: 2,
    },
    {
      label: 'Pending Review',
      value: deviations.filter((d) => d.status === 'Pending Approval').length,
      color: '#AB47BC',
      change: 3,
    },
    {
      label: 'Avg Review Time',
      value: '2.3 days',
      color: '#2196F3',
      change: -8,
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Approver Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Track approval performance and metrics
        </Typography>
      </Box>

      <QuickStats stats={stats} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Approval Performance
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ padding: 2, backgroundColor: '#E8F5E9', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Approval Efficiency
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50', mt: 1 }}>
                  92%
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#FFF3E0', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  First-Time Approval Rate
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9800', mt: 1 }}>
                  85%
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#E3F2FD', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Cases This Month
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196F3', mt: 1 }}>
                  28
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Decision Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ padding: 2, backgroundColor: '#E8F5E9', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Approved
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                    {deviations.filter((d) => d.status === 'Closed').length}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#FFEBEE', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Rejected
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#D32F2F' }}>
                    {deviations.filter((d) => d.status === 'Rework Required').length}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#F3E5F5', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Pending
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#9C27B0' }}>
                    {deviations.filter((d) => d.status === 'Pending Approval').length}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default ApproverAnalytics;
