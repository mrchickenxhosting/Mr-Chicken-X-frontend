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
  createCar,
  updateCar,
  deleteCar,
  disableCar,
  getallCars,
} from 'src/services/Trader.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import CarCard from '../CarCard';
import TableNoData from '../table-no-data';
import UserTableRow from '../Car-table-row';
import EditCarDialog from '../EditCarDialog';
import UserTableHead from '../Car-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../Car-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function CarMasterPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('car_number');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const data = await getallCars();
      setCars(data);
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    }
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';

    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(cars.map((car) => car.car_number));
      return;
    }

    setSelected([]);
  };

  const handleClick = (event, carNumber) => {
    const selectedIndex = selected.indexOf(carNumber);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, carNumber);
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
    inputData: cars,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  // ----------------------------------------------------------------------

  const handleSaveCar = async (payload) => {
    try {
      const formData = new FormData();

      formData.append('car_number', payload.car_number);
      formData.append('model_name', payload.model_name);
      formData.append(
        'max_capacity_cages',
        String(payload.max_capacity_cages)
      );

      // Only append a file when the user selects a new RC Book.
      // If omitted during edit, the existing RC Book is preserved.
      if (payload.rc_book) {
        formData.append('rc_book', payload.rc_book);
      }

      if (!selectedCar) {
        await createCar(formData);
      } else {
        await updateCar(selectedCar.id, formData);
      }

      setOpenDialog(false);
      setSelectedCar(null);
      await fetchCars();
    } catch (error) {
      console.error('Car save failed:', error);
      throw error;
    }
  };

  const handleDeleteCar = async (carId) => {
    try {
      await deleteCar(carId);
      await fetchCars();
    } catch (error) {
      console.error('Delete car failed:', error);
    }
  };

  const handleDisableCar = async (carId) => {
    try {
      await disableCar(carId, false);
      await fetchCars();
    } catch (error) {
      console.error('Disable car failed:', error);
    }
  };

  const handleEnableCar = async (carId) => {
    try {
      await disableCar(carId, true);
      await fetchCars();
    } catch (error) {
      console.error('Enable car failed:', error);
    }
  };

  const handleOpenAddDialog = () => {
    setSelectedCar(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCar(null);
  };

  // ----------------------------------------------------------------------

  return (
    <Container maxWidth="xxl">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography variant="h4">Cars</Typography>

        {!isMobile && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenAddDialog}
          >
            New Car
          </Button>
        )}
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        {!isMobile ? (
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <UserTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={cars.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={[
                    { id: 'car_number', label: 'Car No.' },
                    { id: 'model_name', label: 'Model Name' },
                    { id: 'max_capacity_cages', label: 'Max Capacity' },
                    { id: 'is_active', label: 'Status' },
                    { id: 'rc', label: 'RC Book ' },
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
                        onEdit={(car) => {
                          setSelectedCar(car);
                          setOpenDialog(true);
                        }}
                        handleClick={(event) =>
                          handleClick(event, row.car_number)
                        }
                        onEnable={() => handleEnableCar(row.id)}
                        onDisable={() => handleDisableCar(row.id)}
                        onDelete={() => handleDeleteCar(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, cars.length)}
                  />

                  {notFound && <TableNoData query={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        ) : (
          <Stack spacing={2} sx={{ p: 2 }}>
            {dataFiltered
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <CarCard
                  key={row.id}
                  row={row}
                  onEdit={() => {
                    setSelectedCar(row);
                    setOpenDialog(true);
                  }}
                  onEnable={() => handleEnableCar(row.id)}
                  onDisable={() => handleDisableCar(row.id)}
                  onDelete={() => handleDeleteCar(row.id)}
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

      {isMobile && (
        <Box sx={{ position: 'fixed', bottom: 16, left: 16, right: 16 }}>
          <Button
            fullWidth
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenAddDialog}
          >
            New Car
          </Button>
        </Box>
      )}

      <EditCarDialog
        open={openDialog}
        car={selectedCar}
        onClose={handleCloseDialog}
        onSave={handleSaveCar}
      />
    </Container>
  );
}