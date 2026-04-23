import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AnalyticsPage = () => {
  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: '#F5F7FA' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Analytics Dashboard
      </Typography>
      <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' }}>
        <Typography>Charts and analytics content placeholder (Recharts/Chart.js integration point).</Typography>
      </Paper>
    </Box>
  );
};

export default AnalyticsPage;
