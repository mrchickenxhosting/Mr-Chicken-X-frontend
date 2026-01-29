import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { getUser } from 'src/utils/session';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CustomerOutstandingRow({
  row,
  onCreditConfirm,
}) {
  const user = getUser();
  const [credit, setCredit] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const generateWhatsAppMessage = () => `
Dear ${row.name},

This is a gentle reminder regarding your pending payment.

Outstanding Amount: ₹${Number(row.outstanding).toLocaleString()}

Kindly clear the dues at your earliest convenience.

Thank you for your cooperation.

— ${user.companyName || 'Chicken Supplier'}
`;


  const handleInputChange = (e) => {
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
      setCredit(value);
    }
  };

  const handleConfirmOpen = () => {
    if (!credit || Number(credit) <= 0) return;
    setOpenDialog(true);
  };

  const handleConfirmClose = () => {
    setOpenDialog(false);
  };

const handleConfirmCredit = async () => {

  await onCreditConfirm(row.customer_id, Number(credit));

  setOpenDialog(false);
  setCredit('');
};
  const handleWhatsAppClick = () => {
    if (!row.mobile) return;

    const phone = `91${row.mobile}`; // India country code
    const message = generateWhatsAppMessage();

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };


  const statusColor = (status) => {
    switch (status) {
      case 'GREEN':
        return 'success';
      case 'BLUE':
        return 'info';
      case 'RED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1}>

        <TableCell>{row.name}</TableCell>

        <TableCell>{row.mobile}</TableCell>

        <TableCell>
          ₹ {Number(row.outstanding).toLocaleString()}
        </TableCell>

        <TableCell>
          <Label color={statusColor(row.status)}>
            {row.status}
          </Label>
        </TableCell>

        {/* Credit Input */}
        <TableCell>
          <TextField
            value={credit}
            onChange={handleInputChange}
            onBlur={handleConfirmOpen}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirmOpen();
            }}
            placeholder="Credit"
            size="small"
            type="number"
          />
        </TableCell>

        {/* WhatsApp Button */}
        <TableCell>
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<Iconify icon="logos:whatsapp-icon" />}
            onClick={handleWhatsAppClick}
          >
            WhatsApp
          </Button>
        </TableCell>

      </TableRow>

      {/* CONFIRM CREDIT DIALOG */}
      <Dialog open={openDialog} onClose={handleConfirmClose}>
        <DialogTitle>Confirm Credit</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to credit{' '}
            <strong>₹ {Number(credit).toLocaleString()}</strong> to{' '}
            <strong>{row.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmCredit}
          >
            Yes, Credit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

CustomerOutstandingRow.propTypes = {
  row: PropTypes.shape({
    customer_id: PropTypes.number,
    name: PropTypes.string,
    mobile: PropTypes.string,
    outstanding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
  }),
  onCreditConfirm: PropTypes.func,

};
