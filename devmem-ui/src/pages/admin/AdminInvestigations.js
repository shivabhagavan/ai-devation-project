import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import MainLayout from '../../components/Layout/MainLayout';
import { COLORS } from '../../styles/theme';

const AdminInvestigations = () => {
  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Investigations (Admin View)
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Full system access to all investigations
        </Typography>
      </Box>

      <Card sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
          As System Admin, you have access to view all deviations and investigations
          regardless of status or owner.
        </Typography>
      </Card>
    </MainLayout>
  );
};

export default AdminInvestigations;
