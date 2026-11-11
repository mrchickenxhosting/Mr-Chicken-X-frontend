
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const initialForm = {
  name: '',
  mobile: '',
  monthly_salary: '',
  aadhaar_number: '',
  pan_number: '',
  driving_license_number: '',
  bank_account_number: '',
  ifsc_code: '',
  bank_holder_name: '',
};

export default function EditDriverDialog({ open, onClose, driver, onSave }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const isEditMode = Boolean(driver);

  useEffect(() => {
    if (!open) return;

    setForm({
      ...initialForm,
      name: driver?.name || '',
      mobile: driver?.mobile || '',
      monthly_salary:
        driver?.monthly_salary != null
          ? String(driver.monthly_salary)
          : '',
      aadhaar_number: driver?.aadhaar_number || '',
      pan_number: driver?.pan_number || '',
      driving_license_number: driver?.driving_license_number || '',
      bank_account_number: driver?.bank_account_number || '',
      ifsc_code: driver?.ifsc_code || '',
      bank_holder_name: driver?.bank_holder_name || '',
    });

    setErrors({});
  }, [driver, open]);

  const handleChange = (field) => (event) => {
    let {value} = event.target;

    if (field === 'mobile') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    if (field === 'aadhaar_number') {
      value = value.replace(/\D/g, '').slice(0, 12);
    }

    if (field === 'bank_account_number') {
      value = value.replace(/\D/g, '').slice(0, 34);
    }

    if (field === 'pan_number' || field === 'ifsc_code') {
      value = value.toUpperCase();
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Driver name is required';
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (form.monthly_salary.trim() !== '') {
      const salary = Number(form.monthly_salary);

      if (
        !Number.isFinite(salary) ||
        salary < 0 ||
        Math.round(salary * 100) !== salary * 100
      ) {
        newErrors.monthly_salary =
          'Enter a valid salary with at most 2 decimal places';
      }
    }

    if (
      form.aadhaar_number &&
      !/^\d{12}$/.test(form.aadhaar_number)
    ) {
      newErrors.aadhaar_number = 'Aadhaar must contain exactly 12 digits';
    }

    if (
      form.pan_number &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan_number)
    ) {
      newErrors.pan_number = 'Enter a valid PAN number';
    }

    if (
      form.driving_license_number &&
      !/^[A-Z0-9/-]{5,30}$/.test(form.driving_license_number.toUpperCase())
    ) {
      newErrors.driving_license_number =
        'Enter a valid driving licence number';
    }

    if (
      form.bank_account_number &&
      !/^\d{6,34}$/.test(form.bank_account_number)
    ) {
      newErrors.bank_account_number =
        'Account number must contain 6 to 34 digits';
    }

    if (
      form.ifsc_code &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code)
    ) {
      newErrors.ifsc_code = 'Enter a valid IFSC code';
    }

    if (form.bank_holder_name.length > 100) {
      newErrors.bank_holder_name =
        'Bank holder name cannot exceed 100 characters';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave({
      ...(isEditMode && { id: driver.id }),
      name: form.name.trim(),
      mobile: form.mobile,
      monthly_salary:
        form.monthly_salary.trim() === ''
          ? null
          : Number(form.monthly_salary),
      aadhaar_number: form.aadhaar_number || null,
      pan_number: form.pan_number || null,
      driving_license_number:
        form.driving_license_number.trim() || null,
      bank_account_number: form.bank_account_number || null,
      ifsc_code: form.ifsc_code || null,
      bank_holder_name: form.bank_holder_name.trim() || null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? 'Update Driver' : 'Add Driver'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Personal Details
          </Typography>

          <TextField
            label="Driver Name"
            fullWidth
            required
            value={form.name}
            onChange={handleChange('name')}
            error={Boolean(errors.name)}
            helperText={errors.name}
          />

          <TextField
            label="Mobile Number"
            fullWidth
            required
            value={form.mobile}
            onChange={handleChange('mobile')}
            inputProps={{ maxLength: 10, inputMode: 'numeric' }}
            error={Boolean(errors.mobile)}
            helperText={errors.mobile}
          />

          <TextField
            label="Monthly Salary (₹)"
            fullWidth
            type="number"
            value={form.monthly_salary}
            onChange={handleChange('monthly_salary')}
            inputProps={{ min: 0, step: 0.01 }}
            error={Boolean(errors.monthly_salary)}
            helperText={errors.monthly_salary || 'Leave blank if not set'}
          />

          <Divider />

          <Typography variant="subtitle2" color="text.secondary">
            Identity Details
          </Typography>

          <TextField
            label="Aadhaar Number"
            fullWidth
            value={form.aadhaar_number}
            onChange={handleChange('aadhaar_number')}
            inputProps={{ maxLength: 12, inputMode: 'numeric' }}
            error={Boolean(errors.aadhaar_number)}
            helperText={errors.aadhaar_number}
          />

          <TextField
            label="PAN Number"
            fullWidth
            value={form.pan_number}
            onChange={handleChange('pan_number')}
            inputProps={{ maxLength: 10 }}
            error={Boolean(errors.pan_number)}
            helperText={errors.pan_number}
          />

          <TextField
            label="Driving Licence Number"
            fullWidth
            value={form.driving_license_number}
            onChange={handleChange('driving_license_number')}
            inputProps={{ maxLength: 30 }}
            error={Boolean(errors.driving_license_number)}
            helperText={errors.driving_license_number}
          />

          <Divider />

          <Typography variant="subtitle2" color="text.secondary">
            Bank Details
          </Typography>

          <TextField
            label="Bank Account Number"
            fullWidth
            value={form.bank_account_number}
            onChange={handleChange('bank_account_number')}
            inputProps={{ maxLength: 34, inputMode: 'numeric' }}
            error={Boolean(errors.bank_account_number)}
            helperText={errors.bank_account_number}
          />

          <TextField
            label="IFSC Code"
            fullWidth
            value={form.ifsc_code}
            onChange={handleChange('ifsc_code')}
            inputProps={{ maxLength: 11 }}
            error={Boolean(errors.ifsc_code)}
            helperText={errors.ifsc_code}
          />

          <TextField
            label="Bank Account Holder Name"
            fullWidth
            value={form.bank_holder_name}
            onChange={handleChange('bank_holder_name')}
            error={Boolean(errors.bank_holder_name)}
            helperText={errors.bank_holder_name}
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
          disabled={!form.name.trim() || !/^\d{10}$/.test(form.mobile)}
        >
          {isEditMode ? 'Update Driver' : 'Add Driver'}
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
