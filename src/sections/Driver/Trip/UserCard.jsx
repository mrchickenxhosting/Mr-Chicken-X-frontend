
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

import { getTripDC } from 'src/services/Trader.service';

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


  // ----------------------------------------------------------------------
  // Delivery Challan helpers
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

  const handleShowDC = async () => {
    if (String(row.status || '').toUpperCase() !== 'CLOSED') return;

    // Open immediately from the click event so the browser does not block it.
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
          <title>Bird Challan - Trip #${escapeHtml(row.id)}</title>
          <style>
            *{box-sizing:border-box}
            body{margin:0;background:#e9e9e9;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:12px}
            .sheet{width:100%;max-width:1100px;margin:18px auto;background:#fff;padding:22px 26px;border:1px solid #ccc}
            .topline{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:2px solid #222;padding-bottom:10px}
            .copy{font-size:10px;font-weight:bold;border:1px solid #555;padding:4px 7px;text-transform:uppercase}
            .brand{text-align:center;flex:1;overflow-wrap:anywhere}
            .brand h1{font-size:24px;margin:0 0 4px;letter-spacing:.4px;text-transform:uppercase}
            .brand h2{font-size:16px;margin:0 0 5px;text-transform:uppercase}
            .brand p{margin:2px 0;font-size:10px}
            .challan-no{min-width:130px;border:1px solid #555;padding:8px;line-height:1.8}
            .challan-no strong{font-size:13px}
            .doc-title{text-align:center;font-weight:bold;font-size:15px;letter-spacing:.8px;margin:12px 0;background:#eee;border:1px solid #aaa;padding:7px;text-transform:uppercase}
            .meta{display:grid;grid-template-columns:1.5fr 1fr;gap:12px;margin-bottom:10px}
            .meta-table{width:100%;border-collapse:collapse}
            .meta-table td{border:1px solid #777;padding:5px 7px;vertical-align:top;overflow-wrap:anywhere}
            .meta-table td:first-child{width:42%;font-weight:bold;background:#f7f7f7}
            .section-title{font-size:11px;font-weight:bold;text-transform:uppercase;margin:10px 0 4px}
            .cage-table{width:100%;border-collapse:collapse;table-layout:fixed}
            .cage-table th,.cage-table td{border:1px solid #555;padding:5px 4px;height:24px}
            .cage-table th{background:#eee;text-align:center;font-size:10px}
            .cage-table td{font-size:11px}
            .cage-table .cage-no{text-align:center;width:6%;font-weight:900;background:#e8e8e8;font-size:13px;color:#000}
            .cage-table .num{text-align:right;width:10%;font-variant-numeric:tabular-nums}
            .totals{display:grid;grid-template-columns:1.15fr 1fr;gap:14px;margin-top:12px}
            .totals-table{width:100%;border-collapse:collapse}
            .totals-table td{border:1px solid #777;padding:7px;overflow-wrap:anywhere}
            .totals-table td:first-child{font-weight:bold;background:#f7f7f7;width:55%}
            .grand-total{font-size:15px;font-weight:bold}
            .signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:24px}
            .signature{border-top:1px solid #555;padding-top:6px;text-align:center;min-height:36px;font-weight:bold;font-size:10px}
            .actions{display:flex;justify-content:center;gap:10px;margin:0 auto 16px}
            .actions button{padding:10px 16px;border:0;border-radius:4px;font-weight:bold;cursor:pointer}
            .print{background:#111;color:#fff}.close{background:#ddd;color:#111}
            .small{font-size:10px;color:#444}.error{color:#a00}
            @media(max-width:700px){
              .sheet{margin:0;padding:12px}.brand h1{font-size:17px}.brand h2{font-size:13px}
              .challan-no{min-width:95px}.meta{grid-template-columns:1fr}
              .cage-table th,.cage-table td{padding:3px 2px;font-size:9px}
              .cage-table .cage-no{font-size:11px}.totals{grid-template-columns:1fr}
            }
            @media print{
              body{background:#fff;font-size:10px}.sheet{max-width:none;width:100%;margin:0;padding:8mm;border:0}
              .actions{display:none}
              .doc-title,.cage-table th,.meta-table td:first-child,.totals-table td:first-child{-webkit-print-color-adjust:exact;print-color-adjust:exact}
              tr{break-inside:avoid}
            }
          </style>
        </head>
        <body>
          <main class="sheet">
            <h2>Loading Delivery Challan…</h2>
          </main>
        </body>
      </html>
    `);
    dcWindow.document.close();

    try {
      const response = await getTripDC(row.id);
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
      const date =
        rawDate && !Number.isNaN(new Date(rawDate).getTime())
          ? new Date(rawDate).toLocaleDateString('en-IN')
          : '-';

      const rawTime = String(dc.trip_time || row.trip_time || '').trim();
      const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      const time = timeMatch
        ? new Date(2000, 0, 1, Number(timeMatch[1]), Number(timeMatch[2])).toLocaleTimeString(
            'en-IN',
            { hour: '2-digit', minute: '2-digit', hour12: true }
          )
        : rawTime || '-';

      const totalCages = Number(dc.total_cages ?? cages.length);
      const totalBirds = Number(
        dc.total_birds ??
          cages.reduce((sum, cage) => sum + Number(cage.total_birds || 0), 0)
      );
      const totalWeight = Number(
        dc.total_weight ??
          cages.reduce((sum, cage) => sum + Number(cage.total_weight || 0), 0)
      );

      // Each row displays three cage groups, similar to the paper challan.
      const groupsPerRow = 3;
      const cageGridRows = [];
      for (let i = 0; i < cages.length; i += groupsPerRow) {
        const group = cages.slice(i, i + groupsPerRow);
        cageGridRows.push(
          `<tr>${Array.from({ length: groupsPerRow }, (_, j) => {
            const cage = group[j];
            return cage
              ? `<td class="cage-no">${escapeHtml(cage.cage_number)}</td><td class="num">${formatNumber(cage.total_birds)}</td><td class="num">${formatNumber(cage.total_weight)}</td>`
              : '<td></td><td></td><td></td>';
          }).join('')}</tr>`
        );
      }

      const tripId = dc.trip_id ?? row.id;
      const companyName = dc.trader_name || 'BIRD SUPPLIER';
      let fallbackSourceName = '-';
      if (sourceType === 'broker') {
        fallbackSourceName = row.broker_name || '-';
      } else if (sourceType === 'driver') {
        fallbackSourceName = row.source_driver_name || '-';
      }

      let fallbackSourcePhone = row.farmer_mobile || '-';
      if (sourceType === 'broker') {
        fallbackSourcePhone = row.broker_number || row.broker_mobile || '-';
      } else if (sourceType === 'driver') {
        fallbackSourcePhone = row.source_driver_mobile || '-';
      }

      const sourceName = dc.farmer_name || fallbackSourceName;
      const sourcePhone = dc.farmer_number || fallbackSourcePhone;
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
              .brand{text-align:center;flex:1;overflow-wrap:anywhere}.brand h1{font-size:24px;margin:0 0 4px;letter-spacing:.4px;text-transform:uppercase}
              .brand h2{font-size:16px;margin:0 0 5px;text-transform:uppercase}.brand p{margin:2px 0;font-size:10px}
              .challan-no{min-width:130px;border:1px solid #555;padding:8px;line-height:1.8}.challan-no strong{font-size:13px}
              .doc-title{text-align:center;font-weight:bold;font-size:15px;letter-spacing:.8px;margin:12px 0;background:#eee;border:1px solid #aaa;padding:7px;text-transform:uppercase}
              .meta{display:grid;grid-template-columns:1.5fr 1fr;gap:12px;margin-bottom:10px}.meta-table{width:100%;border-collapse:collapse}
              .meta-table td{border:1px solid #777;padding:5px 7px;vertical-align:top;overflow-wrap:anywhere}.meta-table td:first-child{width:42%;font-weight:bold;background:#f7f7f7}
              .section-title{font-size:11px;font-weight:bold;text-transform:uppercase;margin:10px 0 4px}
              .cage-table{width:100%;border-collapse:collapse;table-layout:fixed}.cage-table th,.cage-table td{border:1px solid #555;padding:5px 4px;height:24px}
              .cage-table th{background:#eee;text-align:center;font-size:10px}.cage-table td{font-size:11px}
              .cage-table .cage-no{text-align:center;width:6%;font-weight:900;background:#e8e8e8;font-size:13px;color:#000}
              .cage-table .num{text-align:right;width:10%;font-variant-numeric:tabular-nums}
              .totals{display:grid;grid-template-columns:1.15fr 1fr;gap:14px;margin-top:12px}.totals-table{width:100%;border-collapse:collapse}
              .totals-table td{border:1px solid #777;padding:7px;overflow-wrap:anywhere}.totals-table td:first-child{font-weight:bold;background:#f7f7f7;width:55%}
              .grand-total{font-size:15px;font-weight:bold}.signatures{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:24px}
              .signature{border-top:1px solid #555;padding-top:6px;text-align:center;min-height:36px;font-weight:bold;font-size:10px}
              .actions{display:flex;justify-content:center;gap:10px;margin:0 auto 16px}.actions button{padding:10px 16px;border:0;border-radius:4px;font-weight:bold;cursor:pointer}
              .print{background:#111;color:#fff}.close{background:#ddd;color:#111}.small{font-size:10px;color:#444}
              @media(max-width:700px){.sheet{margin:0;padding:12px}.brand h1{font-size:17px}.brand h2{font-size:13px}.challan-no{min-width:95px}.meta{grid-template-columns:1fr}.cage-table th,.cage-table td{padding:3px 2px;font-size:9px}.cage-table .cage-no{font-size:11px}.totals{grid-template-columns:1fr}}
              @media print{body{background:#fff;font-size:10px}.sheet{max-width:none;width:100%;margin:0;padding:8mm;border:0}.actions{display:none}.doc-title,.cage-table th,.meta-table td:first-child,.totals-table td:first-child{-webkit-print-color-adjust:exact;print-color-adjust:exact}tr{break-inside:avoid}}
            </style>
          </head>
          <body>
            <div class="actions">
              <button class="print" onclick="window.print()">Print / Save as PDF</button>
              <button class="close" onclick="window.close()">Close</button>
            </div>
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
                  <tr><td>Source Contact</td><td>${escapeHtml(sourcePhone)}</td></tr>
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
                  ${cageGridRows.join('') || '<tr><td colspan="9" style="text-align:center">No cage records found for this trip.</td></tr>'}
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
          <!DOCTYPE html>
          <html lang="en">
            <head><meta charset="UTF-8"/><title>Delivery Challan Error</title></head>
            <body style="font-family:Arial,sans-serif;padding:24px">
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

        {String(row.status || '').toUpperCase() === 'CLOSED' && (
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
