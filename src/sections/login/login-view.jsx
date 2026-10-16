import { useState } from 'react';

import Box from '@mui/material/Box';
// import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import api from 'src/utils/axios';
import { setSession } from 'src/utils/session';
import { getDefaultRouteByRole } from 'src/utils/redirect';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function LoginView() {
  const theme = useTheme();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  try {
    setLoading(true);

    const res = await api.post('/auth/login', {
      mobile,
      password,
    });

    const {
      token,
      user,
      mustChangePassword,
    } = res.data;


    /* =====================================================
       SAVE SESSION
    ===================================================== */

    setSession({
      token,
      user,
    });


    /* =====================================================
       FORCE PASSWORD CHANGE
    ===================================================== */

    if (mustChangePassword) {
      router.replace('/change-password');
      return;
    }


    /* =====================================================
       NORMAL LOGIN
    ===================================================== */

    const redirectTo = getDefaultRouteByRole(user);

    router.replace(redirectTo);

  } catch (error) {

    alert(
      error.response?.data?.message ||
      'Login failed'
    );

  } finally {
    setLoading(false);
  }
};  

  const renderForm = (
    <>
      <Stack spacing={3}>
        <TextField
          name="mobile"
          label="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  <Iconify
                    icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ my: 3 }}
      >
        {/* <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link> */}
      </Stack>

     <LoadingButton
  fullWidth
  size="large"
  variant="contained"
  color="error"
  onClick={handleLogin}
  loading={loading}
  sx={{
    backgroundColor: '#e53935',
    '&:hover': {
      backgroundColor: '#c62828',
    },
  }}
>
  Login
</LoadingButton>

      <Typography
  variant="caption"
  sx={{
    display: 'block',
    textAlign: 'center',
    mt: 2,
    color: 'text.secondary',
    cursor: 'noneS'
  }}
>
  Version 2.0.0
</Typography>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.1),
          imgUrl: '/login.svg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />
  
<Stack
  alignItems="center"
  justifyContent="center"
  sx={{
    minHeight: '100%',
    width: '100%',
    px: 2,
    py: 4,
  }}
>
  <Card
    elevation={0}
    sx={{
      p: { xs: 3, sm: 4.5 },
      width: '100%',
      maxWidth: 440,
      borderRadius: 4,
      backgroundColor: '#ffffff',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.10)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        boxShadow: '0 18px 50px rgba(0, 0, 0, 0.14)',
      },
    }}
  >
    <Stack spacing={1} sx={{ mb: 3 }}>
      <Typography
        variant="overline"
        sx={{
          color: '#e53935',
          fontWeight: 800,
          letterSpacing: 2,
        }}
      >
        POULTRY-LINK
      </Typography>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: '#1c1c1c',
          letterSpacing: '-0.8px',
          fontSize: { xs: '1.7rem', sm: '2rem' },
        }}
      >
        Welcome back
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.7,
        }}
      >
        Sign in to access your account and manage your poultry business.
      </Typography>
    </Stack>

    <Divider
      sx={{
        mb: 3,
        borderColor: 'rgba(0, 0, 0, 0.08)',
      }}
    />

    {renderForm}
  </Card>
</Stack>
    </Box>
  );
}
