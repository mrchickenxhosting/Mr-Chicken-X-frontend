import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Typography } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { getUser } from 'src/utils/session';

import { UpdateCustomer } from 'src/services/Trader.service';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CustomerOutstandingRow({
  row,
  onCreditConfirm,
  fetchCustomers
}) {
  const user = getUser();
  const [credit, setCredit] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newOutstanding, setNewOutstanding] = useState(row.outstanding);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);



  const generateWhatsAppMessage = () => `

પ્રિય ${row.name},

આપને વિનમ્ર યાદ અપાવવાનું છે કે આપની નીચે દર્શાવેલ ચુકવણી બાકી છે.

બાકી રકમ: ₹${Number(row.outstanding).toLocaleString()}

કૃપા કરીને શક્ય તેટલી વહેલી તકે બાકી રકમ ચૂકવશો.

આપના સહકાર માટે આભાર.

— ${user.companyName || 'Chicken Supplier'}

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

        <TableCell>
          <Label variant="soft">{row.custom_customer_code}</Label>
        </TableCell>
        <TableCell>{row.name}</TableCell>

        <TableCell>{row.mobile}</TableCell>

        <TableCell>
          {editing ? (
            <TextField
              size="small"
              type="number"
              autoFocus
              value={newOutstanding}
              onChange={(e) => setNewOutstanding(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (Number(newOutstanding) !== Number(row.outstanding)) {
                    setOpenUpdateDialog(true);
                  } else {
                    setEditing(false);
                  }
                }
              }}
              onBlur={() => setEditing(false)}
            />
          ) : (
            <Typography
              sx={{ cursor: 'pointer' }}
              onClick={() => setEditing(true)}
            >
              ₹ {Number(row.outstanding).toLocaleString()}
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Label color={statusColor(row.customer_type)}>
            {row.customer_type}
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

      <Dialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
      >
        <DialogTitle>Confirm Outstanding Update</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to update outstanding to{' '}
            <strong>₹ {Number(newOutstanding).toLocaleString()}</strong>{' '}
            for customer{' '}
            <strong>{row.name}</strong>?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenUpdateDialog(false);
              setEditing(false);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                await UpdateCustomer(row.customer_id, {
                  has_outstanding: true,
                  opening_balance: Number(newOutstanding),
                });
                fetchCustomers()
                setOpenUpdateDialog(false);
                setEditing(false);
              } catch (err) {
                console.error(err);
                alert('Failed to update outstanding');
              }
            }}
          >
            Yes, Update
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
}

CustomerOutstandingRow.propTypes = {
  row: PropTypes.shape({
    customer_id: PropTypes.number,
    custom_customer_code: PropTypes.string,
    name: PropTypes.string,
    mobile: PropTypes.string,
    outstanding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    customer_type: PropTypes.string,
  }),
  onCreditConfirm: PropTypes.func,
  fetchCustomers: PropTypes.func

};
