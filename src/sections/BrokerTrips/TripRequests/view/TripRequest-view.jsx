
import { useState, useEffect, useCallback } from 'react';

import {
  Card,
  Alert,
  Stack,
  Table,
  Button,
  Dialog,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  TableContainer,
  TablePagination,
  CircularProgress,
} from '@mui/material';

import {
  getBrokerTrips,
  updateBrokerTrip,
} from 'src/services/Trader.service';

// ----------------------------------------------------------------------

const getTripList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.trips)) return response.trips;
  if (Array.isArray(response?.data?.trips)) return response.data.trips;
  if (Array.isArray(response?.data)) return response.data;

  return [];
};

const formatDate = (date) => {
  if (!date) return '-';

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString('en-IN');
};

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return value;
};

// ----------------------------------------------------------------------

export default function BrokerTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [viewTrip, setViewTrip] = useState(null);

  const [form, setForm] = useState({
    supervisor_number: '',
    farm_name: '',
    farm_location: '',
    farm_number: '',
  });

  // ----------------------------------------------------------------------
  // FETCH BROKER-ASSIGNED TRIPS
  // ----------------------------------------------------------------------

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getBrokerTrips();
      const tripList = getTripList(response);

      setTrips(tripList);

      // Prevent the current page from exceeding the available results.
      setPage((currentPage) => {
        const maxPage = Math.max(
          0,
          Math.ceil(tripList.length / rowsPerPage) - 1
        );

        return Math.min(currentPage, maxPage);
      });
    } catch (err) {
      console.error('Failed to fetch broker trips:', err);

      setError(
        err?.response?.data?.message ||
          'Failed to load your assigned trips.'
      );
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // ----------------------------------------------------------------------
  // OPEN EDIT DIALOG
  // ----------------------------------------------------------------------

const handleOpenEdit = (trip) => {
  setSelectedTrip(trip);

  setForm({
    supervisor_number: trip.supervisor_number ?? '',
    farm_name: trip.farm_name ?? '',
    farm_location: trip.farm_location ?? '',
    farm_number: trip.farm_number ?? '',
  });

  setError('');
  setSuccess('');
};

const handleCloseEdit = () => {
  if (saving) return;

  setSelectedTrip(null);

  setForm({
    supervisor_number: '',
    farm_name: '',
    farm_location: '',
    farm_number: '',
  });
};

  // ----------------------------------------------------------------------
  // FORM HANDLING
  // ----------------------------------------------------------------------

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ----------------------------------------------------------------------
  // SAVE ONLY BROKER-EDITABLE FIELDS
  // ----------------------------------------------------------------------

  const handleSave = async () => {
    if (!selectedTrip?.id) return;

   if (
  !form.farm_name.trim() ||
  !form.farm_location.trim() ||
  !form.farm_number.trim()
) {
  setError(
    'Please enter the farm name, farm location, and farm number.'
  );
  return;
}

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const tripId = selectedTrip.id;

const payload = {
  supervisor_number: form.supervisor_number.trim(),
  farm_name: form.farm_name.trim(),
  farm_location: form.farm_location.trim(),
  farm_number: form.farm_number.trim(),
};

      await updateBrokerTrip(tripId, payload);

      await fetchTrips();

      setSelectedTrip(null);

      setSuccess(`Trip #${tripId} updated successfully.`);
    } catch (err) {
      console.error('Failed to update broker trip:', err);

      setError(
        err?.response?.data?.message ||
          'Failed to update trip details.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------------------
  // SEARCH BY TRIP, TRADER, COMPANY, FARM, OR STATUS
  // ----------------------------------------------------------------------

  const filteredTrips = trips.filter((trip) => {
    const searchableText = [
      trip.id,

      // Trader details
      trip.trader_name,
      trip.trader_company_name,

      // Alternative names in case the API uses different aliases
      trip.traderName,
      trip.trader_company,
      trip.company_name,
      trip.companyName,

      // Trip details
      trip.trip_date,
      trip.trip_time,
      trip.farm_name,
      trip.farm_location,
      trip.farmer_name,
      trip.driver_name,
      trip.status,
      trip.total_birds,
    ]
      .map((value) => value ?? '')
      .join(' ')
      .toLowerCase();

    return searchableText.includes(search.trim().toLowerCase());
  });

  // ----------------------------------------------------------------------
  // TABLE
  // ----------------------------------------------------------------------

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Typography variant="h4">Trips</Typography>

        <Typography variant="body2" color="text.secondary">
          View your assigned trips, identify the trader and company
          that submitted each request, and update the farm and
          supervisor details.
        </Typography>

        {error && !selectedTrip && (
          <Alert
            severity="error"
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        <Card>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <TextField
              size="small"
              label="Search trips"
              placeholder="Search by trip, trader, company, farm..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              sx={{ maxWidth: { sm: 420 } }}
            />

            <Button
              variant="outlined"
              onClick={fetchTrips}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          {loading ? (
            <Stack alignItems="center" sx={{ py: 8 }}>
              <CircularProgress />

              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading trips...
              </Typography>
            </Stack>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 1250 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Trip ID</TableCell>
                      <TableCell>Trader Name</TableCell>
                      <TableCell>Trader Company</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Farm Name</TableCell>
                      <TableCell>Farm Location</TableCell>
                      <TableCell>Birds</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredTrips
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((trip) => (
                        <TableRow key={trip.id} hover>
                          <TableCell>
                            {trip.id}
                          </TableCell>

                          <TableCell>
                            {displayValue(
                              trip.trader_name ??
                                trip.traderName
                            )}
                          </TableCell>

                          <TableCell>
                            {displayValue(
                              trip.trader_company_name ??
                                trip.trader_company ??
                                trip.company_name ??
                                trip.companyName
                            )}
                          </TableCell>

                          <TableCell>
                            {formatDate(trip.trip_date)}
                          </TableCell>

                          <TableCell>
                            {trip.trip_time || '-'}
                          </TableCell>

                          <TableCell>
                            {trip.farm_name || '-'}
                          </TableCell>

                          <TableCell>
                            {trip.farm_location || '-'}
                          </TableCell>

                          <TableCell>
                            {trip.total_birds ?? '-'}
                          </TableCell>

                          <TableCell>
                            {trip.status || '-'}
                          </TableCell>

                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setViewTrip(trip)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleOpenEdit(trip)}
                              >
                                Update Details
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}

                    {!filteredTrips.length && (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          align="center"
                          sx={{ py: 5 }}
                        >
                          {search
                            ? 'No trips match your search.'
                            : 'No trips have been assigned to you yet.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredTrips.length}
                page={page}
                onPageChange={(event, newPage) => {
                  setPage(newPage);
                }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </Card>
      </Stack>

      {/* READ-ONLY FULL TRIP DETAILS DIALOG */}
      <Dialog
        open={Boolean(viewTrip)}
        onClose={() => setViewTrip(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Trip Details #{viewTrip?.id}</DialogTitle>
        <DialogContent dividers>
          {viewTrip && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert severity="info">
                Complete trip information. Use Update Details to edit the broker-managed fields.
              </Alert>

              <Typography variant="subtitle1" fontWeight={700}>Trader Information</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow><TableCell><strong>Trader Name</strong></TableCell><TableCell>{displayValue(viewTrip.trader_name ?? viewTrip.traderName)}</TableCell></TableRow>
                  <TableRow><TableCell><strong>Trader Company</strong></TableCell><TableCell>{displayValue(viewTrip.trader_company_name ?? viewTrip.trader_company ?? viewTrip.company_name ?? viewTrip.companyName)}</TableCell></TableRow>
                  </TableBody>
              </Table>

              <Typography variant="subtitle1" fontWeight={700}>Trip Information</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow><TableCell><strong>Date</strong></TableCell><TableCell>{formatDate(viewTrip.trip_date)}</TableCell></TableRow>
                  <TableRow><TableCell><strong>Time</strong></TableCell><TableCell>{displayValue(viewTrip.trip_time)}</TableCell></TableRow>
                  <TableRow><TableCell><strong>Total Birds</strong></TableCell><TableCell>{displayValue(viewTrip.total_birds)}</TableCell></TableRow>
                  <TableRow><TableCell><strong>Minimum Weight</strong></TableCell><TableCell>{displayValue(viewTrip.minimum_weight)}</TableCell></TableRow>
                </TableBody>
              </Table>

              <Typography variant="subtitle1" fontWeight={700}>Farm & Supervisor Information</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow><TableCell><strong>Supervisor Number</strong></TableCell><TableCell>{displayValue(viewTrip.supervisor_number)}</TableCell></TableRow>
                  <TableRow><TableCell><strong>Farm Name</strong></TableCell><TableCell>{displayValue(viewTrip.farm_name)}</TableCell></TableRow>
                  <TableRow><TableCell><strong>Farm Location</strong></TableCell><TableCell>{displayValue(viewTrip.farm_location)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewTrip(null)}>Close</Button>
          {viewTrip && (
            <Button
              variant="contained"
              onClick={() => {
                const tripToEdit = viewTrip;
                setViewTrip(null);
                handleOpenEdit(tripToEdit);
              }}
            >
              Update Details
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* BROKER FIELD UPDATE DIALOG */}

      <Dialog
        open={Boolean(selectedTrip)}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Update Trip #{selectedTrip?.id}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {selectedTrip && (
              <Alert severity="info">
                <strong>Trader:</strong>{' '}
                {displayValue(
                  selectedTrip.trader_name ??
                    selectedTrip.traderName
                )}
                <br />
                <strong>Company:</strong>{' '}
                {displayValue(
                  selectedTrip.trader_company_name ??
                    selectedTrip.trader_company ??
                    selectedTrip.company_name ??
                    selectedTrip.companyName
                )}
                <br />
                You can update only the supervisor and farm
                details. Other trip information is managed by
                the trader.
              </Alert>
            )}

            <TextField
              fullWidth
              label="Supervisor Number"
              name="supervisor_number"
              value={form.supervisor_number}
              onChange={handleFormChange}
              inputProps={{ maxLength: 20 }}
            />

            <TextField
              fullWidth
              required
              label="Farm Name"
              name="farm_name"
              value={form.farm_name}
              onChange={handleFormChange}
              inputProps={{ maxLength: 150 }}
            />

            <TextField
              fullWidth
              required
              label="Farm Location"
              name="farm_location"
              value={form.farm_location}
              onChange={handleFormChange}
              inputProps={{ maxLength: 255 }}
            />

            <TextField
  fullWidth
  required
  label="Farm Number"
  name="farm_number"
  value={form.farm_number}
  onChange={handleFormChange}
  inputProps={{ maxLength: 20 }}
/>

            {error && (
              <Alert
                severity="error"
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseEdit}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Details'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
