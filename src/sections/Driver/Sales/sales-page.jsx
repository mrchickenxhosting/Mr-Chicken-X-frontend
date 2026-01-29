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

// ----------------------------------------------------------------------

const PAYMENT_MODES = ['CASH', 'UPI', 'BOTH'];

const SELL_TYPES = [
  { value: 'FULL', label: 'Full Cage' },
  { value: 'CUSTOM', label: 'Custom Birds' },
];

// ----------------------------------------------------------------------

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
  const [selectedCage, setSelectedCage] = useState(null);
  const [sellType, setSellType] = useState('FULL');

  // ================= SALE =================
  const [count, setCount] = useState('');
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');

  // ================= CALCULATION =================
  const [calcBy, setCalcBy] = useState('WEIGHT'); // WEIGHT | COUNT

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
          const entry = cage.DEFAULT?.[0] || { chickens: 0, weight: 0 };

          return {
            cage_number: Number(cageNumber),
            remaining_birds: entry.chickens,
            remaining_weight: entry.weight,
          };
        }
      );

      setCages(cageArray);
    };

    fetchCages();
  }, [trip]);

  // ----------------------------------------------------------------------
  // AUTO FILL BASED ON SELL TYPE

  useEffect(() => {
    if (!selectedCage) return;

    if (sellType === 'FULL') {
      setCount(selectedCage.remaining_birds);
      setWeight(selectedCage.remaining_weight);
      setCalcBy('WEIGHT');
    }

    if (sellType === 'CUSTOM') {
      setCount('');
      setWeight('');
      setCalcBy('COUNT');
    }
  }, [sellType, selectedCage]);

  // ----------------------------------------------------------------------
  // TOTAL AMOUNT (EXPLICIT)

  const totalAmount =
    calcBy === 'WEIGHT'
      ? Number(rate || 0) * Number(weight || 0)
      : Number(rate || 0) * Number(count || 0);

  // ----------------------------------------------------------------------
  // SAVE SALE

  const handleSaveSale = async () => {
    try {
      const payload = {
        tripId: trip.id,
        customer_id: customer.id,
        cage_number: selectedCage.cage_number,
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

      await sellToCustomer(payload);

      alert('Sale saved successfully');

      const res = await getTripCages(trip.id);
      const cageArray = Object.entries(res || {}).map(
        ([cageNumber, cage]) => {
          const entry = cage.DEFAULT?.[0] || { chickens: 0, weight: 0 };
          return {
            cage_number: Number(cageNumber),
            remaining_birds: entry.chickens,
            remaining_weight: entry.weight,
          };
        }
      );
      setCages(cageArray);

      setCustomer(null);
      setSelectedCage(null);
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

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Sales Entry</Typography>

      {/* ================= TRIP ================= */}
      <Card sx={{ p: 2 }}>
        <Autocomplete
          options={trips}
          value={trip}
          disabled={tripLocked}
          onChange={(e, v) => {
            setTrip(v);
            setTripLocked(true);
          }}
          getOptionLabel={(o) => `Trip #${o.id}`}
          renderInput={(p) => <TextField {...p} label="Select Trip" />}
        />

        {tripLocked && (
          <Button
            size="small"
            color="error"
            onClick={() => {
              setTrip(null);
              setTripLocked(false);
              setCustomer(null);
              setSelectedCage(null);
            }}
          >
            Change Trip
          </Button>
        )}
      </Card>

      {/* ================= CUSTOMER ================= */}
      {trip && (
        <Card sx={{ p: 2 }}>
          <Autocomplete
            options={customers}
            value={customer}
            onChange={(e, v) => setCustomer(v)}
            getOptionLabel={(o) => `${o.name} • ${o.mobile}`}
            renderInput={(p) => (
              <TextField {...p} label="Search Customer" />
            )}
          />
        </Card>
      )}

      {/* ================= CAGE ================= */}
      {customer && (
        <Card sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{mb :2}}>Select Cage</Typography>

          <Autocomplete
            options={cages}
            value={selectedCage}
            onChange={(e, v) => setSelectedCage(v)}
            getOptionLabel={(o) =>
              `Cage #${o.cage_number} • ${o.remaining_birds} birds`
            }
            renderInput={(p) => (
              <TextField {...p} label="Select Cage" />
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

      {/* ================= SALE ================= */}
      {selectedCage && (
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

            <Grid item xs={12}>
              <Typography variant="subtitle2">Calculate Total By</Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip
                  label="Weight × Rate"
                  color={calcBy === 'WEIGHT' ? 'primary' : 'default'}
                  onClick={() => setCalcBy('WEIGHT')}
                />
                <Chip
                  label="Birds × Rate"
                  color={calcBy === 'COUNT' ? 'primary' : 'default'}
                  onClick={() => setCalcBy('COUNT')}
                />
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
      )}

      {/* ================= PAYMENT ================= */}
      {selectedCage && (
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
      )}

      {/* ================= SAVE ================= */}
      {selectedCage && (
        <Button
          variant="contained"
          size="large"
          onClick={handleSaveSale}
          disabled={!rate || !paymentMode}
        >
          Save Sale
        </Button>
      )}
    </Stack>
  );
}
