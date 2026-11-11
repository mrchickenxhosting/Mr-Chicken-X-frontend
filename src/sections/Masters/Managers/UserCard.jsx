
import { useState } from 'react';
import PropTypes from 'prop-types';

import { Chip } from '@mui/material';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import Iconify from 'src/components/iconify';

export default function UserCard({
  row,
  onEdit,
  onEnable,
  onDisable,
  onDelete,
  showSalary = false,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setOpenDialog(false);
    handleCloseMenu();
  };

  const isActive = row.status;

  const formattedSalary =
    row.monthly_salary != null
      ? `₹${Number(row.monthly_salary).toLocaleString('en-IN', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`
      : 'Not set';

  return (
    <Card
      sx={{
        p: 2,
        opacity: isActive ? 1 : 0.6,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">
            {row.name}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Mobile No.: {row.mobile}
          </Typography>

          {showSalary && (
            <Typography variant="body2" color="text.secondary">
              Monthly Salary: <strong>{formattedSalary}</strong>
            </Typography>
          )}

          <Chip
            label={isActive ? 'Active' : 'Disabled'}
            color={isActive ? 'success' : 'error'}
            size="small"
            variant="outlined"
            sx={{ width: 'fit-content', mt: 0.5 }}
          />
        </Stack>

        <IconButton onClick={handleOpenMenu}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      {/* ACTION MENU */}
      <Popover
        open={Boolean(openMenu)}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: { sx: { width: 160 } },
        }}
      >
        <MenuItem
          onClick={() => {
            onEdit(row);
            handleCloseMenu();
          }}
        >
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        {isActive ? (
          <MenuItem
            onClick={() => {
              onDisable();
              handleCloseMenu();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:slash-fill" sx={{ mr: 2 }} />
            Disable
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onEnable();
              handleCloseMenu();
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ mr: 2 }} />
            Enable
          </MenuItem>
        )}

        <MenuItem
          onClick={() => setOpenDialog(true)}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      {/* DELETE CONFIRMATION */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Delete Manager</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{row.name}</strong>?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

UserCard.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onEnable: PropTypes.func.isRequired,
  onDisable: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showSalary: PropTypes.bool,
};
