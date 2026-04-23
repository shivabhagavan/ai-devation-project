import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  TextField,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import QuickStats from '../../components/Common/QuickStats';
import DeviationTable from '../../components/Common/DeviationTable';
import { COLORS } from '../../styles/theme';
import AddIcon from '@mui/icons-material/Add';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [deviations, setDeviations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch deviations from backend with owner role
    const fetchDeviations = async () => {
      try {
        const response = await fetch('http://localhost:8000/deviations?role=DM Owner');
        const data = await response.json();
        setDeviations(data || []);
      } catch (err) {
        console.error('Error fetching deviations:', err);
        // Mock data for demo
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
            status: 'Open',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviations();
  }, []);

  const stats = [
    {
      label: 'Draft Deviations',
      value: deviations.filter((d) => d.status === 'Draft').length,
      color: '#9C27B0',
      change: 0,
    },
    {
      label: 'Open Cases',
      value: deviations.filter((d) => d.status === 'Open' || d.status === 'Under Investigation').length,
      color: '#FFA726',
      change: 2,
    },
    {
      label: 'Under QA Review',
      value: deviations.filter((d) => d.status === 'QA Review').length,
      color: '#42A5F5',
      change: -1,
    },
    {
      label: 'Pending Approval',
      value: deviations.filter((d) => d.status === 'Pending Approval' || d.status === 'Final Approval').length,
      color: '#AB47BC',
      change: 3,
    },
  ];

  const filteredDeviations = deviations.filter(
    (d) =>
      d.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.study.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewClick = (id, status) => {
    // Owner can edit Draft and Owner Review items
    if (status === 'Draft' || status === 'Owner Review' || status === 'Rework Required') {
      navigate(`/owner/draft-review/${id}`);
    } else {
      navigate(`/deviation/${id}`);
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          DM Owner Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Manage and track deviations for your studies
        </Typography>
      </Box>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Create Deviation Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate('/owner/create-deviation')}
        sx={{
          backgroundColor: COLORS.primaryButton,
          mb: 3,
          '&:hover': {
            backgroundColor: COLORS.sidebarDark,
          },
        }}
      >
        Create New Deviation
      </Button>

      {/* Deviations Section */}
      <Card sx={{ padding: 3, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Your Deviations
          </Typography>
          <TextField
            placeholder="Search deviations..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>

        <DeviationTable
          deviations={filteredDeviations}
          onViewClick={handleViewClick}
          showActions={true}
        />
      </Card>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Deviations
            </Typography>
            <Box>
              {deviations.slice(0, 5).map((dev) => (
                <Box
                  key={dev.id}
                  sx={{
                    padding: 1.5,
                    borderBottom: `1px solid ${COLORS.borderLight}`,
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {dev.event}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                    {new Date(dev.date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Next Steps
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ padding: 1.5, backgroundColor: '#E3F2FD', borderRadius: 1, borderLeft: `4px solid ${COLORS.primaryButton}` }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  1. Create a deviation
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Start by creating a new deviation case
                </Typography>
              </Box>
              <Box sx={{ padding: 1.5, backgroundColor: '#FFF3E0', borderRadius: 1, borderLeft: '4px solid #FF9800' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  2. Upload evidence
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Attach supporting documents
                </Typography>
              </Box>
              <Box sx={{ padding: 1.5, backgroundColor: '#E8F5E9', borderRadius: 1, borderLeft: '4px solid #4CAF50' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  3. Track progress
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  Monitor investigation status
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default OwnerDashboard;
