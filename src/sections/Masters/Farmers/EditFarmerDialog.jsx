import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Marker, GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';


const DEFAULT_CENTER = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad fallback

export default function EditFarmerDialog({ open, onClose, farmer, onSave }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');

  const [coords, setCoords] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);

  const isEditMode = Boolean(farmer);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

useEffect(() => {
  if (farmer) {
    setName(farmer.name || '');
    setMobile(farmer.mobile || '');
    setLocation(farmer.location || '');

    // ✅ preload coordinates if present
    if (farmer.latitude && farmer.longitude) {
      setCoords({
        lat: Number(farmer.latitude),
        lng: Number(farmer.longitude),
      });
    } else {
      setCoords(null);
    }
  } else {
    setName('');
    setMobile('');
    setLocation('');
    setCoords(null);
  }
}, [farmer]);


  const handleSave = () => {
    const payload = {
      ...(isEditMode && { id: farmer.id }),
      name,
      mobile,
      location,
      latitude: coords?.lat || null,
      longitude: coords?.lng || null,
    };

    console.log('Farmer form data:', payload);
    console.log('Pinned coordinates (UI only):', coords);

    onSave(payload);
  };

  return (
    <>
      {/* MAIN DIALOG */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {isEditMode ? 'Update Farmer' : 'Add Farmer'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Farmer Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              label="Mobile Number"
              fullWidth
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              inputProps={{ maxLength: 10 }}
            />

            <TextField
              label="Address"
              fullWidth
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Button
              variant="outlined"
              onClick={() => setMapOpen(true)}
            >
              📍 Pick Location on Map
            </Button>

            {coords && (
              <TextField
                label="Pinned Coordinates"
                value={`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  cursor: 'pointer',
                }}
                onClick={() => setMapOpen(true)}
                helperText="Click to view on map"
              />
            )}

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            {isEditMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MAP DIALOG */}
      <Dialog
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Select Location</DialogTitle>

        <DialogContent sx={{ height: 450 }}>
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={coords || DEFAULT_CENTER}
              zoom={14}
              onClick={(e) =>
                setCoords({
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                })
              }
            >
              {coords && <Marker position={coords} />}
            </GoogleMap>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setMapOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => setMapOpen(false)}
          >
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
