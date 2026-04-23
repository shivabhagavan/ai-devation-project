import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService, roleConfig } from '../../utils/auth';
import { COLORS } from '../../styles/theme';
import LogoutIcon from '@mui/icons-material/Logout';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getUser();
  const navItems = roleConfig[user?.role]?.navItems || [];

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: COLORS.sidebarDark,
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          DEVMEM AI
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Deviation Management Intelligence Hub
        </Typography>
      </Box>

      <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', my: 2, mx: 2, borderRadius: 1 }}>
        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
          Current Role
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {user?.role}
        </Typography>
      </Box>

      <List sx={{ flex: 1, px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1,
                backgroundColor:
                  location.pathname === item.path
                    ? COLORS.sidebarSelected
                    : 'transparent',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: COLORS.sidebarSelected,
                },
                '&.Mui-selected': {
                  backgroundColor: COLORS.sidebarSelected,
                  '&:hover': {
                    backgroundColor: COLORS.sidebarSelected,
                  },
                },
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: location.pathname === item.path ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleLogout}
          sx={{
            color: '#FFFFFF',
            borderColor: 'rgba(255,255,255,0.5)',
            '&:hover': {
              borderColor: '#FFFFFF',
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
          startIcon={<LogoutIcon />}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
