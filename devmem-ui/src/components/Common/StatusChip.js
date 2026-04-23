import React from 'react';
import { Chip } from '@mui/material';
import { COLORS, STATUS_COLORS } from '../../styles/theme';

const StatusChip = ({ status }) => {
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: STATUS_COLORS[status] || '#999',
        color: '#FFFFFF',
        fontWeight: 500,
      }}
    />
  );
};

export default StatusChip;
