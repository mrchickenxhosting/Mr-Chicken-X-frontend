import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function EditManagerDialog({ open, onClose, manager, onSave }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const isEditMode = Boolean(manager);

  useEffect(() => {
    if (manager) {
      setName(manager.name || '');
      setMobile(manager.mobile || '');
    } else {
      // Reset for Add mode
      setName('');
      setMobile('');
    }
  }, [manager]);

  const handleSave = () => {
    const payload = {
      ...(isEditMode && { id: manager.id }), // optional
      name,
      mobile,
    };

    console.log(isEditMode ? 'Update Manager Payload:' : 'Create Manager Payload:', payload);

    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? 'Update Manager' : 'Add Manager'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Manager Name"
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

EditManagerDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  manager: PropTypes.object,
};
