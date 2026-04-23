import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Drawer,
  Typography,
  AppBar,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TableContainer,
  TablePagination,
  Paper,
  Avatar,
  CircularProgress,
  Box as MuiBox
} from '@mui/material';
import {
  Security,
  WorkspacePremium,
  AddCircleOutline,
  FolderOpen,
  Description,
  PieChartOutline,
  Settings,
  Logout,
  Search as SearchIcon,
  GetApp
} from '@mui/icons-material';

const drawerWidth = 260;

const rowsData = [
  { ref: 'CASE-2024-701', product: 'Gastro Shield', date: '2024-08-01', status: 'Assigned', attachments: 'View Files' },
  { ref: 'CASE-2024-702', product: 'Pulmo Clear', date: '2024-08-05', status: 'Assigned', attachments: 'View Files' },
  { ref: 'CASE-2024-703', product: 'Ortho Heal', date: '2024-08-09', status: 'Assigned', attachments: 'View Files' },
  { ref: 'CASE-2024-704', product: 'Neuro Flex', date: '2024-08-12', status: 'Pending', attachments: 'View Files' },
  { ref: 'CASE-2024-705', product: 'Cardio Boost', date: '2024-08-15', status: 'Closed', attachments: 'View Files' }
];

const statusColors = {
  Assigned: 'primary',
  Pending: 'warning',
  Closed: 'success',
  Review: 'secondary'
};

function DeviationTablePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deviations, setDeviations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeviations();
  }, []);

  const fetchDeviations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/deviations');
      setDeviations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deviations:', error);
      setLoading(false);
    }
  };

  // Transform API data to table format
  const tableData = deviations.map((d, idx) => ({
    id: d.id,
    ref: `CASE-${d.id}`,
    product: d.event,
    date: d.date,
    status: d.status || 'Open',
    attachments: 'View Files'
  }));

  const filteredRows = tableData
    .filter((row) =>
      row.ref.toLowerCase().includes(search.toLowerCase()) ||
      row.product.toLowerCase().includes(search.toLowerCase())
    )
    .filter((row) => (statusFilter ? row.status === statusFilter : true))
    .filter((row) => (dateFilter ? row.date.includes(dateFilter) : true));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    // Export logic
    alert('Exporting data...');
  };

  const menu = [
    { label: 'Dashboard', icon: <WorkspacePremium />, path: '/owner-workspace' },
    { label: 'Create Deviation', icon: <AddCircleOutline />, path: '/create-deviation' },
    { label: 'Investigations', icon: <FolderOpen />, path: '/investigations', active: true },
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
              onClick={() => navigate(item.path)}
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
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Deviation Investigations
          </Typography>

          <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0px 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
                Deviation Cases
              </Typography>
              <TextField
                size="small"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cases"
                sx={{ width: 200 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              />
              <FormControl size="small" sx={{ width: 140 }}>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty>
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Assigned">Assigned</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                sx={{ width: 160 }}
              />
              <Button
                variant="contained"
                startIcon={<GetApp />}
                onClick={handleExport}
                sx={{ bgcolor: '#2F80ED', '&:hover': { bgcolor: '#1a5dc7' } }}
              >
                Export
              </Button>
            </Box>

            {loading ? (
              <MuiBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress sx={{ color: '#2F80ED' }} />
              </MuiBox>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Case Reference</TableCell>
                        <TableCell>Product Name</TableCell>
                        <TableCell>Report Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Attachments</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                            <Typography>No deviations found</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        (filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)).map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.ref}</TableCell>
                            <TableCell>{row.product}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>
                              <Chip label={row.status} color={statusColors[row.status] || 'default'} size="small" />
                            </TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined">
                                {row.attachments}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button size="small" variant="contained" sx={{ mr: 1, bgcolor: '#2F80ED' }} onClick={() => navigate(`/deviation/${row.id}`)}>
                                View
                              </Button>
                              <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                                Investigate
                              </Button>
                              <Button size="small" variant="outlined">
                                Memo
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={filteredRows.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 15]}
                />
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default DeviationTablePage;