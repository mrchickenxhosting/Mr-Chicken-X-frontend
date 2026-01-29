import { useState } from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CustomerOutstandingCard({
  row,
  onCreditChange,
}) {
  const [credit, setCredit] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

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

  const handleConfirmCredit = () => {
    onCreditChange?.(row, credit);
    setOpenDialog(false);
    setCredit('');
  };

  const handleWhatsAppClick = () => {
    console.log('WhatsApp number:', row.mobile);
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
      <Card sx={{ p: 2 }}>
        <Stack spacing={1.5}>

          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">
              {row.name}
            </Typography>

            <Label variant="soft" color={statusColor(row.status)}>
              {row.status}
            </Label>
          </Stack>

          {/* Mobile */}
          <Typography variant="body2" color="text.secondary">
            Mobile: {row.mobile}
          </Typography>

          {/* Outstanding */}
          <Typography variant="body2">
            Outstanding:{' '}
            <strong>₹ {Number(row.outstanding).toLocaleString()}</strong>
          </Typography>

          {/* Credit Input */}
          <TextField
            value={credit}
            onChange={handleInputChange}
            onBlur={handleConfirmOpen}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirmOpen();
            }}
            placeholder="Credit Amount"
            size="small"
            type="number"
            inputProps={{ min: 0 }}
            fullWidth
          />

          {/* Actions */}
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              color="success"
              startIcon={<Iconify icon="logos:whatsapp-icon" />}
              onClick={handleWhatsAppClick}
            >
              WhatsApp
            </Button>
          </Stack>

        </Stack>
      </Card>

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
            onClick={handleConfirmCredit}
          >
            Yes, Credit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

CustomerOutstandingCard.propTypes = {
  row: PropTypes.shape({
    customer_id: PropTypes.number,
    name: PropTypes.string,
    mobile: PropTypes.string,
    outstanding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
  }),
  onCreditChange: PropTypes.func,
};
