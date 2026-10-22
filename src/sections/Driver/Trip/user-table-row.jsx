
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
    if (String(row.status || '').toUpperCase() !== 'CLOSED') return;

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
            body{margin:0;padding:32px;background:#080808;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif}
            .container{max-width:1000px;margin:0 auto}.muted{color:#aaa}
            .header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
            h1{margin:0 0 8px;font-size:30px}.actions{display:flex;gap:10px;margin:24px 0}
            button{padding:12px 18px;border:0;border-radius:7px;font-weight:bold;cursor:pointer}
            .print{background:#fff;color:#111}.close{background:#292929;color:#fff}
            .details,.summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:24px 0}
            .summary{grid-template-columns:repeat(3,minmax(0,1fr))}
            .card{background:#171717;border:1px solid #333;border-radius:10px;padding:16px;min-width:0}
            .label{color:#aaa;font-size:12px;margin-bottom:7px}.value{font-size:18px;font-weight:bold;overflow-wrap:anywhere}
            .summary .value{font-size:26px;margin-top:10px}.table-wrap{overflow-x:auto}
            table{width:100%;border-collapse:collapse;margin-top:18px}th,td{padding:13px;border-bottom:1px solid #333;text-align:left}
            th{background:#202020}.right{text-align:right}.empty{color:#aaa;text-align:center}
            .footer{margin-top:35px;border-top:1px solid #333;padding-top:16px;color:#aaa;font-size:12px}
            @media(max-width:600px){body{padding:16px}.details,.summary{grid-template-columns:1fr}}
            @media print{body{background:#fff;color:#111;padding:0}.actions{display:none}.card,th{background:#fff;color:#111}.card,th,td{border-color:#bbb}.muted,.label,.footer{color:#555}.table-wrap{overflow:visible}tr{break-inside:avoid}}
          </style>
        </head>
        <body><main class="container"><h1>Delivery Challan</h1><p>Loading trip details...</p></main></body>
      </html>
    `);
    dcWindow.document.close();

    try {
      const response = await getTripDC(row.id);
      // Supports Axios response, { success, data }, or a direct payload.
      const responseBody = response?.data ?? response;
      if (responseBody?.success === false) {
        throw new Error(responseBody.message || 'Unable to load Delivery Challan.');
      }
      const dc = responseBody?.data ?? responseBody;
      if (!dc || typeof dc !== 'object') {
        throw new Error('The server returned an invalid Delivery Challan response.');
      }

      const cages = Array.isArray(dc.cages) ? dc.cages : [];
      const rawDate = dc.trip_date || row.trip_date;
      const date = rawDate && !Number.isNaN(new Date(rawDate).getTime())
        ? new Date(rawDate).toLocaleDateString('en-IN')
        : '-';
      const rawTime = String(dc.trip_time || row.trip_time || '').trim();
      const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      const time = timeMatch
        ? new Date(2000, 0, 1, Number(timeMatch[1]), Number(timeMatch[2])).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : (rawTime || '-');

      const totalCages = Number(dc.total_cages ?? cages.length);
      const totalBirds = Number(dc.total_birds ?? cages.reduce((sum, cage) => sum + Number(cage.total_birds || 0), 0));
      const totalWeight = Number(dc.total_weight ?? cages.reduce((sum, cage) => sum + Number(cage.total_weight || 0), 0));
      const groupsPerRow = 3;
      const cageGridRows = [];
      for (let i = 0; i < cages.length; i += groupsPerRow) {
        const group = cages.slice(i, i + groupsPerRow);
        cageGridRows.push(`<tr>${Array.from({ length: groupsPerRow }, (_, j) => {
          const cage = group[j];
          return cage
            ? `<td class="cage-no">${escapeHtml(cage.cage_number)}</td><td class="num">${formatNumber(cage.total_birds)}</td><td class="num">${formatNumber(cage.total_weight)}</td>`
            : '<td></td><td></td><td></td>';
        }).join('')}</tr>`);
      }
      const cageTableRows = cageGridRows.join('');
      const tripId = dc.trip_id ?? row.id;
      const companyName = dc.trader_name || 'BIRD SUPPLIER';
      const sourceName = dc.farmer_name || (String(row.source_type || '').toLowerCase() === 'broker' ? (row.broker_name || '-') : '-');
      const sourcePhone = dc.farmer_number || '-';
      const location = dc.farm_location || row.farm_location || row.farmer_location || '-';

      if (dcWindow.closed) return;
      dcWindow.document.open();
      dcWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Bird Challan - Trip #${escapeHtml(tripId)}</title>
            <style>
              *{box-sizing:border-box}body{margin:0;background:#e9e9e9;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:12px}
              .sheet{width:100%;max-width:1100px;margin:18px auto;background:#fff;padding:22px 26px;border:1px solid #ccc}
              .topline{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:2px solid #222;padding-bottom:10px}
              .copy{font-size:10px;font-weight:bold;border:1px solid #555;padding:4px 7px;text-transform:uppercase}
              .brand{text-align:center;flex:1}.brand h1{font-size:24px;margin:0 0 4px;letter-spacing:.4px;text-transform:uppercase}.brand h2{font-size:16px;margin:0 0 5px;text-transform:uppercase}.brand p{margin:2px 0;font-size:10px}
              .challan-no{min-width:130px;border:1px solid #555;padding:8px;line-height:1.8}.challan-no strong{font-size:13px}
              .doc-title{text-align:center;font-weight:bold;font-size:15px;letter-spacing:.8px;margin:12px 0;background:#eee;border:1px solid #aaa;padding:7px;text-transform:uppercase}
              .meta{display:grid;grid-template-columns:1.5fr 1fr;gap:12px;margin-bottom:10px}.meta-table{width:100%;border-collapse:collapse}.meta-table td{border:1px solid #777;padding:5px 7px;vertical-align:top}.meta-table td:first-child{width:42%;font-weight:bold;background:#f7f7f7}
              .section-title{font-size:11px;font-weight:bold;text-transform:uppercase;margin:10px 0 4px}
              .cage-table{width:100%;border-collapse:collapse;table-layout:fixed}.cage-table th,.cage-table td{border:1px solid #555;padding:5px 4px;height:24px}.cage-table th{background:#eee;text-align:center;font-size:10px}.cage-table td{font-size:11px}.cage-table .cage-no{text-align:center;width:6%;font-weight:800;background:#f1f1f1;font-size:12px}.cage-table .num{text-align:right;width:10%;font-variant-numeric:tabular-nums}
              .totals{display:grid;grid-template-columns:1.15fr 1fr;gap:14px;margin-top:12px}.totals-table{width:100%;border-collapse:collapse}.totals-table td{border:1px solid #777;padding:7px}.totals-table td:first-child{font-weight:bold;background:#f7f7f7;width:55%}.grand-total{font-size:15px;font-weight:bold}
              .signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:24px}.signature{border-top:1px solid #555;padding-top:6px;text-align:center;min-height:36px;font-weight:bold;font-size:10px}
              .actions{display:flex;justify-content:center;gap:10px;margin:0 auto 16px}.actions button{padding:10px 16px;border:0;border-radius:4px;font-weight:bold;cursor:pointer}.print{background:#111;color:#fff}.close{background:#ddd;color:#111}
              .small{font-size:10px;color:#444}.nowrap{white-space:nowrap}
              @media(max-width:700px){.sheet{margin:0;padding:12px}.brand h1{font-size:17px}.brand h2{font-size:13px}.challan-no{min-width:95px}.meta{grid-template-columns:1fr}.cage-table th,.cage-table td{padding:3px 2px;font-size:9px}.totals{grid-template-columns:1fr}}
              @media print{body{background:#fff;font-size:10px}.sheet{max-width:none;width:100%;margin:0;padding:8mm;border:0}.actions{display:none}.doc-title,.cage-table th,.meta-table td:first-child,.totals-table td:first-child{-webkit-print-color-adjust:exact;print-color-adjust:exact}tr{break-inside:avoid}.sheet{break-after:avoid}}
            </style>
          </head>
          <body>
            <div class="actions"><button class="print" onclick="window.print()">Print / Save as PDF</button><button class="close" onclick="window.close()">Close</button></div>
            <main class="sheet">
              <div class="topline">
                <div class="copy">Office Copy</div>
                <div class="brand">
                  <h1>${escapeHtml(companyName)}</h1>
                  <h2>Bird Delivery Challan</h2>
                  <p>Trip and cage-wise bird details</p>
                </div>
                <div class="challan-no">Challan No.<br/><strong>${escapeHtml(tripId)}</strong><br/>Status: ${escapeHtml(dc.status || row.status || 'CLOSED')}</div>
              </div>
              <div class="doc-title">Bird Dispatch / Ready Bird Challan</div>
              <div class="meta">
                <table class="meta-table">
                  <tr><td>Trader / Supplier</td><td>${escapeHtml(dc.trader_name || companyName)}</td></tr>
                  <tr><td>Trader Contact</td><td>${escapeHtml(dc.trader_number || '-')}</td></tr>
                  <tr><td>Farmer / Source</td><td>${escapeHtml(sourceName)}</td></tr>
                  <tr><td>Farmer Contact</td><td>${escapeHtml(sourcePhone)}</td></tr>
                  <tr><td>Farm Location</td><td>${escapeHtml(location)}</td></tr>
                </table>
                <table class="meta-table">
                  <tr><td>Trip No.</td><td>${escapeHtml(tripId)}</td></tr>
                  <tr><td>Date</td><td>${escapeHtml(date)}</td></tr>
                  <tr><td>Trip Time</td><td>${escapeHtml(time)}</td></tr>
                  <tr><td>Driver Name</td><td>${escapeHtml(dc.driver_name || row.driver_name || '-')}</td></tr>
                  <tr><td>Driver Contact</td><td>${escapeHtml(dc.driver_number || row.driver_mobile || '-')}</td></tr>
                </table>
              </div>
              <div class="section-title">Cage-wise Bird and Weight Details</div>
              <table class="cage-table">
                <thead><tr>
                  <th>Cage</th><th>Birds</th><th>Weight (kg)</th>
                  <th>Cage</th><th>Birds</th><th>Weight (kg)</th>
                  <th>Cage</th><th>Birds</th><th>Weight (kg)</th>
                </tr></thead>
                <tbody>
                  ${cageTableRows || '<tr><td colspan="9" style="text-align:center">No cage records found for this trip.</td></tr>'}
                </tbody>
              </table>
              <div class="totals">
                <table class="totals-table">
                  <tr><td>Total Cages</td><td>${formatNumber(totalCages)}</td></tr>
                  <tr><td>Total Birds</td><td>${formatNumber(totalBirds)}</td></tr>
                  <tr><td>Total Weight (kg)</td><td class="grand-total">${formatNumber(totalWeight)}</td></tr>
                  <tr><td>Average Weight / Bird (kg)</td><td>${totalBirds > 0 ? formatNumber(totalWeight / totalBirds) : '-'}</td></tr>
                </table>
                <table class="totals-table">
                  <tr><td>Source Type</td><td>${escapeHtml(sourceType || 'farmer').toUpperCase()}</td></tr>
                  <tr><td>Farm / Dispatch Location</td><td>${escapeHtml(location)}</td></tr>
                  <tr><td>Generated On</td><td>${escapeHtml(new Date().toLocaleString('en-IN'))}</td></tr>
                </table>
              </div>
              <div class="signatures">
                <div class="signature">Trader / Supplier Signature</div>
                <div class="signature">Driver / Lifter Signature</div>
                <div class="signature">Farmer / Receiver Signature</div>
              </div>
              <p class="small">Generated from Mr Chicken X · Trip #${escapeHtml(tripId)}</p>
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
          <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Delivery Challan Error</title></head>
          <body style="background:#080808;color:#fff;font-family:Arial;padding:32px">
            <h2>Unable to load Delivery Challan</h2><p>${escapeHtml(error.message || 'Please try again.')}</p>
            <button onclick="window.close()">Close</button>
          </body></html>
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
