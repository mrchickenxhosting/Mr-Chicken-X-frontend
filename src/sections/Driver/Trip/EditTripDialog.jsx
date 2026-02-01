import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Marker,GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { getallDriver, getallFarmer } from 'src/services/Trader.service';

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

  const [farmer, setFarmer] = useState(null);
  const [driver, setDriver] = useState(null);
  const [date, setDate] = useState(null);
  const [birds, setBirds] = useState('');
  const [time, setTime] = useState('');


  // NEW FIELDS
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // ----------------------------------------------------------------------
  // FETCH FARMERS & DRIVERS WHEN DIALOG OPENS
  

  useEffect(() => {
    if (!open) return;

    const fetchDropdownData = async () => {
      try {
        const [farmersRes, driversRes] = await Promise.all([
          getallFarmer(),
          getallDriver(),
        ]);

        setFarmers(farmersRes || []);
        setDrivers(driversRes || []);
      } catch (error) {
        console.error('Failed to load farmers/drivers', error);
      }
    };

    fetchDropdownData();
  }, [open]);

  // ----------------------------------------------------------------------
  // PREFILL DATA IN EDIT MODE

  useEffect(() => {
    if (!trip || !farmers.length || !drivers.length) return;

    const selectedFarmer = farmers.find(
      (f) => f.id === trip.farmer_id
    );

    const selectedDriver = drivers.find(
      (d) => d.id === trip.driver_id
    );

    setFarmer(selectedFarmer || null);
    setDriver(selectedDriver || null);
    setBirds(trip.total_birds || '');
    setTime(trip.trip_time?.slice(0, 5) || '');
    setDate(trip.trip_date ? dayjs(trip.trip_date) : null);



    // NEW PREFILL
    setContactName(trip.contact_name || '');
    setContactPhone(trip.contact_phone || '');

  }, [trip, farmers, drivers]);

  // ----------------------------------------------------------------------

  const resetForm = () => {
  setFarmer(null);
  setDriver(null);
  setDate(null);
  setBirds('');
  setTime('');
  setContactName('');
  setContactPhone('');
};

const handleClose = () => {
  resetForm();
  onClose();
};


  const handleSave = () => {
    const payload = {
      ...(isEditMode && { id: trip.id }),
      farmer_id: farmer.id,
      driver_id: driver.id,
      total_birds: Number(birds),
      trip_time: time,
      trip_date: date ? dayjs(date).format('DD-MMM-YYYY') : null,

      // NEW FIELDS
      contact_name: contactName,
      contact_phone: contactPhone,
    };

    console.log('Trip Payload:', payload);

    onSave(payload);
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  useEffect(() => {
  if (open && !trip) {
    resetForm();
  }
}, [open, trip]);


  // ----------------------------------------------------------------------

  const isSaveDisabled =
    !farmer ||
    !driver ||
    !birds ||
    !time ||
    (contactPhone && contactPhone.length !== 10);

  // ----------------------------------------------------------------------

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? 'Update Trip' : 'Create Trip'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>

          {/* ================= FARMER ================= */}

          <Autocomplete
            options={farmers}
            value={farmer}
            onChange={(e, value) => setFarmer(value)}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} label="Select Farmer" />
            )}
          />

          <TextField
            label="Farmer Mobile"
            value={farmer?.mobile || ''}
            disabled
            fullWidth
          />

          <TextField
            label="Location"
            value={farmer?.location || ''}
            disabled
            fullWidth
          />

          {isLoaded && farmer?.latitude && farmer?.longitude && (
            <Stack
              sx={{
                height: 220,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{
                  lat: Number(farmer.latitude),
                  lng: Number(farmer.longitude),
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
                    lat: Number(farmer.latitude),
                    lng: Number(farmer.longitude),
                  }}
                />
              </GoogleMap>
            </Stack>
          )}


          {/* ================= CONTACT PERSON ================= */}

          <TextField
            label="Contact Person Name"
            fullWidth
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />

          <TextField
            label="Contact Person Phone"
            fullWidth
            value={contactPhone}
            onChange={(e) =>
              setContactPhone(e.target.value.replace(/\D/g, ''))
            }
            inputProps={{ maxLength: 10 }}
            helperText="Optional (10 digit mobile number)"
          />

          {/* ================= DRIVER ================= */}

          <Autocomplete
            options={drivers}
            value={driver}
            onChange={(e, value) => setDriver(value)}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} label="Select Driver" />
            )}
          />

          <TextField
            label="Driver Mobile"
            value={driver?.mobile || ''}
            disabled
            fullWidth
          />

          {/* ================= TRIP DETAILS ================= */}

          <TextField
            label="Number of Birds"
            type="number"
            fullWidth
            value={birds}
            onChange={(e) => setBirds(e.target.value)}
          />

          <DatePicker
            label="Trip Date"
            value={date}
            onChange={(newValue) => setDate(newValue)}
            minDate={dayjs()}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />


          <TextField
            label="Trip Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

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

// ----------------------------------------------------------------------

EditTripDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  trip: PropTypes.object,
};
