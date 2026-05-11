import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../api';
import {
  Box,
  Drawer,
  Avatar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Security,
  WorkspacePremium,
  AddCircleOutline,
  PieChartOutline,
  Description,
  Settings,
  Logout,
  FolderOpen,
  AccessTime,
  CheckCircle
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';



const drawerWidth = 260;
const pieColors = ['#2F80ED', '#FFA500', '#28A745', '#6F42C1'];

function OwnerWorkspace() {
  const navigate = useNavigate();

  const [statsCards, setStatsCards] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {

      // 🔹 Metrics
      const metrics = await get('/dashboard-metrics');

      const updatedCards = [
        { label: 'My Total Cases', value: metrics.total_deviations, icon: <FolderOpen sx={{ color: '#2F80ED' }} />, unit: '' },
        { label: 'Pending Review', value: metrics.open, icon: <AccessTime sx={{ color: '#2F80ED' }} />, unit: '' },
        { label: 'Closed Cases', value: metrics.closed, icon: <CheckCircle sx={{ color: '#2F80ED' }} />, unit: '' },
        { label: 'High Severity', value: metrics.high, icon: <CheckCircle sx={{ color: '#2F80ED' }} />, unit: '' },
        { label: 'Medium Severity', value: metrics.medium, icon: <AccessTime sx={{ color: '#2F80ED' }} />, unit: '' }
      ];

      setStatsCards(updatedCards);


      // 🔹 Charts
      const chartData = await get('/dashboard/chart-data');
      setLineData(chartData.line_chart || []);
      setPieData(chartData.pie_chart || []);

    } catch (error) {
      console.error('Dashboard API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const menu = [
    { label: 'Dashboard', icon: <WorkspacePremium />, path: '/owner-workspace', active: true },
    { label: 'Create Deviation', icon: <AddCircleOutline />, path: '/create-deviation' },
    { label: 'Investigations', icon: <FolderOpen />, path: '/investigations' },
    { label: 'Compliance Memo', icon: <Description />, path: '/compliance' },
    { label: 'Analytics', icon: <PieChartOutline />, path: '/analytics' },
    { label: 'Settings', icon: <Settings />, path: '/settings' },
    { label: 'Logout', icon: <Logout />, path: '/' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#0B1F3A',
            color: '#fff'
          }
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: '#2F80ED', mx: 'auto', mb: 1 }}>
            <Security />
          </Avatar>
          <Typography variant="h6">DEVMEM AI</Typography>
        </Box>

        <List>
          {menu.map((item) => (
            <ListItemButton
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                color: '#fff',
                backgroundColor: item.active ? '#2F80ED' : 'transparent'
              }}
            >
              <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main */}
      <Box sx={{ flexGrow: 1, ml: `${drawerWidth}px`, background: '#F5F7FA' }}>
        <AppBar position="sticky" sx={{ backgroundColor: '#fff', color: '#000' }}>
          <Toolbar sx={{ justifyContent: 'center' }}>
            <Typography variant="h6">DevMem AI Investigator</Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            DM Owner – Dashboard
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Cards */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {statsCards.map((card) => (
                  <Grid item xs={12} md={4} key={card.label}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2">{card.label}</Typography>
                      <Typography variant="h4">{card.value}{card.unit}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Charts */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6">Deviation Trends</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="deviations" stroke="#2F80ED" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6">Workflow Distribution</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default OwnerWorkspace;