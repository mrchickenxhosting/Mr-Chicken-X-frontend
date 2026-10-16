import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function EditBrokerDialog({
  open,
  onClose,
  broker,
  onSave,
}) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const isEditMode = Boolean(broker);

  useEffect(() => {
    if (open) {
      setName(broker?.name || '');
      setNumber(broker?.number || '');
      setErrors({});
      setSaveError('');
      setSaving(false);
    }
  }, [broker, open]);

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    const trimmedName = name.trim();
    const trimmedNumber = number.trim();

    if (!trimmedName) {
      newErrors.name = 'Broker name is required';
    }

    if (!trimmedNumber) {
      newErrors.number = 'Mobile number is required';
    } else if (!/^[0-9+\-\s()]{7,20}$/.test(trimmedNumber)) {
      newErrors.number = 'Enter a valid mobile number';
    }

    setErrors(newErrors);
    setSaveError('');

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const payload = {
      name: trimmedName,
      number: trimmedNumber,
    };

    try {
      setSaving(true);
      await onSave(payload);
    } catch (error) {
      console.error('Failed to save broker:', error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Unable to save broker. Please try again.';

      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  let submitButtonText = 'Add Broker';

  if (isEditMode) {
    submitButtonText = 'Update Broker';
  }

  if (saving) {
    submitButtonText = 'Saving...';
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEditMode ? 'Update Broker' : 'Add Broker'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {saveError && (
            <Alert
              severity="error"
              onClose={() => setSaveError('')}
            >
              {saveError}
            </Alert>
          )}

          <TextField
            label="Broker Name"
            fullWidth
            required
            autoFocus
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((prev) => ({
                ...prev,
                name: '',
              }));
              setSaveError('');
            }}
            error={Boolean(errors.name)}
            helperText={errors.name || 'Enter the broker name'}
            inputProps={{ maxLength: 150 }}
            disabled={saving}
          />

          <TextField
            label="Mobile Number"
            fullWidth
            required
            value={number}
            onChange={(event) => {
              setNumber(event.target.value);
              setErrors((prev) => ({
                ...prev,
                number: '',
              }));
              setSaveError('');
            }}
            error={Boolean(errors.number)}
            helperText={
              errors.number || 'Enter the broker contact number'
            }
            inputProps={{
              maxLength: 20,
              inputMode: 'tel',
            }}
            disabled={saving}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={saving}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
        >
          {submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditBrokerDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  broker: PropTypes.object,
};