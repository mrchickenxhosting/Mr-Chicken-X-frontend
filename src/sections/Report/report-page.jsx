import { useState, useEffect } from 'react';

import {
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import {
  getallTrips,
  getTripReport,
  getallCustomer,
  getTripExpenses,
  getTripSalesDetails,
  getCustomerSalesDetails,
} from 'src/services/Trader.service';

// --------------------------------------------------
// HELPERS

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const safeNumber = (val) => Number(val || 0);

// --------------------------------------------------

export default function ReportPage() {

  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  const [trips, setTrips] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [rows, setRows] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // --------------------------------------------------
  // LOAD DROPDOWNS

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      setLoading(true);

      const [tripRes, customerRes] = await Promise.all([
        getallTrips(),
        getallCustomer(),
      ]);

      const closedTrips = (tripRes || []).filter(
        (trip) => trip.status === 'CLOSED'
      );

      setTrips(closedTrips);
      setCustomers(customerRes || []);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD TRIP SUMMARY REPORT

  const handleLoadTripReport = async () => {
    try {
      setReportLoading(true);

      const filters = {
        startDate: startDate || null,
        endDate: endDate || null,
        farmerId: null,
        driverId: null,
      };

      const res = await getTripReport(filters);
      setRows(res.rows || res || []);

      setSelectedTrip(null);
      setSelectedCustomer(null);
      setExpenses([]);
    } finally {
      setReportLoading(false);
    }
  };

  // --------------------------------------------------
  // TRIP DETAILS

  const handleTripChange = async (trip) => {
    setSelectedTrip(trip);
    setSelectedCustomer(null);
    setRows([]);
    setExpenses([]);

    if (!trip) return;

    try {
      setReportLoading(true);

      const [salesRes, expenseRes] = await Promise.all([
        getTripSalesDetails(trip.id),
        getTripExpenses(trip.id),
      ]);

      setRows(salesRes.rows || salesRes || []);
      setExpenses(expenseRes || []);
    } finally {
      setReportLoading(false);
    }
  };

  // --------------------------------------------------
  // CUSTOMER LEDGER

  const handleCustomerChange = async (customer) => {
    setSelectedCustomer(customer);
    setSelectedTrip(null);
    setRows([]);
    setExpenses([]);

    if (!customer) return;

    try {
      setReportLoading(true);
      const res = await getCustomerSalesDetails(customer.id);
      setRows(res.rows || res || []);
    } finally {
      setReportLoading(false);
    }
  };

  // --------------------------------------------------

  const handleReset = () => {
    setSelectedTrip(null);
    setSelectedCustomer(null);
    setRows([]);
    setExpenses([]);
    setStartDate('');
    setEndDate('');
  };

  // --------------------------------------------------
  // TOTALS

  const totalSales = rows.reduce(
    (sum, row) => sum + safeNumber(row.total_sales || row.total_amount),
    0
  );

  const totalPending = rows.reduce(
    (sum, row) => sum + safeNumber(row.pending_amount || row.pending),
    0
  );

  // --------------------------------------------------
  // TRIP ANALYTICS (ONLY FOR TRIP MODE)

  const totalLiftedBirds = Number(selectedTrip?.total_birds || 0);
const totalWeight = Number(selectedTrip?.total_weight || 0);

const totalSoldBirds = rows.reduce(
  (sum, row) => sum + Number(row.bird_count || 0),
  0
);

const totalSoldWeight = rows.reduce(
  (sum, row) => sum + Number(row.weight || 0),
  0
);

const remainingBirds = totalLiftedBirds - totalSoldBirds;

const soldPercentage =
  totalLiftedBirds > 0
    ? ((totalSoldBirds / totalLiftedBirds) * 100).toFixed(1)
    : 0;

const purchaseRatePerKg = Number(
  expenses[0]?.purchase_rate_per_kg || 0
);

const totalSpent = purchaseRatePerKg * totalWeight;

const totalOperationalExpense = expenses.reduce(
  (sum, exp) =>
    sum +
    Number(exp.diesel_expense || 0) +
    Number(exp.driver_expense || 0) +
    Number(exp.other_expense || 0),
  0
);

const netProfitLoss =
  totalSales - totalSpent - totalOperationalExpense;


  // --------------------------------------------------
  // TITLE

  let reportTitle = 'Trip Report';
  if (selectedTrip) reportTitle = 'Trip Sales';
  if (selectedCustomer) reportTitle = 'Customer Ledger';

  // --------------------------------------------------

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Reports</Typography>

      {/* FILTER CARD */}
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleLoadTripReport}
            >
              Load Trip Report
            </Button>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleReset}
            >
              Reset
            </Button>
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              options={trips}
              loading={loading}
              value={selectedTrip}
              getOptionLabel={(o) =>
                o
                  ? `Trip #${formatDate(o.trip_date)} • ${o.total_birds} birds`
                  : ''
              }
              onChange={(e, v) => handleTripChange(v)}
              renderInput={(params) => (
                <TextField {...params} label="Select Trip" />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              options={customers}
              loading={loading}
              value={selectedCustomer}
              getOptionLabel={(o) => o?.name || ''}
              onChange={(e, v) => handleCustomerChange(v)}
              renderInput={(params) => (
                <TextField {...params} label="Select Customer" />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      {/* REPORT TABLE */}
      {!reportLoading && rows.length > 0 && (
        <Card sx={{ p: 2 }}>
          <Typography variant="subtitle1" mb={2}>
            {reportTitle}
          </Typography>

          {/* SUMMARY MODE */}
          {!selectedTrip && !selectedCustomer && (
            <>
              <Grid container spacing={1} sx={{ fontWeight: 600 }}>
                <Grid item xs={3}>Date</Grid>
                <Grid item xs={3}>Farmer</Grid>
                <Grid item xs={3}>Total Sales</Grid>
                <Grid item xs={3}>Pending</Grid>
              </Grid>

              {rows.map((row) => (
                <Grid container spacing={1} key={row.trip_id}>
                  <Grid item xs={3}>
                    {formatDate(row.trip_date)}
                  </Grid>
                  <Grid item xs={3}>{row.farmer_name}</Grid>
                  <Grid item xs={3}>
                    ₹{safeNumber(row.total_sales).toFixed(2)}
                  </Grid>
                  <Grid item xs={3}>
                    ₹{safeNumber(row.pending_amount).toFixed(2)}
                  </Grid>
                </Grid>
              ))}
            </>
          )}

          {/* DETAIL MODE */}
          {(selectedTrip || selectedCustomer) && (
            <>
              <Grid container spacing={1} sx={{ fontWeight: 600 }}>
                <Grid item xs={2}>Date</Grid>
                <Grid item xs={2}>Customer</Grid>
                <Grid item xs={1}>Birds</Grid>
                <Grid item xs={1}>Weight</Grid>
                <Grid item xs={2}>Total</Grid>
                <Grid item xs={2}>Cash</Grid>
                <Grid item xs={2}>UPI</Grid>
              </Grid>

              {rows.map((row) => (
                <Grid container spacing={1} key={row.id}>
                  <Grid item xs={2}>
                    {formatDate(row.sale_date)}
                  </Grid>
                  <Grid item xs={2}>
                    {row.customer_name}
                  </Grid>
                  <Grid item xs={1}>{row.bird_count}</Grid>
                  <Grid item xs={1}>{row.weight}</Grid>
                  <Grid item xs={2}>
                    ₹{row.total_amount}
                  </Grid>
                  <Grid item xs={2}>
                    ₹{row.cash_amount}
                  </Grid>
                  <Grid item xs={2}>
                    ₹{row.upi_amount}
                  </Grid>
                </Grid>
              ))}
            </>
          )}

          {/* TOTALS */}
          <Grid
            container
            spacing={1}
            sx={{
              py: 2,
              fontWeight: 700,
              borderTop: '2px solid #000',
              mt: 1,
            }}
          >
            <Grid item xs={6}> </Grid>
            <Grid item xs={3}>
              Total Sales: ₹{totalSales.toFixed(2)}
            </Grid>
            <Grid item xs={3}>
              Total Pending: ₹{totalPending.toFixed(2)}
            </Grid>
          </Grid>
        </Card>
      )}

      {/* EXPENSE + ANALYTICS */}
      {selectedTrip && (
  <Grid container spacing={3} mt={2}>

    {/* Expense Breakdown */}
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
          background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)',
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Expense Breakdown
        </Typography>

        {expenses.map((exp) => {
          const diesel = Number(exp.diesel_expense || 0);
          const driver = Number(exp.driver_expense || 0);
          const other = Number(exp.other_expense || 0);
          const total = diesel + driver + other;

          return (
            <Grid container spacing={2} key={exp.id}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Diesel
                </Typography>
                <Typography fontWeight={600}>₹{diesel}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Driver
                </Typography>
                <Typography fontWeight={600}>₹{driver}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Other
                </Typography>
                <Typography fontWeight={600}>₹{other}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Expense
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  ₹{total.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          );
        })}
      </Card>
    </Grid>

    {/* Trip Analytics */}
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
          background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%)',
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Trip Analytics
        </Typography>

        <Grid container spacing={2}>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Lifted Birds
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {totalLiftedBirds}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Sold Birds
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {totalSoldBirds}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Lifted Weight
            </Typography>
            <Typography fontWeight={600}>
              {totalWeight} kg
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Sold Weight
            </Typography>
            <Typography fontWeight={600}>
              {totalSoldWeight.toFixed(2)} kg
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Remaining Birds
            </Typography>
            <Typography
              fontWeight={700}
              color={remainingBirds < 0 ? 'error.main' : 'text.primary'}
            >
              {remainingBirds}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Sold %
            </Typography>
            <Typography fontWeight={700}>
              {soldPercentage}%
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Purchase Rate
            </Typography>
            <Typography fontWeight={600}>
              ₹{purchaseRatePerKg}/kg
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Purchase Cost
            </Typography>
            <Typography fontWeight={600}>
              ₹{totalSpent.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Operational Expense
            </Typography>
            <Typography fontWeight={600}>
              ₹{totalOperationalExpense.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="h5"
              fontWeight={700}
              mt={2}
              color={
                netProfitLoss >= 0
                  ? 'success.main'
                  : 'error.main'
              }
            >
              {netProfitLoss >= 0 ? 'Profit' : 'Loss'}:
              ₹{netProfitLoss.toFixed(2)}
            </Typography>
          </Grid>

        </Grid>
      </Card>
    </Grid>

  </Grid>
)}

    </Stack>
  );
}



