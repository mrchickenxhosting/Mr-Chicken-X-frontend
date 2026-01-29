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
  getPlatformTraders,
  deletePlatformTrader,
  createPlatformTrader,
  updatePlatformTrader,
  enablePlatformTrader,
  disablePlatformTrader,
} from 'src/services/platformTrader.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import UserCard from '../UserCard';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import EditTraderDialog from '../EditTraderDialog';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function TraderMasterPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [traders, setTraders] = useState([])
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState(null);

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
    inputData: traders,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;


  useEffect(() => {
    fetchTraders();
  }, []);


  const handleSaveTrader = async (payload) => {
    try {
      if (!selectedTrader) {
        // ➕ ADD TRADER
        await createPlatformTrader({
          companyName: payload.company_name,
          ownerName: payload.owner_name,
          mobile: payload.mobile,
          password: '1234', // default password
          upi_id: payload.upiId,
        });
      } else {
        // ✏️ UPDATE TRADER (future)
        console.log('Update Trader Payload:', payload);
        await updatePlatformTrader(payload.id, {
          companyName: payload.company_name,
          ownerName: payload.owner_name,
          mobile: payload.mobile,
          upi_id: payload.upiId,
        });
        // await updateTrader(payload.id, payload);
      }

      setOpenDialog(false);
      fetchTraders();
    } catch (error) {
      console.error('Trader save failed', error);
    }
  };


  const fetchTraders = async () => {
    try {
      const data = await getPlatformTraders();
      setTraders(data);
    } catch (error) {
      console.error('Failed to fetch traders', error);
    }
  };

  const handleDisableTrader = async (traderId) => {
    try {
      await disablePlatformTrader(traderId);
      fetchTraders();
    } catch (error) {
      console.error('Failed to disable trader', error);
    }
  };

  const handleEnableTrader = async (traderId) => {
    try {
      await enablePlatformTrader(traderId);
      fetchTraders();
    } catch (error) {
      console.error('Failed to enable trader', error);
    }
  };

  const handleDeleteTrader = async (traderId) => {
  try {
    await deletePlatformTrader(traderId);
    fetchTraders(); // refresh list after delete
  } catch (error) {
    console.error('Failed to delete trader', error);
  }
};


  return (
    <Container maxWidth="xxl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Traders</Typography>

        {!isMobile && (<Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => {
            setSelectedTrader(null); // new manager
            setOpenDialog(true);
          }}
        >
          New Trader
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
                  rowCount={traders.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={[
                    { id: 'owner_name', label: 'Name' },
                    { id: 'company', label: 'Company' },
                    { id: 'role', label: 'Mobile No.' },
                    { id: 'role', label: 'UPIId' },
                    { id: 'status', label: 'Status' },
                    { id: '' },
                  ]}
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <UserTableRow
                        row={row}
                        onEdit={(trader) => {
                          setSelectedTrader(trader);
                          setOpenDialog(true);
                        }}
                        onEnable={() => handleEnableTrader(row.id)}
                        onDisable={() => handleDisableTrader(row.id)}
                        onDelete={() => handleDeleteTrader(row.id)}
                        handleClick={(event) => handleClick(event, row.name)}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, traders.length)}
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
                  setSelectedTrader(row);
                  setOpenDialog(true);
                }}
                onEnable={() => handleEnableTrader(row.id)}
                onDisable={() => handleDisableTrader(row.id)}
                onDelete={() => handleDeleteTrader(row.id)}
              />

            ))}

            {!dataFiltered.length && <TableNoData query={filterName} />}
          </Stack>
        )}


        <TablePagination
          page={page}
          component="div"
          count={traders.length}
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
              setSelectedTrader(null);
              setOpenDialog(true);
            }}
          >
            New Trader
          </Button>
        </Box>
      )}


      <EditTraderDialog
        open={openDialog}
        trader={selectedTrader}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveTrader}
      />
    </Container>
  );
}
