import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function EditDriverDialog({ open, onClose, driver, onSave }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const isEditMode = Boolean(driver);

  useEffect(() => {
    if(open){
    if (driver) {
      setName(driver.name || '');
      setMobile(driver.mobile || '');
    } else {
      // Reset for Add mode
      setName('');
      setMobile('');
    }}
  }, [driver,open]);

  const handleSave = () => {
    const payload = {
      ...(isEditMode && { id: driver.id }), // optional
      name,
      mobile,
    };

    console.log(isEditMode ? 'Update Driver Payload:' : 'Create Driver Payload:', payload);

    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? 'Update Driver' : 'Add Driver'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Driver Name"
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

EditDriverDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  driver: PropTypes.object,
};
