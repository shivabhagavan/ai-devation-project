import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
} from '@mui/material';
import MainLayout from '../../components/Layout/MainLayout';
import { COLORS } from '../../styles/theme';
import SaveIcon from '@mui/icons-material/Save';

const Settings = () => {
  const [settings, setSettings] = useState({
    systemName: 'DEVMEM AI',
    companyName: 'Pharmaceutical Corp',
    enableNotifications: true,
    enableAuditLog: true,
    autoBackup: true,
    backupFrequency: 'daily',
    maxSessions: 5,
    sessionTimeout: 30,
    allowMultiLogin: false,
    maintenanceMode: false,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
    setSaved(false);
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <MainLayout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          System Settings
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted }}>
          Configure system parameters and behavior
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                General Settings
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="System Name"
                  value={settings.systemName}
                  onChange={(e) => handleChange('systemName', e.target.value)}
                />

                <TextField
                  fullWidth
                  label="Company Name"
                  value={settings.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Security Settings
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowMultiLogin}
                      onChange={(e) => handleChange('allowMultiLogin', e.target.checked)}
                    />
                  }
                  label="Allow Multiple Sessions per User"
                />

                <TextField
                  fullWidth
                  label="Max Sessions per User"
                  type="number"
                  value={settings.maxSessions}
                  onChange={(e) => handleChange('maxSessions', parseInt(e.target.value))}
                />

                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableAuditLog}
                      onChange={(e) => handleChange('enableAuditLog', e.target.checked)}
                    />
                  }
                  label="Enable Audit Logging"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Monitoring */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                System Monitoring
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableNotifications}
                      onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                    />
                  }
                  label="Enable Notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoBackup}
                      onChange={(e) => handleChange('autoBackup', e.target.checked)}
                    />
                  }
                  label="Auto Backup"
                />

                <TextField
                  fullWidth
                  select
                  label="Backup Frequency"
                  value={settings.backupFrequency}
                  onChange={(e) => handleChange('backupFrequency', e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </TextField>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                    />
                  }
                  label="Maintenance Mode (Disable User Access)"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                System Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ padding: 2, backgroundColor: '#F5F7FA', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                      System Version
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      v1.0.0
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ padding: 2, backgroundColor: '#F5F7FA', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                      Database
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      SQLite 3.41
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ padding: 2, backgroundColor: '#F5F7FA', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                      Last Backup
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      2024-01-16 03:00 AM
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ padding: 2, backgroundColor: '#F5F7FA', borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                      Disk Usage
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      2.3 GB / 500 GB
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Card sx={{ border: `2px solid ${COLORS.rejectButton}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.rejectButton }}>
                Danger Zone
              </Typography>

              <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 3 }}>
                These actions cannot be undone. Please proceed with caution.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => alert('Executing system backup...')}
                >
                  Force Backup Now
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => alert('Clearing logs...')}
                >
                  Clear Audit Logs
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => alert('Resetting system to defaults...')}
                >
                  Reset System
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined">Cancel</Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ backgroundColor: COLORS.primaryButton }}
        >
          Save Settings
        </Button>
      </Box>
    </MainLayout>
  );
};

export default Settings;
