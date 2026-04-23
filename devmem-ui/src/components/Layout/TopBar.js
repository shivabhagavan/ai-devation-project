import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  MenuItem,
  Menu,
} from '@mui/material';
import { authService } from '../../utils/auth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { COLORS } from '../../styles/theme';

const TopBar = () => {
  const user = authService.getUser();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'DM Owner':
        return '#FF9800';
      case 'DM QA':
        return '#2196F3';
      case 'DM Approver':
        return '#4CAF50';
      case 'System Admin':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        marginLeft: 280,
        width: 'calc(100% - 280px)',
        backgroundColor: '#FFFFFF',
        color: COLORS.textDark,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1200,
      }}
    >
      <Toolbar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.sidebarDark }}>
            DEVMEM AI
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
            Deviation Management Intelligence Hub
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right', mr: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user?.username}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              sx={{
                backgroundColor: getRoleColor(),
                color: '#FFFFFF',
                fontWeight: 500,
                mt: 0.5,
              }}
            />
          </Box>

          <Box
            onClick={handleMenuOpen}
            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <AccountCircleIcon
              sx={{ fontSize: 40, color: getRoleColor() }}
            />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                <strong>{user?.username}</strong>
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption">{user?.role}</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
