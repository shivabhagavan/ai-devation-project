import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import QuickStats from '../../components/Common/QuickStats';
import { COLORS } from '../../styles/theme';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [deviations, setDeviations] = useState([]);
  const [systemStats, setSystemStats] = useState([]);

  useEffect(() => {
    const fetchDeviations = async () => {
      try {
        const response = await fetch('http://localhost:8000/dashboard-metrics');
        const data = await response.json();
        setSystemStats([
          {
            label: 'Total Deviations',
            value: data.total_deviations,
            color: COLORS.primaryButton,
            change: 5,
          },
          {
            label: 'High Severity',
            value: data.high,
            color: '#D32F2F',
            change: 2,
          },
          {
            label: 'Open Cases',
            value: data.open,
            color: '#FFA726',
            change: -3,
          },
          {
            label: 'Closed Cases',
            value: data.closed,
            color: '#66BB6A',
            change: 12,
          },
        ]);
      } catch (err) {
        setSystemStats([
          {
            label: 'Total Deviations',
            value: 45,
            color: COLORS.primaryButton,
            change: 5,
          },
          {
            label: 'High Severity',
            value: 8,
            color: '#D32F2F',
            change: 2,
          },
          {
            label: 'Open Cases',
            value: 12,
            color: '#FFA726',
            change: -3,
          },
          {
            label: 'Closed Cases',
            value: 28,
            color: '#66BB6A',
            change: 12,
          },
        ]);
      }
    };

    const fetchDeviationsList = async () => {
      try {
        const response = await fetch('http://localhost:8000/deviations?role=System Admin');
        const data = await response.json();
        setDeviations(data || []);
      } catch (err) {
        setDeviations([]);
      }
    };

    fetchDeviations();
    fetchDeviationsList();
  }, []);

  const users = [
    { id: 1, username: 'john_owner', role: 'DM Owner', status: 'Active' },
    { id: 2, username: 'jane_qa', role: 'DM QA', status: 'Active' },
    { id: 3, username: 'michael_approver', role: 'DM Approver', status: 'Active' },
    { id: 4, username: 'admin_user', role: 'System Admin', status: 'Active' },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          System Administration Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Manage system-wide operations and configuration
        </Typography>
      </Box>

      {/* Quick Stats */}
      <QuickStats stats={systemStats} />

      {/* Admin Action Buttons */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/admin/user-management')}
            sx={{ backgroundColor: COLORS.primaryButton, py: 1.5 }}
          >
            User Management
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/admin/settings')}
            sx={{ backgroundColor: COLORS.primaryButton, py: 1.5 }}
          >
            System Settings
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SecurityIcon />}
            sx={{ py: 1.5, color: COLORS.primaryButton, borderColor: COLORS.primaryButton }}
          >
            Security Audit
          </Button>
        </Grid>
      </Grid>

      {/* System Overview */}
      <Grid container spacing={3}>
        {/* Active Users */}
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Active Users
              </Typography>
              <Chip label={`${users.length} users`} size="small" />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          sx={{
                            backgroundColor: user.status === 'Active' ? '#E8F5E9' : '#FFEBEE',
                            color: user.status === 'Active' ? '#4CAF50' : '#D32F2F',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              fullWidth
              variant="text"
              sx={{ mt: 2, color: COLORS.primaryButton }}
              onClick={() => navigate('/admin/user-management')}
            >
              View All Users →
            </Button>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              System Health
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ padding: 2, backgroundColor: '#E8F5E9', borderRadius: 1, borderLeft: '4px solid #4CAF50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Database Status</Typography>
                  <Chip label="Healthy" size="small" sx={{ backgroundColor: '#4CAF50', color: '#FFFFFF' }} />
                </Box>
              </Box>

              <Box sx={{ padding: 2, backgroundColor: '#E3F2FD', borderRadius: 1, borderLeft: '4px solid #2196F3' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">API Server</Typography>
                  <Chip label="Online" size="small" sx={{ backgroundColor: '#2196F3', color: '#FFFFFF' }} />
                </Box>
              </Box>

              <Box sx={{ padding: 2, backgroundColor: '#FCE4EC', borderRadius: 1, borderLeft: '4px solid #E91E63' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">System Uptime</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#E91E63' }}>
                    99.9%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ padding: 2, backgroundColor: '#FFF3E0', borderRadius: 1, borderLeft: '4px solid #FF9800' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Data Backup</Typography>
                  <Chip label="Last 1h ago" size="small" sx={{ backgroundColor: '#FF9800', color: '#FFFFFF' }} />
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Deviations Summary */}
      <Card sx={{ padding: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Deviations
          </Typography>
          <Chip label={`Total: ${deviations.length}`} />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Study</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deviations.slice(0, 5).map((dev) => (
                <TableRow key={dev.id}>
                  <TableCell sx={{ fontWeight: 500 }}>DEV-{String(dev.id).padStart(4, '0')}</TableCell>
                  <TableCell>{dev.event}</TableCell>
                  <TableCell>{dev.study}</TableCell>
                  <TableCell>
                    <Chip
                      label={dev.severity}
                      size="small"
                      sx={{
                        backgroundColor: dev.severity === 'High' ? '#FFEBEE' : dev.severity === 'Medium' ? '#FFF3E0' : '#E8F5E9',
                        color: dev.severity === 'High' ? '#D32F2F' : dev.severity === 'Medium' ? '#F57C00' : '#388E3C',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={dev.status}
                      size="small"
                      sx={{
                        backgroundColor: dev.status === 'Closed' ? '#E8F5E9' : '#FFF3E0',
                        color: dev.status === 'Closed' ? '#4CAF50' : '#FF9800',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </MainLayout>
  );
};

export default AdminDashboard;
