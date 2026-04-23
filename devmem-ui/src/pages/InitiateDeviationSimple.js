import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
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

const InitiateDeviationSimple = () => {
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
    if (e.target.value !== 'yes') {
      setForm(f => ({ ...f, impactDescription: '' }));
    }
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
    // TODO: Implement actual API call with form data and files
    setTimeout(() => {
      setSubmitting(false);
      // On success, redirect to My Deviations
      navigate('/my-deviations');
    }, 1200);
  };

  return (
    <Box sx={{ background: '#F5F7FA', minHeight: '100vh', py: 4 }}>
      <Box maxWidth="md" mx="auto">
        <Typography variant="h4" fontWeight={700} mb={2} color="primary.main" letterSpacing={1.5}>
          INITIATE DEVIATION
        </Typography>
        <Stepper activeStep={0} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* SECTION 1 — BASIC INFORMATION */}
        <CardSection>
          <CardContent>
            <SectionTitle variant="h6">Section 1 — Basic Information</SectionTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Product Name"
                  name="productName"
                  value={form.productName}
                  onChange={handleInput}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Batch Number"
                  name="batchNumber"
                  value={form.batchNumber}
                  onChange={handleInput}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Department</InputLabel>
                  <Select
                    label="Department"
                    name="department"
                    value={form.department}
                    onChange={handleInput}
                    required
                  >
                    {departments.map(dep => (
                      <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Occurrence"
                  name="dateOccurrence"
                  type="date"
                  value={form.dateOccurrence}
                  onChange={handleInput}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Detection"
                  name="dateDetection"
                  type="date"
                  value={form.dateDetection}
                  onChange={handleInput}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleInput}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Reported By"
                  name="reportedBy"
                  value={form.reportedBy}
                  onChange={handleInput}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </CardSection>

        {/* SECTION 2 — DEVIATION DESCRIPTION */}
        <CardSection>
          <CardContent>
            <SectionTitle variant="h6">Section 2 — Deviation Description</SectionTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Deviation Title"
                  name="deviationTitle"
                  value={form.deviationTitle}
                  onChange={handleInput}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Narrative Observation"
                  name="narrativeObservation"
                  value={form.narrativeObservation}
                  onChange={handleInput}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  multiline
                  minRows={4}
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </CardSection>

        {/* SECTION 3 — IMMEDIATE ACTION */}
        <CardSection>
          <CardContent>
            <SectionTitle variant="h6">Section 3 — Immediate Action</SectionTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Immediate Action Taken"
                  name="immediateAction"
                  value={form.immediateAction}
                  onChange={handleInput}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  multiline
                  minRows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Is Product Impacted?</InputLabel>
                  <Select
                    label="Is Product Impacted?"
                    name="isProductImpacted"
                    value={form.isProductImpacted ? 'yes' : 'no'}
                    onChange={handleProductImpacted}
                  >
                    <MenuItem value="yes">Yes</MenuItem>
                    <MenuItem value="no">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {form.isProductImpacted && (
                <Grid item xs={12}>
                  <TextField
                    label="Impact Description"
                    name="impactDescription"
                    value={form.impactDescription}
                    onChange={handleInput}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    multiline
                    minRows={2}
                    required
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </CardSection>

        {/* SECTION 4 — ATTACHMENTS */}
        <CardSection>
          <CardContent>
            <SectionTitle variant="h6">Section 4 — Attachments</SectionTitle>
            <FileDropArea
              isdragactive={dragActive ? 1 : 0}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload-input').click()}
              elevation={0}
            >
              <CloudUploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body1" color="textSecondary">
                Drag & drop files here, or click to upload
              </Typography>
              <input
                id="file-upload-input"
                type="file"
                multiple
                accept={allowedFileTypes}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </FileDropArea>
            <List dense>
              {files.map((file, idx) => (
                <ListItem key={idx} secondaryAction={
                  <IconButton edge="end" onClick={() => handleFileDelete(idx)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                }>
                  <ListItemIcon>
                    <InsertDriveFileIcon color="action" />
                  </ListItemIcon>
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </CardSection>

        {/* BOTTOM BUTTONS */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleSaveDraft}
            disabled={submitting}
            sx={{ borderRadius: 8, minWidth: 140 }}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ borderRadius: 8, minWidth: 180, fontWeight: 700 }}
          >
            Submit Deviation
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InitiateDeviationSimple;
