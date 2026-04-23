import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import MainLayout from '../../components/Layout/MainLayout';
import QuickStats from '../../components/Common/QuickStats';
import { COLORS } from '../../styles/theme';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

const QAAnalytics = () => {
  const [deviations, setDeviations] = useState([]);

  useEffect(() => {
    const fetchDeviations = async () => {
      try {
        const response = await fetch('http://localhost:8000/deviations?role=QA Reviewer');
        const data = await response.json();
        setDeviations(data || []);
      } catch (err) {
        setDeviations([
          {
            id: 1,
            event: 'Temperature excursion',
            study: 'STUDY-001',
            date: '2024-01-15',
            severity: 'High',
            status: 'Closed',
          },
        ]);
      }
    };

    fetchDeviations();
  }, []);

  const stats = [
    {
      label: 'Investigations Completed',
      value: deviations.filter((d) => d.status === 'Closed').length,
      color: '#66BB6A',
      change: 12,
    },
    {
      label: 'Avg Investigation Time',
      value: '8 days',
      color: '#2196F3',
      change: -3,
    },
    {
      label: 'High Severity Cases',
      value: deviations.filter((d) => d.severity === 'High').length,
      color: '#D32F2F',
      change: 0,
    },
    {
      label: 'CAPA Effectiveness',
      value: '94%',
      color: '#FF9800',
      change: 5,
    },
  ];

  const severityData = [
    { name: 'High', value: deviations.filter((d) => d.severity === 'High').length },
    { name: 'Medium', value: deviations.filter((d) => d.severity === 'Medium').length },
    { name: 'Low', value: deviations.filter((d) => d.severity === 'Low').length },
  ];

  const statusData = [
    { name: 'Closed', value: deviations.filter((d) => d.status === 'Closed').length },
    { name: 'Pending', value: deviations.filter((d) => d.status !== 'Closed').length },
  ];

  const SEVERITY_COLORS = ['#D32F2F', '#FF9800', '#4CAF50'];
  const STATUS_COLORS = ['#66BB6A', '#FFA726'];

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          QA Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Track investigation metrics and trends
        </Typography>
      </Box>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Deviation Severity Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Investigation Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Investigation Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ padding: 2, backgroundColor: '#E8F5E9', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                    Average Investigation Duration
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50', mt: 1 }}>
                    8.2 days
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                    ↓ 5% improvement from last month
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ padding: 2, backgroundColor: '#E3F2FD', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                    CAPA Effectiveness Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196F3', mt: 1 }}>
                    94%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#2196F3' }}>
                    ↑ 3% improvement from last month
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ padding: 2, backgroundColor: '#FFF3E0', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                    Cases Under Investigation
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800', mt: 1 }}>
                    {deviations.filter((d) => d.status === 'Under Investigation').length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#FF9800' }}>
                    Current active investigations
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ padding: 2, backgroundColor: '#FCE4EC', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                    Closed Investigations
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#E91E63', mt: 1 }}>
                    {deviations.filter((d) => d.status === 'Closed').length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#E91E63' }}>
                    Successfully resolved
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Insights */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ padding: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <RecordVoiceOverIcon sx={{ fontSize: 28, color: COLORS.primaryButton }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Key Insights
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ padding: 2, backgroundColor: '#E3F2FD', borderRadius: 1, borderLeft: `4px solid #2196F3` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Investigation Trends
                </Typography>
                <Typography variant="caption">
                  Average investigation time has improved by 5% this month. Continue focusing on root cause analysis efficiency.
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#E8F5E9', borderRadius: 1, borderLeft: `4px solid #4CAF50` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  CAPA Effectiveness
                </Typography>
                <Typography variant="caption">
                  94% of CAPAs have been successfully implemented. Maintain current standards and share best practices with team.
                </Typography>
              </Box>
              <Box sx={{ padding: 2, backgroundColor: '#FFF3E0', borderRadius: 1, borderLeft: `4px solid #FF9800` }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Severity Distribution
                </Typography>
                <Typography variant="caption">
                  High severity cases account for {Math.round((severityData[0].value / deviations.length) * 100)}% of deviations. 
                  Allocate additional resources for these critical cases.
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default QAAnalytics;
