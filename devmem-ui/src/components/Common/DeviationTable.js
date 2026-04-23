import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StatusChip from './StatusChip';
import { COLORS } from '../../styles/theme';

const DeviationTable = ({ deviations, onViewClick, onEditClick, onDeleteClick, showActions = true }) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#F5F7FA', borderBottom: `2px solid ${COLORS.borderLight}` }}>
            <TableCell
              sx={{
                fontWeight: 600,
                color: COLORS.textDark,
                padding: '16px',
              }}
            >
              Deviation ID
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: COLORS.textDark, padding: '16px' }}>
              Event
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: COLORS.textDark, padding: '16px' }}>
              Name
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: COLORS.textDark, padding: '16px' }}>
              Date
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: COLORS.textDark, padding: '16px' }}>
              Severity
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: COLORS.textDark, padding: '16px' }}>
              Status
            </TableCell>
            {showActions && (
              <TableCell sx={{ fontWeight: 600, color: COLORS.textDark, padding: '16px' }}>
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {deviations && deviations.length > 0 ? (
            deviations.map((deviation) => (
              <TableRow
                key={deviation.id}
                sx={{
                  '&:hover': {
                    backgroundColor: '#F5F7FA',
                  },
                  borderBottom: `1px solid ${COLORS.borderLight}`,
                }}
              >
                <TableCell sx={{ padding: '16px', fontWeight: 500 }}>
                  DEV-{String(deviation.id).padStart(4, '0')}
                </TableCell>
                <TableCell sx={{ padding: '16px' }}>
                  {(deviation.event || 'Deviation').substring(0, 100) + ((deviation.event || 'Deviation').length > 100 ? '...' : '')}
                </TableCell>
                <TableCell sx={{ padding: '16px' }}>{deviation.study}</TableCell>
                <TableCell sx={{ padding: '16px' }}>
                  {new Date(deviation.date).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ padding: '16px' }}>
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '4px',
                      backgroundColor:
                        deviation.severity === 'High'
                          ? '#FFEBEE'
                          : deviation.severity === 'Medium'
                          ? '#FFF3E0'
                          : '#E8F5E9',
                      color:
                        deviation.severity === 'High'
                          ? '#D32F2F'
                          : deviation.severity === 'Medium'
                          ? '#F57C00'
                          : '#388E3C',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                    }}
                  >
                    {deviation.severity}
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '16px' }}>
                  <StatusChip status={deviation.status} />
                </TableCell>
                {showActions && (
                  <TableCell sx={{ padding: '16px' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => onViewClick && onViewClick(deviation.id, deviation.status)}
                        sx={{ color: COLORS.primaryButton }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      {onEditClick && (
                        <IconButton
                          size="small"
                          onClick={() => onEditClick(deviation.id)}
                          sx={{ color: COLORS.primaryButton }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {onDeleteClick && deviation.status === 'Draft' && (
                        <IconButton
                          size="small"
                          onClick={() => onDeleteClick(deviation.id)}
                          sx={{ color: '#D32F2F' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} sx={{ padding: '32px', textAlign: 'center' }}>
                <Box sx={{ color: COLORS.textMuted }}>
                  No deviations found. Create one to get started.
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DeviationTable;
