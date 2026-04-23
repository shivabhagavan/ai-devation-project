import React from 'react';
import { Box, Typography, Divider, Grid, Chip, Paper } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';

const ComplianceMemo = ({ deviation }) => {
  if (!deviation) return null;

  const parseField = (field) => {
    if (!field) return null;
    if (typeof field === 'object') return field;
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  };

  const rootCauses = parseField(deviation.root_causes) || parseField(deviation.root_cause) || null;
  const capa = parseField(deviation.capa) || null;
  const memo = deviation.deviation_memo_draft || '';
  const devId = `DEV-${String(deviation.id).padStart(4, '0')}`;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const deviationDate = deviation.date
    ? new Date(deviation.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const renderRootCauses = () => {
    if (!rootCauses) return <Typography variant="body2">No root cause data available.</Typography>;
    if (typeof rootCauses === 'string') return <Typography variant="body2" sx={{ lineHeight: 1.8 }}>{rootCauses}</Typography>;
    if (rootCauses.causes && Array.isArray(rootCauses.causes)) {
      return rootCauses.causes.map((cause, idx) => (
        <Typography key={idx} variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
          {idx + 1}. {typeof cause === 'string' ? cause : JSON.stringify(cause)}
        </Typography>
      ));
    }
    if (Array.isArray(rootCauses)) {
      return rootCauses.map((cause, idx) => (
        <Typography key={idx} variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
          {idx + 1}. {typeof cause === 'string' ? cause : JSON.stringify(cause)}
        </Typography>
      ));
    }
    return <Typography variant="body2" sx={{ lineHeight: 1.8 }}>{JSON.stringify(rootCauses, null, 2)}</Typography>;
  };

  const renderCapa = () => {
    if (!capa) return <Typography variant="body2">No CAPA data available.</Typography>;
    if (typeof capa === 'string') return <Typography variant="body2" sx={{ lineHeight: 1.8 }}>{capa}</Typography>;
    return (
      <Box>
        {capa.corrective && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: '#1B5E20' }}>Corrective Actions:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>{capa.corrective}</Typography>
          </Box>
        )}
        {capa.preventive && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: '#0D47A1' }}>Preventive Actions:</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>{capa.preventive}</Typography>
          </Box>
        )}
        {!capa.corrective && !capa.preventive && (
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>{JSON.stringify(capa, null, 2)}</Typography>
        )}
      </Box>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 900,
        mx: 'auto',
        backgroundColor: '#FFFFFF',
        border: '1px solid #B0BEC5',
        borderRadius: 0,
        overflow: 'hidden',
      }}
    >
      {/* Document Header Bar */}
      <Box sx={{ backgroundColor: '#1A237E', color: '#FFFFFF', px: 4, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              COMPLIANCE DEVIATION MEMO
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 0.5 }}>
              OFFICIAL REGULATORY DOCUMENT
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{devId}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>Generated: {today}</Typography>
        </Box>
      </Box>

      {/* Classification Banner */}
      <Box sx={{ backgroundColor: '#C62828', color: '#FFF', px: 4, py: 0.5, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 2 }}>
          CONFIDENTIAL — FOR AUTHORIZED PERSONNEL ONLY
        </Typography>
      </Box>

      {/* Document Body */}
      <Box sx={{ px: 5, py: 4 }}>
        {/* Meta Info Table */}
        <Box sx={{ border: '1px solid #CFD8DC', borderRadius: 1, mb: 4, overflow: 'hidden' }}>
          <Box sx={{ backgroundColor: '#ECEFF1', px: 3, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#37474F', letterSpacing: 0.5 }}>
              DEVIATION DETAILS
            </Typography>
          </Box>
          <Grid container>
            <Grid item xs={6} sx={{ borderRight: '1px solid #CFD8DC', borderBottom: '1px solid #CFD8DC', px: 3, py: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600, display: 'block' }}>Reference Number</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{devId}</Typography>
            </Grid>
            <Grid item xs={6} sx={{ borderBottom: '1px solid #CFD8DC', px: 3, py: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600, display: 'block' }}>Date of Occurrence</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{deviationDate}</Typography>
            </Grid>
            <Grid item xs={6} sx={{ borderRight: '1px solid #CFD8DC', borderBottom: '1px solid #CFD8DC', px: 3, py: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600, display: 'block' }}>Product / Study</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{deviation.study || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6} sx={{ borderBottom: '1px solid #CFD8DC', px: 3, py: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600, display: 'block' }}>Severity Classification</Typography>
              <Chip
                label={deviation.severity || 'N/A'}
                size="small"
                sx={{
                  fontWeight: 700,
                  backgroundColor: deviation.severity === 'High' ? '#FFCDD2' : deviation.severity === 'Medium' ? '#FFE0B2' : '#C8E6C9',
                  color: deviation.severity === 'High' ? '#B71C1C' : deviation.severity === 'Medium' ? '#E65100' : '#1B5E20',
                }}
              />
            </Grid>
            <Grid item xs={6} sx={{ borderRight: '1px solid #CFD8DC', px: 3, py: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600, display: 'block' }}>Deviation Event</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{deviation.event || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6} sx={{ px: 3, py: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600, display: 'block' }}>Current Status</Typography>
              <Chip label={deviation.status} size="small" sx={{ fontWeight: 600, backgroundColor: '#E8EAF6', color: '#283593' }} />
            </Grid>
          </Grid>
        </Box>

        {/* Section 1: Root Cause Analysis */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 4, height: 24, backgroundColor: '#FF9800', borderRadius: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#37474F', letterSpacing: 0.5 }}>
              SECTION 1 — ROOT CAUSE ANALYSIS
            </Typography>
          </Box>
          <Box sx={{ pl: 2, borderLeft: '2px solid #FFE0B2', py: 1 }}>
            {renderRootCauses()}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section 2: CAPA */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 4, height: 24, backgroundColor: '#4CAF50', borderRadius: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#37474F', letterSpacing: 0.5 }}>
              SECTION 2 — CORRECTIVE & PREVENTIVE ACTIONS (CAPA)
            </Typography>
          </Box>
          <Box sx={{ pl: 2, borderLeft: '2px solid #C8E6C9', py: 1 }}>
            {renderCapa()}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section 3: Compliance Memo */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 4, height: 24, backgroundColor: '#1565C0', borderRadius: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#37474F', letterSpacing: 0.5 }}>
              SECTION 3 — COMPLIANCE MEMO & REGULATORY ASSESSMENT
            </Typography>
          </Box>
          <Box sx={{ pl: 2, borderLeft: '2px solid #BBDEFB', py: 1 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>
              {memo || 'No compliance memo available.'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Footer Signature Block */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '2px solid #1A237E' }}>
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <Box sx={{ borderBottom: '1px solid #90A4AE', pb: 4, mb: 1 }} />
              <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600 }}>DM Owner Signature</Typography>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ borderBottom: '1px solid #90A4AE', pb: 4, mb: 1 }} />
              <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600 }}>QA Reviewer Signature</Typography>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ borderBottom: '1px solid #90A4AE', pb: 4, mb: 1 }} />
              <Typography variant="caption" sx={{ color: '#78909C', fontWeight: 600 }}>Final Approver Signature</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Document Footer */}
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #ECEFF1', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#90A4AE' }}>
            AI-Assisted Deviation Management System
          </Typography>
          <Typography variant="caption" sx={{ color: '#90A4AE' }}>
            {devId} | Page 1 of 1
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ComplianceMemo;
