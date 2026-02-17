import { QRCodeCanvas } from 'qrcode.react';
import { useState, useEffect } from 'react';

import {
  Chip,
  Card,
  Grid,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import { getallCustomer } from 'src/services/Trader.service';
import {
  getTripCages,
  sellToCustomer,
  getassignedTrips,
} from 'src/services/Driver.service';

const PAYMENT_MODES = ['CASH', 'UPI', 'BOTH'];

const SELL_TYPES = [
  { value: 'FULL', label: 'Full Cage(s)' },
  { value: 'CUSTOM', label: 'Custom Birds' },
];

export default function DriverSalesPage() {

  // ================= TRIP =================
  const [trips, setTrips] = useState([]);
  const [trip, setTrip] = useState(null);
  const [tripLocked, setTripLocked] = useState(false);

  // ================= CUSTOMER =================
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);

  // ================= CAGES =================
  const [cages, setCages] = useState([]);
  const [selectedCages, setSelectedCages] = useState([]);
  const [sellType, setSellType] = useState('FULL');

  // ================= SALE =================
  const [count, setCount] = useState('');
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');
  const [calcBy, setCalcBy] = useState('WEIGHT');

  // ================= PAYMENT =================
  const [paymentMode, setPaymentMode] = useState('');
  const [payment, setPayment] = useState({ cash: '', upi: '' });

  // ----------------------------------------------------------------------
  // LOAD BASE DATA

  useEffect(() => {
    getassignedTrips().then((res) => setTrips(res || []));
    getallCustomer().then((res) => setCustomers(res || []));
  }, []);

  // ----------------------------------------------------------------------
  // LOAD CAGES AFTER TRIP SELECT

  useEffect(() => {
    if (!trip) return;

    const fetchCages = async () => {
      const res = await getTripCages(trip.id);

      const cageArray = Object.entries(res || {}).map(
        ([cageNumber, cage]) => {

          let totalRemainingBirds = 0;
          let totalRemainingWeight = 0;

          let totalOriginalBirds = 0;
          let totalOriginalWeight = 0;

          Object.keys(cage || {}).forEach((color) => {
            cage[color]?.forEach((entry) => {
              totalRemainingBirds += Number(entry.chickens || 0);
              totalRemainingWeight += Number(entry.weight || 0);

              totalOriginalBirds += Number(entry.original_chickens || 0);
              totalOriginalWeight += Number(entry.original_weight || 0);
            });
          });

          return {
            cage_number: Number(cageNumber),
            remaining_birds: totalRemainingBirds,
            remaining_weight: totalRemainingWeight,
            original_birds: totalOriginalBirds,
            original_weight: totalOriginalWeight,
            isSoldOut: totalRemainingBirds <= 0
          };
        }
      );
      setCages(cageArray);

    };

    fetchCages();
  }, [trip]);

  // ----------------------------------------------------------------------
  // AUTO CALCULATE WHEN MULTI CAGE SELECTED

  useEffect(() => {
    if (!selectedCages.length) return;

    if (sellType === 'FULL') {
      const totalBirds = selectedCages.reduce(
        (sum, c) => sum + Number(c.remaining_birds || 0),
        0
      );

      const totalWeight = selectedCages.reduce(
        (sum, c) => sum + Number(c.remaining_weight || 0),
        0
      );

      setCount(totalBirds);
      setWeight(Number(totalWeight.toFixed(2)));
      setCalcBy('WEIGHT');
    }

    if (sellType === 'CUSTOM') {
      setCount('');
      setWeight('');
      // setCalcBy('COUNT');
    }

  }, [sellType, selectedCages]);

  // ----------------------------------------------------------------------

  const totalAmount =
    calcBy === 'WEIGHT'
      ? Number((Number(rate || 0) * Number(weight || 0)).toFixed(2))
      : Number((Number(rate || 0) * Number(count || 0)).toFixed(2));


  // ----------------------------------------------------------------------
  // SAVE SALE

  const handleSaveSale = async () => {
    try {

      const payload = {
        tripId: trip.id,
        customer_id: customer.id,
        cage_numbers: selectedCages.map(c => c.cage_number), // ✅ ARRAY
        sell_type: sellType,
        bird_count: Number(count),
        weight: Number(weight),
        rate: Number(rate),
        total_amount: totalAmount,
        payment_mode: paymentMode,
        cash_amount:
          paymentMode === 'CASH' || paymentMode === 'BOTH'
            ? Number(payment.cash || 0)
            : 0,
        upi_amount:
          paymentMode === 'UPI' || paymentMode === 'BOTH'
            ? Number(payment.upi || 0)
            : 0,
      };
      console.log(payload)
      await sellToCustomer(payload);

      alert('Sale saved successfully');

      // refresh cages
      const res = await getTripCages(trip.id);

      const cageArray = Object.entries(res || {}).map(
        ([cageNumber, cage]) => {

          let totalBirds = 0;
          let totalWeight = 0;

          Object.keys(cage || {}).forEach((color) => {
            cage[color]?.forEach((entry) => {
              totalBirds += Number(entry.chickens || 0);
              totalWeight += Number(entry.weight || 0);
            });
          });

          return {
            cage_number: Number(cageNumber),
            remaining_birds: totalBirds,
            remaining_weight: totalWeight,
          };
        }
      );

      setCages(cageArray);

      // reset
      setCustomer(null);
      setSelectedCages([]);
      setSellType('FULL');
      setCount('');
      setWeight('');
      setRate('');
      setCalcBy('WEIGHT');
      setPaymentMode('');
      setPayment({ cash: '', upi: '' });

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to save sale');
    }
  };

  // ----------------------------------------------------------------------
  // UPI QR

  const generateUpiQrValue = () => {
    if (!trip || !payment.upi || !trip.trader_upi_id) return '';

    const amount = Number(payment.upi).toFixed(2);

    return `upi://pay?pa=${trip.trader_upi_id}&pn=${encodeURIComponent(
      trip.company_name || 'Trader'
    )}&am=${amount}&cu=INR`;
  };

  // ----------------------------------------------------------------------

  const allCagesSold =
    cages.length > 0 &&
    cages.every((c) => Number(c.remaining_birds) <= 0);


  return (
    <Stack spacing={3}>
      <Typography variant="h5">Sales Entry</Typography>
      <Card sx={{ p: 2 }}>
        <Autocomplete
          options={trips}
          value={trip}
          disabled={tripLocked}
          onChange={(e, v) => {
            setTrip(v);
            setTripLocked(true);
          }}
          getOptionLabel={(o) => o
            ? `Trip #${new Date(o.trip_date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}  • ${o.total_birds} birds • ${o.farmer_name}`
            : ''}
          renderInput={(p) => <TextField {...p} label="Select Trip" />}
        />

        {tripLocked && (
          <Typography
            variant="body2"
            color="error"
            sx={{
              mt: 1,
              cursor: 'pointer',
              width: 'fit-content',
            }}
            onClick={() => {
              setTrip(null);
              setTripLocked(false);
              setCustomer(null);
              setSelectedCages([]);
            }}
          >
            Change Trip
          </Typography>
        )}
      </Card>

      {/* CUSTOMER */}

      {allCagesSold && (
        <Typography
          variant="subtitle1"
          sx={{
            color: 'error.main',
            fontWeight: 600,
            textAlign: 'center',
            py: 2,
          }}
        >
          All cages are sold. Please meet Manager now.
        </Typography>
      )}
      {trip && !allCagesSold && (
        <Card sx={{ p: 2 }}>
          <Autocomplete
            options={customers}
            value={customer}
            onChange={(e, v) => setCustomer(v)}
            getOptionLabel={(o) =>
              o ? `${o.name} • ₹ ${Math.round(Number(o.outstanding || 0)).toLocaleString()}` : ''
            }
            renderOption={(props, option) => (
              <li {...props}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>

                  {/* Left Side */}
                  <div>
                    <div style={{ fontWeight: 600 }}>{option.name}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      {option.mobile} • {option.city}
                    </div>
                  </div>

                  {/* Outstanding Red Box */}
                  {Number(option.outstanding) > 0 && (
                    <div
                      style={{
                        backgroundColor: '#ffe5e5',
                        color: '#d32f2f',
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      ₹ {Math.round(Number(option.outstanding)).toLocaleString()}
                    </div>
                  )}
                </div>
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Search Customer" />
            )}
          />
        </Card>
      )}

      {/* MULTI CAGE */}
      {customer && (
        <Card sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Select Cage(s)
          </Typography>

          <Autocomplete
            multiple
            options={cages}
            value={selectedCages}
            onChange={(e, v) => setSelectedCages(v)}
            getOptionLabel={(o) =>
              `Cage #${o.cage_number} • ${o.remaining_birds} birds • ${o.remaining_weight} kg`
            }
            getOptionDisabled={(option) =>
              option.remaining_birds <= 0
            }
            renderOption={(props, option) => (
              <li
                {...props}
                style={{
                  opacity: option.remaining_birds <= 0 ? 0.4 : 1,
                  pointerEvents: option.remaining_birds <= 0 ? 'none' : 'auto'
                }}
              >
                Cage #{option.cage_number} • {option.remaining_birds} birds • {option.remaining_weight} kg
                {option.remaining_birds <= 0 && " (Sold)"}
              </li>
            )}
            renderInput={(p) => (
              <TextField {...p} label="Select Cage(s)" />
            )}
          />


          <Stack direction="row" spacing={1} mt={2}>
            {SELL_TYPES.map((s) => (
              <Chip
                key={s.value}
                label={s.label}
                color={sellType === s.value ? 'primary' : 'default'}
                onClick={() => setSellType(s.value)}
              />
            ))}
          </Stack>
        </Card>
      )}

      {/* SALE */}
      {selectedCages.length > 0 && (
        <>
          <Card sx={{ p: 2 }}>
            <Grid container spacing={2}>

              <Grid item xs={6}>
                <TextField
                  label="Birds"
                  value={count}
                  disabled={sellType !== 'CUSTOM'}
                  onChange={(e) => setCount(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Weight (kg)"
                  value={weight}
                  disabled={sellType !== 'CUSTOM'}
                  onChange={(e) => setWeight(e.target.value)}
                  fullWidth
                />
              </Grid>

              {/* 🔥 CALCULATION TOGGLE BACK */}
              <Grid item xs={12}>
                <Typography variant="subtitle2">
                  Calculate Total By
                </Typography>

                <Stack direction="row" spacing={1} mt={1}>
                  <Chip
                    label="Weight × Rate"
                    color={calcBy === 'WEIGHT' ? 'primary' : 'default'}
                    onClick={() => setCalcBy('WEIGHT')}
                  />

                  {/* <Chip
                    label="Birds × Rate"
                    color={calcBy === 'COUNT' ? 'primary' : 'default'}
                    onClick={() => setCalcBy('COUNT')}
                  /> */}
                </Stack>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Rate"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Total Amount"
                  value={totalAmount.toFixed(2)}
                  disabled
                  fullWidth
                />
              </Grid>

            </Grid>
          </Card>

          <Card sx={{ p: 2 }}>
            <TextField
              select
              label="Payment Mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              fullWidth
            >
              {PAYMENT_MODES.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>

            {(paymentMode === 'CASH' || paymentMode === 'BOTH') && (
              <TextField
                sx={{ mt: 2 }}
                label="Cash Amount"
                value={payment.cash}
                onChange={(e) =>
                  setPayment((p) => ({ ...p, cash: e.target.value }))
                }
                fullWidth
              />
            )}

            {(paymentMode === 'UPI' || paymentMode === 'BOTH') && (
              <>
                <TextField
                  sx={{ mt: 2 }}
                  label="UPI Amount"
                  value={payment.upi}
                  onChange={(e) =>
                    setPayment((p) => ({ ...p, upi: e.target.value }))
                  }
                  fullWidth
                />

                {payment.upi && trip?.trader_upi_id && (
                  <Stack alignItems="center" mt={3} spacing={1}>
                    <Typography variant="subtitle2">
                      Scan To Pay ₹{payment.upi}
                    </Typography>

                    <QRCodeCanvas
                      value={generateUpiQrValue()}
                      size={220}
                      level="H"
                      includeMargin
                    />

                    <Typography variant="caption" color="text.secondary">
                      UPI ID: {trip.trader_upi_id}
                    </Typography>
                  </Stack>
                )}
              </>
            )}
          </Card>

          <Button
            variant="contained"
            size="large"
            onClick={handleSaveSale}
            disabled={!rate || !paymentMode}
          >
            Save Sale
          </Button>
        </>
      )}
    </Stack>
  );
}
