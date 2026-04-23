import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { COLORS } from '../../styles/theme';

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <Box
          component="main"
          sx={{
            flex: 1,
            marginTop: '64px',
            padding: '32px',
            backgroundColor: COLORS.background,
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
