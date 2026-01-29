// import { useState, useEffect } from 'react';

// import Grid from '@mui/material/Grid';
// import Card from '@mui/material/Card';
// import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import Typography from '@mui/material/Typography';
// import Autocomplete from '@mui/material/Autocomplete';
// import CircularProgress from '@mui/material/CircularProgress';

// import {
//   getallFarmer,
//   getReportData,
//   getallCustomer,
// } from 'src/services/Trader.service';

// // ----------------------------------------------------------------------

// export default function ReportPage() {
//   const [filters, setFilters] = useState({
//     startDate: '',
//     endDate: '',
//     customer: null,
//     farmer: null,
//   });

//   const [customers, setCustomers] = useState([]);
//   const [farmers, setFarmers] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [reportLoading, setReportLoading] = useState(false);

//   const [reportData, setReportData] = useState(null);

//   // ----------------------------------------------------------------------
//   // LOAD FILTER DROPDOWNS

//   useEffect(() => {
//     loadFilterData();
//   }, []);

//   const loadFilterData = async () => {
//     try {
//       setLoading(true);

//       const [customerRes, farmerRes] = await Promise.all([
//         getallCustomer(),
//         getallFarmer(),
//       ]);

//       setCustomers(customerRes || []);
//       setFarmers(farmerRes || []);

//     } catch (error) {
//       console.error('Failed to load report filters', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----------------------------------------------------------------------
//   // HANDLE FILTER CHANGE

//   const handleChange = (field, value) => {
//     setFilters((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   // ----------------------------------------------------------------------
//   // APPLY FILTER → FETCH REPORT

//   const handleSubmit = async () => {
//     try {
//       const payload = {
//         startDate: filters.startDate || null,
//         endDate: filters.endDate || null,
//         customerId: filters.customer?.id || null,
//         farmerId: filters.farmer?.id || null,

//         // default grouping (can extend later)
//         groupBy: 'NONE',
//       };

//       console.log('REPORT FILTER PAYLOAD:', payload);

//       setReportLoading(true);

//       const data = await getReportData(payload);

//       console.log('REPORT RESPONSE:', data);

//       setReportData(data);

//     } catch (error) {
//       console.error('Report fetch failed', error);
//       alert(error?.response?.data?.message || 'Failed to load report');
//     } finally {
//       setReportLoading(false);
//     }
//   };

//   // ----------------------------------------------------------------------
//   // RESET FILTERS

//   const handleReset = () => {
//     setFilters({
//       startDate: '',
//       endDate: '',
//       customer: null,
//       farmer: null,
//     });

//     setReportData(null);
//   };

//   // ----------------------------------------------------------------------

//   return (
//     <Stack spacing={3}>

//       <Typography variant="h5">
//         Reports
//       </Typography>

//       {/* ================= FILTER CARD ================= */}

//       <Card sx={{ p: 3 }}>
//         <Grid container spacing={2}>

//           {/* From Date */}
//           <Grid item xs={12} md={3}>
//             <TextField
//               fullWidth
//               type="date"
//               label="From Date"
//               InputLabelProps={{ shrink: true }}
//               value={filters.startDate}
//               onChange={(e) => handleChange('startDate', e.target.value)}
//             />
//           </Grid>

//           {/* To Date */}
//           <Grid item xs={12} md={3}>
//             <TextField
//               fullWidth
//               type="date"
//               label="To Date"
//               InputLabelProps={{ shrink: true }}
//               value={filters.endDate}
//               onChange={(e) => handleChange('endDate', e.target.value)}
//             />
//           </Grid>

//           {/* Customer */}
//           <Grid item xs={12} md={3}>
//             <Autocomplete
//               options={customers}
//               loading={loading}
//               value={filters.customer}
//               getOptionLabel={(option) => option.name || ''}
//               onChange={(e, value) => handleChange('customer', value)}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Customer"
//                   InputProps={{
//                     ...params.InputProps,
//                     endAdornment: (
//                       <>
//                         {loading ? <CircularProgress size={18} /> : null}
//                         {params.InputProps.endAdornment}
//                       </>
//                     ),
//                   }}
//                 />
//               )}
//             />
//           </Grid>

//           {/* Farmer */}
//           <Grid item xs={12} md={3}>
//             <Autocomplete
//               options={farmers}
//               loading={loading}
//               value={filters.farmer}
//               getOptionLabel={(option) => option.name || ''}
//               onChange={(e, value) => handleChange('farmer', value)}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Farmer"
//                   InputProps={{
//                     ...params.InputProps,
//                     endAdornment: (
//                       <>
//                         {loading ? <CircularProgress size={18} /> : null}
//                         {params.InputProps.endAdornment}
//                       </>
//                     ),
//                   }}
//                 />
//               )}
//             />
//           </Grid>

//           {/* Buttons */}
//           <Grid item xs={12}>
//             <Stack direction="row" spacing={2} justifyContent="flex-end">

//               <Button variant="outlined" onClick={handleReset}>
//                 Reset
//               </Button>

//               <Button
//                 variant="contained"
//                 onClick={handleSubmit}
//                 disabled={reportLoading}
//               >
//                 Apply Filters
//               </Button>

//             </Stack>
//           </Grid>

//         </Grid>
//       </Card>

//       {/* ================= LOADING ================= */}

//       {reportLoading && (
//         <Stack alignItems="center" spacing={1}>
//           <CircularProgress />
//           <Typography variant="caption">
//             Loading Report...
//           </Typography>
//         </Stack>
//       )}

//       {/* ================= REPORT SUMMARY ================= */}

//       {reportData && !reportLoading && (
//         <Card sx={{ p: 3 }}>

//           <Typography variant="subtitle1" mb={2}>
//             Report Summary
//           </Typography>

//           <Grid container spacing={2}>

//             <Grid item xs={12} md={3}>
//               <Typography variant="body2">
//                 <b>Total Sales</b>
//               </Typography>
//               <Typography>
//                 ₹ {Number(reportData.summary.total_sales).toLocaleString()}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} md={3}>
//               <Typography variant="body2">
//                 <b>Cash Received</b>
//               </Typography>
//               <Typography>
//                 ₹ {Number(reportData.summary.cash_received).toLocaleString()}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} md={3}>
//               <Typography variant="body2">
//                 <b>UPI Received</b>
//               </Typography>
//               <Typography>
//                 ₹ {Number(reportData.summary.upi_received).toLocaleString()}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} md={3}>
//               <Typography variant="body2">
//                 <b>Pending Amount</b>
//               </Typography>
//               <Typography color="error">
//                 ₹ {Number(reportData.summary.pending).toLocaleString()}
//               </Typography>
//             </Grid>

//           </Grid>

//         </Card>
//       )}

//     </Stack>
//   );
// }


import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function ReportPage() {
  return (
    <Stack
      sx={{
        minHeight: '60vh',
      }}
      alignItems="center"
      justifyContent="center"
      spacing={1}
    >
      <Typography variant="h4">📊 Reports</Typography>

      <Typography variant="subtitle1" color="text.secondary">
        Coming Soon
      </Typography>

      <Typography variant="caption" color="text.disabled">
        This section is under development
      </Typography>
    </Stack>
  );
}
