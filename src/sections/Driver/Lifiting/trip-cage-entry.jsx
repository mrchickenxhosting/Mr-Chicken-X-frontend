import { useState, useEffect } from 'react';
import { Marker, GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import {
  Card,
  Grid,
  Stack,
  Dialog,
  Button,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { updateFarmLocation } from 'src/services/Trader.service';
import {
  resetCage,
  getTripCages,
  addCageEntry,
  completeTrip,
  getassignedTrips,
} from 'src/services/Driver.service';

// ----------------------------------------------------------------------

const CAGE_COUNT = 80;
const COLORS = ['RED', 'BLUE', 'BLACK'];

const COLOR_BUTTON_MAP = {
  RED: 'error',
  BLUE: 'info',
  BLACK: 'inherit',
};

const FALLBACK_CENTER = { lat: 23.0225, lng: 72.5714 };


// ----------------------------------------------------------------------

export default function TripCageEntry() {
  const [trips, setTrips] = useState([]);
  const [trip, setTrip] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedCage, setSelectedCage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isPostLiftEdit, setIsPostLiftEdit] = useState(false);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [coords, setCoords] = useState(null);

  /**
   * cageData structure
   * {
   *   1: {
   *     DEFAULT: [{ chickens, weight }],
   *     RED: [{ chickens, weight }]
   *   }
   * }
   */
  const [cageData, setCageData] = useState({});

  const [form, setForm] = useState({
    chickens: '',
    weight: '',
  });



  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });
  // ----------------------------------------------------------------------
  // LOAD ASSIGNED TRIPS

  useEffect(() => {
    getassignedTrips().then((res) => setTrips(res || []));
  }, []);

  const isLifted = trip?.status === 'LIFTED';

  // ----------------------------------------------------------------------
  // TRIP SELECT

  const handleTripChange = async (_, value) => {
    setTrip(value);
    setCageData({});
    setSelectedCage(null);

    if (!value) return;

    try {
      const cages = await getTripCages(value.id);
      setCageData(cages || {});
    } catch {
      alert('Failed to load cages');
    }
  };

  // ----------------------------------------------------------------------
  // OPEN CAGE

  const handleCageClick = (cageNo) => {
    setSelectedCage(cageNo);
    setSelectedColor(null);
    setIsPostLiftEdit(isLifted);

    const cage = cageData[cageNo];

    if (cage?.DEFAULT?.length) {
      setForm(cage.DEFAULT[0]);
    } else {
      setForm({ chickens: '', weight: '' });
    }

    setOpenDialog(true);
  };

  // ----------------------------------------------------------------------
  // COLOR SELECT

  const selectDefault = () => {
    setSelectedColor(null);
    const entry = cageData[selectedCage]?.DEFAULT?.[0];
    setForm(entry || { chickens: '', weight: '' });
  };

  const selectColor = (color) => {
    setSelectedColor(color);
    const colorEntries = cageData[selectedCage]?.[color] || [];
    const entry = colorEntries[colorEntries.length - 1];
    setForm(entry || { chickens: '', weight: '' });
  };

  // ----------------------------------------------------------------------
  // SAVE WITH EXTRA VALIDATION

  const handleSave = async () => {
    const color = selectedColor || 'DEFAULT';
    const existing = cageData[selectedCage]?.[color]?.at(-1);

    // Extra validation ONLY if same color already exists
    if (isPostLiftEdit && existing) {
      if (Number(form.chickens) < existing.chickens) {
        alert('❌ Cannot reduce bird count after lifting');
        return;
      }

      if (Number(form.weight) < existing.weight) {
        alert('❌ Cannot reduce weight after lifting');
        return;
      }
    }

    try {
      setSaving(true); // 🔥 START LOADING

      await addCageEntry({
        tripId: trip.id,
        cageNumber: selectedCage,
        color,
        bird_count: Number(form.chickens),
        weight: Number(form.weight),
        isPostLiftEdit,
      });

      setCageData((prev) => {
        const cage = prev[selectedCage] || {};
        const entry = {
          chickens: Number(form.chickens),
          weight: Number(form.weight),
        };

        return {
          ...prev,
          [selectedCage]: {
            ...cage,
            [color]:
              color === 'DEFAULT'
                ? [entry]
                : [...(cage[color] || []), entry],
          },
        };
      });

      setOpenDialog(false);
    } catch (err) {
      alert('❌ Failed to save');
    } finally {
      setSaving(false); // 🔥 STOP LOADING
    }
  };


  const openAddLocation = () => {
    if (trip?.farmer_latitude && trip?.farmer_longitude) {
      setCoords({
        lat: Number(trip.farmer_latitude),
        lng: Number(trip.farmer_longitude),
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => setCoords(FALLBACK_CENTER)
      );
    } else {
      setCoords(FALLBACK_CENTER);
    }

    setOpenLocationDialog(true);
  };

  const saveUpdatedLocation = async () => {
    try {
      await updateFarmLocation(trip.farm_id, {
        latitude: coords.lat,
        longitude: coords.lng,
      });



      alert('✅ Farmer location updated successfully');
      setOpenLocationDialog(false);
    } catch {
      alert('❌ Failed to update location');
    }
  };

  // ----------------------------------------------------------------------
  // RESET (BLOCKED AFTER LIFT)

  const handleResetCage = async () => {
    if (isLifted) return;

    await resetCage({
      tripId: trip.id,
      cageNumber: selectedCage,
    });

    setCageData((prev) => {
      const copy = { ...prev };
      delete copy[selectedCage];
      return copy;
    });

    setOpenDialog(false);
  };

  // ----------------------------------------------------------------------
  // TOTALS

  const getTotals = (cage) =>
    Object.values(cage || {})
      .flat()
      .reduce(
        (a, c) => ({
          chickens: a.chickens + c.chickens,
          weight: a.weight + c.weight,
        }),
        { chickens: 0, weight: 0 }
      );

  const overallTotals = Object.values(cageData).reduce(
    (a, c) => {
      const t = getTotals(c);
      return {
        chickens: a.chickens + t.chickens,
        weight: a.weight + t.weight,
      };
    },
    { chickens: 0, weight: 0 }
  );


  // ----------------------------------------------------------------------

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Trip Cage Entry</Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Autocomplete
          sx={{ flex: 1 }}
          options={trips}
          value={trip}
          onChange={handleTripChange}
          getOptionLabel={(o) =>
                o
                  ? `Trip #${new Date(o.trip_date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}  • ${o.total_birds} birds • ${o.farmer_name}`
                  : ''
              }
          renderInput={(p) => <TextField {...p} label="Select Trip" />}
        />

        {trip && (
          <Button variant="contained" onClick={openAddLocation}>
            Add Location
          </Button>
        )}
      </Stack>

      {trip && (
        <Grid container spacing={2}>
          {Array.from({ length: CAGE_COUNT }).map((_, i) => {
            const cageNo = i + 1;
            const cage = cageData[cageNo];
            const totals = getTotals(cage);

            return (
              <Grid item xs={4} sm={3} md={2} lg={1.5} key={cageNo}>

                <Card
                  onClick={() => handleCageClick(cageNo)}
                  sx={{
                    height: 110,
                    cursor: 'pointer',
                    bgcolor: cage ? 'success.light' : 'background.neutral',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {/* COLOR DOTS */}
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                    }}
                  >
                    {cage?.RED?.length > 0 && (
                      <Stack
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'error.main',
                        }}
                      />
                    )}

                    {cage?.BLUE?.length > 0 && (
                      <Stack
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'info.main',
                        }}
                      />
                    )}

                    {cage?.BLACK?.length > 0 && (
                      <Stack
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'grey.800',
                        }}
                      />
                    )}
                  </Stack>

                  <Stack alignItems="center" spacing={0.3}>
                    <Typography variant="subtitle2">#{cageNo}</Typography>
                    {cage && (
                      <>
                        <Typography variant="caption">🐔 {totals.chickens}</Typography>
                        <Typography variant="caption">⚖ {totals.weight} kg</Typography>
                      </>
                    )}
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {trip && (
        <Card sx={{ p: 2 }}>
          <Stack direction="row" spacing={4} alignItems="center">
            <Typography><b>Total Birds:</b> {overallTotals.chickens}</Typography>
            <Typography><b>Total Weight:</b> {overallTotals.weight} kg</Typography>

            <Button
              variant="contained"
              color="success"
              disabled={isLifted}
              onClick={async () => {
                const res = await completeTrip(trip.id);
                alert(`Trip Lifted!\nBirds: ${res.totalBirds}\nWeight: ${res.totalWeight}`);
                setTrip({ ...trip, status: 'LIFTED' });
              }}
            >
              Complete Lifting
            </Button>
          </Stack>
        </Card>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Cage #{selectedCage}
          {isPostLiftEdit && ' ⚠️ Post-Lift Edit'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack direction="row" spacing={1}>
              <Button
                variant={!selectedColor ? 'contained' : 'outlined'}
                onClick={selectDefault}
              >
                Normal
              </Button>

              {COLORS.map((c) => (
                <Button
                  key={c}
                  variant={selectedColor === c ? 'contained' : 'outlined'}
                  color={COLOR_BUTTON_MAP[c]}
                  onClick={() => selectColor(c)}
                >
                  {c}
                </Button>
              ))}
            </Stack>

            <TextField
              label="Birds"
              type="number"
              value={form.chickens}
              onChange={(e) =>
                setForm((p) => ({ ...p, chickens: e.target.value }))
              }
            />

            <TextField
              label="Weight (kg)"
              type="number"
              value={form.weight}
              onChange={(e) =>
                setForm((p) => ({ ...p, weight: e.target.value }))
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>

          <Button color="error" disabled={isLifted} onClick={handleResetCage}>
            Reset Cage
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.chickens || !form.weight || saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>

        </DialogActions>
      </Dialog>

      <Dialog open={openLocationDialog} onClose={() => setOpenLocationDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Update Farmer Location</DialogTitle>

        <DialogContent sx={{ height: 450 }}>
          {isLoaded && coords && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={coords}
              zoom={15}
              onClick={(e) =>
                setCoords({
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                })
              }
            >
              <Marker position={coords} />
            </GoogleMap>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenLocationDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveUpdatedLocation}>
            Save Location
          </Button>
        </DialogActions>
      </Dialog>

    </Stack>
  );
}
