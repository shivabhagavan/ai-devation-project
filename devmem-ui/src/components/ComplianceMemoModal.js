import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  TextField,
  Divider,
  IconButton,
  Grid
} from '@mui/material';
import { Close, Print, Save } from '@mui/icons-material';

const ComplianceMemoModal = ({ open, onClose }) => {
  const [preparedBy, setPreparedBy] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    // Save logic here
    alert('Memo saved!');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{
        '& .MuiDialog-paper': {
          width: '900px',
          maxWidth: '90vw',
          borderRadius: '10px',
          boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
          p: 0
        }
      }}
    >
      <DialogTitle sx={{ p: 0, backgroundColor: '#F5F7FA', borderRadius: '10px 10px 0 0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{
              backgroundColor: '#2F3A4F',
              '&:hover': { backgroundColor: '#1a2533' },
              borderRadius: '20px',
              textTransform: 'none'
            }}
          >
            Print / Save
          </Button>
          <IconButton onClick={onClose} sx={{ color: '#4A5568' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 5, backgroundColor: '#FFFFFF' }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontFamily: 'Playfair Display, serif',
            fontSize: '28px',
            color: '#1F2A44',
            letterSpacing: '0.5px',
            mb: 4
          }}
        >
          COMPLIANCE MEMO
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, px: 2 }}>
          <Typography sx={{ fontWeight: 'bold', color: '#4A5568' }}>
            CASE ID: <span style={{ fontWeight: 'normal' }}>CASE-2024-701</span>
          </Typography>
          <Typography sx={{ fontWeight: 'bold', color: '#4A5568' }}>
            DATE: <span style={{ fontWeight: 'normal' }}>2024-08-01</span>
          </Typography>
          <Typography sx={{ fontWeight: 'bold', color: '#4A5568' }}>
            SLA BREACH: <span style={{ fontWeight: 'normal' }}>3 DAYS</span>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontFamily: 'Inter, sans-serif',
              color: '#1F2A44'
            }}
          >
            Deviation Summary
          </Typography>
          <Typography
            sx={{
              lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif',
              color: '#4A5568'
            }}
          >
            "The PMDA submission gateway rejected the transmission due to a mismatched SSL certificate on the regional server."
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontFamily: 'Inter, sans-serif',
              color: '#1F2A44'
            }}
          >
            Corrective Action
          </Typography>
          <Typography
            sx={{
              lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif',
              color: '#4A5568'
            }}
          >
            "Certificate updated and submission retried successfully on Day 16."
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontFamily: 'Inter, sans-serif',
              color: '#1F2A44'
            }}
          >
            Preventive Action
          </Typography>
          <Typography
            component="div"
            sx={{
              lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif',
              color: '#4A5568'
            }}
          >
            • Monitoring process implemented<br />
            • Certificate expiry alert configured
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontFamily: 'Inter, sans-serif',
              color: '#1F2A44'
            }}
          >
            Signatures
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Prepared By"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                fullWidth
                variant="standard"
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#E2E8F0' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#2F80ED' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Reviewed By"
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
                fullWidth
                variant="standard"
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#E2E8F0' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#2F80ED' }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Approved By"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                fullWidth
                variant="standard"
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: '#E2E8F0' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#2F80ED' }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceMemoModal;