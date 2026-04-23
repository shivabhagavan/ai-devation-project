import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  CheckCircle,
  Search as SearchIcon
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

const cards = [
  { label: 'My Total Cases', value: 25, icon: <FolderOpen sx={{ color: '#2F80ED' }} />, unit: '' },
  { label: 'Pending Review', value: 15, icon: <AccessTime sx={{ color: '#2F80ED' }} />, unit: '' },
  { label: 'Closed Cases', value: 3, icon: <CheckCircle sx={{ color: '#2F80ED' }} />, unit: '' },
  { label: 'Completion Rate', value: 85, icon: <CheckCircle sx={{ color: '#2F80ED' }} />, unit: '%' },
  { label: 'Average Closure Time', value: 2.5, icon: <AccessTime sx={{ color: '#2F80ED' }} />, unit: ' days' }
];

const rowsData = [
  { ref: 'CASE-2024-701', product: 'Gastro Shield', date: '2024-08-01', status: 'Assigned', attachments: 'View Files' },
  { ref: 'CASE-2024-702', product: 'Pulmo Clear', date: '2024-08-05', status: 'Assigned', attachments: 'View Files' },
  { ref: 'CASE-2024-703', product: 'Ortho Heal', date: '2024-08-09', status: 'Assigned', attachments: 'View Files' }
];

const pieColors = ['#2F80ED', '#FFA500', '#28A745', '#6F42C1'];

  const lineData = [
    { month: 'Jan', deviations: 12 },
    { month: 'Feb', deviations: 19 },
    { month: 'Mar', deviations: 15 },
    { month: 'Apr', deviations: 25 },
    { month: 'May', deviations: 22 },
    { month: 'Jun', deviations: 18 }
  ];

  const pieData = [
    { name: 'Open', value: 10 },
    { name: 'Assigned', value: 15 },
    { name: 'Closed', value: 5 },
    { name: 'Review', value: 3 }
  ];

function OwnerWorkspace() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [statsCards, setStatsCards] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch metrics for stats cards
      const metricsResponse = await axios.get('http://localhost:8000/dashboard-metrics');
      const metrics = metricsResponse.data;

      const updatedCards = [
        { label: 'My Total Cases', value: metrics.total_deviations, icon: <FolderOpen sx={{ color: '#2F80ED' }} />, unit: '' },
        { label: 'Pending Review', value: metrics.open, icon: <AccessTime sx={{ color: '#2F80ED' }} />, unit: '' },
        { label: 'Closed Cases', value: metrics.closed, icon: <CheckCircle sx={{ color: '#2F80ED' }} />, unit: '' },
        { label: 'High Severity', value: metrics.high, icon: <CheckCircle sx={{ color: '#2F80ED' }} />, unit: '' },
        { label: 'Medium Severity', value: metrics.medium, icon: <AccessTime sx={{ color: '#2F80ED' }} />, unit: '' }
      ];
      setStatsCards(updatedCards);

      // Fetch chart data
      const chartResponse = await axios.get('http://localhost:8000/dashboard/chart-data');
      setLineData(chartResponse.data.line_chart);
      setPieData(chartResponse.data.pie_chart);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const filteredRows = rowsData
    .filter((row) =>
      row.ref.toLowerCase().includes(search.toLowerCase()) ||
      row.product.toLowerCase().includes(search.toLowerCase())
    )
    .filter((row) => (statusFilter ? row.status === statusFilter : true));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewFiles = (row) => {
    setSelectedAttachment(row);
    setModalOpen(true);
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
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#0B1F3A',
            color: '#fff',
            border: 'none'
          }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#2F80ED', width: 56, height: 56, mb: 1 }}>
            <Security />
          </Avatar>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
            DEVMEM AI
          </Typography>
        </Box>

        <List>
          {menu.map((item) => (
            <ListItemButton
              key={item.label}
              onClick={item.action || (() => navigate(item.path))}
              sx={{
                color: '#fff',
                backgroundColor: item.active ? '#2F80ED' : 'transparent',
                '&:hover': { backgroundColor: '#234a7d' }
              }}
            >
              <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, ml: `${drawerWidth}px`, background: '#F5F7FA', minHeight: '100vh' }}>
        <AppBar position="sticky" elevation={1} sx={{ backgroundColor: '#fff', color: '#000', height: 60, justifyContent: 'center', boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' }}>
          <Toolbar sx={{ justifyContent: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0B1F3A' }}>
              DevMem AI Investigator
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#556680', letterSpacing: 1, mb: 1 }}>
            OWNER WORKSPACE
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            DM Owner – Demo
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <CircularProgress sx={{ color: '#2F80ED' }} />
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {statsCards.map((card) => (
                  <Grid item xs={12} md={4} key={card.label}>
                    <Paper sx={{ p: 2.5, borderRadius: '12px', boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#66788a', fontWeight: 700 }}>
                            {card.label}
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1.5 }}>
                            {card.value}{card.unit}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(47,128,237,0.15)', width: 52, height: 52 }}>
                          {card.icon}
                        </Avatar>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                      Compliance Deviation Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="deviations" stroke="#2F80ED" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                      Workflow Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
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
