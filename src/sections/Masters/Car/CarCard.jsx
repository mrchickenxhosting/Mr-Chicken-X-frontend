
import { useState } from 'react';
import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';
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

const API_BASE_URL = 'https://backend.poultrylink.tech';

export default function CarCard({
  row,
  onEdit,
  onEnable,
  onDisable,
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
    onDelete();
    setOpenDialog(false);
    handleCloseMenu();
  };

  const isActive = row.is_active;
  const hasRcBook = Boolean(row.rc_book_url);

  // Build RC Book URL without nested ternary.
  let rcBookUrl = '';

  if (hasRcBook) {
    if (/^https?:\/\//i.test(row.rc_book_url)) {
      rcBookUrl = row.rc_book_url;
    } else {
      const filePath = row.rc_book_url.startsWith('/')
        ? row.rc_book_url
        : `/${row.rc_book_url}`;

      rcBookUrl = `${API_BASE_URL}${filePath}`;
    }
  }

  const handleViewRcBook = () => {
    if (!rcBookUrl) return;

    window.open(rcBookUrl, '_blank', 'noopener,noreferrer');
  };

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
        <Stack spacing={0.8}>
          <Typography variant="subtitle1">
            {row.car_number}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Model: {row.model_name}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Max Capacity: {row.max_capacity_cages}
          </Typography>

          {/* Car Status */}
          <Chip
            label={isActive ? 'Active' : 'Disabled'}
            color={isActive ? 'success' : 'error'}
            size="small"
            variant="outlined"
            sx={{ width: 'fit-content', mt: 0.5 }}
          />

          {/* RC Book */}
          {hasRcBook ? (
            <Stack spacing={1} alignItems="flex-start">
              <Chip
                icon={<Iconify icon="eva:file-text-fill" />}
                label="RC Book Uploaded"
                color="success"
                size="small"
                variant="outlined"
              />

              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="eva:eye-fill" />}
                onClick={handleViewRcBook}
              >
                View RC Book
              </Button>
            </Stack>
          ) : (
            <Chip
              icon={<Iconify icon="eva:file-remove-outline" />}
              label="RC Book Not Uploaded"
              color="default"
              size="small"
              variant="outlined"
              sx={{ width: 'fit-content' }}
            />
          )}
        </Stack>

        <IconButton onClick={handleOpenMenu}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      {/* Action Menu */}
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
          paper: {
            sx: { width: 160 },
          },
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

      {/* Delete Confirmation */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Delete Car</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{row.car_number}</strong>?
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

CarCard.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onEnable: PropTypes.func.isRequired,
  onDisable: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
