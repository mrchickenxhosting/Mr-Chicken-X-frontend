import { useTheme } from '@emotion/react';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import { Box, useMediaQuery } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import {
  createManager,
  getallManager,
  UpdateManager,
  deleteManager,
  disableManager,
} from 'src/services/Trader.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import UserCard from '../UserCard';
import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import EditManagerDialog from '../EditManagerDialog';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function ManagerMasterPage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [managers, setManagers] = useState([])
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);


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
      const newSelecteds = managers.map((n) => n.name);
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
    inputData: managers,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const data = await getallManager();
      setManagers(data);
    } catch (error) {
      console.error('Failed to fetch traders', error);
    }
  };

  const handleSaveManager = async (payload) => {
    try {
      if (!selectedManager) {
        // ➕ ADD
        await createManager({
          name: payload.name,
          mobile: payload.mobile,
          password: '1234',
        });
      } else {
        // ✏️ UPDATE
        await UpdateManager(selectedManager.id, {
          name: payload.name,
          mobile: payload.mobile,
        });
      }

      setOpenDialog(false);
      fetchManagers();
    } catch (error) {
      console.error('Manager save failed', error);
    }
  };

  const handleDeleteManager = async (managerId) => {
    try {
      await deleteManager(managerId);
      fetchManagers();
    } catch (error) {
      console.error('Delete manager failed', error);
    }
  };

  const handleDisableManager = async (managerId) => {
    try {
      await disableManager(managerId, false);
      fetchManagers();
    } catch (error) {
      console.error('Disable manager failed', error);
    }
  };

  const handleEnableManager = async (managerId) => {
    try {
      await disableManager(managerId, true);
      fetchManagers();
    } catch (error) {
      console.error('Enable manager failed', error);
    }
  };

  return (
    <Container maxWidth="xxl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Managers</Typography>

        {!isMobile && (<Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => {
            setSelectedManager(null); // new manager
            setOpenDialog(true);
          }}
        >
          New Manager
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
                  rowCount={managers.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={[
                    { id: 'name', label: 'Name' },
                    { id: 'mobile', label: 'Mobile No.' },
                    { id: 'mobile', label: 'Status' },
                    { id: '' },
                  ]}
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <UserTableRow
                        row={row}
                        onEdit={(manager) => {
                          setSelectedManager(manager); // fill dialog
                          setOpenDialog(true);         // open dialog
                        }}
                        handleClick={(event) => handleClick(event, row.name)}
                        onEnable={() => handleEnableManager(row.id)}
                        onDisable={() => handleDisableManager(row.id)}
                        onDelete={() => handleDeleteManager(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, managers.length)}
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
                  setSelectedManager(row);
                  setOpenDialog(true);
                }}
                onEnable={() => handleEnableManager(row.id)}
                onDisable={() => handleDisableManager(row.id)}
                onDelete={() => handleDeleteManager(row.id)}
              />
            ))}

            {!dataFiltered.length && <TableNoData query={filterName} />}
          </Stack>
        )}


        <TablePagination
          page={page}
          component="div"
          count={managers.length}
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
              setSelectedManager(null);
              setOpenDialog(true);
            }}
          >
            New Manager
          </Button>
        </Box>
      )}


      <EditManagerDialog
        open={openDialog}
        manager={selectedManager}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveManager}
      />

    </Container>
  );
}
