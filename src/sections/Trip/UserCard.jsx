import { useState } from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
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
  onDelete,
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
    onDelete(row);
    setOpenDialog(false);
    handleCloseMenu();
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="subtitle1" fontWeight={600}>
          {row.customer_name}
        </Typography>

        <IconButton onClick={handleOpenMenu}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Stack spacing={0.8}>
        <Typography variant="body2">
          Cage No: <strong>{row.cage_number}</strong>
        </Typography>

        <Typography variant="body2">
          Bird Count: <strong>{row.bird_count}</strong>
        </Typography>

        <Typography variant="body2">
          Weight: <strong>{row.weight}</strong>
        </Typography>

        <Typography variant="body2">
          Total: <strong>₹{row.total_amount}</strong>
        </Typography>

        <Typography variant="body2">
          Payment Mode: <strong>{row.payment_mode}</strong>
        </Typography>

        <Typography variant="body2">
          Cash: <strong>₹{row.cash_amount}</strong>
        </Typography>

        <Typography variant="body2">
          UPI: <strong>₹{row.upi_amount}</strong>
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Time: {new Date(row.created_at).toLocaleTimeString()}
        </Typography>
      </Stack>

      {/* ACTION MENU */}
      <Popover
        open={!!openMenu}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { width: 140 } },
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

        <MenuItem
          onClick={() => setOpenDialog(true)}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      {/* DELETE CONFIRMATION */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Delete Sale</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete sale of{' '}
            <strong>{row.customer_name}</strong> (Cage: {row.cage_number})?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

UserCard.propTypes = {
  row: PropTypes.object,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
