import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  TextField,
  Divider,
  Grid
} from '@mui/material';
import { Close, Print, Save, Notifications, Settings, Person } from '@mui/icons-material';

const ComplianceMemo = () => {
  const [preparedBy, setPreparedBy] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    alert('Memo saved!');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <Toolbar sx={{ justifyContent: 'space-between', height: 60 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2A44' }}>
            DevMem AI Investigator
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ color: '#1F2A44' }}><Notifications /></IconButton>
            <IconButton sx={{ color: '#1F2A44' }}><Settings /></IconButton>
            <IconButton sx={{ color: '#1F2A44' }}><Person /></IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 'calc(100vh - 60px)', backgroundColor: '#FFFFFF' }}>
        <Paper sx={{ width: '900px', maxWidth: '90vw', backgroundColor: '#FFFFFF', borderRadius: '10px', boxShadow: '0px 4px 20px rgba(0,0,0,0.08)', p: 5, border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button variant="contained" startIcon={<Print />} onClick={handlePrint} sx={{ backgroundColor: '#2F3A4F', '&:hover': { backgroundColor: '#1a2533' }, borderRadius: '20px', textTransform: 'none' }}>
              Print / Save
            </Button>
            <IconButton sx={{ color: '#1F2A44' }}><Close /></IconButton>
          </Box>

          <Typography variant="h4" sx={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: '28px', color: '#1F2A44', letterSpacing: '0.5px', mb: 4 }}>
            COMPLIANCE MEMO
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, px: 2 }}>
            <Typography sx={{ fontWeight: 'bold', color: '#1F2A44' }}>CASE ID: <span style={{ fontWeight: 'normal' }}>CASE-2024-701</span></Typography>
            <Typography sx={{ fontWeight: 'bold', color: '#1F2A44' }}>DATE: <span style={{ fontWeight: 'normal' }}>2024-08-01</span></Typography>
            <Typography sx={{ fontWeight: 'bold', color: '#1F2A44' }}>SLA BREACH: <span style={{ fontWeight: 'normal' }}>3 DAYS</span></Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>Deviation Summary</Typography>
            <Typography sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              "The PMDA submission gateway rejected the transmission due to a mismatched SSL certificate on the regional server."
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>Corrective Action</Typography>
            <Typography sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              "Certificate updated and submission retried successfully on Day 16."
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>Preventive Action</Typography>
            <Typography component="div" sx={{ lineHeight: 1.6, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>
              � Monitoring process implemented<br />
              � Certificate expiry alert configured
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, fontFamily: 'Inter, sans-serif', color: '#1F2A44' }}>Signatures</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField label="Prepared By" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} fullWidth variant="standard" sx={{ '& .MuiInput-underline:before': { borderBottomColor: '#E2E8F0' }, '& .MuiInput-underline:after': { borderBottomColor: '#2F80ED' }, '& .MuiInputLabel-root': { color: '#1F2A44' }, '& .MuiInputLabel-root.Mui-focused': { color: '#1F2A44' } }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Reviewed By" value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)} fullWidth variant="standard" sx={{ '& .MuiInput-underline:before': { borderBottomColor: '#E2E8F0' }, '& .MuiInput-underline:after': { borderBottomColor: '#2F80ED' }, '& .MuiInputLabel-root': { color: '#1F2A44' }, '& .MuiInputLabel-root.Mui-focused': { color: '#1F2A44' } }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Approved By" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} fullWidth variant="standard" sx={{ '& .MuiInput-underline:before': { borderBottomColor: '#E2E8F0' }, '& .MuiInput-underline:after': { borderBottomColor: '#2F80ED' }, '& .MuiInputLabel-root': { color: '#1F2A44' }, '& .MuiInputLabel-root.Mui-focused': { color: '#1F2A44' } }} />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave} sx={{ backgroundColor: '#2F80ED', '&:hover': { backgroundColor: '#1a5dc7' }, textTransform: 'none', borderRadius: '8px' }}>
              Save Memo
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ComplianceMemo;
