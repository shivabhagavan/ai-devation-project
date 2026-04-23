import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
} from '@mui/material';
import MainLayout from '../../components/Layout/MainLayout';
import { COLORS } from '../../styles/theme';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, username: 'john_owner', email: 'john@company.com', role: 'DM Owner', status: 'Active' },
    { id: 2, username: 'jane_qa', email: 'jane@company.com', role: 'DM QA', status: 'Active' },
    { id: 3, username: 'michael_approver', email: 'michael@company.com', role: 'DM Approver', status: 'Active' },
    { id: 4, username: 'admin_user', email: 'admin@company.com', role: 'System Admin', status: 'Active' },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'DM Owner',
  });

  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        role: 'DM Owner',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSaveUser = () => {
    if (dialogMode === 'create') {
      const newUser = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        ...formData,
        status: 'Active',
      };
      setUsers([...users, newUser]);
    } else {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, ...formData } : u
        )
      );
    }
    handleCloseDialog();
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleDeactivateUser = (id) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
          : u
      )
    );
  };

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          User Management
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Manage system users and their roles
        </Typography>
      </Box>

      {/* Add User Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog('create')}
        sx={{
          backgroundColor: COLORS.primaryButton,
          mb: 3,
          '&:hover': {
            backgroundColor: COLORS.sidebarDark,
          },
        }}
      >
        Add New User
      </Button>

      {/* Users Table */}
      <Card sx={{ padding: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          System Users ({users.length})
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#F5F7FA' } }}>
                  <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        backgroundColor:
                          user.role === 'DM Owner'
                            ? '#FFE0B2'
                            : user.role === 'DM QA'
                            ? '#BBDEFB'
                            : user.role === 'DM Approver'
                            ? '#C8E6C9'
                            : '#E1BEE7',
                        color: COLORS.textDark,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      size="small"
                      sx={{
                        backgroundColor: user.status === 'Active' ? '#E8F5E9' : '#FFEBEE',
                        color: user.status === 'Active' ? '#4CAF50' : '#D32F2F',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('edit', user)}
                        sx={{ color: COLORS.primaryButton }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeactivateUser(user.id)}
                        sx={{ color: '#FF9800' }}
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        sx={{ color: '#D32F2F' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={dialogMode === 'edit'}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="DM Owner">DM Owner</MenuItem>
                <MenuItem value="DM QA">DM QA</MenuItem>
                <MenuItem value="DM Approver">DM Approver</MenuItem>
                <MenuItem value="System Admin">System Admin</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveUser}
                sx={{ backgroundColor: COLORS.primaryButton }}
              >
                {dialogMode === 'create' ? 'Add User' : 'Update User'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UserManagement;
