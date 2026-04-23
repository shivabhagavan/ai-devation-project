import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import QuickStats from '../../components/Common/QuickStats';
import { COLORS } from '../../styles/theme';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

const ApproverDashboard = () => {
  const navigate = useNavigate();
  const [deviations, setDeviations] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusColors = {
    'Pending Approval': '#2196F3',
    'Approved': '#4CAF50',
    'Rework Required': '#F44336',
    'Open': '#FF9800'
  };
  const lineChartColors = ['#2196F3', '#4CAF50', '#FF9800'];

  useEffect(() => {
    const fetchDeviations = async () => {
      try {
        const response = await fetch('http://localhost:8000/deviations?role=Approver');
        const data = await response.json();
        setDeviations(data || []);
        updatePieData(data || []);
      } catch (err) {
        const fallbackData = [
          {
            id: 1,
            event: 'Temperature excursion',
            study: 'STUDY-001',
            date: '2024-01-15',
            severity: 'High',
            status: 'Pending Approval',
          },
        ];
        setDeviations(fallbackData);
        updatePieData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    const updatePieData = (devs) => {
      const statusCounts = {
        'Pending Approval': devs.filter(d => d.status === 'Pending Approval').length,
        'Closed': devs.filter(d => d.status === 'Closed').length,
        'Rework Required': devs.filter(d => d.status === 'Rework Required').length,
        'Open': devs.filter(d => d.status === 'Open').length
      };

      const chartData = [
        { name: 'Pending Approval', value: statusCounts['Pending Approval'] },
        { name: 'Approved', value: statusCounts['Closed'] },
        { name: 'Rework Required', value: statusCounts['Rework Required'] },
        { name: 'Open', value: statusCounts['Open'] }
      ].filter(item => item.value > 0);

      setPieData(chartData);

      // Generate trend line data based on deviations
      const trendData = [
        { week: 'Week 1', approved: 5, rejected: 2, pending: 8 },
        { week: 'Week 2', approved: 8, rejected: 3, pending: 7 },
        { week: 'Week 3', approved: 12, rejected: 2, pending: 6 },
        { week: 'Week 4', approved: 15, rejected: 4, pending: statusCounts['Pending Approval'] }
      ];
      setLineChartData(trendData);
    };

    fetchDeviations();
  }, []);

  const triageQueue = deviations.filter((d) => d.status === 'Open').slice(0, 3);
  const validationQueue = deviations.filter((d) => d.status === 'Pending Approval').slice(0, 3);
  const remediationQueue = deviations.filter((d) => d.status === 'Rework Required').slice(0, 3);

  const stats = [
    {
      label: 'Pending Approval',
      value: deviations.filter((d) => d.status === 'Pending Approval').length,
      color: '#AB47BC',
      change: 2,
    },
    {
      label: 'Approved Cases',
      value: deviations.filter((d) => d.status === 'Closed').length,
      color: COLORS.approveButton,
      change: 8,
    },
    {
      label: 'Rejected Cases',
      value: deviations.filter((d) => d.status === 'Rework Required').length,
      color: COLORS.rejectButton,
      change: -1,
    },
    {
      label: 'Avg Review Time',
      value: '2.3 days',
      color: '#2196F3',
      change: -5,
    },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Approver Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Review and approve deviation investigations
        </Typography>
      </Box>

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Main Action Button */}
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/approver/approval-queue')}
        sx={{
          backgroundColor: COLORS.primaryButton,
          mb: 4,
          '&:hover': {
            backgroundColor: COLORS.sidebarDark,
          },
        }}
      >
        Review All Pending Approvals
      </Button>

      {/* Approval Queues */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Triage Queue */}
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: 3, border: `2px solid #FF9800` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <PendingIcon sx={{ fontSize: 24, color: '#FF9800' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                TRIAGE QUEUE
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block', mb: 2 }}>
              Assign Reviewers & Initial Triage
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              {triageQueue.length > 0 ? (
                triageQueue.map((dev) => (
                  <Box
                    key={dev.id}
                    sx={{
                      padding: 1.5,
                      backgroundColor: '#FFF3E0',
                      borderRadius: 1,
                      borderLeft: '4px solid #FF9800',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      DEV-{String(dev.id).padStart(4, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block' }}>
                      {dev.event}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  No cases in triage queue
                </Typography>
              )}
            </Box>

            <Button fullWidth variant="outlined" size="small">
              View Queue ({triageQueue.length})
            </Button>
          </Card>
        </Grid>

        {/* Validation Queue */}
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: 3, border: `2px solid #2196F3` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 24, color: '#2196F3' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                VALIDATION QUEUE
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block', mb: 2 }}>
              Ready for Final Approval
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              {validationQueue.length > 0 ? (
                validationQueue.map((dev) => (
                  <Box
                    key={dev.id}
                    sx={{
                      padding: 1.5,
                      backgroundColor: '#E3F2FD',
                      borderRadius: 1,
                      borderLeft: '4px solid #2196F3',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      DEV-{String(dev.id).padStart(4, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block' }}>
                      {dev.event}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  No cases in validation queue
                </Typography>
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={() => navigate('/approver/approval-queue')}
              sx={{ backgroundColor: COLORS.primaryButton }}
            >
              Approve Cases ({validationQueue.length})
            </Button>
          </Card>
        </Grid>

        {/* Remediation Queue */}
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: 3, border: `2px solid #D32F2F` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <AssignmentReturnIcon sx={{ fontSize: 24, color: '#D32F2F' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                REMEDIATION QUEUE
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block', mb: 2 }}>
              Rejected Cases Requiring Rework
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              {remediationQueue.length > 0 ? (
                remediationQueue.map((dev) => (
                  <Box
                    key={dev.id}
                    sx={{
                      padding: 1.5,
                      backgroundColor: '#FFEBEE',
                      borderRadius: 1,
                      borderLeft: '4px solid #D32F2F',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      DEV-{String(dev.id).padStart(4, '0')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, display: 'block' }}>
                      {dev.event}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  No cases in remediation queue
                </Typography>
              )}
            </Box>

            <Button fullWidth variant="outlined" size="small" sx={{ color: '#D32F2F' }}>
              Review Rework ({remediationQueue.length})
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Summary & Recommendations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Approval Activity Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ padding: 1.5, backgroundColor: '#E8F5E9', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Cases Approved This Month
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.approveButton }}>
                  {deviations.filter((d) => d.status === 'Closed').length}
                </Typography>
              </Box>
              <Box sx={{ padding: 1.5, backgroundColor: '#FFEBEE', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Cases Rejected (Rework)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.rejectButton }}>
                  {deviations.filter((d) => d.status === 'Rework Required').length}
                </Typography>
              </Box>
              <Box sx={{ padding: 1.5, backgroundColor: '#F3E5F5', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Avg Approval Time
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#9C27B0' }}>
                  2.3 days
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3, boxShadow: '0px 4px 20px rgba(0,0,0,0.08)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              📊 Deviation Status Distribution
            </Typography>
            {loading ? (
              <Typography variant="body2" sx={{ color: COLORS.textMuted, textAlign: 'center', py: 3 }}>
                Loading chart...
              </Typography>
            ) : pieData.length > 0 ? (
              <Box sx={{ position: 'relative' }}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value, percent }) => 
                        `${name} (${value}) ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={110}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={statusColors[entry.name] || '#999999'}
                          style={{
                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${value} cases`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend details */}
                <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  {pieData.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: statusColors[item.name] || '#999999',
                          boxShadow: `0px 2px 4px rgba(0, 0, 0, 0.2)`
                        }} 
                      />
                      <Typography variant="caption" sx={{ fontSize: '0.85rem' }}>
                        {item.name}: {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: COLORS.textMuted, textAlign: 'center', py: 3 }}>
                No deviation data available
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Section with Line Chart */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ padding: 3, boxShadow: '0px 4px 20px rgba(0,0,0,0.08)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              📈 Approval Trends (Weekly)
            </Typography>
            {loading ? (
              <Typography variant="body2" sx={{ color: COLORS.textMuted, textAlign: 'center', py: 5 }}>
                Loading chart...
              </Typography>
            ) : lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                  data={lineChartData}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9800" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF9800" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis 
                    dataKey="week" 
                    stroke="#666"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="#666"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 12px rgba(0,0,0,0.1)'
                    }}
                    cursor={{ stroke: '#ddd', strokeWidth: 2 }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="approved" 
                    stroke="#4CAF50" 
                    strokeWidth={3}
                    dot={{ fill: '#4CAF50', r: 6 }}
                    activeDot={{ r: 8 }}
                    connectNulls
                    name="Approved"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rejected" 
                    stroke="#FF9800" 
                    strokeWidth={3}
                    dot={{ fill: '#FF9800', r: 6 }}
                    activeDot={{ r: 8 }}
                    connectNulls
                    name="Rejected"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#2196F3" 
                    strokeWidth={3}
                    dot={{ fill: '#2196F3', r: 6 }}
                    activeDot={{ r: 8 }}
                    connectNulls
                    name="Pending"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" sx={{ color: COLORS.textMuted, textAlign: 'center', py: 5 }}>
                No trend data available
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Recommendations Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Approval Recommendations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ padding: 1.5, backgroundColor: '#E3F2FD', borderRadius: 1, borderLeft: '4px solid #2196F3' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  1. Review Pending Cases
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  {validationQueue.length} cases awaiting your decision
                </Typography>
              </Box>
              <Box sx={{ padding: 1.5, backgroundColor: '#FFF3E0', borderRadius: 1, borderLeft: '4px solid #FF9800' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  2. Assign Reviewers
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  {triageQueue.length} new cases need initial review assignment
                </Typography>
              </Box>
              <Box sx={{ padding: 1.5, backgroundColor: '#FFEBEE', borderRadius: 1, borderLeft: '4px solid #D32F2F' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  3. Monitor Remediation
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                  {remediationQueue.length} cases require rework and resubmission
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default ApproverDashboard;
