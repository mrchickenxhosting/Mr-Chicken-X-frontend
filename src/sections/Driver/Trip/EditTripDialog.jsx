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

import {
  getallDriver,
  getallFarmer,
  getallLifter,
  getallBrokers,
} from 'src/services/Trader.service';

// ----------------------------------------------------------------------

export default function EditTripDialog({ open, onClose, trip, onSave }) {
  const isEditMode = Boolean(trip);

  const [farmers, setFarmers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [lifters, setLifters] = useState([]);
  const [brokers, setBrokers] = useState([]);

  const [sourceDriver, setSourceDriver] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [farm, setFarm] = useState(null);
  const [driver, setDriver] = useState(null);
  const [lifter, setLifter] = useState(null);
  const [broker, setBroker] = useState(null);

  const [date, setDate] = useState(null);
  const [approxRate, setApproxRate] = useState('');
  const [birds, setBirds] = useState('');
  const [time, setTime] = useState('');

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sourceType, setSourceType] = useState('farmer');

  // Show validation only after clicking Create/Update.
  const [submitted, setSubmitted] = useState(false);

  // ----------------------------------------------------------------------
  // Fetch dropdown data

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;

    const fetchData = async () => {
      try {
        const [farmersRes, driversRes, liftersRes, brokersRes] =
          await Promise.all([
            getallFarmer(),
            getallDriver(),
            getallLifter(),
            getallBrokers(),
          ]);

        if (cancelled) return;

        const toArray = (response, key) => {
          if (Array.isArray(response)) return response;
          if (Array.isArray(response?.data)) return response.data;
          if (Array.isArray(response?.[key])) return response[key];

          if (Array.isArray(response?.data?.[key])) {
            return response.data[key];
          }

          return [];
        };

        setFarmers(toArray(farmersRes, 'farmers'));
        setDrivers(toArray(driversRes, 'drivers'));
        setLifters(toArray(liftersRes, 'lifters'));
        setBrokers(toArray(brokersRes, 'brokers'));
      } catch (error) {
        console.error('Failed to load trip dropdown data:', error);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // ----------------------------------------------------------------------
  // Prefill trip details when editing

  useEffect(() => {
    if (!trip) return;

    setSourceType(trip.source_type || 'farmer');
    setApproxRate(trip.approx_rate ?? '');
    setBirds(String(trip.total_birds ?? ''));
    setTime(trip.trip_time?.slice(0, 5) || '');
    setDate(trip.trip_date ? dayjs(trip.trip_date) : null);
    setContactName(trip.contact_name || '');
    setContactPhone(
      String(trip.contact_phone || '').replace(/\D/g, '').slice(0, 10)
    );
  }, [trip]);

  // ----------------------------------------------------------------------
  // Prefill dropdown values after options load

  useEffect(() => {
    if (!trip) return;

    if (farmers.length) {
      const selectedFarmer = farmers.find(
        (item) => Number(item.id) === Number(trip.farmer_id)
      );

      setFarmer(selectedFarmer || null);

      const selectedFarm = selectedFarmer?.farms?.find(
        (item) => Number(item.id) === Number(trip.farm_id)
      );

      setFarm(selectedFarm || null);
    } else {
      setFarmer(null);
      setFarm(null);
    }

    if (drivers.length) {
      setDriver(
        drivers.find(
          (item) => Number(item.id) === Number(trip.driver_id)
        ) || null
      );

      setSourceDriver(
        drivers.find(
          (item) => Number(item.id) === Number(trip.source_driver_id)
        ) || null
      );
    }

    if (lifters.length) {
      setLifter(
        lifters.find(
          (item) => Number(item.id) === Number(trip.lifter_id)
        ) || null
      );
    }

    if (brokers.length) {
      setBroker(
        brokers.find(
          (item) => Number(item.id) === Number(trip.broker_id)
        ) || null
      );
    }
  }, [trip, farmers, drivers, lifters, brokers]);

  // ----------------------------------------------------------------------
  // Reset form

  const resetForm = () => {
    setSubmitted(false);
    setSourceType('farmer');
    setSourceDriver(null);
    setFarmer(null);
    setFarm(null);
    setDriver(null);
    setLifter(null);
    setBroker(null);
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

  // ----------------------------------------------------------------------
  // Validation

  const phoneIsValid =
    contactPhone === '' || /^[6-9]\d{9}$/.test(contactPhone);

  const birdsValue = Number(birds);

  const birdsAreValid =
    String(birds).trim() !== '' &&
    Number.isInteger(birdsValue) &&
    birdsValue > 0;

  const rateIsValid =
    approxRate !== '' &&
    Number.isFinite(Number(approxRate)) &&
    Number(approxRate) >= 0;

  const dateIsValid = Boolean(date && dayjs(date).isValid());

  const timeIsValid =
    Boolean(time) && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

  const farmerFarms = farmer?.farms || [];

  const isFormValid =
    Boolean(driver) &&
    birdsAreValid &&
    rateIsValid &&
    dateIsValid &&
    timeIsValid &&
    phoneIsValid &&
    (sourceType !== 'farmer' || Boolean(farmer && farm)) &&
    (sourceType !== 'driver' || Boolean(sourceDriver));

  // ----------------------------------------------------------------------
  // Save trip

  const handleSave = () => {
    setSubmitted(true);

    // Keep the button enabled, but do not save invalid data.
    if (!isFormValid) return;

    const payload = {
      ...(isEditMode && { id: trip.id }),
      source_type: sourceType,
      source_driver_id:
        sourceType === 'driver' ? sourceDriver?.id || null : null,
      farm_id: sourceType === 'farmer' ? farm?.id || null : null,
      driver_id: driver?.id || null,
      lifter_id: lifter?.id || null,
      broker_id: broker?.id || null,
      total_birds: birdsValue,
      approx_rate: Number(approxRate),
      trip_time: time,
      trip_date: dayjs(date).format('YYYY-MM-DD'),
      contact_name: contactName.trim(),
      contact_phone: contactPhone,
    };

    onSave(payload);
  };

  // ----------------------------------------------------------------------
  // Google Maps

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  // ----------------------------------------------------------------------

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isEditMode ? 'Update Trip' : 'Create Trip'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={4} mt={1}>
          {/* SOURCE TYPE */}
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
                ].find((item) => item.value === sourceType) || null
              }
              onChange={(event, value) => {
                const nextSourceType = value?.value || 'farmer';

                setSourceType(nextSourceType);

                if (nextSourceType === 'farmer') {
                  setSourceDriver(null);
                } else {
                  setFarmer(null);
                  setFarm(null);
                }
              }}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              renderInput={(params) => (
                <TextField {...params} label="Select Source Type" />
              )}
            />
          </Stack>

          {/* FARMER INFORMATION */}
          {sourceType === 'farmer' && (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Farmer Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={farmers}
                    value={farmer}
                    onChange={(event, value) => {
                      setFarmer(value);
                      setFarm(
                        value?.farms?.length === 1 ? value.farms[0] : null
                      );
                    }}
                    getOptionLabel={(option) => option?.name || ''}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Farmer"
                        fullWidth
                        error={submitted && !farmer}
                        helperText={
                          submitted && !farmer
                            ? 'Please select a farmer'
                            : ''
                        }
                      />
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
                      onChange={(event, value) => setFarm(value)}
                      getOptionLabel={(option) => option?.location || ''}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Farm"
                          fullWidth
                          error={submitted && !farm}
                          helperText={
                            submitted && !farm ? 'Please select a farm' : ''
                          }
                        />
                      )}
                    />
                  </Grid>
                )}

                {submitted && farmer && !farm && farmerFarms.length === 0 && (
                  <Grid item xs={12}>
                    <Typography color="error" variant="caption">
                      This farmer has no farms available. Please select a
                      farmer with an assigned farm.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Stack>
          )}

          {/* DRIVER SOURCE */}
          {sourceType === 'driver' && (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Driver Source Information
              </Typography>

              <Autocomplete
                options={drivers}
                value={sourceDriver}
                onChange={(event, value) => setSourceDriver(value)}
                getOptionLabel={(option) => option?.name || ''}
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Source Driver"
                    error={submitted && !sourceDriver}
                    helperText={
                      submitted && !sourceDriver
                        ? 'Please select a source driver'
                        : ''
                    }
                  />
                )}
              />
            </Stack>
          )}

          {/* FARM MAP */}
          {isLoaded &&
            farm?.latitude != null &&
            farm?.longitude != null && (
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

          {/* CONTACT DETAILS */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Contact Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Person Name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Person Phone"
                  value={contactPhone}
                  onChange={(event) =>
                    setContactPhone(
                      event.target.value.replace(/\D/g, '').slice(0, 10)
                    )
                  }
                  inputProps={{
                    maxLength: 10,
                    inputMode: 'numeric',
                  }}
                  error={submitted && !phoneIsValid}
                  helperText={
                    submitted && !phoneIsValid
                      ? 'Enter a valid 10-digit Indian mobile number'
                      : 'Optional (10-digit mobile number)'
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>

          {/* ASSIGN TEAM */}
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Assign Team
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={drivers}
                  value={driver}
                  onChange={(event, value) => setDriver(value)}
                  getOptionLabel={(option) => option?.name || ''}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Delivery Partner"
                      fullWidth
                      error={submitted && !driver}
                      helperText={
                        submitted && !driver
                          ? 'Please select a delivery partner'
                          : ''
                      }
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Delivery Partner Mobile"
                  value={driver?.mobile || ''}
                  disabled
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={lifters}
                  value={lifter}
                  onChange={(event, value) => setLifter(value)}
                  getOptionLabel={(option) => option?.name || ''}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Lifter"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Lifter Mobile"
                  value={lifter?.mobile || ''}
                  disabled
                  fullWidth
                />
              </Grid>

              {/* BROKER DROPDOWN */}
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={brokers}
                  value={broker}
                  onChange={(event, value) => setBroker(value)}
                  getOptionLabel={(option) =>
                    option?.name || option?.broker_name || ''
                  }
                  isOptionEqualToValue={(option, value) =>
                    Number(option.id) === Number(value.id)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Broker (Optional)"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Broker Mobile"
                  value={broker?.mobile || broker?.number || ''}
                  disabled
                  fullWidth
                />
              </Grid>

              {/* NUMBER OF BIRDS */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Number of Birds"
                  type="number"
                  value={birds}
                  onChange={(event) => setBirds(event.target.value)}
                  inputProps={{ min: 1, step: 1 }}
                  error={submitted && !birdsAreValid}
                  helperText={
                    submitted && !birdsAreValid
                      ? 'Enter a positive whole number'
                      : ''
                  }
                  fullWidth
                />
              </Grid>

              {/* APPROXIMATE RATE */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Approx. Rate (₹)"
                  type="number"
                  value={approxRate}
                  onChange={(event) => setApproxRate(event.target.value)}
                  inputProps={{ min: 0, step: '0.01' }}
                  error={submitted && !rateIsValid}
                  helperText={
                    submitted && !rateIsValid
                      ? 'Enter a valid rate greater than or equal to 0'
                      : ''
                  }
                  fullWidth
                />
              </Grid>

              {/* TRIP DATE */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Trip Date"
                  value={date}
                  onChange={(newDate) => setDate(newDate)}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: submitted && !dateIsValid,
                      helperText:
                        submitted && !dateIsValid
                          ? 'Select a valid trip date'
                          : '',
                    },
                  }}
                />
              </Grid>

              {/* TRIP TIME */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Trip Time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  inputProps={{ step: 60 }}
                  error={submitted && !timeIsValid}
                  helperText={
                    submitted && !timeIsValid
                      ? 'Enter a valid trip time'
                      : ''
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
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

        {/* Intentionally no disabled prop */}
        <Button onClick={handleSave} variant="contained">
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