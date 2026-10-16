import { useState } from 'react';
import PropTypes from 'prop-types';

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

// ----------------------------------------------------------------------

export default function BrokerCard({ row, onEdit, onDelete }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  const handleDeleteConfirm = () => {
    onDelete(row.id);
    setOpenDialog(false);
    handleCloseMenu();
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
            {row.name || 'Unnamed Broker'}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify
              icon="eva:phone-fill"
              sx={{ color: 'text.secondary', width: 18, height: 18 }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: 'anywhere' }}
            >
              {row.number || 'No mobile number'}
            </Typography>
          </Stack>

          {row.created_at && (
            <Typography variant="caption" color="text.disabled">
              Added: {new Date(row.created_at).toLocaleDateString()}
            </Typography>
          )}
        </Stack>

        <IconButton
          onClick={handleOpenMenu}
          aria-label={`Actions for ${row.name || 'broker'}`}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      {/* ACTION MENU */}
      <Popover
        open={Boolean(openMenu)}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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

        <MenuItem
          onClick={() => {
            setOpenDialog(true);
            handleCloseMenu();
          }}
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
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Broker</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{row.name || 'this broker'}</strong>? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>

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

BrokerCard.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};