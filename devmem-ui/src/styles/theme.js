import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
      dark: '#0B3C91',
    },
    secondary: {
      main: '#F5F7FA',
    },
    success: {
      main: '#2E7D32',
    },
    error: {
      main: '#D32F2F',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#0B3C91',
    },
    h5: {
      fontWeight: 600,
      color: '#333333',
    },
    h6: {
      fontWeight: 600,
      color: '#555555',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#333333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: '8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '4px',
        },
        containedPrimary: {
          backgroundColor: '#1565C0',
          '&:hover': {
            backgroundColor: '#0B3C91',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0B3C91',
          color: '#FFFFFF',
        },
      },
    },
  },
});

export const COLORS = {
  // Sidebar
  sidebarDark: '#0B3C91',
  sidebarSelected: '#1565C0',
  
  // Backgrounds
  background: '#F5F7FA',
  cardWhite: '#FFFFFF',
  lightGray: '#F5F7FA',
  
  // Buttons
  primaryButton: '#1565C0',
  approveButton: '#2E7D32',
  rejectButton: '#D32F2F',
  
  // Text (nested for component compatibility)
  text: {
    primary: '#212121',
    secondary: '#757575',
  },
  textDark: '#333333',
  textMuted: '#888888',
  
  // Borders
  border: {
    light: '#E0E0E0',
  },
  borderLight: '#E0E0E0',
  
  // Primary color variants
  primary: {
    blue: '#1565C0',
    dark: '#0D47A1',
  },
};

export const STATUS_COLORS = {
  'Draft': '#7E57C2',
  'Open': '#FFA726',
  'Under Investigation': '#42A5F5',
  'QA Review': '#5C6BC0',
  'Owner Review': '#EF6C00',
  'Pending QA Review': '#AB47BC',
  'Pending Approval': '#29B6F6',
  'Rework Required': '#EF5350',
  'Closed': '#66BB6A',
};
