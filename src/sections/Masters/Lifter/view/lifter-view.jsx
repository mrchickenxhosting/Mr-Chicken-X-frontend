
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
  createLifter,
  getallLifter,
  UpdateLifter,
  deleteLifter,
  disableLifter,
} from 'src/services/Trader.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import UserCard from '../UserCard';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import EditLifterDialog from '../EditLifterDialog';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function LifterMasterPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [lifters, setLifters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLifter, setSelectedLifter] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ----------------------------------------------------------------------

  const fetchLifters = async () => {
    try {
      const data = await getallLifter();
      setLifters(data);
    } catch (error) {
      console.error('Failed to fetch lifters', error);
    }
  };

  useEffect(() => {
    fetchLifters();
  }, []);

  // ----------------------------------------------------------------------

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';

    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = lifters.map((lifter) => lifter.name);
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

  // ----------------------------------------------------------------------

  const dataFiltered = applyFilter({
    inputData: lifters,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  // ----------------------------------------------------------------------
  // CREATE / UPDATE LIFTER
  // ----------------------------------------------------------------------

  const handleSaveLifter = async (payload) => {
    try {
      if (!selectedLifter) {
        await createLifter({
          ...payload,
          password: '1234',
        });
      } else {
        await UpdateLifter(selectedLifter.id, payload);
      }

      setOpenDialog(false);
      setSelectedLifter(null);

      await fetchLifters();
    } catch (error) {
      console.error('Lifter save failed', error);
    }
  };

  // ----------------------------------------------------------------------
  // DELETE LIFTER
  // ----------------------------------------------------------------------

  const handleDeleteLifter = async (lifterId) => {
    try {
      await deleteLifter(lifterId);
      await fetchLifters();
    } catch (error) {
      console.error('Delete lifter failed', error);
    }
  };

  // ----------------------------------------------------------------------
  // DISABLE LIFTER
  // ----------------------------------------------------------------------

  const handleDisableLifter = async (lifterId) => {
    try {
      await disableLifter(lifterId, false);
      await fetchLifters();
    } catch (error) {
      console.error('Disable lifter failed', error);
    }
  };

  // ----------------------------------------------------------------------
  // ENABLE LIFTER
  // ----------------------------------------------------------------------

  const handleEnableLifter = async (lifterId) => {
    try {
      await disableLifter(lifterId, true);
      await fetchLifters();
    } catch (error) {
      console.error('Enable lifter failed', error);
    }
  };

  // ----------------------------------------------------------------------

  const handleOpenCreateDialog = () => {
    setSelectedLifter(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (lifter) => {
    setSelectedLifter(lifter);
    setOpenDialog(true);
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
        <Typography variant="h4">Lifter</Typography>

        {!isMobile && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenCreateDialog}
          >
            New Lifter
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
          // ================= DESKTOP TABLE =================
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <UserTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={lifters.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={[
                    { id: 'name', label: 'Name' },
                    { id: 'mobile', label: 'Mobile No.' },
                    { id: 'monthly_salary', label: 'Monthly Salary' },
                    { id: 'status', label: 'Status' },
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
                        onEdit={handleOpenEditDialog}
                        handleClick={(event) =>
                          handleClick(event, row.name)
                        }
                        onEnable={() => handleEnableLifter(row.id)}
                        onDisable={() => handleDisableLifter(row.id)}
                        onDelete={() => handleDeleteLifter(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(
                      page,
                      rowsPerPage,
                      lifters.length
                    )}
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
                key={row.id}
                row={row}
                onEdit={() => handleOpenEditDialog(row)}
                onEnable={() => handleEnableLifter(row.id)}
                onDisable={() => handleDisableLifter(row.id)}
                onDelete={() => handleDeleteLifter(row.id)}
              />
            ))}

            {!dataFiltered.length && (
              <TableNoData query={filterName} />
            )}
          </Stack>
        )}

        <TablePagination
          page={page}
          component="div"
          count={lifters.length}
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
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleOpenCreateDialog}
          >
            New Lifter
          </Button>
        </Box>
      )}

      {/* CREATE / EDIT DIALOG */}
      <EditLifterDialog
        open={openDialog}
        driver={selectedLifter}
        onClose={() => {
          setOpenDialog(false);
          setSelectedLifter(null);
        }}
        onSave={handleSaveLifter}
      />
    </Container>
  );
}
