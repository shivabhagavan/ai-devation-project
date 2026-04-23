import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService, ROLE_PATHS, ROLES } from '../utils/auth';
import { COLORS } from '../styles/theme';
import LockIcon from '@mui/icons-material/Lock';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DM Owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password || !role) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const user = authService.login(username, password, role);
      const redirectPath = ROLE_PATHS[role];
      navigate(redirectPath);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        backgroundImage: `linear-gradient(135deg, ${COLORS.sidebarDark} 0%, ${COLORS.primaryButton} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            padding: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            borderRadius: '12px',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: COLORS.primaryButton,
                color: '#FFFFFF',
                mb: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              DEVMEM AI
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
              Deviation Management Intelligence Hub
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              disabled={loading}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              disabled={loading}
              variant="outlined"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Select Role</InputLabel>
              <Select
                value={role}
                label="Select Role"
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="DM Owner">DM Owner</MenuItem>
                <MenuItem value="DM QA">DM QA</MenuItem>
                <MenuItem value="DM Approver">DM Approver</MenuItem>
                <MenuItem value="System Admin">System Admin</MenuItem>
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                backgroundColor: COLORS.primaryButton,
                '&:hover': {
                  backgroundColor: COLORS.sidebarDark,
                },
              }}
              onClick={handleLogin}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Info */}
          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${COLORS.borderLight}` }}>
            <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block', mb: 2 }}>
              Demo Credentials (any username/password combination)
            </Typography>
            <Box sx={{ backgroundColor: '#F5F7FA', padding: 2, borderRadius: 1 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                <strong>Role-based Dashboards:</strong>
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                • DM Owner → Create & manage deviations
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                • DM QA → Investigate & add root causes
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                • DM Approver → Review & approve/reject
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                • System Admin → Full system access
              </Typography>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
