import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Paper, Typography, TextField, Button, Grid, Alert, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CreateDeviation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    reportDate: '',
    narrativeObservation: '',
    investigationDetails: '',
    rootCause: '',
    correctiveAction: '',
    preventiveAction: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.productName || !formData.reportDate || !formData.narrativeObservation) {
      setError('Please fill in all required fields (Product Name, Report Date, Narrative Observation)');
      return;
    }

    setLoading(true);
    try {
      // Convert file to base64 if selected
      let documentContent = null;
      let documentFilename = null;
      
      if (selectedFile) {
        documentContent = await convertFileToBase64(selectedFile);
        documentFilename = selectedFile.name;
      }

      // Use the AI analysis endpoint instead of manual creation
      const response = await axios.post('http://localhost:8000/analyze-deviation', {
        event: formData.narrativeObservation,
        date: formData.reportDate,
        study: formData.productName,
        detection_method: formData.detectionMethod || 'Manual reporting',
        immediate_action: formData.immediateAction || 'Under investigation',
        document_filename: documentFilename,
        document_content: documentContent
      });

      setSuccess('Deviation analyzed with AI successfully! Redirecting to investigations...');
      setTimeout(() => {
        navigate('/investigations');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze deviation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: '#F5F7FA' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Initiate Deviation
      </Typography>
      <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Product Name"
              fullWidth
              value={formData.productName}
              onChange={handleChange('productName')}
              sx={{ mb: 2 }}
              disabled={loading}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Report Date"
              type="date"
              fullWidth
              value={formData.reportDate}
              onChange={handleChange('reportDate')}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              disabled={loading}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Narrative Observation"
              fullWidth
              multiline
              rows={3}
              value={formData.narrativeObservation}
              onChange={handleChange('narrativeObservation')}
              sx={{ mb: 2 }}
              disabled={loading}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Investigation Details"
              fullWidth
              multiline
              rows={3}
              value={formData.investigationDetails}
              onChange={handleChange('investigationDetails')}
              sx={{ mb: 2 }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Root Cause"
              fullWidth
              multiline
              rows={2}
              value={formData.rootCause}
              onChange={handleChange('rootCause')}
              sx={{ mb: 2 }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Corrective Action"
              fullWidth
              multiline
              rows={2}
              value={formData.correctiveAction}
              onChange={handleChange('correctiveAction')}
              sx={{ mb: 2 }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Preventive Action"
              fullWidth
              multiline
              rows={2}
              value={formData.preventiveAction}
              onChange={handleChange('preventiveAction')}
              sx={{ mb: 2 }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                Upload Supporting Document (Optional)
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1.5 }}>
                PDF, DOC, DOCX, or TXT files up to 5MB - visible to QA and Approver
              </Typography>
              <input
                type="file"
                id="deviation-file-input"
                onChange={handleFileSelect}
                disabled={loading}
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
              />
              <label htmlFor="deviation-file-input" style={{ display: 'block' }}>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  disabled={loading}
                  sx={{
                    color: selectedFile ? '#4CAF50' : '#2F80ED',
                    borderColor: selectedFile ? '#4CAF50' : '#2F80ED',
                    '&:hover': {
                      borderColor: selectedFile ? '#4CAF50' : '#1a5dc7',
                      backgroundColor: selectedFile ? 'rgba(76, 175, 80, 0.05)' : 'rgba(47, 128, 237, 0.05)'
                    }
                  }}
                >
                  {selectedFile ? `✓ ${selectedFile.name}` : 'Choose File'}
                </Button>
              </label>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                bgcolor: '#2F80ED',
                '&:hover': { bgcolor: '#1a5dc7' },
                '&:disabled': { bgcolor: '#ccc' },
                height: 48,
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ color: '#fff' }} />
                  Creating Deviation...
                </>
              ) : (
                'Submit for Quality Review'
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CreateDeviation;
