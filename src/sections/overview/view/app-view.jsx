import PropTypes from 'prop-types';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Stack,
  Container,
  Typography,
  CircularProgress,
} from '@mui/material';

import { getUser } from 'src/utils/session';

import { getDashboardData } from 'src/services/Trader.service';

import AppWidgetSummary from '../app-widget-summary';
import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import AppOrderTimeline from '../app-order-timeline';

// ----------------------------------------------------------------------
// RED THEME
// ----------------------------------------------------------------------

const RED = {
  main: '#D32F2F',
  dark: '#A71919',
  light: '#FFEBEB',
  lighter: '#FFF5F5',
  text: '#252525',
  muted: '#777777',
  border: '#F0E1E1',
  background: '#FAF8F8',
  white: '#FFFFFF',
};

// ----------------------------------------------------------------------
// REUSABLE SECTION HEADER
// ----------------------------------------------------------------------

function SectionHeading({ title, subtitle }) {
  return (
    <Stack spacing={0.5} sx={{ mb: 2.5 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          color: RED.text,
          letterSpacing: '-0.4px',
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography variant="body2" sx={{ color: RED.muted }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  );

  
}

SectionHeading.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};


// ----------------------------------------------------------------------
// DASHBOARD
// ----------------------------------------------------------------------

export default function AppView() {
  const user = getUser();
  const parentTheme = useTheme();

  // Keep the existing application theme while changing primary blue to red.
  const dashboardTheme = useMemo(
    () =>
      createTheme(parentTheme, {
        palette: {
          primary: {
            main: RED.main,
            light: '#EF5350',
            dark: RED.dark,
            contrastText: RED.white,
          },
          info: {
            main: RED.main,
            light: '#FFCDD2',
            dark: RED.dark,
            contrastText: RED.white,
          },
          background: {
            default: RED.background,
            paper: RED.white,
          },
        },
        shape: {
          borderRadius: 16,
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 18,
                border: `1px solid ${RED.border}`,
                boxShadow: '0 4px 18px rgba(110, 25, 25, 0.045)',
                backgroundImage: 'none',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              containedPrimary: {
                boxShadow: 'none',
              },
            },
          },
        },
      }),
    [parentTheme]
  );

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------
  // FETCH DASHBOARD DATA
  // --------------------------------------------------------------------

  const fetchDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getDashboardData();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // --------------------------------------------------------------------
  // SAFE DATA
  // --------------------------------------------------------------------

  const summary = dashboard?.summary || {};
  const weeklySales = dashboard?.weeklySales || [];
  const paymentSplit = dashboard?.paymentSplit || [];
  const tripStatus = dashboard?.tripStatus || [];
  const topPendingCustomers = dashboard?.topPendingCustomers || [];
  const topDrivers = dashboard?.topDrivers || [];

  // --------------------------------------------------------------------
  // WEEKLY SALES CHART
  // --------------------------------------------------------------------

  const weeklySalesChart = {
    labels: weeklySales.map((item) =>
      new Date(item.sale_date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      })
    ),
    series: [
      {
        name: 'Total Sales',
        type: 'column',
        data: weeklySales.map((item) => Number(item.total_sales)),
      },
      {
        name: 'Collected',
        type: 'column',
        data: weeklySales.map((item) => Number(item.total_collected)),
      },
    ],
  };

  // --------------------------------------------------------------------
  // PAYMENT SPLIT
  // --------------------------------------------------------------------

  const paymentSplitChart = paymentSplit.map((item) => ({
    label: item.payment_mode,
    value: Number(item.total_amount),
  }));

  // --------------------------------------------------------------------
  // TRIP STATUS TIMELINE
  // --------------------------------------------------------------------

  const tripStatusTimeline = tripStatus.map((item, index) => ({
    id: `${index}`,
    title: `${item.count} Trip(s) ${item.status}`,
    type: `order${index + 1}`,
    time: item.action_time ? new Date(item.action_time) : null,
  }));

  // --------------------------------------------------------------------
  // FORMAT VALUES
  // --------------------------------------------------------------------

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString('en-IN');

  // --------------------------------------------------------------------
  // SUMMARY WIDGETS
  // --------------------------------------------------------------------

  const summaryWidgets = [
    {
      title: "Today's Sales",
      total: Number(summary.today_sales || 0),
      color: 'success',
      icon: '/assets/icons/glass/ic_glass_buy.png',
    },
    {
      title: "Today's Collection",
      total: Number(summary.today_collection || 0),
      color: 'info',
      icon: '/assets/icons/glass/ic_glass_message.png',
    },
    {
      title: 'Total Pending',
      total: Number(summary.total_pending || 0),
      color: 'warning',
      icon: '/assets/icons/glass/ic_glass_bag.png',
    },
    {
      title: 'Birds Sold Today',
      total: Number(summary.birds_sold_today || 0),
      color: 'error',
      icon: '/assets/icons/glass/ic_glass_users.png',
    },
    {
      title: 'Active Trips',
      total: Number(summary.active_trips || 0),
      color: 'primary',
      icon: '/assets/icons/glass/ic_glass_buy.png',
    },
    {
      title: 'Drivers',
      total: Number(summary.total_drivers || 0),
      color: 'secondary',
      icon: '/assets/icons/glass/ic_glass_users.png',
    },
    {
      title: 'Farmers',
      total: Number(summary.total_farmers || 0),
      color: 'success',
      icon: '/assets/icons/glass/ic_glass_bag.png',
    },
    {
      title: 'Customers',
      total: Number(summary.total_customers || 0),
      color: 'warning',
      icon: '/assets/icons/glass/ic_glass_message.png',
    },
  ];

  // --------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------

  return (
    <ThemeProvider theme={dashboardTheme}>
      <Box
        sx={{
          minHeight: '100%',
          py: { xs: 2.5, md: 4 },
          backgroundColor: RED.background,
        }}
      >
        <Container maxWidth="xxl">
          {/* ===========================================================
              HEADER
          =========================================================== */}

          <Card
            sx={{
              mb: 4,
              p: { xs: 2.5, sm: 3.5, md: 4 },
              position: 'relative',
              overflow: 'hidden',
              color: RED.white,
              border: 'none',
              background: `linear-gradient(115deg, ${RED.dark} 0%, ${RED.main} 58%, #F05B5B 100%)`,
              boxShadow: '0 12px 32px rgba(211, 47, 47, 0.17)',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: { xs: 150, md: 250 },
                height: { xs: 150, md: 250 },
                borderRadius: '50%',
                right: { xs: -65, md: -40 },
                top: { xs: -70, md: -100 },
                backgroundColor: 'rgba(255,255,255,0.09)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 150,
                height: 150,
                borderRadius: '50%',
                right: { xs: 45, md: 125 },
                bottom: -115,
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={2}
              sx={{ position: 'relative', zIndex: 1 }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    opacity: 0.85,
                    letterSpacing: 2,
                    fontWeight: 700,
                  }}
                >
                  MR CHICKEN X · BUSINESS OVERVIEW
                </Typography>

                <Typography
                  variant="h3"
                  sx={{
                    mt: 0.5,
                    fontSize: { xs: 25, sm: 31, md: 36 },
                    fontWeight: 900,
                    letterSpacing: '-1px',
                    lineHeight: 1.2,
                  }}
                >
                  Welcome back{user?.name ? `, ${user.name}` : ''}!
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ mt: 1, opacity: 0.9 }}
                >
                  {user?.companyName || 'Your Business'} — your business at a glance.
                </Typography>
              </Box>

              <Chip
                label="Dashboard Overview"
                sx={{
                  color: RED.white,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  fontWeight: 700,
                  backdropFilter: 'blur(8px)',
                  height: 36,
                  '& .MuiChip-label': { px: 2 },
                }}
              />
            </Stack>
          </Card>

          {/* ===========================================================
              SUMMARY
          =========================================================== */}

          <SectionHeading
            title="Business Summary"
            subtitle="Key business metrics and daily performance"
          />

          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {summaryWidgets.map((widget) => (
              <Grid key={widget.title} xs={12} sm={6} lg={3}>
                <Box
                  sx={{
                    height: '100%',
                    minWidth: 0,
                    '& > *': {
                      height: '100%',
                      minWidth: 0,
                    },
                    '& .MuiCard-root': {
                      transition: 'transform 180ms ease, box-shadow 180ms ease',
                    },
                    '&:hover .MuiCard-root': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 10px 25px rgba(110,25,25,0.09)',
                    },
                  }}
                >
                  <AppWidgetSummary
                    title={widget.title}
                    total={widget.total}
                    color={widget.color}
                    icon={
                      <img
                        alt=""
                        src={widget.icon}
                        style={{
                          width: 52,
                          height: 52,
                          objectFit: 'contain',
                        }}
                      />
                    }
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* ===========================================================
              CUSTOMER AND DRIVER LEADERBOARDS
          =========================================================== */}

          <SectionHeading
            title="Business Activity"
            subtitle="Outstanding customer balances and driver performance"
          />

          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid xs={12} lg={6}>
              <AppOrderTimeline
                title="Top Pending Customers"
                list={topPendingCustomers.map((customer, index) => ({
                  id: `${customer.id}`,
                  title: `${customer.name} - ₹${formatMoney(
                    customer.pending_amount
                  )}`,
                  type: `order${(index % 5) + 1}`,
                  time: null,
                }))}
              />
            </Grid>

            <Grid xs={12} lg={6}>
              <AppOrderTimeline
                title="Top Drivers"
                list={topDrivers.map((driver, index) => ({
                  id: `${driver.id}`,
                  title: `${driver.name} | Trips: ${
                    driver.total_trips
                  } | Sales: ₹${formatMoney(driver.total_sales)}`,
                  type: `order${(index % 5) + 1}`,
                  time: null,
                }))}
              />
            </Grid>
          </Grid>

          {/* ===========================================================
              SALES ANALYTICS
          =========================================================== */}

          <SectionHeading
            title="Sales & Analytics"
            subtitle="Review sales performance and payment distribution"
          />

          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid xs={12} lg={8}>
              <AppWebsiteVisits
                title="Weekly Sales"
                subheader="Last 7 days"
                chart={weeklySalesChart}
              />
            </Grid>

            <Grid xs={12} lg={4}>
              <AppCurrentVisits
                title="Payment Split"
                chart={{
                  series: paymentSplitChart,
                }}
              />
            </Grid>
          </Grid>

          {/* ===========================================================
              TRIP STATUS
          =========================================================== */}

          <SectionHeading
            title="Trip Activity"
            subtitle="Overview of trip status and recent activity"
          />

          <Grid container spacing={2.5}>
            <Grid xs={12}>
              <AppOrderTimeline
                title="Trip Status Timeline"
                list={tripStatusTimeline}
              />
            </Grid>
          </Grid>

          {/* ===========================================================
              LOADING INDICATOR
          =========================================================== */}

          {loading && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1200,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.25,
                borderRadius: 3,
                backgroundColor: RED.white,
                border: `1px solid ${RED.border}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <CircularProgress size={18} color="primary" />

              <Typography variant="body2" fontWeight={600}>
                Loading dashboard...
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}