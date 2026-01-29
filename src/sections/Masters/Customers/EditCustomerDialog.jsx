import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function EditCustomerDialog({ open, onClose, customer, onSave }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [credit_limit, setCredit_Limit] = useState('');

  const isEditMode = Boolean(customer);

useEffect(() => {
  if (customer) {
    setName(customer.name || '');
    setMobile(customer.mobile || '');
    setCredit_Limit(customer.credit_limit || '');
  } else {
    setName('');
    setMobile('');
    setCredit_Limit('');
  }
}, [customer, open]);


  const handleSave = () => {
    const payload = {
      ...(isEditMode && { id: customer.id }), // optional
      name,
      mobile,
      credit_limit,
    };

    console.log(isEditMode ? 'Update Customer Payload:' : 'Create Customer Payload:', payload);

    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? 'Update Customer' : 'Add Customer'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Customer Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Mobile Number"
            fullWidth
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputProps={{ maxLength: 10 }}
          />

          <TextField
            label="Credit Limit"
            fullWidth
            value={credit_limit}
            onChange={(e) => setCredit_Limit(e.target.value)}
            inputProps={{ maxLength: 10 }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          {isEditMode ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditCustomerDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  customer: PropTypes.object,
};
