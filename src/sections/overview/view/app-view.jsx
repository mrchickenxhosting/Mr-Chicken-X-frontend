import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { getUser } from 'src/utils/session';

import { getDashboardData } from 'src/services/Trader.service';

import AppWidgetSummary from '../app-widget-summary';
import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import AppOrderTimeline from '../app-order-timeline';

// ----------------------------------------------------------------------

export default function AppView() {
  const user = getUser();

  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await getDashboardData();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    }
  };

  // ================= SAFE DATA =================
  const summary = dashboard?.summary || {};
  const weeklySales = dashboard?.weeklySales || [];
  const paymentSplit = dashboard?.paymentSplit || [];
  const tripStatus = dashboard?.tripStatus || [];

  // ================= WEEKLY SALES CHART =================
const weeklySalesChart = {
labels: weeklySales.map(item =>
  new Date(item.sale_date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short'
  })
),
  series: [
    {
      name: 'Total Sales',
      type: 'column',
      data: weeklySales.map(item => Number(item.total_sales)),
    },
    {
      name: 'Collected',
      type: 'column', // ✅ CHANGE HERE
      data: weeklySales.map(item => Number(item.total_collected)),
    },
  ],
};



  // ================= PAYMENT SPLIT PIE =================
const paymentSplitChart = paymentSplit.map((item) => ({
  label: item.payment_mode,
  value: Number(item.total_amount),
}));


  // ================= TRIP STATUS TIMELINE =================
  const tripStatusTimeline = tripStatus.map((item, index) => ({
    id: `${index}`,
    title: `${item.count} Trip(s) ${item.status}`,
    type: `order${index + 1}`,
    time: new Date(),
  }));

  console.log("Active Trips:", summary.active_trips, typeof summary.active_trips);


  // ================= RENDER =================
  return (
    <Container maxWidth="xxl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back {user?.name}, {user?.companyName} 👋
      </Typography>

      <Grid container spacing={3}>
        {/* ================= SUMMARY ================= */}

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Active Trips"
            total={summary.active_trips || 0}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Drivers"
            total={summary.total_drivers || 0}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Farmers"
            total={summary.total_farmers || 0}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Customers"
            total={summary.total_customers || 0}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        {/* ================= WEEKLY SALES ================= */}

        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Weekly Sales"
            subheader="Last 7 days"
            chart={weeklySalesChart}
          />
        </Grid>

        {/* ================= PAYMENT SPLIT ================= */}

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Payment Split"
            chart={{
              series: paymentSplitChart,
            }}
          />
        </Grid>

        {/* ================= TRIP STATUS TIMELINE ================= */}

        <Grid xs={12}>
          <AppOrderTimeline
            title="Trip Status Timeline"
            list={tripStatusTimeline}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
