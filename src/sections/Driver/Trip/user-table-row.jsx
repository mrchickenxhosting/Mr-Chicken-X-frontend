import { useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function TripTableRow({
  row,
  onEdit,
  onDelete,
  onClose,
}) {
  console.log(row)
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
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
🚚 *ટ્રિપ વિગત*

📅 તારીખ: ${
  row.trip_date
    ? new Date(row.trip_date).toLocaleDateString('en-IN')
    : '-'
}
⏰ સમય: ${row.trip_time || '-'}

📍 સ્થળ: ${row.farm_location || '-'}

${
  getGoogleMapLink()
    ? `🗺️ નકશામાં ખોલો: ${getGoogleMapLink()}`
    : ''
}

👨‍🌾 ખેડૂત: ${row.farmer_name || '-'}
📞 ખેડૂત સંપર્ક: ${row.farmer_mobile || '-'}

🚛 ડ્રાઈવર: ${row.driver_name || '-'}
📞 ડ્રાઈવર સંપર્ક: ${row.driver_mobile || '-'}

${
  row.lifter_name
    ? `🧍 લિફ્ટર: ${row.lifter_name}
📞 લિફ્ટર સંપર્ક: ${row.lifter_mobile}`
    : ''
}

${
  row.contact_name
    ? `👤 સંપર્ક વ્યક્તિ: ${row.contact_name}
📞 સંપર્ક નંબર: ${row.contact_phone}`
    : ''
}

🐔 કુલ પક્ષીઓ: ${row.total_birds}

કૃપા કરીને સમયસર પહોંચો અને લોડિંગ પછી સ્ટેટસ અપડેટ કરો.

— Dispatch Team


🚚 *Trip Details*

📅 Date: ${
  row.trip_date
    ? new Date(row.trip_date).toLocaleDateString('en-IN')
    : '-'
}
⏰ Time: ${row.trip_time || '-'}

📍 Location: ${row.farm_location || '-'}

${
  getGoogleMapLink()
    ? `🗺️ Open in Maps: ${getGoogleMapLink()}`
    : ''
}

👨‍🌾 Farmer: ${row.farmer_name || '-'}
📞 Farmer Contact: ${row.farmer_mobile || '-'}

🚛 Driver: ${row.driver_name || '-'}
📞 Driver Contact: ${row.driver_mobile || '-'}

${
  row.lifter_name
    ? `🧍 Lifter: ${row.lifter_name}
📞 Lifter Contact: ${row.lifter_mobile}`
    : ''
}

${
  row.contact_name
    ? `👤 Contact Person: ${row.contact_name}
📞 Contact No: ${row.contact_phone}`
    : ''
}

🐔 Total Birds: ${row.total_birds}

Please reach on time and update status after loading.

— Dispatch Team
`;


  const handleWhatsAppClick = () => {
    if (!row.driver_mobile) return;

    const phone = `91${row.driver_mobile}`;
    const message = generateTripWhatsAppMessage();
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
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

  return (
    <>
      <TableRow hover tabIndex={-1}>

        <TableCell>#{row.id}</TableCell>

        <TableCell>
          {row.trip_date
            ? new Date(row.trip_date).toLocaleDateString('en-IN')
            : '-'}
        </TableCell>

        <TableCell>{row.trip_time || '-'}</TableCell>

<TableCell>
  <Stack spacing={0.3}>
    <Typography variant="subtitle2">
      {row.farmer_name || '-'}
    </Typography>

    <Typography variant="caption" color="text.secondary">
      📞 {row.farmer_mobile || ''}
    </Typography>

{row.farm_location && (
  row.farm_latitude && row.farm_longitude ? (
    <Typography
      component="a"
      href={`https://www.google.com/maps?q=${row.farm_latitude},${row.farm_longitude}`}
      target="_blank"
      rel="noopener noreferrer"
      variant="caption"
      color="primary"
      sx={{
        display: 'block',
        maxWidth: 180,
        textDecoration: 'none',
      }}
    >
      📍 {row.farm_location}
    </Typography>
  ) : (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', maxWidth: 180 }}
    >
      📍 {row.farm_location}
    </Typography>
  )
)}

  </Stack>
</TableCell>

        <TableCell>
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">
              {row.driver_name || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.driver_mobile || ''}
            </Typography>
          </Stack>
        </TableCell>

                <TableCell>
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">
              {row.lifter_name || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.lifter_mobile || ''}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>
          {row.contact_name ? (
            <Stack spacing={0.3}>
              <Typography variant="subtitle2">
                {row.contact_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.contact_phone}
              </Typography>
            </Stack>
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell>{row.total_birds}</TableCell>

        <TableCell>
          <Label variant="soft" color={statusColor(row.status)}>
            {row.status}
          </Label>
        </TableCell>

        <TableCell>
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<Iconify icon="logos:whatsapp-icon" />}
            disabled={row.status === 'CLOSED'}
            onClick={handleWhatsAppClick}
          >
            WhatsApp
          </Button>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>

      </TableRow>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 180 } }}
      >
        {/* EDIT */}
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

        {/* CLOSE */}
        {row.status === 'IN_PROGRESS' && (
          <MenuItem
            onClick={() => {
              onClose(row);
              handleCloseMenu();
            }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ mr: 2 }} />
            Close Trip
          </MenuItem>
        )}

        {/* DELETE */}
        {row.status === 'CREATED' && (
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              onDelete(row);
              handleCloseMenu();
            }}
          >
            <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
            Delete Trip
          </MenuItem>
        )}
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

TripTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
