import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function EditTraderDialog({ open, onClose, trader, onSave }) {
  const [company_name, setcompany_name] = useState('');
  const [owner_name, setowner_name] = useState('');
  const [mobile, setMobile] = useState('');

  const isEditMode = Boolean(trader);

  useEffect(() => {
    if (trader) {
      setcompany_name(trader.company_name || '');
      setowner_name(trader.owner_name || '');
      setMobile(trader.mobile || '');
    } else {
      // Reset for Add mode
      setcompany_name('');
      setowner_name('');
      setMobile('');
    }
  }, [trader]);

  const handleSave = () => {
    const payload = {
      ...(isEditMode && { id: trader.id }), // optional
      company_name,
      owner_name,
      mobile,
    };

    console.log(isEditMode ? 'Update Trader Payload:' : 'Create Trader Payload:', payload);

    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? 'Update Trader' : 'Add Trader'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Company Name"
            fullWidth
            value={company_name}
            onChange={(e) => setcompany_name(e.target.value)}
          />

          <TextField
            label="Owner Name"
            fullWidth
            value={owner_name}
            onChange={(e) => setowner_name(e.target.value)}
            inputProps={{ maxLength: 10 }}
          />

          <TextField
            label="Owner Mobile Number"
            fullWidth
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
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

EditTraderDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  trader: PropTypes.object,
};
