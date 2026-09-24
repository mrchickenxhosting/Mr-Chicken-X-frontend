import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import api from 'src/utils/axios';
import { setSession, clearSession } from 'src/utils/session';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ChangePasswordView() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  /* =========================================================
     CHANGE PASSWORD
  ========================================================= */

  const handleChangePassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    /* ================= VALIDATION ================= */

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(
        'New password must be at least 6 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        'New password and confirm password do not match.'
      );
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        'New password must be different from your current password.'
      );
      return;
    }

    /* ================= API ================= */

    try {
      setLoading(true);

      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      /* =====================================================
         SAVE UPDATED SESSION

         Backend should return:
         - token
         - user
         - user.mustChangePassword = false
      ===================================================== */

      setSession({
        token: res.data.token,
        user: res.data.user,
      });

      setSuccessMessage('Password changed successfully!');

      /* ================= GO TO DASHBOARD ================= */

      setTimeout(() => {
        router.replace('/');
      }, 500);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          'Failed to change password.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PASSWORD VISIBILITY
  ========================================================= */

  const passwordAdornment = (visible, setVisible) => (
    <InputAdornment position="end">
      <IconButton
        onClick={() => setVisible(!visible)}
        edge="end"
      >
        <Iconify
          icon={
            visible
              ? 'eva:eye-fill'
              : 'eva:eye-off-fill'
          }
        />
      </IconButton>
    </InputAdornment>
  );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <Box
      sx={{
        ...bgGradient({
          color: 'background.default',
          imgUrl: '/assets/background/overlay_2.jpg',
        }),

        minHeight: '100vh',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        p: 2,
      }}
    >
      {/* ================= LOGO ================= */}

      <Logo
        sx={{
          position: 'fixed',
          top: {
            xs: 16,
            md: 24,
          },
          left: {
            xs: 16,
            md: 24,
          },
        }}
      />

      {/* ================= CARD ================= */}

      <Card
        sx={{
          p: {
            xs: 3,
            sm: 5,
          },

          width: '100%',

          maxWidth: 460,
        }}
      >
        {/* ================= TITLE ================= */}

        <Typography variant="h4">
          Change Your Password
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            color: 'text.secondary',
          }}
        >
          For security reasons, you must change your
          default password before continuing.
        </Typography>

        <Divider
          sx={{
            my: 3,
          }}
        />

        {/* ================= ERROR ================= */}

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
          >
            {errorMessage}
          </Alert>
        )}

        {/* ================= SUCCESS ================= */}

        {successMessage && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
            }}
          >
            {successMessage}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* ================= CURRENT PASSWORD ================= */}

          <TextField
            fullWidth
            label="Current Password"
            type={
              showCurrentPassword
                ? 'text'
                : 'password'
            }
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
            InputProps={{
              endAdornment: passwordAdornment(
                showCurrentPassword,
                setShowCurrentPassword
              ),
            }}
          />

          {/* ================= NEW PASSWORD ================= */}

          <TextField
            fullWidth
            label="New Password"
            type={
              showNewPassword
                ? 'text'
                : 'password'
            }
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            helperText="Minimum 6 characters"
            InputProps={{
              endAdornment: passwordAdornment(
                showNewPassword,
                setShowNewPassword
              ),
            }}
          />

          {/* ================= CONFIRM PASSWORD ================= */}

          <TextField
            fullWidth
            label="Confirm New Password"
            type={
              showConfirmPassword
                ? 'text'
                : 'password'
            }
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            InputProps={{
              endAdornment: passwordAdornment(
                showConfirmPassword,
                setShowConfirmPassword
              ),
            }}
          />

          {/* ================= CHANGE PASSWORD ================= */}

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            color="inherit"
            onClick={handleChangePassword}
            loading={loading}
          >
            Change Password
          </LoadingButton>

          {/* ================= LOGOUT ================= */}

          <Button
            fullWidth
            size="large"
            variant="outlined"
            color="inherit"
            onClick={handleLogout}
            startIcon={
              <Iconify icon="solar:logout-2-bold" />
            }
          >
            Logout
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}