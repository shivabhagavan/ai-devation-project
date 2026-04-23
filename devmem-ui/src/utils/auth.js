// Auth utilities
export const ROLES = {
  OWNER: 'DM Owner',
  QA: 'DM QA',
  APPROVER: 'DM Approver',
  ADMIN: 'System Admin',
};

export const ROLE_PATHS = {
  'DM Owner': '/owner/dashboard',
  'DM QA': '/qa/dashboard',
  'DM Approver': '/approver/dashboard',
  'System Admin': '/admin/dashboard',
};

export const authService = {
  login: (username, password, role) => {
    const user = {
      username,
      role,
      token: `token-${Math.random()}`,
    };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  },

  getUserRole: () => {
    const user = authService.getUser();
    return user ? user.role : null;
  },
};

export const roleConfig = {
  'DM Owner': {
    navItems: [
      { label: 'Dashboard', path: '/owner/dashboard' },
      { label: 'Initiate Deviation', path: '/owner/create-deviation' },
      { label: 'Investigations', path: '/owner/investigations' },
      { label: 'Compliance Memo', path: '/owner/memo-view' },
    ],
    permissions: {
      createDeviation: true,
      uploadEvidence: true,
      viewDeviationStatus: true,
      viewFinalMemo: true,
      investigate: false,
      approve: false,
      closeDeviation: false,
    },
  },
  'DM QA': {
    navItems: [
      { label: 'Dashboard', path: '/qa/dashboard' },
      { label: 'Investigations', path: '/qa/investigations' },
      { label: 'Analytics', path: '/qa/analytics' },
    ],
    permissions: {
      createDeviation: false,
      uploadEvidence: false,
      viewDeviationStatus: true,
      viewFinalMemo: false,
      investigate: true,
      addInvestigationDetails: true,
      addRootCause: true,
      addCAPAS: true,
      submitQAReview: true,
      approve: false,
      closeDeviation: false,
    },
  },
  'DM Approver': {
    navItems: [
      { label: 'Dashboard', path: '/approver/dashboard' },
      { label: 'Approval Queue', path: '/approver/approval-queue' },
      { label: 'Final Memo', path: '/approver/final-memo' },
      { label: 'Analytics', path: '/approver/analytics' },
    ],
    permissions: {
      createDeviation: false,
      uploadEvidence: false,
      viewDeviationStatus: true,
      viewFinalMemo: true,
      investigate: false,
      approve: true,
      rejectDeviation: true,
      closeDeviation: true,
      viewTriageQueue: true,
      viewValidationQueue: true,
      viewRemediationQueue: true,
      assignReviewers: true,
    },
  },
  'System Admin': {
    navItems: [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Investigations', path: '/admin/investigations' },
      { label: 'Analytics', path: '/admin/analytics' },
      { label: 'Settings', path: '/admin/settings' },
      { label: 'User Management', path: '/admin/user-management' },
    ],
    permissions: {
      createDeviation: true,
      uploadEvidence: true,
      viewDeviationStatus: true,
      viewFinalMemo: true,
      investigate: true,
      approve: true,
      closeDeviation: true,
      manageUsers: true,
      viewAnalytics: true,
      deleteDeviation: true,
      systemConfiguration: true,
      fullAccess: true,
    },
  },
};
