import React from 'react';
import { Box, Typography, Card, Grid } from '@mui/material';
import MainLayout from '../../components/Layout/MainLayout';
import QuickStats from '../../components/Common/QuickStats';
import { COLORS } from '../../styles/theme';

const AdminAnalytics = () => {
  const stats = [
    {
      label: 'Total System Users',
      value: 24,
      color: COLORS.primaryButton,
      change: 3,
    },
    {
      label: 'Total Deviations',
      value: 156,
      color: '#2196F3',
      change: 12,
    },
    {
      label: 'System Uptime',
      value: '99.9%',
      color: '#4CAF50',
      change: 0,
    },
    {
      label: 'Avg Response Time',
      value: '250ms',
      color: '#FF9800',
      change: -5,
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          System Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          System-wide performance and usage metrics
        </Typography>
      </Box>

      <QuickStats stats={stats} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              User Activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ padding: 2, backgroundColor: '#E8F5E9', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Active Sessions: 8
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#E3F2FD', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Today's Logins: 24
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#FFF3E0', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Failed Login Attempts: 2
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              System Performance
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ padding: 2, backgroundColor: '#E8F5E9', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  CPU Usage: 35%
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#E3F2FD', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Memory Usage: 52%
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#FCE4EC', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Database Queries (Last Hour): 4,231
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default AdminAnalytics;
