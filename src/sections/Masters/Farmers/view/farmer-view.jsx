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
  createFarmer,
  getallFarmer,
  UpdateFarmer,
  deleteFarmer,
  disableFarmer,
} from 'src/services/Trader.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import UserCard from '../UserCard';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import EditFarmerDialog from '../EditFarmerDialog';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function FarmerMasterPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [farmers, setFarmers] = useState([])
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);


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
      const newSelecteds = farmers.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
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
    inputData: farmers,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const data = await getallFarmer();
      setFarmers(data);
    } catch (error) {
      console.error('Failed to fetch traders', error);
    }
  };

  const handleSaveFarmer = async (payload) => {
    try {
      if (!selectedFarmer) {
        // ➕ ADD FARMER
        await createFarmer({
          name: payload.name,
          mobile: payload.mobile,
          location: payload.location,
          latitude: payload.latitude,
          longitude: payload.longitude,
        });
      } else {
        // ✏️ UPDATE FARMER
        await UpdateFarmer(selectedFarmer.id, {
          name: payload.name,
          mobile: payload.mobile,
          location: payload.location,
          latitude: payload.latitude,
          longitude: payload.longitude,
        });
      }

      setOpenDialog(false);
      fetchFarmers();
    } catch (error) {
      console.error('Farmer save failed', error);
    }
  };

  const handleDeleteFarmer = async (farmerId) => {
    try {
      await deleteFarmer(farmerId);
      fetchFarmers();
    } catch (error) {
      console.error('Delete farmer failed', error);
    }
  };

  const handleDisableFarmer = async (farmerId) => {
    try {
      await disableFarmer(farmerId, false);
      fetchFarmers();
    } catch (error) {
      console.error('Disable farmer failed', error);
    }
  };

  const handleEnableFarmer = async (farmerId) => {
    try {
      await disableFarmer(farmerId, true);
      fetchFarmers();
    } catch (error) {
      console.error('Enable farmer failed', error);
    }
  };

  return (
    <Container maxWidth="xxl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Farmers</Typography>

        {!isMobile && (<Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => {
            setSelectedFarmer(null); // new manager
            setOpenDialog(true);
          }}
        >
          New Farmer
        </Button>)}
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
                  rowCount={farmers.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={[
                    { id: 'name', label: 'Name' },
                    { id: 'mobile', label: 'Mobile No.' },
                    { id: 'location', label: 'Location' },
                    { id: 'status', label: 'Status' }, // 👈 ADD
                    { id: '' },
                  ]}
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <UserTableRow
                        row={row}
                        onEdit={(farmer) => {
                          setSelectedFarmer(farmer);
                          setOpenDialog(true);
                        }}
                        onEnable={() => handleEnableFarmer(row.id)}
                        onDisable={() => handleDisableFarmer(row.id)}
                        onDelete={() => handleDeleteFarmer(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, farmers.length)}
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
                onEdit={() => {
                  setSelectedFarmer(row);
                  setOpenDialog(true);
                }}
                onEnable={() => handleEnableFarmer(row.id)}
                onDisable={() => handleDisableFarmer(row.id)}
                onDelete={() => handleDeleteFarmer(row.id)}
              />
            ))}

            {!dataFiltered.length && <TableNoData query={filterName} />}
          </Stack>
        )}


        <TablePagination
          page={page}
          component="div"
          count={farmers.length}
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
            onClick={() => {
              setSelectedFarmer(null)
              setOpenDialog(true)
            }}
          >
            New Farmer
          </Button>
        </Box>
      )}


      <EditFarmerDialog
        open={openDialog}
        farmer={selectedFarmer}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveFarmer}
      />
    </Container>
  );
}
