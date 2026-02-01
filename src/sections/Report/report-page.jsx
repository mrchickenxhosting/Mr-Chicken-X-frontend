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

import {
  getallTrips,
  getTripSales,
  getallCustomer,
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
  // DATE DECIDER

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
                o ? `Trip #${o.id} • ${o.farmer_name}` : ''
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

          {!isMobile && (
            <>
              <Grid container spacing={1} sx={{ fontWeight: 600 }}>
                <Grid item xs={2}>Customer</Grid>
                <Grid item xs={1}>Type</Grid>
                <Grid item xs={1}>Birds</Grid>
                <Grid item xs={1}>Weight</Grid>
                <Grid item xs={1}>Rate</Grid>
                  <Grid item xs={2}>Total</Grid>
                  <Grid item xs={1}>Pay</Grid>
                <Grid item xs={1}>Cash</Grid>
                <Grid item xs={1}>UPI</Grid>
                <Grid item xs={1}>Date</Grid>
              </Grid>

              {sales.map((sale) => (
                <Grid
                  container
                  spacing={1}
                  key={sale.id}
                  sx={{ py: 1, borderBottom: '1px solid #eee' }}
                >
                  <Grid item xs={2}>{sale.customer_name}</Grid>
                  <Grid item xs={1}>{sale.sell_type}</Grid>
                  <Grid item xs={1}>{sale.bird_count}</Grid>
                  <Grid item xs={1}>{sale.weight}</Grid>
                  <Grid item xs={1}>₹{sale.rate}</Grid>
                  <Grid item xs={2}>₹{sale.total_amount}</Grid>
                  <Grid item xs={1}>{sale.payment_mode}</Grid>
                  <Grid item xs={1}>₹{sale.cash_amount}</Grid>
                  <Grid item xs={1}>₹{sale.upi_amount}</Grid>
                  <Grid item xs={1}>{getSaleDate(sale)}</Grid>
                </Grid>
              ))}
            </>
          )}

          {isMobile && (
            <Stack spacing={2}>
              {sales.map((sale) => (
                <Card key={sale.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={0.5}>
                    <Typography fontWeight={600}>
                      {sale.customer_name}
                    </Typography>
                    <Typography variant="body2">
                      Type: {sale.sell_type}
                    </Typography>
                    <Typography variant="body2">
                      Birds: {sale.bird_count} | Weight: {sale.weight} kg
                    </Typography>
                    <Typography fontWeight={600}>
                      Total: ₹{sale.total_amount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getSaleDate(sale)}
                    </Typography>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Card>
      )}
    </Stack>
  );
}
