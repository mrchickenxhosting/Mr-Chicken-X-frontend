import { useState } from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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

export default function UserCard({
  row,
  onEdit,
  onEnable,
  onDisable,
  onDelete,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const isActive = row.status;
  const hasCoords = row.latitude && row.longitude;

  return (
    <Card
      sx={{
        p: 2,
        opacity: isActive ? 1 : 0.6,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        {/* LEFT CONTENT */}
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">{row.name}</Typography>

          <Typography variant="body2" color="text.secondary">
            📞 {row.mobile}
          </Typography>

          {/* LOCATION + MAP PIN */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              📍 {row.location || '-'}
            </Typography>

            {hasCoords && (
              <IconButton
                size="small"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${row.latitude},${row.longitude}`,
                    '_blank'
                  )
                }
                title="View on map"
              >
                <Iconify icon="eva:pin-fill" width={18} />
              </IconButton>
            )}
          </Stack>

          {/* STATUS */}
          <Chip
            label={isActive ? 'Active' : 'Disabled'}
            color={isActive ? 'success' : 'error'}
            size="small"
            variant="outlined"
            sx={{ width: 'fit-content', mt: 0.5 }}
          />
        </Stack>

        {/* ACTION MENU */}
        <IconButton onClick={(e) => setOpenMenu(e.currentTarget)}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      {/* MENU */}
      <Popover
        open={Boolean(openMenu)}
        anchorEl={openMenu}
        onClose={() => setOpenMenu(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 160 } }}
      >
        <MenuItem
          onClick={() => {
            onEdit(row);
            setOpenMenu(null);
          }}
        >
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        {isActive ? (
          <MenuItem
            onClick={() => {
              onDisable();
              setOpenMenu(null);
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
              setOpenMenu(null);
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ mr: 2 }} />
            Enable
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            setOpenDialog(true);
            setOpenMenu(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      {/* DELETE CONFIRMATION */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Delete Farmer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{row.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              onDelete();
              setOpenDialog(false);
            }}
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
};
