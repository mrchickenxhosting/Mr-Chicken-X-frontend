
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
  onOpenBrokerDialog,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const sourceType = String(row.source_type || 'farmer').toLowerCase();
  const isBrokerTrip = sourceType === 'broker';
  const isDriverTrip = sourceType === 'driver';

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

    const location = row.farm_location || row.farmer_location;

    if (location) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        location
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

📍 Location: ${row.farm_location || row.farmer_location || '-'}

${getGoogleMapLink() ? `🗺️ Open in Maps: ${getGoogleMapLink()}` : ''}

👨‍🌾 Farmer: ${row.farmer_name || '-'}
📞 Farmer Contact: ${row.farmer_mobile || '-'}

🚛 Driver: ${row.driver_name || '-'}
📞 Driver Contact: ${row.driver_mobile || '-'}

${row.lifter_name ? `🧍 Lifter: ${row.lifter_name}
📞 Lifter Contact: ${row.lifter_mobile || '-'}` : ''}

${row.contact_name ? `👤 Contact Person: ${row.contact_name}
📞 Contact No: ${row.contact_phone || '-'}` : ''}

🐔 Total Birds: ${row.total_birds ?? '-'}

— Dispatch Team
`;

  const handleWhatsApp = () => {
    if (!row.driver_mobile) return;

    const phone = `91${String(row.driver_mobile).replace(/\D/g, '')}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(
      generateTripWhatsAppMessage()
    )}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderSource = () => {
    if (isBrokerTrip) {
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:people-fill" width={16} />
          <Typography variant="body2">
            <strong>Source: Broker</strong> — {row.broker_name || '-'}
            {' '}({row.broker_number || row.broker_mobile || '-'})
          </Typography>
        </Stack>
      );
    }

    if (isDriverTrip) {
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:car-fill" width={16} />
          <Typography variant="body2">
            <strong>Source: Driver</strong> — {row.source_driver_name || '-'}
            {' '}({row.source_driver_mobile || '-'})
          </Typography>
        </Stack>
      );
    }

    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Iconify icon="eva:home-fill" width={16} />
        <Typography variant="body2">
          <strong>Source: Farmer</strong> — {row.farmer_name || '-'}
          {' '}({row.farmer_mobile || '-'})
        </Typography>
      </Stack>
    );
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={1.5}>
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

        {/* SOURCE */}
        {renderSource()}

        {/* FARMER */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:home-fill" width={16} />
          <Typography variant="body2">
            <strong>Farmer:</strong> {row.farmer_name || '-'}
            {' '}({row.farmer_mobile || '-'})
          </Typography>
        </Stack>

        {/* DRIVER */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:car-fill" width={16} />
          <Typography variant="body2">
            <strong>Driver:</strong> {row.driver_name || '-'}
            {' '}({row.driver_mobile || '-'})
          </Typography>
        </Stack>

        {/* BROKER */}
        {isBrokerTrip && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="eva:people-fill" width={16} />
            <Typography variant="body2">
              <strong>Broker:</strong> {row.broker_name || '-'}
              {' '}({row.broker_number || row.broker_mobile || '-'})
            </Typography>
          </Stack>
        )}

        {/* LOCATION */}
        {(row.farm_location || row.farmer_location) && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="eva:pin-fill" width={16} />
            <Typography
              variant="body2"
              component={getGoogleMapLink() ? 'a' : 'span'}
              href={getGoogleMapLink() || undefined}
              target={getGoogleMapLink() ? '_blank' : undefined}
              rel={getGoogleMapLink() ? 'noopener noreferrer' : undefined}
              sx={{ textDecoration: 'none' }}
            >
              {row.farm_location || row.farmer_location}
            </Typography>
          </Stack>
        )}

        {/* CONTACT PERSON */}
        {row.contact_name && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="eva:person-fill" width={16} />
            <Typography variant="body2">
              <strong>Contact:</strong> {row.contact_name}
              {' '}({row.contact_phone || '-'})
            </Typography>
          </Stack>
        )}

        {/* BIRDS */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:cube-fill" width={16} />
          <Typography variant="body2">
            <strong>Birds:</strong> {row.total_birds ?? '-'}
          </Typography>
        </Stack>

        {/* APPROX RATE */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:pricetags-fill" width={16} />
          <Typography variant="body2">
            <strong>Approx Rate:</strong> {row.approx_rate ?? '-'}
          </Typography>
        </Stack>

        {/* ACTIONS */}
        {isBrokerTrip && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:external-link-fill" />}
            onClick={() => onOpenBrokerDialog(row)}
          >
            Open Broker Trip
          </Button>
        )}

        <Button
          size="small"
          variant="outlined"
          color="success"
          startIcon={<Iconify icon="logos:whatsapp-icon" />}
          disabled={row.status === 'CLOSED' || !row.driver_mobile}
          onClick={handleWhatsApp}
        >
          WhatsApp
        </Button>
      </Stack>

      {/* MENU */}
      <Popover
        open={Boolean(openMenu)}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 180 } }}
      >
        {isBrokerTrip && (
          <MenuItem
            onClick={() => {
              onOpenBrokerDialog(row);
              handleCloseMenu();
            }}
          >
            <Iconify icon="eva:external-link-fill" sx={{ mr: 2 }} />
            Open Broker Trip
          </MenuItem>
        )}

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
            onClick={() => {
              setOpenDialog(true);
              handleCloseMenu();
            }}
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

      {/* CLOSE CONFIRMATION */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Close Trip</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to close <strong>Trip #{row.id}</strong>?
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
  onOpenBrokerDialog: PropTypes.func,
};

TripCard.defaultProps = {
  onOpenBrokerDialog: () => {},
};
