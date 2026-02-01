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
  createCustomer,
  getallCustomer,
  UpdateCustomer,
  deleteCustomer,
  disableCustomer,
} from 'src/services/Trader.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import UserCard from '../UserCard';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import EditCustomerDialog from '../EditCustomerDialog';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function CustomerMasterPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [customers, setCustomers] = useState([])
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
      const newSelecteds = customers.map((n) => n.name);
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
    inputData: customers,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await getallCustomer();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch traders', error);
    }
  };

  const handleSaveCustomer = async (payload) => {
    try {
      if (!selectedCustomer) {
        // ➕ ADD CUSTOMER
        await createCustomer(payload);
      } else {
        // ✏️ UPDATE CUSTOMER
        await UpdateCustomer(selectedCustomer.id, payload);
      }

      setOpenDialog(false);
      fetchCustomers();
    } catch (error) {
      console.error('Customer save failed', error);
    }
  };


  const handleDeleteCustomer = async (customerId) => {
    try {
      await deleteCustomer(customerId);
      fetchCustomers();
    } catch (error) {
      console.error('Delete customer failed', error);
    }
  };

  const handleDisableCustomer = async (customerId) => {
    try {
      await disableCustomer(customerId, false);
      fetchCustomers();
    } catch (error) {
      console.error('Disable customer failed', error);
    }
  };

  const handleEnableCustomer = async (customerId) => {
    try {
      await disableCustomer(customerId, true);
      fetchCustomers();
    } catch (error) {
      console.error('Enable customer failed', error);
    }
  };

  return (
    <Container maxWidth="xxl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Customers</Typography>

        {!isMobile && (<Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => {
            setSelectedCustomer(null); // new manager
            setOpenDialog(true);
          }}
        >
          New Customer
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
                  rowCount={customers.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={[
                    { id: 'customer_code', label: 'Customer Code' },
                    { id: 'name', label: 'Name' },
                    { id: 'shop_name', label: 'Shop Name' },
                    { id: 'mobile', label: 'Mobile No.' },
                    { id: 'city', label: 'City' },
                    { id: 'outstanding', label: 'Outstanding (₹)' },
                    { id: 'customer_type', label: 'Type' },
                    { id: 'status', label: 'Status' },
                    { id: 'actions', label: '' }, // actions menu
                  ]}
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <UserTableRow
                        row={row}
                        onEdit={(customer) => {
                          setSelectedCustomer(customer);
                          setOpenDialog(true);
                        }}
                        onEnable={() => handleEnableCustomer(row.id)}
                        onDisable={() => handleDisableCustomer(row.id)}
                        onDelete={() => handleDeleteCustomer(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, customers.length)}
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
                  setSelectedCustomer(row);
                  setOpenDialog(true);
                }}
                onEnable={() => handleEnableCustomer(row.id)}
                onDisable={() => handleDisableCustomer(row.id)}
                onDelete={() => handleDeleteCustomer(row.id)}
              />

            ))}

            {!dataFiltered.length && <TableNoData query={filterName} />}
          </Stack>
        )}


        <TablePagination
          page={page}
          component="div"
          count={customers.length}
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
              setSelectedCustomer(null);
              setOpenDialog(true);
            }}
          >
            New Customer
          </Button>
        </Box>
      )}

      <EditCustomerDialog
        open={openDialog}
        customer={selectedCustomer}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveCustomer}
      />

    </Container>
  );
}
