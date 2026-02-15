import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Marker, GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import {
  Stack,
  Dialog,
  Button,
  Divider,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import Iconify from 'src/components/iconify';

const DEFAULT_CENTER = { lat: 23.0225, lng: 72.5714 };

export default function EditFarmerDialog({ open, onClose, farmer, onSave }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [farms, setFarms] = useState([]);
  const [mapIndex, setMapIndex] = useState(null);

  const isEditMode = Boolean(farmer);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  useEffect(() => {
    if (open) {
      if (farmer) {
        setName(farmer.name || '');
        setMobile(farmer.mobile || '');
        setFarms(farmer.farms || []);
      } else {
        setName('');
        setMobile('');
        setFarms([
          { name: '', location: '', latitude: null, longitude: null },
        ]);
      }
    }
  }, [farmer, open]);

  const handleFarmChange = (index, field, value) => {
    const updated = [...farms];
    updated[index][field] = value;
    setFarms(updated);
  };

  const addFarm = () => {
    setFarms([
      ...farms,
      { name: '', location: '', latitude: null, longitude: null },
    ]);
  };

  const removeFarm = (index) => {
    const updated = farms.filter((_, i) => i !== index);
    setFarms(updated);
  };

const handleSave = () => {
  // 1️⃣ Clean farms
  const cleanedFarms = farms
    .filter((farm) => farm.location?.trim()) // remove empty farms
    .map((farm) => ({
      ...(farm.id && { id: farm.id }), // keep id in edit mode
      location: farm.location.trim(),
      latitude: farm.latitude || null,
      longitude: farm.longitude || null,
    }));

  if (!name.trim()) {
    alert('Farmer name is required');
    return;
  }

  if (cleanedFarms.length === 0) {
    alert('At least one farm is required');
    return;
  }

  const payload = {
    ...(isEditMode && { id: farmer.id }),
    name: name.trim(),
    mobile: mobile.trim(),
    farms: cleanedFarms,
  };
console.log(payload)
  onSave(payload);
};


  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          {isEditMode ? 'Update Farmer' : 'Add Farmer'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Farmer Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              fullWidth
            />

            <Divider />
            <Typography variant="h6">Farms</Typography>

            {farms.map((farm, index) => (
              <Stack
                key={index}
                spacing={2}
                sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}
              >
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Farm {index + 1}</Typography>
                  {farms.length > 1 && (
                    <IconButton onClick={() => removeFarm(index)}>
  <Iconify icon="mdi:delete-outline" width={22} />
</IconButton>
                  )}
                </Stack>

                <TextField
                  label="Address"
                  value={farm.location}
                  onChange={(e) =>
                    handleFarmChange(index, 'location', e.target.value)
                  }
                  fullWidth
                />

                <Button
                  variant="outlined"
                  onClick={() => setMapIndex(index)}
                >
                  📍 Pick Location on Map
                </Button>

                {farm.latitude && farm.longitude && (
                  <TextField
                    label="Pinned Coordinates"
                    value={`${farm.latitude.toFixed(6)}, ${farm.longitude.toFixed(6)}`}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                )}
              </Stack>
            ))}

            <Button variant="contained" onClick={addFarm}>
              + Add Another Farm
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {isEditMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MAP DIALOG */}
      <Dialog
        open={mapIndex !== null}
        onClose={() => setMapIndex(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Select Location</DialogTitle>

        <DialogContent sx={{ height: 450 }}>
          {isLoaded && mapIndex !== null && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={
                farms[mapIndex].latitude
                  ? {
                      lat: farms[mapIndex].latitude,
                      lng: farms[mapIndex].longitude,
                    }
                  : DEFAULT_CENTER
              }
              zoom={14}
              onClick={(e) =>
                handleFarmChange(mapIndex, 'latitude', e.latLng.lat()) ||
                handleFarmChange(mapIndex, 'longitude', e.latLng.lng())
              }
            >
              {farms[mapIndex].latitude && (
                <Marker
                  position={{
                    lat: farms[mapIndex].latitude,
                    lng: farms[mapIndex].longitude,
                  }}
                />
              )}
            </GoogleMap>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setMapIndex(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => setMapIndex(null)}>
            Save Location
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

EditFarmerDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  farmer: PropTypes.object,
};
