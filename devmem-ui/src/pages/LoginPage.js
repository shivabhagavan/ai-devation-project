import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Avatar,
  Container,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import { Security } from '@mui/icons-material';
const LoginPage = () => {
  const navigate = useNavigate();
  const [personnelContext, setPersonnelContext] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    
    if (!username || !password || !personnelContext) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/auth/login', {
        username,
        password,
        role: personnelContext
      });

      // Store user info in session storage
      sessionStorage.setItem('user', JSON.stringify({
        username: response.data.user.username,
        role: response.data.user.role,
        token: response.data.token
      }));

      navigate('/owner-workspace');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
        p: 2,
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: '12px',
            boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
            p: 4,
            backgroundColor: '#ffffff',
          }}
        >
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{
                bgcolor: '#1565C0',
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
              }}
            >
              <Security sx={{ fontSize: 32, color: 'white' }} />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2F80ED', mb: 1 }}>
              DEVMEM AI
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#6B7280', mb: 3 }}>
              Deviation Management Intelligence Hub
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Role</InputLabel>
              <Select
                value={personnelContext}
                onChange={(e) => setPersonnelContext(e.target.value)}
                label="Select Role"
                variant="outlined"
              >
                <MenuItem value="DM Owner">DM Owner - Create deviation, view cases</MenuItem>
                <MenuItem value="DM Approver">DM Approver - Final approval</MenuItem>
                <MenuItem value="DM QA">DM QA - Review & approve</MenuItem>
                <MenuItem value="System Admin">System Admin - Full access</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              sx={{ mb: 2 }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="nothing"
              type="nothing"
              variant="outlined"
              sx={{ mb: 3 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: '#2F80ED',
                '&:hover': { bgcolor: '#1a5dc7' },
                '&:disabled': { bgcolor: '#ccc' },
                height: 45,
                borderRadius: '10px',
                textTransform: 'none',
              }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Access Portal'}
            </Button>
          </CardContent>
        </Card>
        <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center', mt: 2 }}>
          © 2026 DevMem AI Platform
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;