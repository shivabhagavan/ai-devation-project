
import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MainLayout from '../components/MainLayout';
import { useNavigate } from 'react-router-dom';

  const steps = [
    'Initiation',
    'Investigation',
    'QA Review',
    'Approval',
    'Closure'
  ];

  const departments = [
    'Manufacturing',
    'QC',
    'QA',
    'Warehouse',
    'Engineering'
  ];

  const CardSection = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  }));

  const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
    letterSpacing: 1.2,
  }));

  const FileDropArea = styled(Paper)(({ theme, isdragactive }) => ({
    border: '2px dashed #1565C0',
    background: isdragactive ? '#e3f2fd' : '#fafbfc',
    padding: theme.spacing(3),
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: theme.spacing(2),
  }));

  const initialForm = {
    productName: '',
    batchNumber: '',
    department: '',
    dateOccurrence: '',
    dateDetection: '',
    location: '',
    reportedBy: '',
    deviationTitle: '',
    narrativeObservation: '',
    immediateAction: '',
    isProductImpacted: false,
    impactDescription: '',
  };

  const allowedFileTypes = '.pdf,.jpg,.jpeg,.png,.xlsx,.docx';

  const InitiateDeviation = () => {
    const [form, setForm] = useState(initialForm);
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleInput = (e) => {
      const { name, value, type, checked } = e.target;
      setForm(f => ({
        ...f,
        [name]: type === 'checkbox' ? checked : value
      }));
    };

    const handleProductImpacted = (e) => {
      setForm(f => ({ ...f, isProductImpacted: e.target.value === 'yes' }));
    };

    const handleFileChange = (e) => {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setDragActive(false);
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      setDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      setDragActive(false);
    };

    const handleFileDelete = (idx) => {
      setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSaveDraft = () => {
      // TODO: Implement save draft logic (API call)
      alert('Draft saved (not implemented)');
    };

    const handleSubmit = async () => {
      setSubmitting(true);
      try {
        let documentFilename = null;
        let documentContent = null;

        if (files.length > 0) {
          const fileToEncode = files[0];
          documentFilename = fileToEncode.name;
          documentContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result || '').toString().split(',')[1] || '');
            reader.onerror = reject;
            reader.readAsDataURL(fileToEncode);
          });
        }

        // Map form fields to backend expected payload
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

        // Call FastAPI backend
        const response = await axios.post('http://localhost:8000/analyze-deviation', payload);
        setSubmitting(false);
        // On success, redirect to My Deviations or show a message
        navigate('/my-deviations');
      } catch (error) {
        setSubmitting(false);
        alert('Failed to submit deviation: ' + (error.response?.data?.detail || error.message));
      }
    };

    return (
      <MainLayout>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
          Initiate Deviation
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3, background: '#fff', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Section 1: Deviation Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Deviation Title" name="deviationTitle" value={form.deviationTitle} onChange={handleInput} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Product" name="productName" value={form.productName} onChange={handleInput} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Batch Number" name="batchNumber" value={form.batchNumber} onChange={handleInput} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Date of Occurrence" name="dateOccurrence" type="date" value={form.dateOccurrence} onChange={handleInput} fullWidth InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Date of Detection" name="dateDetection" type="date" value={form.dateDetection} onChange={handleInput} fullWidth InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Process Stage</InputLabel>
                    <Select label="Process Stage" name="processStage" value={form.processStage || ''} onChange={handleInput}>
                      {['Manufacturing', 'Packing', 'Warehouse', 'QC', 'QA'].map((stage) => (
                        <MenuItem key={stage} value={stage}>{stage}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Department</InputLabel>
                    <Select label="Department" name="department" value={form.department} onChange={handleInput}>
                      {['Production', 'Quality Control', 'Quality Assurance', 'Engineering', 'Warehouse'].map((dep) => (
                        <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3, background: '#fff', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Section 2: Deviation Description
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField label="Description" name="narrativeObservation" value={form.narrativeObservation} onChange={handleInput} fullWidth multiline minRows={3} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Immediate Action Taken" name="immediateAction" value={form.immediateAction} onChange={handleInput} fullWidth multiline minRows={2} required />
                </Grid>
              </Grid>
            </Paper>
            <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3, background: '#fff', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Section 3: Reporter Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Reported By" name="reportedBy" value={form.reportedBy} onChange={handleInput} fullWidth required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Reported Date" name="dateDetection" type="date" value={form.dateDetection} onChange={handleInput} fullWidth InputLabelProps={{ shrink: true }} required />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3, background: '#fff', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Section 4: Upload / Attach (Optional)
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FileDropArea
                isdragactive={dragActive ? 1 : 0}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Drag and drop files here, or use the button below.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Accepted: {allowedFileTypes}
                </Typography>
                <Button variant="outlined" component="label">
                  Choose File(s)
                  <input type="file" hidden multiple accept={allowedFileTypes} onChange={handleFileChange} />
                </Button>
              </FileDropArea>

              {files.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Attached Files ({files.length})
                  </Typography>
                  {files.map((file, idx) => (
                    <Box
                      key={`${file.name}-${idx}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1,
                        px: 2,
                        py: 1,
                        backgroundColor: '#F5F7FA',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2">{file.name}</Typography>
                      <Button size="small" color="error" onClick={() => handleFileDelete(idx)}>
                        Remove
                      </Button>
                    </Box>
                  ))}
                  <Typography variant="caption" color="text.secondary">
                    Note: currently the first attached file is sent to AI drafting.
                  </Typography>
                </Box>
              )}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button variant="contained" color="primary" size="large" sx={{ borderRadius: 2, minWidth: 220, fontWeight: 700 }} onClick={handleSubmit} disabled={submitting}>
                Run AI Investigation
              </Button>
            </Box>
          </Grid>
        </Grid>
      </MainLayout>
    );
  };

export default InitiateDeviation;
