import { useTheme } from '@emotion/react';
import { useState, useEffect, useCallback } from 'react';

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
  createBroker,
  updateBroker,
  deleteBroker,
  getallBrokers,
} from 'src/services/Trader.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import BrokerCard from '../BrokerCard';
import TableNoData from '../table-no-data';
import BrokerTableRow from '../Broker-table-row';
import TableEmptyRows from '../table-empty-rows';
import EditBrokerDialog from '../EditBrokerDialog';
import BrokerTableHead from '../Broker-table-head';
import BrokerTableToolbar from '../Broker-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function BrokerMasterPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [brokers, setBrokers] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ======================= FETCH BROKERS =======================

  const fetchBrokers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getallBrokers();
      setBrokers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        'Failed to fetch brokers:',
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  // ======================= SORTING =======================

  const handleSort = (event, id) => {
    if (!id) return;

    const isAsc = orderBy === id && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };



  const handleClick = (event, brokerId) => {
    setSelected((previous) =>
      previous.includes(brokerId)
        ? previous.filter((id) => id !== brokerId)
        : [...previous, brokerId]
    );
  };

  // ======================= PAGINATION =======================

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ======================= SEARCH =======================

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
    setPage(0);
  };

  const dataFiltered = applyFilter({
    inputData: brokers,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const paginatedBrokers = dataFiltered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const notFound = !loading && dataFiltered.length === 0;

  // ======================= CREATE / UPDATE =======================

  const handleSaveBroker = async (payload) => {
    const brokerPayload = {
      name: payload.name?.trim(),
      number: String(payload.number ?? '').trim(),
    };

    if (!brokerPayload.name || !brokerPayload.number) {
      throw new Error('Broker name and mobile number are required.');
    }

    try {
      if (selectedBroker) {
        await updateBroker(selectedBroker.id, brokerPayload);
      } else {
        await createBroker(brokerPayload);
      }

      setOpenDialog(false);
      setSelectedBroker(null);
      await fetchBrokers();
    } catch (error) {
      console.error(
        'Broker save failed:',
        error.response?.data || error.message
      );

      // Keep the dialog open so the user can correct or retry.
      throw error;
    }
  };

  // ======================= DELETE =======================

  const handleDeleteBroker = async (brokerId) => {
    try {
      await deleteBroker(brokerId);

      setSelected((previous) =>
        previous.filter((id) => id !== brokerId)
      );

      await fetchBrokers();
    } catch (error) {
      console.error(
        'Delete broker failed:',
        error.response?.data || error.message
      );
    }
  };

  // ======================= DIALOG =======================

  const handleOpenCreateDialog = () => {
    setSelectedBroker(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (broker) => {
    setSelectedBroker(broker);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBroker(null);
  };

  // ======================= RENDER =======================

  return (
    <Container maxWidth="xxl">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography variant="h4">Brokers</Typography>

        {!isMobile && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenCreateDialog}
          >
            New Broker
          </Button>
        )}
      </Stack>

      <Card>
        <BrokerTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        {!isMobile ? (
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 650 }}>
                <BrokerTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleSort}
                  headLabel={[
                    { id: 'name', label: 'Broker Name' },
                    { id: 'number', label: 'Mobile Number' },
                    { id: 'created_at', label: 'Created At' },
                    { id: '', label: 'Actions', align: 'right' },
                  ]}
                />

                <TableBody>
                  {loading ? (
                    <TableEmptyRows
                      height={77}
                      emptyRows={rowsPerPage}
                    />
                  ) : (
                    paginatedBrokers.map((row) => (
                      <BrokerTableRow
                        key={row.id}
                        row={row}
                        onEdit={handleOpenEditDialog}
                        handleClick={(event) =>
                          handleClick(event, row.id)
                        }
                        selected={selected.includes(row.id)}
                        onDelete={() => handleDeleteBroker(row.id)}
                      />
                    ))
                  )}

                  {!loading && (
                    <TableEmptyRows
                      height={77}
                      emptyRows={emptyRows(
                        page,
                        rowsPerPage,
                        dataFiltered.length
                      )}
                    />
                  )}

                  {notFound && (
                    <TableNoData query={filterName} />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        ) : (
          <Stack spacing={2} sx={{ p: 2 }}>
            {loading ? (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ py: 3 }}
              >
                Loading brokers...
              </Typography>
            ) : (
              paginatedBrokers.map((row) => (
                <BrokerCard
                  key={row.id}
                  row={row}
                  onEdit={handleOpenEditDialog}
                  onDelete={() => handleDeleteBroker(row.id)}
                />
              ))
            )}

            {notFound && <TableNoData query={filterName} />}
          </Stack>
        )}

        <TablePagination
          component="div"
          page={page}
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
            zIndex: theme.zIndex.speedDial,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenCreateDialog}
          >
            New Broker
          </Button>
        </Box>
      )}

      {/* CREATE / EDIT DIALOG */}
      <EditBrokerDialog
        open={openDialog}
        broker={selectedBroker}
        onClose={handleCloseDialog}
        onSave={handleSaveBroker}
      />
    </Container>
  );
}