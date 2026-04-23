import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import DeviationTable from '../../components/Common/DeviationTable';
import { COLORS } from '../../styles/theme';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const OwnerInvestigations = () => {
  const navigate = useNavigate();
  const [deviations, setDeviations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Fetch deviations from backend with owner role
    const fetchDeviations = async () => {
      try {
        const response = await fetch('http://localhost:8000/deviations?role=DM Owner');
        const data = await response.json();
        setDeviations(data || []);
      } catch (err) {
        console.error('Error fetching deviations:', err);
        setDeviations([
          {
            id: 1,
            event: 'Temperature excursion in cold room',
            study: 'STUDY-001',
            date: '2024-01-15',
            severity: 'High',
            status: 'Open',
          },
          {
            id: 2,
            event: 'Batch record discrepancy',
            study: 'STUDY-002',
            date: '2024-01-14',
            severity: 'Medium',
            status: 'Under Investigation',
          },
          {
            id: 3,
            event: 'Equipment malfunction',
            study: 'STUDY-003',
            date: '2024-01-13',
            severity: 'Low',
            status: 'Pending QA Review',
          },
        ]);
      }
    };

    fetchDeviations();
  }, []);

  const filteredDeviations = deviations.filter((d) => {
    const matchSearch =
      d.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.study.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchSeverity = severityFilter === 'All' || d.severity === severityFilter;
    return matchSearch && matchStatus && matchSeverity;
  });

  const handleViewClick = (id, status) => {
    // Owner can edit Draft and Owner Review items
    if (status === 'Draft' || status === 'Owner Review' || status === 'Rework Required') {
      navigate(`/owner/draft-review/${id}`);
    } else {
      navigate(`/deviation/${id}`);
    }
  };

  const handleDeleteClick = async (id) => {
    const confirmed = window.confirm('Delete this draft deviation? This action cannot be undone.');
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:8000/deviation/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || result.error || 'Failed to delete deviation');
      }
      setDeviations((prev) => prev.filter((deviation) => deviation.id !== id));
      setSuccess('Draft deviation deleted successfully.');
    } catch (err) {
      setError(err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const statuses = ['All', 'Draft', 'QA Review', 'Pending QA Review', 'Owner Review', 'Pending Approval', 'Closed'];
  const severities = ['All', 'High', 'Medium', 'Low'];

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Investigations
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          View and track all deviations under investigation
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ padding: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <FilterAltIcon sx={{ color: COLORS.primaryButton }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="Search by event or study..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {statuses.map((status) => (
                <Chip
                  key={status}
                  label={status}
                  onClick={() => setStatusFilter(status)}
                  variant={statusFilter === status ? 'filled' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    ...(statusFilter === status && {
                      backgroundColor: COLORS.primaryButton,
                      color: '#FFFFFF',
                    }),
                  }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {severities.map((severity) => (
                <Chip
                  key={severity}
                  label={severity}
                  onClick={() => setSeverityFilter(severity)}
                  variant={severityFilter === severity ? 'filled' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    ...(severityFilter === severity && {
                      backgroundColor: COLORS.primaryButton,
                      color: '#FFFFFF',
                    }),
                  }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setSeverityFilter('All');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 1 }}>
              Total Investigations
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.primaryButton }}>
              {deviations.filter((d) => d.status !== 'Open' && d.status !== 'Closed').length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 1 }}>
              In Progress
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFA726' }}>
              {deviations.filter((d) => d.status === 'Under Investigation').length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 1 }}>
              Pending Review
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#AB47BC' }}>
              {deviations.filter((d) => d.status === 'Pending QA Review').length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 1 }}>
              Completed
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#66BB6A' }}>
              {deviations.filter((d) => d.status === 'Closed').length}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Deviations Table */}
      <Card sx={{ padding: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Investigation Details
        </Typography>
        <DeviationTable
          deviations={filteredDeviations}
          onViewClick={handleViewClick}
          onDeleteClick={handleDeleteClick}
          showActions={true}
          deleting={deleting}
        />
      </Card>

      {/* Note */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> As a DM Owner, you can view investigation progress but cannot directly investigate. 
          The QA team will handle investigation details. Once the investigation is complete, the deviation will be submitted for approval.
        </Typography>
      </Alert>
    </MainLayout>
  );
};

export default OwnerInvestigations;
