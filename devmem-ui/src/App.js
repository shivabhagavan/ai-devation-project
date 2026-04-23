import InitiateDeviation from './pages/InitiateDeviation';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './styles/theme';
import { authService } from './utils/auth';

// Pages
import Login from './pages/Login';

// Existing pages (for backward compatibility)
import OwnerWorkspace from './pages/OwnerWorkspace';
import DeviationDetail from './pages/DeviationDetail';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import CreateDeviation from './pages/owner/CreateDeviation';
import DraftReview from './pages/owner/DraftReview';
import OwnerInvestigations from './pages/owner/OwnerInvestigations';
import MemoView from './pages/owner/MemoView';

// QA Pages
import QADashboard from './pages/qa/QADashboard';
import QAInvestigations from './pages/qa/QAInvestigations';
import QAAnalytics from './pages/qa/QAAnalytics';

// Approver Pages
import ApproverDashboard from './pages/approver/ApproverDashboard';
import ApprovalQueue from './pages/approver/ApprovalQueue';
import FinalMemo from './pages/approver/FinalMemo';
import ApproverAnalytics from './pages/approver/ApproverAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/admin/Settings';
import AdminInvestigations from './pages/admin/AdminInvestigations';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles }) => {
  const user = authService.getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* DM Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute requiredRoles={['DM Owner', 'System Admin']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/initiate-deviation"
            element={
              <ProtectedRoute requiredRoles={['DM Owner', 'System Admin']}>
                <InitiateDeviation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/create-deviation"
            element={
              <ProtectedRoute requiredRoles={['DM Owner', 'System Admin']}>
                <CreateDeviation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/draft-review/:id"
            element={
              <ProtectedRoute requiredRoles={['DM Owner', 'System Admin']}>
                <DraftReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/investigations"
            element={
              <ProtectedRoute requiredRoles={['DM Owner', 'System Admin']}>
                <OwnerInvestigations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/memo-view"
            element={
              <ProtectedRoute requiredRoles={['DM Owner', 'System Admin']}>
                <MemoView />
              </ProtectedRoute>
            }
          />

          {/* QA Routes */}
          <Route
            path="/qa/dashboard"
            element={
              <ProtectedRoute requiredRoles={['DM QA', 'System Admin']}>
                <QADashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa/investigations"
            element={
              <ProtectedRoute requiredRoles={['DM QA', 'System Admin']}>
                <QAInvestigations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa/analytics"
            element={
              <ProtectedRoute requiredRoles={['DM QA', 'System Admin']}>
                <QAAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Approver Routes */}
          <Route
            path="/approver/dashboard"
            element={
              <ProtectedRoute requiredRoles={['DM Approver', 'System Admin']}>
                <ApproverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approver/approval-queue"
            element={
              <ProtectedRoute requiredRoles={['DM Approver', 'System Admin']}>
                <ApprovalQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approver/final-memo"
            element={
              <ProtectedRoute requiredRoles={['DM Approver', 'System Admin']}>
                <FinalMemo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approver/analytics"
            element={
              <ProtectedRoute requiredRoles={['DM Approver', 'System Admin']}>
                <ApproverAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={['System Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-management"
            element={
              <ProtectedRoute requiredRoles={['System Admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRoles={['System Admin']}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/investigations"
            element={
              <ProtectedRoute requiredRoles={['System Admin']}>
                <AdminInvestigations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requiredRoles={['System Admin']}>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes */}
          <Route
            path="/deviation/:id"
            element={
              <ProtectedRoute>
                <DeviationDetail />
              </ProtectedRoute>
            }
          />

          {/* Backward Compatibility Routes */}
          <Route
            path="/owner-workspace"
            element={
              <ProtectedRoute requiredRoles={['DM Owner', 'System Admin']}>
                <OwnerWorkspace />
              </ProtectedRoute>
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;