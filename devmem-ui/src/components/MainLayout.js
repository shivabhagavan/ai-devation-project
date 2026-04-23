import React from 'react';
import { Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Initiate Deviation', icon: <AssignmentIcon />, path: '/initiate-deviation' },
  { label: 'Reports', icon: <TableChartIcon />, path: '/reports' },
];

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', background: '#f1f5f9', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#0f172a',
            color: '#fff',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            DEVMEM AI
          </Typography>
        </Toolbar>
        <List>
          {navItems.map((item) => (
            <ListItem button key={item.label} onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box sx={{ flexGrow: 1, ml: `${drawerWidth}px` }}>
        <AppBar position="fixed" sx={{ ml: `${drawerWidth}px`, background: '#fff', color: '#0f172a', boxShadow: 'none', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar>
            <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
              Pharmaceutical Deviation Management System
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Box sx={{ p: 4 }}>{children}</Box>
      </Box>
    </Box>
  );
}
