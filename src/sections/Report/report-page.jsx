import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useState, useEffect } from 'react';

import {
  Card,
  Grid,
  Stack,
  Button,
  useTheme,
  TextField,
  Typography,
  Autocomplete,
  useMediaQuery,
} from '@mui/material';

import { getUser } from 'src/utils/session';

import {
  getallTrips,
  getTripSales,
  getallCustomer,
  getTripExpenses,
  getCustomerSales,
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

// EXPORT TO EXCEL
const exportSalesToExcel = (sales) => {
  const data = sales.map((sale) => ({
    Customer: sale.customer_name,
    'Sell Type': sale.sell_type,
    Birds: sale.bird_count,
    Weight: sale.weight,
    Rate: sale.rate,
    'Total Amount': sale.total_amount,
    'Payment Mode': sale.payment_mode,
    'Cash Amount': sale.cash_amount,
    'UPI Amount': sale.upi_amount,
    Date: formatDate(sale.sale_date || sale.created_at),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const file = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(file, `sales-report-${Date.now()}.xlsx`);
};

// --------------------------------------------------

export default function ReportPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  const [trips, setTrips] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const user = getUser();


  // --------------------------------------------------
  // CALCULATE SUBTOTAL (Trip Only)

  const subtotal = sales.reduce(
    (sum, sale) => sum + Number(sale.total_amount || 0),
    0
  );

  const totalExpense = expenses.reduce(
    (sum, exp) =>
      sum +
      Number(exp.diesel_expense || 0) +
      Number(exp.driver_expense || 0) +
      Number(exp.other_expense || 0),
    0
  );


  const profit = subtotal - totalExpense;
  console.log(profit, totalExpense, expenses)

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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------

  const getSaleDate = (sale) => {
    if (selectedTrip) return formatDate(sale.created_at);
    if (selectedCustomer) return formatDate(sale.sale_date);
    return '-';
  };

  // --------------------------------------------------
  // TRIP SELECT

  const handleTripChange = async (trip) => {
    setSelectedTrip(trip);
    setSelectedCustomer(null);
    setSales([]);

    if (!trip) return;

    try {
      setReportLoading(true);
      const data = await getTripSales(trip.id);
      const expense = await getTripExpenses(trip.id)
      setExpenses(expense)
      setSales(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setReportLoading(false);
    }
  };

  // --------------------------------------------------
  // CUSTOMER SELECT

  const handleCustomerChange = async (customer) => {
    setSelectedCustomer(customer);
    setSelectedTrip(null);
    setSales([]);

    if (!customer) return;

    try {
      setReportLoading(true);
      const data = await getCustomerSales(customer.id);
      setSales(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setReportLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedTrip(null);
    setSelectedCustomer(null);
    setSales([]);
  };

  // --------------------------------------------------
  const totalLiftedBirds = Number(selectedTrip?.total_birds || 0);
  const totalWeight = selectedTrip?.total_weight

  const totalSoldWeight = sales.reduce(
    (sum, sale) => sum + Number(sale.weight || 0),
    0
  );

  const totalSoldBirds = sales.reduce(
    (sum, sale) => sum + Number(sale.bird_count || 0),
    0
  );

  const remainingBirds = totalLiftedBirds - totalSoldBirds;


  const soldPercentage =
    totalLiftedBirds > 0
      ? ((totalSoldBirds / totalLiftedBirds) * 100).toFixed(1)
      : 0;

  const purchaseRatePerKg = Number(expenses[0]?.purchase_rate_per_kg || 0);

  // Total cost of lifted birds
  const totalSpent = purchaseRatePerKg * Number(totalWeight || 0);

  const totalOperationalExpense = expenses.reduce(
    (sum, exp) =>
      sum +
      Number(exp.diesel_expense || 0) +
      Number(exp.driver_expense || 0) +
      Number(exp.other_expense || 0),
    0
  );

  // Profit or Loss
  const netProfitLoss =
    subtotal - totalSpent - totalOperationalExpense;

  console.log(totalSpent, netProfitLoss)


  return (
    <Stack spacing={3}>
      <Typography variant="h5">Reports</Typography>

      {/* DROPDOWNS */}
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={trips}
              loading={loading}
              value={selectedTrip}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              getOptionLabel={(o) =>
                o
                  ? `Trip #${new Date(o.trip_date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })} • ${o.driver_name} • ${o.total_birds} birds • ${o.farmer_name}`
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
              isOptionEqualToValue={(o, v) => o.id === v.id}
              getOptionLabel={(o) => o?.name || ''}
              onChange={(e, v) => handleCustomerChange(v)}
              renderInput={(params) => (
                <TextField {...params} label="Select Customer" />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* SALES */}
      {!reportLoading && sales.length > 0 && (
        <Card sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="subtitle1">Sales</Typography>

            <Button
              size={isMobile ? 'small' : 'medium'}
              variant="contained"
              onClick={() => exportSalesToExcel(sales)}
            >
              Export to Excel
            </Button>
          </Stack>

          {/* DESKTOP VIEW */}
          {!isMobile && (
            <>
              <Grid container spacing={1} sx={{ fontWeight: 600 }}>
                <Grid item xs={1}>Date</Grid>
                <Grid item xs={2}>Customer</Grid>
                <Grid item xs={1}>Type</Grid>
                <Grid item xs={1}>Birds</Grid>
                <Grid item xs={1}>Weight</Grid>
                <Grid item xs={1}>Rate</Grid>
                <Grid item xs={2}>Total</Grid>
                <Grid item xs={1}>Pay</Grid>
                <Grid item xs={1}>Cash</Grid>
                <Grid item xs={1}>UPI</Grid>
              </Grid>

              {sales.map((sale) => (
                <Grid
                  container
                  spacing={1}
                  key={sale.id}
                  sx={{ py: 1, borderBottom: '1px solid #eee' }}
                >
                  <Grid item xs={1}>{getSaleDate(sale)}</Grid>
                  <Grid item xs={2}>{sale.customer_name}</Grid>
                  <Grid item xs={1}>{sale.sell_type}</Grid>
                  <Grid item xs={1}>{sale.bird_count}</Grid>
                  <Grid item xs={1}>{sale.weight}</Grid>
                  <Grid item xs={1}>₹{sale.rate}</Grid>
                  <Grid item xs={2}>₹{sale.total_amount}</Grid>
                  <Grid item xs={1}>{sale.payment_mode}</Grid>
                  <Grid item xs={1}>₹{sale.cash_amount}</Grid>
                  <Grid item xs={1}>₹{sale.upi_amount}</Grid>
                </Grid>
              ))}

              {/* SUBTOTAL (ONLY FOR TRIP) */}
              {selectedTrip && (
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
                  <Grid item xs={7} />
                  <Grid item xs={2}>Subtotal:</Grid>
                  <Grid item xs={1} />
                  <Grid item xs={2}>₹{Math.round(subtotal)}</Grid>
                </Grid>
              )}
            </>
          )}

          {/* MOBILE VIEW */}
          {isMobile && (
            <Stack spacing={2}>
              {sales.map((sale) => (
                <Card key={sale.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={0.5}>
                    <Typography fontWeight={600}>
                      {sale.customer_name}
                    </Typography>
                    <Typography variant="body2">
                      Birds: {sale.bird_count} | Weight: {sale.weight}
                    </Typography>
                    <Typography fontWeight={600}>
                      Total: ₹{sale.total_amount}
                    </Typography>
                    <Typography variant="caption">
                      {getSaleDate(sale)}
                    </Typography>
                  </Stack>
                </Card>
              ))}

              {selectedTrip && (
                <Card sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <Typography fontWeight={700}>
                    Subtotal: ₹{subtotal.toFixed(2)}
                  </Typography>
                </Card>
              )}
            </Stack>
          )}
        </Card>
      )}

      {/* EXPENSE BREAKDOWN CARD */}
      {selectedTrip && (
        <Grid container spacing={3} mt={1}>

          {/* Expense Card */}
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
                        ₹{total}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              })}
            </Card>
          </Grid>

          {/* Trip Analytics Card */}
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
                    Remaining
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

                {user?.role === "TRADER" && <Grid item xs={12}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color={netProfitLoss >= 0 ? 'success.main' : 'error.main'}
                    mt={2}
                  >
                    {netProfitLoss >= 0 ? 'Profit' : 'Loss'}: ₹
                    {netProfitLoss.toFixed(2)}
                  </Typography>
                </Grid>}

              </Grid>
            </Card>
          </Grid>

        </Grid>
      )}

    </Stack>
  );
}
