
import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Stack,
  Button,
  Popover,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// IMPORTANT:
// Change this import to the actual location of your existing
// authenticated API service if its path or export differs.
import { getTripDC } from 'src/services/Trader.service';

// ----------------------------------------------------------------------

export default function TripTableRow({
  row,
  onEdit,
  onDelete,
  onClose,
  onOpenBrokerDialog,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const sourceType = String(row.source_type || 'farmer').toLowerCase();

  const isBrokerTrip = sourceType === 'broker';
  const isDriverTrip = sourceType === 'driver';

  // ----------------------------------------------------------------------
  // Source-specific row colors
  // ----------------------------------------------------------------------

  const getTripRowColor = () => {
    switch (sourceType) {
      case 'farmer':
        return 'rgba(46, 125, 50, 0.07)';
      case 'driver':
        return 'rgba(25, 118, 210, 0.07)';
      case 'broker':
        return 'rgba(237, 108, 2, 0.08)';
      default:
        return 'transparent';
    }
  };

  const getTripRowHoverColor = () => {
    switch (sourceType) {
      case 'farmer':
        return 'rgba(46, 125, 50, 0.13)';
      case 'driver':
        return 'rgba(25, 118, 210, 0.13)';
      case 'broker':
        return 'rgba(237, 108, 2, 0.14)';
      default:
        return undefined;
    }
  };

  // ----------------------------------------------------------------------
  // Google Maps link
  // ----------------------------------------------------------------------

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

  // ----------------------------------------------------------------------
  // WhatsApp message
  // ----------------------------------------------------------------------

  const generateTripWhatsAppMessage = () => `
🚚 *ટ્રિપ વિગત*

📅 તારીખ: ${
    row.trip_date
      ? new Date(row.trip_date).toLocaleDateString('en-IN')
      : '-'
  }
⏰ સમય: ${row.trip_time || '-'}
📍 સ્થળ: ${row.farm_location || row.farmer_location || '-'}
${getGoogleMapLink() ? `🗺️ નકશામાં ખોલો: ${getGoogleMapLink()}` : ''}
👨‍🌾 ખેડૂત: ${row.farmer_name || '-'}
📞 ખેડૂત સંપર્ક: ${row.farmer_mobile || '-'}
🚛 ડ્રાઈવર: ${row.driver_name || '-'}
📞 ડ્રાઈવર સંપર્ક: ${row.driver_mobile || '-'}

${
  row.lifter_name
    ? `🧍 લિફ્ટર: ${row.lifter_name}
📞 લિફ્ટર સંપર્ક: ${row.lifter_mobile || '-'}`
    : ''
}

${
  row.contact_name
    ? `👤 સંપર્ક વ્યક્તિ: ${row.contact_name}
📞 સંપર્ક નંબર: ${row.contact_phone || '-'}`
    : ''
}

🐔 કુલ પક્ષીઓ: ${row.total_birds ?? '-'}

— Dispatch Team

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

${
  row.lifter_name
    ? `🧍 Lifter: ${row.lifter_name}
📞 Lifter Contact: ${row.lifter_mobile || '-'}`
    : ''
}

${
  row.contact_name
    ? `👤 Contact Person: ${row.contact_name}
📞 Contact No: ${row.contact_phone || '-'}`
    : ''
}

🐔 Total Birds: ${row.total_birds ?? '-'}

— Dispatch Team
`;

  const handleWhatsAppClick = () => {
    if (!row.driver_mobile) return;

    const phone = `91${String(row.driver_mobile).replace(/\D/g, '')}`;
    const message = generateTripWhatsAppMessage();
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ----------------------------------------------------------------------
  // Delivery Challan HTML helpers
  // ----------------------------------------------------------------------

  const escapeHtml = (value) =>
    String(value ?? '-').replace(/[&<>"']/g, (char) => {
      const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entities[char];
    });

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });

  // ----------------------------------------------------------------------
  // Show / Download DC
  // ----------------------------------------------------------------------

  const handleShowDC = async () => {
    if (row.status !== 'CLOSED') return;

    // Open synchronously from the click to avoid popup blocking.
    const dcWindow = window.open('', '_blank');

    if (!dcWindow) {
      window.alert('Please allow pop-ups to open the Delivery Challan.');
      return;
    }

    dcWindow.document.open();
    dcWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Delivery Challan - Trip #${escapeHtml(row.id)}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 32px;
              background: #080808;
              color: #f5f5f5;
              font-family: Arial, Helvetica, sans-serif;
            }
            .container { max-width: 1000px; margin: 0 auto; }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
              flex-wrap: wrap;
            }
            h1 { margin: 0 0 8px; font-size: 30px; }
            h2 { margin-top: 32px; }
            .muted { color: #aaa; }
            .actions { display: flex; gap: 10px; margin: 24px 0; }
            button {
              padding: 12px 18px;
              border: 0;
              border-radius: 7px;
              font-weight: bold;
              cursor: pointer;
            }
            .print { background: #fff; color: #111; }
            .close { background: #292929; color: #fff; }
            .summary {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 16px;
              margin: 26px 0;
            }
            .card {
              background: #171717;
              border: 1px solid #333;
              border-radius: 10px;
              padding: 20px;
            }
            .value {
              font-size: 26px;
              font-weight: bold;
              margin-top: 10px;
              overflow-wrap: anywhere;
            }
            .table-wrap { overflow-x: auto; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td {
              padding: 14px;
              border-bottom: 1px solid #333;
              text-align: left;
            }
            th { background: #202020; }
            .right { text-align: right; }
            .error { color: #ff8888; }
            .footer {
              margin-top: 35px;
              border-top: 1px solid #333;
              padding-top: 16px;
              color: #aaa;
              font-size: 12px;
            }
            @media (max-width: 600px) {
              body { padding: 16px; }
              .summary { grid-template-columns: 1fr; }
            }
            @media print {
              body { background: #fff; color: #111; padding: 0; }
              .actions { display: none; }
              .card, th { background: #fff; color: #111; }
              .card, th, td { border-color: #bbb; }
              .muted, .footer { color: #555; }
              .table-wrap { overflow: visible; }
              tr { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <main class="container">
            <div class="header">
              <div>
                <h1>Delivery Challan</h1>
                <div class="muted">Trip #${escapeHtml(row.id)}</div>
              </div>
              <div class="muted">Status: CLOSED</div>
            </div>
            <div class="actions">
              <button class="print" onclick="window.print()">
                Print / Save as PDF
              </button>
              <button class="close" onclick="window.close()">Close</button>
            </div>
            <p>Loading Delivery Challan details...</p>
          </main>
        </body>
      </html>
    `);
    dcWindow.document.close();

    try {
      const response = await getTripDC(row.id);
      const dc = response?.data || response;

      if (dc?.success === false) {
        throw new Error(dc.message || 'Unable to load Delivery Challan.');
      }

      const cages = Array.isArray(dc?.cages) ? dc.cages : [];

      const cageRows = cages
        .map(
          (cage) => `
            <tr>
              <td>${escapeHtml(cage.cage_number)}</td>
              <td class="right">${formatNumber(cage.total_birds)}</td>
              <td class="right">${formatNumber(cage.total_weight)}</td>
            </tr>
          `
        )
        .join('');

      const date = row.trip_date
        ? new Date(row.trip_date).toLocaleDateString('en-IN')
        : '-';

      const totalCages = Number(dc?.total_cages ?? cages.length);
      const totalBirds = Number(
        dc?.total_birds ??
          cages.reduce((sum, cage) => sum + Number(cage.total_birds || 0), 0)
      );
      const totalWeight = Number(
        dc?.total_weight ??
          cages.reduce((sum, cage) => sum + Number(cage.total_weight || 0), 0)
      );

      if (dcWindow.closed) return;

      dcWindow.document.open();
      dcWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Delivery Challan - Trip #${escapeHtml(row.id)}</title>
            <style>
              * { box-sizing: border-box; }
              body {
                margin: 0;
                padding: 32px;
                background: #080808;
                color: #f5f5f5;
                font-family: Arial, Helvetica, sans-serif;
              }
              .container { max-width: 1000px; margin: 0 auto; }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 16px;
                flex-wrap: wrap;
              }
              h1 { margin: 0 0 8px; font-size: 30px; }
              h2 { margin-top: 32px; }
              .muted { color: #aaa; }
              .actions { display: flex; gap: 10px; margin: 24px 0; }
              button {
                padding: 12px 18px;
                border: 0;
                border-radius: 7px;
                font-weight: bold;
                cursor: pointer;
              }
              .print { background: #fff; color: #111; }
              .close { background: #292929; color: #fff; }
              .summary {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 16px;
                margin: 26px 0;
              }
              .card {
                background: #171717;
                border: 1px solid #333;
                border-radius: 10px;
                padding: 20px;
              }
              .value {
                font-size: 26px;
                font-weight: bold;
                margin-top: 10px;
                overflow-wrap: anywhere;
              }
              .table-wrap { overflow-x: auto; }
              table { width: 100%; border-collapse: collapse; margin-top: 18px; }
              th, td {
                padding: 14px;
                border-bottom: 1px solid #333;
                text-align: left;
              }
              th { background: #202020; }
              .right { text-align: right; }
              .empty { color: #aaa; text-align: center; }
              .footer {
                margin-top: 35px;
                border-top: 1px solid #333;
                padding-top: 16px;
                color: #aaa;
                font-size: 12px;
              }
              @media (max-width: 600px) {
                body { padding: 16px; }
                .summary { grid-template-columns: 1fr; }
              }
              @media print {
                body { background: #fff; color: #111; padding: 0; }
                .actions { display: none; }
                .card, th { background: #fff; color: #111; }
                .card, th, td { border-color: #bbb; }
                .muted, .footer { color: #555; }
                .table-wrap { overflow: visible; }
                tr { break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <main class="container">
              <div class="header">
                <div>
                  <h1>Delivery Challan</h1>
                  <div class="muted">Trip #${escapeHtml(row.id)}</div>
                  <div class="muted">Trip Date: ${escapeHtml(date)}</div>
                </div>
                <div class="muted">Status: CLOSED</div>
              </div>

              <div class="actions">
                <button class="print" onclick="window.print()">
                  Print / Save as PDF
                </button>
                <button class="close" onclick="window.close()">Close</button>
              </div>

              <div class="summary">
                <section class="card">
                  <div class="muted">Total Cages</div>
                  <div class="value">${formatNumber(totalCages)}</div>
                </section>
                <section class="card">
                  <div class="muted">Total Birds</div>
                  <div class="value">${formatNumber(totalBirds)}</div>
                </section>
                <section class="card">
                  <div class="muted">Total Weight</div>
                  <div class="value">${formatNumber(totalWeight)}</div>
                </section>
              </div>

              <h2>Cage Details</h2>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Cage Number</th>
                      <th class="right">Bird Count</th>
                      <th class="right">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      cageRows ||
                      '<tr><td colspan="3" class="empty">No cage records found for this trip.</td></tr>'
                    }
                    ${
                      cages.length
                        ? `
                          <tr>
                            <th>Total</th>
                            <th class="right">${formatNumber(totalBirds)}</th>
                            <th class="right">${formatNumber(totalWeight)}</th>
                          </tr>
                        `
                        : ''
                    }
                  </tbody>
                </table>
              </div>

              <div class="footer">
                Generated from Mr Chicken X · Trip #${escapeHtml(row.id)}
              </div>
            </main>
          </body>
        </html>
      `);
      dcWindow.document.close();
    } catch (error) {
      console.error('Failed to load Delivery Challan:', error);

      if (!dcWindow.closed) {
        dcWindow.document.open();
        dcWindow.document.write(`
          <!DOCTYPE html>
          <html lang="en">
            <head><title>Delivery Challan Error</title></head>
            <body style="background:#080808;color:#fff;font-family:Arial;padding:32px">
              <h2>Unable to load Delivery Challan</h2>
              <p>${escapeHtml(error.message || 'Please try again.')}</p>
              <button onclick="window.close()">Close</button>
            </body>
          </html>
        `);
        dcWindow.document.close();
      }
    }
  };

  // ----------------------------------------------------------------------
  // Broker trip
  // ----------------------------------------------------------------------

  const canOpenBrokerTrip = isBrokerTrip && row.status === 'CREATED';

  // ----------------------------------------------------------------------
  // Status label colors
  // ----------------------------------------------------------------------

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

  // ----------------------------------------------------------------------
  // Trip source details
  // ----------------------------------------------------------------------

  const renderSource = () => {
    if (isBrokerTrip) {
      return (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">
            🤝 {row.broker_name || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            📞 {row.broker_number || row.broker_mobile || '-'}
          </Typography>
          <Typography variant="caption" color="info.main">
            Source: Broker
          </Typography>
        </Stack>
      );
    }

    if (isDriverTrip) {
      return (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2">
            🚛 {row.source_driver_name || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            📞 {row.source_driver_mobile || '-'}
          </Typography>
          <Typography variant="caption" color="warning.main">
            Source: Driver
          </Typography>
        </Stack>
      );
    }

    return (
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">
          👨‍🌾 {row.farmer_name || '-'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          📞 {row.farmer_mobile || '-'}
        </Typography>

        {(row.farm_location || row.farmer_location) && (
          <Typography
            component={getGoogleMapLink() ? 'a' : 'span'}
            href={getGoogleMapLink() || undefined}
            target={getGoogleMapLink() ? '_blank' : undefined}
            rel={getGoogleMapLink() ? 'noopener noreferrer' : undefined}
            variant="caption"
            color={getGoogleMapLink() ? 'primary' : 'text.secondary'}
            sx={{
              display: 'block',
              maxWidth: 180,
              textDecoration: 'none',
            }}
          >
            📍 {row.farm_location || row.farmer_location}
          </Typography>
        )}

        <Typography variant="caption" color="success.main">
          Source: Farmer
        </Typography>
      </Stack>
    );
  };

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------

  return (
    <>
      <TableRow
        hover
        tabIndex={-1}
        sx={{
          backgroundColor: getTripRowColor(),
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: getTripRowHoverColor(),
          },
          '& > .MuiTableCell-root': {
            transition: 'background-color 0.2s ease',
          },
        }}
      >
        <TableCell>#{row.id}</TableCell>

        <TableCell>
          {row.trip_date
            ? new Date(row.trip_date).toLocaleDateString('en-IN')
            : '-'}
        </TableCell>

        <TableCell>{row.trip_time || '-'}</TableCell>

        <TableCell>{renderSource()}</TableCell>

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
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">
              {row.broker_name || '-'}
            </Typography>
            {(row.broker_number || row.broker_mobile) && (
              <Typography variant="caption" color="text.secondary">
                📞 {row.broker_number || row.broker_mobile}
              </Typography>
            )}
          </Stack>
        </TableCell>

        <TableCell>
          {row.contact_name ? (
            <Stack spacing={0.3}>
              <Typography variant="subtitle2">
                {row.contact_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.contact_phone || '-'}
              </Typography>
            </Stack>
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell>{row.total_birds ?? '-'}</TableCell>

        <TableCell>{row.approx_rate ?? '-'}</TableCell>

        <TableCell>
          <Label variant="soft" color={statusColor(row.status)}>
            {row.status}
          </Label>
        </TableCell>

        <TableCell>
          <Stack spacing={1} alignItems="flex-start">
            {canOpenBrokerTrip && (
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
              onClick={handleWhatsAppClick}
            >
              WhatsApp
            </Button>
          </Stack>
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
        PaperProps={{ sx: { width: 200 } }}
      >
        {canOpenBrokerTrip && (
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

        {row.status === 'CLOSED' && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              handleShowDC();
            }}
          >
            <Iconify icon="eva:printer-fill" sx={{ mr: 2 }} />
            Show / Download DC
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
              onClose(row);
              handleCloseMenu();
            }}
          >
            <Iconify
              icon="eva:checkmark-circle-2-fill"
              sx={{ mr: 2 }}
            />
            Close Trip
          </MenuItem>
        )}

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
  onOpenBrokerDialog: PropTypes.func,
};

TripTableRow.defaultProps = {
  onOpenBrokerDialog: () => {},
};
