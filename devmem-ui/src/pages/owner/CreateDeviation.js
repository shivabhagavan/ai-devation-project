import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import MainLayout from '../../components/Layout/MainLayout';
import { COLORS } from '../../styles/theme';
import ScienceIcon from '@mui/icons-material/Science';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CreateDeviation = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    deviationTitle: '',
    productName: '',
    batchNumber: '',
    department: '',
    dateOccurrence: '',
    dateDetection: '',
    location: '',
    reportedBy: '',
    processStage: '',
    severity: 'Medium',
    narrativeObservation: '',
    immediateAction: '',
    isProductImpacted: false,
    impactDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      let documentFilename = null;
      let documentContent = null;

      if (selectedFile) {
        documentFilename = selectedFile.name;
        documentContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result || '').toString().split(',')[1] || '');
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      const payload = {
        event: form.deviationTitle,
        date: form.dateOccurrence,
        study: form.productName,
        detection_method: form.narrativeObservation,
        immediate_action: form.immediateAction,
        impact_description: form.impactDescription,
        department: form.department,
        batch_number: form.batchNumber,
        location: form.location,
        reported_by: form.reportedBy,
        is_product_impacted: form.isProductImpacted,
        document_filename: documentFilename,
        document_content: documentContent,
      };

      const response = await axios.post('http://localhost:8000/analyze-deviation', payload);
      const deviationId = response.data.id;
      setSuccess(true);
      setTimeout(() => {
        navigate(`/owner/draft-review/${deviationId}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while creating the deviation');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  // Calculate form completion
  const requiredFields = ['productName', 'batchNumber', 'dateOccurrence', 'dateDetection', 'narrativeObservation'];
  const filledCount = requiredFields.filter(f => form[f] && form[f].toString().trim() !== '').length;
  const progress = Math.round((filledCount / requiredFields.length) * 100);

  return (
    <MainLayout>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2,
            background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <WarningAmberIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.text.primary, letterSpacing: '-0.5px' }}>
              Initiate Deviation
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
              Document a new deviation event and trigger AI-powered investigation
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.text.primary, whiteSpace: 'nowrap' }}>
          Form Completion
        </Typography>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10, borderRadius: 5,
              backgroundColor: '#E3F2FD',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: progress === 100
                  ? 'linear-gradient(90deg, #2E7D32 0%, #43A047 100%)'
                  : 'linear-gradient(90deg, #1565C0 0%, #42A5F5 100%)',
              },
            }}
          />
        </Box>
        <Chip
          label={`${filledCount}/${requiredFields.length} fields`}
          size="small"
          sx={{
            fontWeight: 600, fontSize: '0.75rem',
            backgroundColor: progress === 100 ? '#E8F5E9' : '#E3F2FD',
            color: progress === 100 ? '#2E7D32' : '#1565C0',
          }}
        />
      </Paper>

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Deviation created successfully! AI is generating the investigation draft. Redirecting to review...
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Form Column */}
        <Grid item xs={12} md={8}>

          {/* Section 1: Deviation Information */}
          <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <ScienceIcon sx={{ color: '#1565C0', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.text.primary }}>
                Section 1: Deviation Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField label="Product Name" name="productName" value={form.productName} onChange={handleChange} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Batch Number" name="batchNumber" value={form.batchNumber} onChange={handleChange} fullWidth required placeholder="e.g., BAT-2026-001" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Date of Occurrence" name="dateOccurrence" type="date" value={form.dateOccurrence} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Date of Detection" name="dateDetection" type="date" value={form.dateDetection} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Deviation Description */}
          <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <DescriptionIcon sx={{ color: '#1565C0', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.text.primary }}>
                Section 2: Deviation Description
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  label="Narrative Observation"
                  name="narrativeObservation"
                  value={form.narrativeObservation}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={4}
                  required
                  placeholder="Describe the deviation event in detail — what happened, when it was noticed, and supporting observations..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <CloudUploadIcon sx={{ color: '#1565C0', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.text.primary }}>
                Section 3: Upload / Attach (Optional)
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                Upload / Attach
                <input type="file" hidden onChange={handleFileSelect} />
              </Button>
              <Typography variant="body2" sx={{ color: COLORS.text.secondary }}>
                {selectedFile ? `Attached: ${selectedFile.name}` : 'No file attached'}
              </Typography>
              {selectedFile && (
                <Button size="small" color="error" onClick={() => setSelectedFile(null)}>
                  Remove
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/owner/dashboard')}
              sx={{
                textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3,
                borderColor: COLORS.text.secondary, color: COLORS.text.secondary,
                '&:hover': { borderColor: COLORS.text.primary, color: COLORS.text.primary, backgroundColor: '#f5f5f5' },
              }}
            >
              Cancel
            </Button>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                sx={{
                  textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3,
                  borderColor: '#1565C0', color: '#1565C0',
                  '&:hover': { borderColor: '#0D47A1', backgroundColor: 'rgba(21, 101, 192, 0.05)' },
                }}
              >
                Save Draft
              </Button>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSubmit}
                disabled={loading || progress < 100}
                sx={{
                  textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 4, minWidth: 220,
                  background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                  boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, #0D47A1 0%, #0A3A82 100%)', boxShadow: '0 6px 16px rgba(21, 101, 192, 0.4)' },
                  '&:disabled': { background: '#ccc', boxShadow: 'none' },
                }}
              >
                {loading ? 'Submitting...' : 'Run AI Investigation'}
              </Button>
            </Stack>
          </Box>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3, background: '#F8FAFC' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: COLORS.text.primary }}>
              Quick Guide
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: '1. Fill deviation details', desc: 'Product, batch, and dates' },
                { label: '2. Describe the event', desc: 'Provide narrative observation' },
                { label: '3. Submit for AI analysis', desc: 'AI generates investigation report' },
              ].map((step, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: filledCount > i * 2 ? '#1565C0' : '#E0E0E0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                  }}>
                    {i + 1}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.text.primary }}>{step.label}</Typography>
                    <Typography variant="caption" sx={{ color: COLORS.text.secondary }}>{step.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: '#FFFDE7' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <WarningAmberIcon sx={{ color: '#F9A825', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F57F17' }}>
                Important
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#5D4037', lineHeight: 1.6 }}>
              All deviations must be reported within 24 hours of detection per SOP-DEV-001.
              Critical deviations require immediate notification to QA Head.
              Ensure all mandatory fields (marked with *) are completed before submission.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default CreateDeviation;
