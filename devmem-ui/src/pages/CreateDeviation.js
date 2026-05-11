import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ USE CENTRAL API
import { post } from "../api";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert
} from '@mui/material';

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
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!formData.productName || !formData.reportDate || !formData.narrativeObservation) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      let documentContent = null;
      let documentFilename = null;

      if (selectedFile) {
        documentContent = await convertFileToBase64(selectedFile);
        documentFilename = selectedFile.name;
      }

      // ✅ CLEAN API CALL
      await post("/analyze-deviation", {
        event: formData.narrativeObservation,
        date: formData.reportDate,
        study: formData.productName,
        detection_method: "Manual reporting",
        immediate_action: "Under investigation",
        document_filename: documentFilename,
        document_content: documentContent
      });

      setSuccess("✅ Deviation submitted successfully!");

      setTimeout(() => {
        navigate('/investigations');
      }, 1500);

    } catch (err) {
      console.error("🔥 CreateDeviation Error:", err);
      setError(err.message || "Failed to analyze deviation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: '#F5F7FA' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Initiate Deviation
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Product Name"
              fullWidth
              value={formData.productName}
              onChange={handleChange('productName')}
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
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CreateDeviation;