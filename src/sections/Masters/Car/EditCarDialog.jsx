import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export default function EditCarDialog({ open, onClose, car, onSave }) {
  const [carNumber, setCarNumber] = useState('');
  const [modelName, setModelName] = useState('');
  const [maxCapacityCages, setMaxCapacityCages] = useState('');
  const [rcBookFile, setRcBookFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditMode = Boolean(car);

  useEffect(() => {
    if (open) {
      if (car) {
        setCarNumber(car.car_number || '');
        setModelName(car.model_name || '');
        setMaxCapacityCages(car.max_capacity_cages ?? '');
      } else {
        setCarNumber('');
        setModelName('');
        setMaxCapacityCages('');
      }

      setRcBookFile(null);
      setError('');
    }
  }, [car, open]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setRcBookFile(null);
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Only PDF, JPG, JPEG and PNG files are allowed.');
      event.target.value = '';
      setRcBookFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('RC Book file size must not exceed 5 MB.');
      event.target.value = '';
      setRcBookFile(null);
      return;
    }

    setError('');
    setRcBookFile(file);
  };

  const handleSave = async () => {
    setError('');

    if (!carNumber.trim()) {
      setError('Please enter the car number.');
      return;
    }

    if (!modelName.trim()) {
      setError('Please enter the model name.');
      return;
    }

    if (
      maxCapacityCages === '' ||
      Number.isNaN(Number(maxCapacityCages)) ||
      Number(maxCapacityCages) <= 0
    ) {
      setError('Please enter a valid maximum cage capacity.');
      return;
    }

    const payload = {
      car_number: carNumber.trim().toUpperCase(),
      model_name: modelName.trim(),
      max_capacity_cages: Number(maxCapacityCages),
      rc_book: rcBookFile,
    };

    try {
      setSaving(true);
      await onSave(payload);
    } catch (saveError) {
      setError(
        saveError?.response?.data?.message ||
          saveError?.message ||
          'Failed to save car. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const submitButtonLabel = (() => {
  if (saving) return 'Saving...';
  if (isEditMode) return 'Update';
  return 'Add';
})();

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? 'Update Car' : 'Add Car'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Car Number"
            fullWidth
            required
            value={carNumber}
            onChange={(event) =>
              setCarNumber(event.target.value.toUpperCase())
            }
          />

          <TextField
            label="Model Name"
            fullWidth
            required
            value={modelName}
            onChange={(event) => setModelName(event.target.value)}
          />

          <TextField
            label="Max Capacity (Cages)"
            type="number"
            fullWidth
            required
            value={maxCapacityCages}
            onChange={(event) => setMaxCapacityCages(event.target.value)}
            inputProps={{ min: 1 }}
          />

          <Stack spacing={1}>
            <Typography variant="subtitle2">RC Book</Typography>

            {isEditMode && car?.rc_book_url && !rcBookFile && (
              <Alert severity="success" icon={<Iconify icon="eva:file-text-fill" />}>
                An RC Book is already uploaded. Select a new file to replace it.
              </Alert>
            )}

            <Button
              component="label"
              variant="outlined"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              sx={{ alignSelf: 'flex-start' }}
            >
              {rcBookFile ? 'Change selected file' : 'Choose RC Book'}

              <input
                hidden
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
              />
            </Button>

            {rcBookFile && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <Iconify icon="eva:file-text-outline" />
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {rcBookFile.name}
                </Typography>

                <Button
                  size="small"
                  color="error"
                  onClick={() => setRcBookFile(null)}
                >
                  Remove
                </Button>
              </Stack>
            )}

            <Typography variant="caption" color="text.secondary">
              Accepted formats: PDF, JPG, JPEG and PNG. Maximum size: 5 MB.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>

        <Button
  onClick={handleSave}
  variant="contained"
  disabled={saving}
>
  {submitButtonLabel}
</Button>
      </DialogActions>
    </Dialog>
  );
}

EditCarDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  car: PropTypes.object,
};