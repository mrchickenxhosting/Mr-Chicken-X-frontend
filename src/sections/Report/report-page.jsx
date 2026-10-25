import * as XLSX from "xlsx";
import { useState, useEffect } from 'react';

import {
  Card,
  Grid,
  Table,
  Stack,
  Button,
  TableRow,

  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  Autocomplete,
  TableContainer
} from "@mui/material";

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
  const [customerOutstanding, setCustomerOutstanding] = useState(0);

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
const reportRows = res.rows || res || [];

console.log('TRIP REPORT RESPONSE:', reportRows);

setRows(
  reportRows.map((row) => ({
    ...row,
    farm_location:
      row.farm_location ||
      row.location ||
      row.farmLocation ||
      row.farm ||
      '',
  }))
);

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
  setCustomerOutstanding(0);

  if (!customer) {
    return;
  }

  try {
    setReportLoading(true);

    const res = await getCustomerSalesDetails(customer.id);

    // Support both Axios and direct API responses.
    const responseData = res?.data ?? res;

    // Support nested response: { rows: { rows: [], total_outstanding: 0 } }
    const resultData = responseData?.rows ?? responseData;

    // Extract customer sales rows without nested ternary expressions.
    let customerRows = [];

    if (Array.isArray(resultData?.rows)) {
      customerRows = resultData.rows;
    } else if (Array.isArray(resultData)) {
      customerRows = resultData;
    }

    setRows(customerRows);

    // Extract total outstanding, including previous outstanding balance.
    const outstanding =
      resultData?.total_outstanding ??
      responseData?.total_outstanding ??
      0;

    setCustomerOutstanding(Number(outstanding) || 0);
  } catch (error) {
    console.error('Failed to load customer sales details:', error);
    setRows([]);
    setCustomerOutstanding(0);
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

  
  const salesRows = rows.filter(
    (row) => Number(row.bird_count) > 0
  );
  
  const paymentRows = rows.filter(
    (row) => Number(row.bird_count) === 0
  );

const isSummaryMode = !selectedTrip && !selectedCustomer;

const totalSales = isSummaryMode
  ? rows.reduce((sum, row) => sum + safeNumber(row.total_sales), 0)
  : salesRows.reduce((sum, row) => sum + safeNumber(row.total_amount), 0);

  const totalPending = isSummaryMode
  ? rows.reduce((sum, row) => sum + safeNumber(row.pending_amount), 0)
  : salesRows.reduce((sum, row) => sum + safeNumber(row.pending), 0); 
  // --------------------------------------------------
  // TRIP ANALYTICS (ONLY FOR TRIP MODE)

  const totalLiftedBirds = Number(selectedTrip?.total_birds || 0);
  const totalWeight = Number(selectedTrip?.total_weight || 0);

 const totalSoldBirds = isSummaryMode
  ? rows.reduce((sum, row) => sum + safeNumber(row.total_birds), 0)
  : salesRows.reduce((sum, row) => sum + safeNumber(row.bird_count), 0);

  const totalSoldWeight = isSummaryMode
  ? rows.reduce((sum, row) => sum + safeNumber(row.total_weight), 0)
  : salesRows.reduce((sum, row) => sum + safeNumber(row.weight), 0);

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


const handleExportExcel = () => {
  let exportData = [];
  let fileName = 'Report.xlsx';

  // Trip Summary Report
  if (!selectedTrip && !selectedCustomer) {
    fileName = 'Trip_Report.xlsx';

    exportData = rows.map((row) => ({
      Date: formatDate(row.trip_date),
      Farmer: row.farmer_name || '-',
      Farm: row.farm_location || row.location || '-',
      Birds: row.total_birds,
      Weight: row.total_weight,
      Rate: row.purchase_rate_per_kg,
      Sales: row.total_sales,
      Purchase: row.purchase_cost,
      Diesel: row.diesel_expense,
      Driver: row.driver_expense,
      Other: row.other_expense,
      Expense: row.total_expense,
      Pending: row.pending_amount,
      Profit: row.profit_loss,
    }));
  }

  // Trip Sales Report
  if (selectedTrip) {
    fileName = `Trip_${selectedTrip.id}_Sales.xlsx`;

    exportData = rows.map((row) => ({
      Date: formatDate(row.sale_date),
      Customer: row.customer_name || '-',
      Birds: row.bird_count,
      Weight: row.weight,
      Rate: row.rate,
      Amount: row.total_amount,
      Cash: row.cash_amount,
      UPI: row.upi_amount,
      Pending: row.pending,
    }));
  }

  // Customer Ledger
  if (selectedCustomer) {
    const safeFileName = `${selectedCustomer.name || 'Customer'}_Ledger`
      .replace(/[<>:"/\\|?*]/g, '_');

    fileName = `${safeFileName}.xlsx`;

    // Customer sales details
    const customerSalesData = rows.map((row) => ({
      Date: formatDate(row.sale_date),
      Trip: row.trip_id ?? '-',
      Birds: row.bird_count ?? 0,
      Weight: Number(row.weight || 0),
      Rate: Number(row.rate || 0),
      Amount: Number(row.total_amount || 0),
      Cash: Number(row.cash_amount || 0),
      UPI: Number(row.upi_amount || 0),
      Pending: Number(row.pending || 0),
    }));

    // Create worksheet with summary and sales table
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Customer Ledger'],
      ['Customer Name', selectedCustomer.name || '-'],
      [
        'Total Outstanding',
        Number(customerOutstanding || 0),
      ],
      [],
      [
        'Date',
        'Trip',
        'Birds',
        'Weight',
        'Rate',
        'Amount',
        'Cash',
        'UPI',
        'Pending',
      ],
    ]);

    // Add transaction rows below the headers
    XLSX.utils.sheet_add_json(worksheet, customerSalesData, {
      origin: 'A6',
      skipHeader: true,
    });

    // Set useful column widths
    worksheet['!cols'] = [
      { wch: 16 }, // Date
      { wch: 12 }, // Trip
      { wch: 10 }, // Birds
      { wch: 12 }, // Weight
      { wch: 12 }, // Rate
      { wch: 15 }, // Amount
      { wch: 15 }, // Cash
      { wch: 15 }, // UPI
      { wch: 15 }, // Pending
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Customer Ledger'
    );

    XLSX.writeFile(workbook, fileName);
    return;
  }

  // Export Trip Summary or Trip Sales
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Report'
  );

  XLSX.writeFile(workbook, fileName);
};

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

  <Grid item xs={12} md={2}>
    <Button
      variant="contained"
      fullWidth
      onClick={handleLoadTripReport}
    >
      Load Report
    </Button>
  </Grid>

  <Grid item xs={12} md={2}>
    <Button
      variant="outlined"
      fullWidth
      onClick={handleReset}
    >
      Reset
    </Button>
  </Grid>

  <Grid item xs={12} md={2}>
    <Button
      variant="contained"
      color="success"
      fullWidth
      onClick={handleExportExcel}
      disabled={reportLoading || rows.length === 0}
    >
      Export Excel
    </Button>
  </Grid>

  <Grid item xs={12} md={6}>
    <Autocomplete
      options={trips}
      loading={loading}
      value={selectedTrip}
      getOptionLabel={(o) =>
  o
    ? `Trip #${o.id} • ${formatDate(o.trip_date)} • ${o.farmer_name || '-'} • ${o.farm_location || o.location || '-'}`
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



<Grid
  container
  spacing={1}
  mb={2}
  sx={{
    flexWrap: 'nowrap',
    width: '100%',
    m: 0,
  }}
>
  {/* Total Sales */}
  <Grid item sx={{ flex: '1 1 0', minWidth: 0 }}>
    <Card sx={{ p: 1.5, height: '100%' }}>
      <Typography variant="caption" noWrap>
        Total Sales
      </Typography>
      <Typography variant="h6" noWrap>
        ₹{totalSales.toLocaleString('en-IN')}
      </Typography>
    </Card>
  </Grid>

  {/* Total Birds Sold */}
  <Grid item sx={{ flex: '1 1 0', minWidth: 0 }}>
    <Card sx={{ p: 1.5, height: '100%' }}>
      <Typography variant="caption" noWrap>
        Total Birds Sold
      </Typography>
      <Typography variant="h6" noWrap>
        {totalSoldBirds}
      </Typography>
    </Card>
  </Grid>

  {/* Total Weight */}
  <Grid item sx={{ flex: '1 1 0', minWidth: 0 }}>
    <Card sx={{ p: 1.5, height: '100%' }}>
      <Typography variant="caption" noWrap>
        Total Weight
      </Typography>
      <Typography variant="h6" noWrap>
        {totalSoldWeight.toFixed(2)} KG
      </Typography>
    </Card>
  </Grid>

  {/* Customer Outstanding */}
  {selectedCustomer && (
    <Grid item sx={{ flex: '1 1 0', minWidth: 0 }}>
      <Card
        sx={{
          p: 1.5,
          height: '100%',
          border: '1px solid',
          borderColor: 'warning.light',
          bgcolor: 'warning.lighter',
        }}
      >
        <Typography variant="caption" noWrap>
          Total Outstanding
        </Typography>
        <Typography variant="h6" color="warning.dark" noWrap>
          ₹{Number(customerOutstanding || 0).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
          })}
        </Typography>
      </Card>
    </Grid>
  )}

  {/* Total Expense */}
  {isSummaryMode && (
    <Grid item sx={{ flex: '1 1 0', minWidth: 0 }}>
      <Card sx={{ p: 1.5, height: '100%' }}>
        <Typography variant="caption" noWrap>
          Total Expense
        </Typography>
        <Typography variant="h6" color="error.main" noWrap>
          ₹{rows
            .reduce(
              (sum, row) => sum + safeNumber(row.total_expense),
              0
            )
            .toLocaleString('en-IN', {
              maximumFractionDigits: 2,
            })}
        </Typography>
      </Card>
    </Grid>
  )}

  {/* Pending */}
  <Grid item sx={{ flex: '1 1 0', minWidth: 0 }}>
    <Card sx={{ p: 1.5, height: '100%' }}>
      <Typography variant="caption" noWrap>
        Pending
      </Typography>
      <Typography variant="h6" color="warning.main" noWrap>
        ₹{totalPending.toLocaleString('en-IN', {
          maximumFractionDigits: 2,
        })}
      </Typography>
    </Card>
  </Grid>
</Grid>




          {/* SUMMARY MODE */}
          {!selectedTrip && !selectedCustomer && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Farmer</TableCell>
                    <TableCell>Farm</TableCell>
                    <TableCell>Birds</TableCell>
                    <TableCell>KG</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">Purchase</TableCell>
                    <TableCell align="right">Diesel</TableCell>
                    <TableCell align="right">Driver</TableCell>
                    <TableCell align="right">Other</TableCell>
                    <TableCell align="right">Expense</TableCell>
                    <TableCell align="right">Pending</TableCell>
                    <TableCell align="right">Profit</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row) => {
                    const profit = safeNumber(row.profit_loss);

                    return (
                      <TableRow key={row.trip_id} hover>
                        <TableCell>
                          {formatDate(row.trip_date)}
                        </TableCell>

                        <TableCell>{row.farmer_name || '-'}</TableCell>
                        <TableCell>{row.farm_location || row.location || '-'}</TableCell>

                        <TableCell>{row.total_birds}</TableCell>

                        <TableCell>
                          {safeNumber(row.total_weight).toFixed(1)}
                        </TableCell>

                        <TableCell>
                          ₹{row.purchase_rate_per_kg}
                        </TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(row.total_sales).toLocaleString()}
                        </TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(row.purchase_cost).toLocaleString()}
                        </TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(row.diesel_expense).toLocaleString()}
                        </TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(row.driver_expense).toLocaleString()}
                        </TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(row.other_expense).toLocaleString()}
                        </TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(row.total_expense).toLocaleString()}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              safeNumber(row.pending_amount) > 0
                                ? "warning.main"
                                : "inherit",
                            fontWeight: 600,
                          }}
                        >
                          ₹{safeNumber(row.pending_amount).toLocaleString()}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              profit >= 0
                                ? "success.main"
                                : "error.main",
                            fontWeight: 700,
                          }}
                        >
                          ₹{profit.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  <TableRow
                    sx={{
                      "& td": {
                        fontWeight: 700,
                        borderTop: "2px solid",
                      },
                    }}
                  >
                    <TableCell colSpan={6}>
                      TOTAL
                    </TableCell>

                    <TableCell align="right">
                      ₹{rows
                        .reduce(
                          (s, r) => s + safeNumber(r.total_sales),
                          0
                        )
                        .toLocaleString()}
                    </TableCell>

                    <TableCell align="right">
                      ₹{rows
                        .reduce(
                          (s, r) => s + safeNumber(r.purchase_cost),
                          0
                        )
                        .toLocaleString()}
                    </TableCell>

                    <TableCell />

                    <TableCell />

                    <TableCell />

                    <TableCell align="right">
                      ₹{rows
                        .reduce(
                          (s, r) => s + safeNumber(r.total_expense),
                          0
                        )
                        .toLocaleString()}
                    </TableCell>

                    <TableCell align="right">
                      ₹{salesRows
                        .reduce(
                          (s, r) => s + safeNumber(r.pending_amount),
                          0
                        )
                        .toLocaleString()}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        color:
                          salesRows.reduce(
                            (s, r) => s + safeNumber(r.profit_loss),
                            0
                          ) >= 0
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      ₹{salesRows
                        .reduce(
                          (s, r) => s + safeNumber(r.profit_loss),
                          0
                        )
                        .toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}


          {/* DETAIL MODE */}
{(selectedTrip || selectedCustomer) && (
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Customer</TableCell>
          <TableCell align="center">Birds</TableCell>
          <TableCell align="center">Weight</TableCell>
          <TableCell align="center">Rate</TableCell>
          <TableCell align="right">Amount</TableCell>
          <TableCell align="right">Cash</TableCell>
          <TableCell align="right">UPI</TableCell>
          <TableCell align="right">Pending</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {salesRows.map((row) => (
          <TableRow key={row.id} hover>
            <TableCell>
              {formatDate(row.sale_date)}
            </TableCell>

            <TableCell>
              {row.customer_name}
            </TableCell>

            <TableCell align="center">
              {row.bird_count}
            </TableCell>

            <TableCell align="center">
              {safeNumber(row.weight).toFixed(2)}
            </TableCell>

            <TableCell align="center">
              ₹{safeNumber(row.rate).toFixed(0)}
            </TableCell>

            <TableCell align="right">
              ₹{safeNumber(row.total_amount).toLocaleString()}
            </TableCell>

            <TableCell align="right">
              ₹{safeNumber(row.cash_amount).toLocaleString()}
            </TableCell>

            <TableCell align="right">
              ₹{safeNumber(row.upi_amount).toLocaleString()}
            </TableCell>

            <TableCell
              align="right"
              sx={{
                color:
                  safeNumber(row.pending) > 0
                    ? "warning.main"
                    : "success.main",
                fontWeight: 600,
              }}
            >
              ₹{safeNumber(row.pending).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}

        <TableRow
          sx={{
            "& td": {
              fontWeight: 700,
              borderTop: "2px solid",
            },
          }}
        >
          <TableCell colSpan={2}>
            TOTAL
          </TableCell>

          <TableCell align="center">
            {salesRows.reduce(
              (s, r) => s + safeNumber(r.bird_count),
              0
            )}
          </TableCell>

          <TableCell align="center">
            {salesRows
              .reduce(
                (s, r) => s + safeNumber(r.weight),
                0
              )
              .toFixed(2)}
          </TableCell>

          <TableCell />

          <TableCell align="right">
            ₹{rows
              .reduce(
                (s, r) => s + safeNumber(r.total_amount),
                0
              )
              .toLocaleString()}
          </TableCell>

          <TableCell align="right">
            ₹{rows
              .reduce(
                (s, r) => s + safeNumber(r.cash_amount),
                0
              )
              .toLocaleString()}
          </TableCell>

          <TableCell align="right">
            ₹{rows
              .reduce(
                (s, r) => s + safeNumber(r.upi_amount),
                0
              )
              .toLocaleString()}
          </TableCell>

          <TableCell align="right">
            ₹{rows
              .reduce(
                (s, r) => s + safeNumber(r.pending),
                0
              )
              .toLocaleString()}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </TableContainer>
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
    <Grid item xs={12} md={4}>
      <Card
        sx={{
          p: 3,
          height: "100%",
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={3}>
          Expense Breakdown
        </Typography>

        {expenses.map((exp) => {
          const diesel = Number(exp.diesel_expense || 0);
          const driver = Number(exp.driver_expense || 0);
          const other = Number(exp.other_expense || 0);
          const total = diesel + driver + other;

          return (
            <Stack spacing={2} key={exp.id}>
              <Grid container>
                <Grid item xs={6}>
                  Diesel
                </Grid>
                <Grid item xs={6} textAlign="right">
                  ₹{diesel.toLocaleString()}
                </Grid>
              </Grid>

              <Grid container>
                <Grid item xs={6}>
                  Driver
                </Grid>
                <Grid item xs={6} textAlign="right">
                  ₹{driver.toLocaleString()}
                </Grid>
              </Grid>

              <Grid container>
                <Grid item xs={6}>
                  Other
                </Grid>
                <Grid item xs={6} textAlign="right">
                  ₹{other.toLocaleString()}
                </Grid>
              </Grid>

              <Grid
                container
                sx={{
                  mt: 1,
                  pt: 2,
                  borderTop: "1px solid #ddd",
                  fontWeight: 700,
                }}
              >
                <Grid item xs={6}>
                  Total
                </Grid>
                <Grid item xs={6} textAlign="right">
                  ₹{total.toLocaleString()}
                </Grid>
              </Grid>
            </Stack>
          );
        })}
      </Card>
    </Grid>

    {/* Analytics */}
    <Grid item xs={12} md={8}>
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={3}>
          Trip Analytics
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography variant="caption">
              Lifted Birds
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {totalLiftedBirds}
            </Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="caption">
              Sold Birds
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {totalSoldBirds}
            </Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="caption">
              Lifted Weight
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {totalWeight}
            </Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="caption">
              Sold Weight
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {totalSoldWeight.toFixed(1)}
            </Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="caption">
              Remaining Birds
            </Typography>
            <Typography
              variant="h5"
              fontWeight={700}
              color={
                remainingBirds > 0
                  ? "warning.main"
                  : "success.main"
              }
            >
              {remainingBirds}
            </Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="caption">
              Sold %
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {soldPercentage}%
            </Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="caption">
              Purchase Rate
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              ₹{purchaseRatePerKg}
            </Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography variant="caption">
              Expense
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              ₹{totalOperationalExpense.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px solid #ddd",
          }}
        >
          <Grid item xs={6}>
            <Typography variant="caption">
              Purchase Cost
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              ₹{totalSpent.toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption">
              Net Result
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              color={
                netProfitLoss >= 0
                  ? "success.main"
                  : "error.main"
              }
            >
              ₹{netProfitLoss.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  </Grid>
)}

{selectedTrip && paymentRows.length > 0 && (
  <Card sx={{ p: 3, mt: 3 }}>
    <Typography variant="h6" mb={2}>
      Payments Only
    </Typography>

    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell align="right">Cash</TableCell>
            <TableCell align="right">UPI</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paymentRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                {formatDate(row.sale_date)}
              </TableCell>

              <TableCell>
                {row.customer_name}
              </TableCell>

              <TableCell align="right">
                ₹{safeNumber(row.cash_amount).toLocaleString()}
              </TableCell>

              <TableCell align="right">
                ₹{safeNumber(row.upi_amount).toLocaleString()}
              </TableCell>

              <TableCell align="right">
                ₹{safeNumber(row.total_amount).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}

          <TableRow
            sx={{
              "& td": {
                fontWeight: 700,
                borderTop: "2px solid",
              },
            }}
          >
            <TableCell colSpan={2}>
              TOTAL
            </TableCell>

            <TableCell align="right">
              ₹{paymentRows
                .reduce(
                  (s, r) => s + safeNumber(r.cash_amount),
                  0
                )
                .toLocaleString()}
            </TableCell>

            <TableCell align="right">
              ₹{paymentRows
                .reduce(
                  (s, r) => s + safeNumber(r.upi_amount),
                  0
                )
                .toLocaleString()}
            </TableCell>

            <TableCell align="right">
              ₹{paymentRows
                .reduce(
                  (s, r) => s + safeNumber(r.total_amount),
                  0
                )
                .toLocaleString()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Card>
)}

    </Stack>
  );
}



