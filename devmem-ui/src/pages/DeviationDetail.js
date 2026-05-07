import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from "../api";   // ✅ ADDED
import { authService } from '../utils/auth';
import {
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  TextField,
} from '@mui/material';
import { ArrowBack, Print } from '@mui/icons-material';

const DeviationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deviation, setDeviation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signatures, setSignatures] = useState({});
  const [signatureDraft, setSignatureDraft] = useState('');
  const [signatureSaving, setSignatureSaving] = useState(false);
  const currentUser = authService.getUser();

  useEffect(() => {
    fetchDeviationDetail();
  }, [id]);

  const fetchDeviationDetail = async () => {
    try {
      setLoading(true);

      // ✅ FIXED
      const response = await axios.get(`${BASE_URL}/deviation/${id}`, {
        timeout: 10000
      });

      let data = response.data;

      if (typeof data.root_cause === 'string') {
        try { data.root_cause = JSON.parse(data.root_cause); } catch {}
      }

      if (typeof data.capa === 'string') {
        try { data.capa = JSON.parse(data.capa); } catch {}
      }

      setDeviation(data);
      setSignatures(data.signatures || {});
      setSignatureDraft(currentUser?.username || '');

    } catch (err) {
      console.error('Error fetching deviation:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to load deviation details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureSave = async () => {
    if (!signatureDraft.trim()) return;

    setSignatureSaving(true);

    try {
      // ✅ FIXED
      const response = await axios.put(
        `${BASE_URL}/deviation/${id}/signature`,
        {
          role: currentUser.role,
          name: signatureDraft.trim(),
        },
        { timeout: 10000 }
      );

      setSignatures(response.data.signatures || {});

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to save signature'
      );
    } finally {
      setSignatureSaving(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#FFFFFF' }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/investigations')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">DevMem AI Investigator</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ width: '900px', p: 5 }}>

          <Typography variant="h4" sx={{ textAlign: 'center', mb: 4 }}>
            COMPLIANCE MEMO
          </Typography>

          <Typography><b>CASE ID:</b> CASE-{deviation.id}</Typography>
          <Typography><b>Date:</b> {deviation.date}</Typography>

          <Typography>
            <b>Severity:</b>
            <Chip label={deviation.severity} color={getSeverityColor(deviation.severity)} size="small" />
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6">Description</Typography>
          <Typography>{deviation.event}</Typography>

          <Typography variant="h6" sx={{ mt: 3 }}>Product</Typography>
          <Typography>{deviation.study}</Typography>

          <Typography variant="h6" sx={{ mt: 3 }}>AI Memo</Typography>
          <Paper sx={{ p: 2, mt: 1 }}>
            <Typography>{deviation.deviation_memo_draft}</Typography>
          </Paper>

          <Divider sx={{ my: 3 }} />

          <TextField
            fullWidth
            value={signatureDraft}
            onChange={(e) => setSignatureDraft(e.target.value)}
            placeholder="Enter signature"
          />

          <Button onClick={handleSignatureSave} disabled={signatureSaving}>
            {signatureSaving ? 'Signing...' : 'Sign'}
          </Button>

          <Button startIcon={<Print />} sx={{ ml: 2 }} onClick={() => window.print()}>
            Print
          </Button>

        </Paper>
      </Box>
    </Box>
  );
};

export default DeviationDetail;