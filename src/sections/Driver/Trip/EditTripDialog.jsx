import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Marker, GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Grid, Typography } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { getallDriver, getallFarmer, getallLifter } from 'src/services/Trader.service';

// ----------------------------------------------------------------------

export default function EditTripDialog({
  open,
  onClose,
  trip,
  onSave,
}) {
  const isEditMode = Boolean(trip);

  const [farmers, setFarmers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [lifters, setLifters] = useState([])
  const [sourceDriver, setSourceDriver] = useState(null);

  const [farmer, setFarmer] = useState(null);
  const [farm, setFarm] = useState(null);
  const [driver, setDriver] = useState(null);
  const [lifter, setLifter] = useState(null);

  const [date, setDate] = useState(null);
  const [approxRate, setApproxRate] = useState('');
  const [birds, setBirds] = useState('');
  const [time, setTime] = useState('');

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sourceType, setSourceType] = useState('farmer');

  // ----------------------------------------------------------------------
  // Fetch dropdown data

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const [farmersRes, driversRes, lifterRes] = await Promise.all([
          getallFarmer(),
          getallDriver(),
          getallLifter(),
        ]);

        setLifters(lifterRes || []);
        setFarmers(farmersRes || []);
        setDrivers(driversRes || []);
      } catch (error) {
        console.error('Failed to load farmers/drivers', error);
      }
    };

    fetchData();
  }, [open]);

  // ----------------------------------------------------------------------
  // Prefill in edit mode

  useEffect(() => {
    if (!trip || !farmers.length || !drivers.length) return;

    const selectedFarmer = farmers.find(
      (f) => f.id === trip.farmer_id
    );

    const selectedFarm = selectedFarmer?.farms?.find(
      (fa) => fa.id === trip.farm_id
    );

    const selectedDriver = drivers.find(
      (d) => d.id === trip.driver_id
    );

    const selectedLifter = lifters.find(
      (d) => d.id === trip.lifter_id
    );

    setFarmer(selectedFarmer || null);
    setFarm(selectedFarm || null);
    setDriver(selectedDriver || null);
    setLifter(selectedLifter || null);

    setApproxRate(trip.approx_rate || '');
    setBirds(trip.total_birds || '');
    setTime(trip.trip_time?.slice(0, 5) || '');
    setDate(trip.trip_date ? dayjs(trip.trip_date) : null);

    setContactName(trip.contact_name || '');
    setContactPhone(trip.contact_phone || '');
  }, [trip, farmers, drivers, lifters]);

  // ----------------------------------------------------------------------

  const resetForm = () => {
    setSourceType('farmer');
    setFarmer(null);
    setFarm(null);
    setDriver(null);
    setLifter(null);
    setDate(null);
    setBirds('');
    setTime('');
    setContactName('');
    setContactPhone('');
    setApproxRate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    const payload = {
      ...(isEditMode && { id: trip.id }),
      source_type: sourceType,
      source_driver_id: sourceDriver?.id || null,
      farm_id: farm?.id,
      driver_id: driver?.id,
      lifter_id: lifter?.id || null,
      total_birds: Number(birds),
      approx_rate: Number(approxRate),
      trip_time: time,
      trip_date: date ? dayjs(date).format('YYYY-MM-DD') : null,
      contact_name: contactName,
      contact_phone: contactPhone,
    };

    console.log('Trip Payload:', payload);
    onSave(payload);
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  const isSaveDisabled =
    sourceType === 'farmer'
      ? (
        !farmer ||
        !farm ||
        !driver ||
        !birds ||
        !time ||
        (contactPhone && contactPhone.length !== 10)
      )
      : (
        !driver ||
        !birds ||
        !time ||
        (contactPhone && contactPhone.length !== 10)
      );

  const farmerFarms = farmer?.farms || [];

  // ----------------------------------------------------------------------

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isEditMode ? 'Update Trip' : 'Create Trip'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={4} mt={1}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Source Type
            </Typography>

            <Autocomplete
              options={[
                { value: 'farmer', label: 'Get From Farmer' },
                { value: 'driver', label: 'Get From Driver' },
              ]}
              value={
                [
                  { value: 'farmer', label: 'Get From Farmer' },
                  { value: 'driver', label: 'Get From Driver' },
                ].find((x) => x.value === sourceType) || null
              }
              onChange={(e, value) =>
                setSourceType(value?.value || 'farmer')
              }
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <TextField {...params} label="Select Source Type" />
              )}
            />
          </Stack>

          {/* ================= FARMER SECTION ================= */}
          {sourceType === 'farmer' && (<Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Farmer Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={farmers}
                  value={farmer}
                  onChange={(e, value) => {
                    setFarmer(value);
                    if (value?.farms?.length === 1) {
                      setFarm(value.farms[0]);
                    } else {
                      setFarm(null);
                    }
                  }}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select Farmer" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Farmer Mobile"
                  value={farmer?.mobile || ''}
                  disabled
                  fullWidth
                />
              </Grid>

              {farmer && (
                <Grid item xs={12}>
                  <Autocomplete
                    options={farmerFarms}
                    value={farm}
                    onChange={(e, value) => setFarm(value)}
                    getOptionLabel={(option) => option.location || ''}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Select Farm" fullWidth />
                    )}
                  />
                </Grid>
              )}
            </Grid>
          </Stack>)}

          {/* ================= DRIVER SECTION ================= */}
          {sourceType === 'driver' && (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Driver Information
              </Typography>

              <Autocomplete
                options={drivers}
                value={sourceDriver}
                onChange={(e, value) => setSourceDriver(value)}
                getOptionLabel={(option) => option.name || ''}
                renderInput={(params) => (
                  <TextField {...params} label="Select Driver" />
                )}
              />
            </Stack>
          )}
          {/* ================= MAP SECTION ================= */}
          {isLoaded && farm?.latitude && farm?.longitude && (
            <Stack
              sx={{
                height: 220,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{
                  lat: Number(farm.latitude),
                  lng: Number(farm.longitude),
                }}
                zoom={14}
                options={{
                  disableDefaultUI: true,
                  draggable: false,
                  zoomControl: false,
                  scrollwheel: false,
                  disableDoubleClickZoom: true,
                  gestureHandling: 'none',
                }}
              >
                <Marker
                  position={{
                    lat: Number(farm.latitude),
                    lng: Number(farm.longitude),
                  }}
                />
              </GoogleMap>
            </Stack>
          )}

          {/* ================= CONTACT SECTION ================= */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Contact Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Person Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Person Phone"
                  value={contactPhone}
                  onChange={(e) =>
                    setContactPhone(e.target.value.replace(/\D/g, ''))
                  }
                  inputProps={{ maxLength: 10 }}
                  helperText="Optional (10 digit mobile number)"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>

          {/* ================= TEAM SECTION ================= */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Assign Team
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={drivers}
                  value={driver}
                  onChange={(e, value) => setDriver(value)}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select Delivery Partner" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Delivery Partner Mobile"
                  value={driver?.mobile || ''}
                  disabled
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={lifters}
                  value={lifter}
                  onChange={(e, value) => setLifter(value)}
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select Lifter" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Lifter Mobile"
                  value={lifter?.mobile || ''}
                  disabled
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>

          {/* ================= TRIP DETAILS ================= */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Trip Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Number of Birds"
                  type="number"
                  value={birds}
                  onChange={(e) => setBirds(e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Approx. Selling Rate (₹)"
                  type="number"
                  value={approxRate}
                  onChange={(e) => setApproxRate(e.target.value)}
                  fullWidth
                  inputProps={{ min: 0, step: "0.01" }}
                />
              </Grid>


              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Trip Date"
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  // minDate={dayjs()}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Trip Time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>

        </Stack>
      </DialogContent>


      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSaveDisabled}
        >
          {isEditMode ? 'Update Trip' : 'Create Trip'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditTripDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  trip: PropTypes.object,
};
