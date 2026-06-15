import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function EditCarDialog({ open, onClose, car, onSave }) {
  const [carNumber, setCarNumber] = useState('');
  const [modelName, setModelName] = useState('');
  const [maxCapacityCages, setMaxCapacityCages] = useState('');

  const isEditMode = Boolean(car);

  useEffect(() => {
    if (open) {
      if (car) {
        setCarNumber(car.car_number || '');
        setModelName(car.model_name || '');
        setMaxCapacityCages(car.max_capacity_cages || '');
      } else {
        setCarNumber('');
        setModelName('');
        setMaxCapacityCages('');
      }
    }
  }, [car, open]);

  const handleSave = () => {
    const payload = {
      ...(isEditMode && { id: car.id }),
      car_number: carNumber,
      model_name: modelName,
      max_capacity_cages: Number(maxCapacityCages),
    };

    console.log(
      isEditMode
        ? 'Update Car Payload:'
        : 'Create Car Payload:',
      payload
    );

    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? 'Update Car' : 'Add Car'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Car Number"
            fullWidth
            value={carNumber}
            onChange={(e) => setCarNumber(e.target.value.toUpperCase())}
          />

          <TextField
            label="Model Name"
            fullWidth
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />

          <TextField
            label="Max Capacity (Cages)"
            type="number"
            fullWidth
            value={maxCapacityCages}
            onChange={(e) => setMaxCapacityCages(e.target.value)}
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

EditCarDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  car: PropTypes.object,
};