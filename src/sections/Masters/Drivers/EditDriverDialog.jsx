
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
  const [monthlySalary, setMonthlySalary] = useState('');
  const [salaryError, setSalaryError] = useState('');

  const isEditMode = Boolean(driver);

  useEffect(() => {
    if (!open) return;

    setName(driver?.name || '');
    setMobile(driver?.mobile || '');
    setMonthlySalary(
      driver?.monthly_salary != null ? String(driver.monthly_salary) : ''
    );
    setSalaryError('');
  }, [driver, open]);

  const handleSave = () => {
    if (!name.trim() || !mobile.trim()) {
      return;
    }

    if (monthlySalary.trim() !== '') {
      const salary = Number(monthlySalary);

      if (!Number.isFinite(salary) || salary < 0) {
        setSalaryError('Enter a valid non-negative monthly salary');
        return;
      }

      if (Math.round(salary * 100) !== salary * 100) {
        setSalaryError('Salary can have at most 2 decimal places');
        return;
      }
    }

    setSalaryError('');

    onSave({
      ...(isEditMode && { id: driver.id }),
      name: name.trim(),
      mobile: mobile.trim(),
      monthly_salary:
        monthlySalary.trim() === '' ? null : Number(monthlySalary),
    });
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
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            label="Mobile Number"
            fullWidth
            required
            value={mobile}
            onChange={(e) =>
              setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
            }
            inputProps={{ maxLength: 10, inputMode: 'numeric' }}
          />

          <TextField
            label="Monthly Salary (₹)"
            fullWidth
            type="number"
            value={monthlySalary}
            onChange={(e) => {
              setMonthlySalary(e.target.value);
              setSalaryError('');
            }}
            error={Boolean(salaryError)}
            helperText={salaryError || 'Fixed monthly salary; leave blank if not set'}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim() || !/^\d{10}$/.test(mobile)}
        >
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
