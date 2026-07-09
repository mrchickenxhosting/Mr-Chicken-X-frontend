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

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function TripCard({
  row,
  onEdit,
  onCloseTrip,
  onDeleteTrip,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  const handleCloseConfirm = () => {
    onCloseTrip(row.id);
    setOpenDialog(false);
    handleCloseMenu();
  };

  const handleDelete = () => {
    onDeleteTrip(row.id);
    handleCloseMenu();
  };

  const statusColor = (status) => {
    switch (status) {
      case 'CREATED':
        return 'info';
      case 'IN_PROGRESS':
        return 'warning';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

    const getGoogleMapLink = () => {
  if (row.farmer_latitude && row.farmer_longitude) {
    return `https://www.google.com/maps?q=${row.farmer_latitude},${row.farmer_longitude}`;
  }

  // fallback: text search by address
  if (row.farmer_location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      row.farmer_location
    )}`;
  }

  return null;
};

  const generateTripWhatsAppMessage = () => `
🚚 *Trip Details*

📅 Date: ${
    row.trip_date
      ? new Date(row.trip_date).toLocaleDateString('en-IN')
      : '-'
  }
⏰ Time: ${row.trip_time || '-'}

📍 Location: ${row.farmer_location || '-'}

${
  getGoogleMapLink()
    ? `🗺️ Open in Maps: ${getGoogleMapLink()}`
    : ''
}
👨‍🌾 Farmer: ${row.farmer_name || '-'}
📞 Farmer Contact: ${row.farmer_mobile || '-'}

${
    row.contact_name
      ? `👤 Contact Person: ${row.contact_name}
📞 Contact No: ${row.contact_phone}`
      : ''
  }

🐔 Total Birds: ${row.total_birds}

— Dispatch Team
`;

  const handleWhatsApp = () => {
    if (!row.driver_mobile) return;
    const phone = `91${row.driver_mobile}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(
      generateTripWhatsAppMessage()
    )}`;
    window.open(url, '_blank');
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={1}>

        {/* HEADER */}
        <Stack direction="row" justifyContent="space-between">
          <Stack spacing={0.3}>
            <Typography variant="subtitle1">
              Trip #{row.id}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {row.trip_date
                ? new Date(row.trip_date).toLocaleDateString('en-IN')
                : '-'}{' '}
              | {row.trip_time || '-'}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Label variant="soft" color={statusColor(row.status)}>
              {row.status}
            </Label>

            <IconButton onClick={handleOpenMenu}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
        </Stack>

        {/* FARMER */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:home-fill" width={16} />
          <Typography variant="body2">
            <strong>Farmer:</strong> {row.farmer_name || '-'} ({row.farmer_mobile || '-'})
          </Typography>
        </Stack>

        {/* DRIVER */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:car-fill" width={16} />
          <Typography variant="body2">
            <strong>Driver:</strong> {row.driver_name || '-'} ({row.driver_mobile || '-'})
          </Typography>
        </Stack>

        {/* CONTACT PERSON */}
        {row.contact_name && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="eva:person-fill" width={16} />
            <Typography variant="body2">
              <strong>Contact:</strong> {row.contact_name} ({row.contact_phone})
            </Typography>
          </Stack>
        )}

        {/* BIRDS */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:cube-fill" width={16} />
          <Typography variant="body2">
            <strong>Birds:</strong> {row.total_birds}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:cube-fill" width={16} />
          <Typography variant="body2">
            <strong>Approx Rate:</strong> {row.approx_rate}
          </Typography>
        </Stack>

        {/* WHATSAPP */}
        <Button
          size="small"
          variant="outlined"
          color="success"
          startIcon={<Iconify icon="logos:whatsapp-icon" />}
          disabled={row.status === 'CLOSED'}
          onClick={handleWhatsApp}
        >
          WhatsApp
        </Button>
      </Stack>

      {/* ================= MENU ================= */}

      <Popover
        open={Boolean(openMenu)}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 180 } } }}
      >
        <MenuItem
          onClick={() => {
            onEdit(row);
            handleCloseMenu();
          }}
          disabled={row.status !== 'CREATED'}
        >
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit Trip
        </MenuItem>

        {row.status === 'IN_PROGRESS' && (
          <MenuItem
            onClick={() => setOpenDialog(true)}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ mr: 2 }} />
            Close Trip
          </MenuItem>
        )}

        {row.status === 'CREATED' && (
          <MenuItem
            onClick={handleDelete}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
            Delete Trip
          </MenuItem>
        )}
      </Popover>

      {/* ================= CLOSE CONFIRM ================= */}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Close Trip</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to close
            <strong> Trip #{row.id}</strong>?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>

          <Button
            color="success"
            variant="contained"
            onClick={handleCloseConfirm}
          >
            Close Trip
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

// ----------------------------------------------------------------------

TripCard.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCloseTrip: PropTypes.func.isRequired,
  onDeleteTrip: PropTypes.func.isRequired,
};
