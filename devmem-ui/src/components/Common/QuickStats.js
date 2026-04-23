import React from 'react';
import { Card, Box, Typography, Grid } from '@mui/material';
import { COLORS } from '../../styles/theme';

const QuickStats = ({ stats }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {stats.map((stat, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <Card
            sx={{
              padding: 3,
              borderLeft: `4px solid ${stat.color || COLORS.primaryButton}`,
              backgroundColor: COLORS.cardWhite,
            }}
          >
            <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
              {stat.label}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: stat.color || COLORS.primaryButton,
                mt: 1,
              }}
            >
              {stat.value}
            </Typography>
            {stat.change && (
              <Typography
                variant="caption"
                sx={{
                  color: stat.change > 0 ? '#4CAF50' : '#D32F2F',
                  mt: 1,
                  display: 'block',
                }}
              >
                {stat.change > 0 ? '+' : ''}{stat.change}% vs last month
              </Typography>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default QuickStats;
