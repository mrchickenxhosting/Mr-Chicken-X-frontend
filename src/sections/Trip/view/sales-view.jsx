import { useTheme } from '@emotion/react';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { Select, Button, MenuItem, InputLabel, FormControl, useMediaQuery } from '@mui/material';

import { getPlatformTraders } from 'src/services/platformTrader.service';
import { getallTrips, closeTripDay, getTripSales } from 'src/services/Trader.service';

import Scrollbar from 'src/components/scrollbar';

import UserCard from '../UserCard';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';


// ----------------------------------------------------------------------

export default function DaySalesPage() {
  const [page, setPage] = useState(0);
  const [trips, setTrips] = useState([]);
  const [sales, setSales] = useState([])
  const [order, setOrder] = useState('asc');
  const [traders, setTraders] = useState([])
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [otherExpense, setOtherExpense] = useState('');
  const [dieselExpense, setDieselExpense] = useState('');
  const [openCloseDay, setOpenCloseDay] = useState(false);


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = traders.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = await getallTrips();

      // 🚫 Remove CLOSED trips
      const activeTrips = data.filter(
        (trip) => trip.status !== 'CLOSED'
      );

      setTrips(activeTrips);
    } catch (err) {
      console.error('Failed to fetch trips', err);
    }
  };

  useEffect(() => {
    if (!selectedTrip) return;
    fetchSales(selectedTrip);
  }, [selectedTrip]);

  const fetchSales = async (tripId) => {
    try {
      const data = await getTripSales(tripId);
      console.log(data)
      setSales(data);
    } catch (err) {
      console.error('Failed to fetch sales', err);
    }
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
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

  const dataFiltered = applyFilter({
    inputData: sales,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;


  useEffect(() => {
    fetchTraders();
  }, []);



  const fetchTraders = async () => {
    try {
      const data = await getPlatformTraders();
      setTraders(data);
    } catch (error) {
      console.error('Failed to fetch traders', error);
    }
  };

  const handleSubmitCloseDay = async () => {
    if (!selectedTrip) return;

    try {
      const payload = {
        tripId: selectedTrip,
        diesel_expense: Number(dieselExpense || 0),
        other_expense: Number(otherExpense || 0),
      };

      console.log('Closing day:', selectedTrip, payload);

      await closeTripDay(selectedTrip, payload);

      setOpenCloseDay(false);
      setDieselExpense('');
      setOtherExpense('');
      setSales([]);              // clear sales
      setSelectedTrip(null);   // reset trip

      alert('Day closed successfully');
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to close day');
    }
  };

  let emptyTableMessage = null;

  if (!selectedTrip) {
    emptyTableMessage = {
      title: 'No trip is selected',
      subtitle: 'Please select a trip to view sales',
    };
  } else if (sales.length === 0) {
    emptyTableMessage = {
      title: 'No sales done for this trip',
      subtitle: 'Sales will appear here once birds are sold',
    };
  }



  return (
    <Container maxWidth="xxl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Sales</Typography>
        <FormControl sx={{ minWidth: 280 }}>
          <InputLabel>Select Trip</InputLabel>
          <Select
            value={selectedTrip}
            label="Select Trip"
            onChange={(e) => setSelectedTrip(e.target.value)}
          >
            {trips.map((trip) => (
              <MenuItem key={trip.id} value={trip.id}>
                Trip #{trip.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>



      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        {!isMobile ? (
          // ================= DESKTOP TABLE =================
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <UserTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={traders.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={[
                    { id: 'owner_name', label: 'Customer' },
                    { id: 'company', label: 'Cage' },
                    { id: 'role', label: 'Birds' },
                    { id: 'role', label: 'Weight' },
                    { id: 'role', label: 'Amount ' },
                    { id: 'role', label: 'Mode' },
                    { id: 'role', label: 'Cash' },
                    { id: 'role', label: 'UPI' },
                    { id: 'role', label: 'Time' },
                    { id: '' },
                  ]}
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <UserTableRow
                        row={row}
                        handleClick={(event) => handleClick(event, row.name)}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, sales.length)}
                    message={emptyTableMessage}
                  />


                  {notFound && <TableNoData query={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        ) : (
          // ================= MOBILE CARD LIST =================
          <Stack spacing={2} sx={{ p: 2 }}>
            {dataFiltered.map((row) => (
              <UserCard
                row={row}
                onEdit={() => console.log('edit', row)}
                onDelete={() => console.log('delete', row)}
              />
            ))}

            {!dataFiltered.length && <TableNoData query={filterName} />}
          </Stack>
        )}


        <TablePagination
          page={page}
          component="div"
          count={sales.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

{selectedTrip && sales.length > 0 && (
  <Stack
    direction="row"
    justifyContent="flex-end"
    sx={{ p: 2, borderTop: '1px solid #eee' }}
  >
    <Button
      variant="contained"
      color="success"
      size="large"
      onClick={() => setOpenCloseDay(true)}
    >
      Complete Day
    </Button>
  </Stack>
)}


        <Dialog
          open={openCloseDay}
          onClose={() => setOpenCloseDay(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Close Day – Trip #{selectedTrip}</DialogTitle>

          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Diesel Expense"
                type="number"
                fullWidth
                value={dieselExpense}
                onChange={(e) => setDieselExpense(e.target.value)}
                InputProps={{ startAdornment: <span>₹&nbsp;</span> }}
              />

              <TextField
                label="Other Expense"
                type="number"
                fullWidth
                value={otherExpense}
                onChange={(e) => setOtherExpense(e.target.value)}
                InputProps={{ startAdornment: <span>₹&nbsp;</span> }}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setOpenCloseDay(false)}
              color="inherit"
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handleSubmitCloseDay}
            >
              Confirm & Close Day
            </Button>
          </DialogActions>
        </Dialog>


      </Card>

    </Container>
  );
}
