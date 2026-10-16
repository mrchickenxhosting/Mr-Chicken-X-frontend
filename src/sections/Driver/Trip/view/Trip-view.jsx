import { useTheme } from '@emotion/react';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import { Box, useMediaQuery } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import {
  CreateTrip,
  updateTrip,
  deleteTrip,
  getallTrips,
} from 'src/services/Trader.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import UserCard from '../UserCard';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import EditTripDialog from '../EditTripDialog';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import { emptyRows, getComparator } from '../utils';
import UserTableToolbar from '../user-table-toolbar';

// ----------------------------------------------------------------------

export default function DriverTripsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('id');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [trips, setTrips] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // ----------------------------------------------------------------------
  // FETCH TRIPS

const fetchTrips = async () => {
  try {
    const response = await getallTrips();

    let tripList = [];

    if (Array.isArray(response)) {
      tripList = response;
    } else if (Array.isArray(response?.trips)) {
      tripList = response.trips;
    } else if (Array.isArray(response?.data)) {
      tripList = response.data;
    }

    setTrips(tripList);
  } catch (error) {
    console.error('Failed to fetch trips:', error);
  }
};

  useEffect(() => {
    fetchTrips();
  }, []);

  // ----------------------------------------------------------------------
  // TABLE HANDLERS

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';

    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  // ----------------------------------------------------------------------
  // FILTER AND SORT
  // Includes broker name and number in the search.

  const dataFiltered = trips
    .filter((trip) =>
      [
        trip.id,
        trip.farmer_name,
        trip.driver_name,
        trip.lifter_name,
        trip.broker_name,
        trip.broker_number,
        trip.contact_name,
        trip.farmer_mobile,
        trip.driver_mobile,
        trip.contact_phone,
        trip.status,
        trip.farm_location,
        trip.total_birds,
        trip.approx_rate,
      ]
        .map((value) => value ?? '')
        .join(' ')
        .toLowerCase()
        .includes(filterName.trim().toLowerCase())
    )
    .sort(getComparator(order, orderBy));

  const notFound = !dataFiltered.length && Boolean(filterName);

  // ----------------------------------------------------------------------
  // WHATSAPP MESSAGE

  const generateTripWhatsAppMessage = (trip) => `
🚚 *ટ્રિપ સોંપવામાં આવી છે*

📅 તારીખ: ${
    trip.trip_date
      ? new Date(trip.trip_date).toLocaleDateString('en-IN')
      : '-'
  }
⏰ સમય: ${trip.trip_time || '-'}

📍 સ્થળ: ${trip.farm_location || '-'}

👨‍🌾 ખેડૂત: ${trip.farmer_name || '-'}
📞 ખેડૂત સંપર્ક: ${trip.farmer_mobile || '-'}

🚛 ડ્રાઈવર: ${trip.driver_name || '-'}
📞 ડ્રાઈવર સંપર્ક: ${trip.driver_mobile || '-'}

🧍 લિફ્ટર: ${trip.lifter_name || '-'}
📞 લિફ્ટર સંપર્ક: ${trip.lifter_mobile || '-'}

${trip.broker_name ? `🤝 બ્રોકર: ${trip.broker_name}\n` : ''}
${
  trip.contact_name
    ? `👤 સંપર્ક વ્યક્તિ: ${trip.contact_name}
📞 સંપર્ક નંબર: ${trip.contact_phone || '-'}`
    : ''
}

🐔 કુલ પક્ષીઓ: ${trip.total_birds ?? '-'}

કૃપા કરીને સમયસર પહોંચો અને લોડિંગ પછી સ્ટેટસ અપડેટ કરો.

— Dispatch Team


🚚 *New Trip Assigned*

📅 Date: ${
    trip.trip_date
      ? new Date(trip.trip_date).toLocaleDateString('en-IN')
      : '-'
  }
⏰ Time: ${trip.trip_time || '-'}

📍 Location: ${trip.farm_location || '-'}

👨‍🌾 Farmer: ${trip.farmer_name || '-'}
📞 Farmer Contact: ${trip.farmer_mobile || '-'}

🚛 Driver: ${trip.driver_name || '-'}
📞 Driver Contact: ${trip.driver_mobile || '-'}

🧍 Lifter: ${trip.lifter_name || '-'}
📞 Lifter Contact: ${trip.lifter_mobile || '-'}

${trip.broker_name ? `🤝 Broker: ${trip.broker_name}\n` : ''}
${
  trip.contact_name
    ? `👤 Contact Person: ${trip.contact_name}
📞 Contact No: ${trip.contact_phone || '-'}`
    : ''
}

🐔 Total Birds: ${trip.total_birds ?? '-'}

Please reach on time and update status after loading.

— Dispatch Team
`;

  const sendTripWhatsApp = (trip) => {
    if (!trip?.driver_mobile) {
      console.warn('Driver mobile missing, WhatsApp not sent');
      return;
    }

    const phone = `91${String(trip.driver_mobile).replace(/\D/g, '')}`;
    const message = generateTripWhatsAppMessage(trip);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ----------------------------------------------------------------------
  // SAVE TRIP (CREATE / UPDATE)

  const handleSaveTrip = async (payload) => {
    try {
      let response;

      if (!selectedTrip) {
        response = await CreateTrip(payload);
      } else {
        response = await updateTrip(selectedTrip.id, payload);
      }

      const savedTrip = response?.trip || response?.data?.trip || response?.data || response;

      // Close the dialog and reset selection.
      setOpenDialog(false);
      setSelectedTrip(null);

      // Refresh trips so the broker name and other joined fields are up to date.
      await fetchTrips();

      // Preserve the existing WhatsApp behavior.
      if (savedTrip?.driver_mobile) {
        sendTripWhatsApp(savedTrip);
      } else {
        console.warn(
          'Driver mobile not found in the save response; WhatsApp not sent.'
        );
      }
    } catch (error) {
      console.error('Trip save failed:', error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to save trip'
      );
    }
  };

  // ----------------------------------------------------------------------
  // DELETE TRIP

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      await deleteTrip(tripId);
      await fetchTrips();
      setPage(0);

      alert('Trip deleted successfully');
    } catch (error) {
      console.error('Trip delete failed:', error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to delete trip'
      );
    }
  };

  // ----------------------------------------------------------------------
  // OPEN CREATE DIALOG

  const handleCreateTrip = () => {
    setSelectedTrip(null);
    setOpenDialog(true);
  };

  // ----------------------------------------------------------------------
  // RENDER

  return (
    <Container maxWidth="xxl">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography variant="h4">Trips</Typography>

        {!isMobile && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleCreateTrip}
          >
            New Trip
          </Button>
        )}
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={0}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        {/* DESKTOP TABLE */}
        {!isMobile ? (
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 1100 }}>
                <UserTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleSort}
                  headLabel={[
                    { id: 'id', label: 'Trip ID' },
                    { id: 'trip_date', label: 'Date' },
                    { id: 'trip_time', label: 'Time' },
                    { id: 'farmer_name', label: 'Farmer/Driver' },
                    { id: 'driver_name', label: 'Driver' },
                    { id: 'lifter_name', label: 'Lifter' },
                    { id: 'broker_name', label: 'Broker' },
                    { id: 'contact_name', label: 'Contact Person' },
                    { id: 'total_birds', label: 'Birds' },
                    { id: 'approx_rate', label: 'Approx. Rate' },
                    { id: 'status', label: 'Status' },
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: '' },
                  ]}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        onEdit={(trip) => {
                          setSelectedTrip(trip);
                          setOpenDialog(true);
                        }}
                        onDelete={() => handleDeleteTrip(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(
                      page,
                      rowsPerPage,
                      dataFiltered.length
                    )}
                  />

                  {notFound && <TableNoData query={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        ) : (
          /* MOBILE CARDS */
          <Stack spacing={2} sx={{ p: 2 }}>
            {dataFiltered
              .slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              .map((row) => (
                <UserCard
                  key={row.id}
                  row={row}
                  onEdit={(trip) => {
                    setSelectedTrip(trip);
                    setOpenDialog(true);
                  }}
                  onDeleteTrip={handleDeleteTrip}
                />
              ))}

            {!dataFiltered.length && <TableNoData query={filterName} />}
          </Stack>
        )}

        <TablePagination
          page={page}
          component="div"
          count={dataFiltered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* MOBILE CREATE BUTTON */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleCreateTrip}
          >
            New Trip
          </Button>
        </Box>
      )}

      {/* CREATE / EDIT TRIP DIALOG */}
      <EditTripDialog
        open={openDialog}
        trip={selectedTrip}
        onClose={() => {
          setOpenDialog(false);
          setSelectedTrip(null);
        }}
        onSave={handleSaveTrip}
      />
    </Container>
  );
}