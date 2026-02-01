import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Stack,
  Switch,
  Dialog,
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogTitle,
  ToggleButton,
  DialogActions,
  DialogContent,
  InputAdornment,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

// ----------------------------------------------------------------------
// INITIAL FORM STATE (IMPORTANT: keep outside component)

const INITIAL_FORM = {
  name: '',
  shop_name: '',
  mobile: '',
  alternate_mobile: '',
  city: '',
  address: '',
  has_outstanding: false,
  opening_balance: '',
  outstanding_reason: '',
  customer_type: 'GREEN',
  has_credit_limit: true,
  credit_limit: '',
  credit_days: 7,
  block_on_limit: true,
  payment_mode: 'CASH',
  upi_number: '',
};

// ----------------------------------------------------------------------

export default function EditCustomerDialog({ open, onClose, customer, onSave }) {
  const isEditMode = Boolean(customer);

  const [form, setForm] = useState(INITIAL_FORM);

  // ----------------------------------------------------------------------
  // PREFILL OR RESET FORM ON OPEN

  useEffect(() => {
    if (!open) return;

    if (customer) {
      // Edit mode → prefill
      setForm({ ...INITIAL_FORM, ...customer });
    } else {
      // Create mode → reset
      setForm(INITIAL_FORM);
    }
  }, [customer, open]);

  // ----------------------------------------------------------------------

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    onClose();
  };

  const handleSave = () => {
    const payload = {
      ...(isEditMode && { id: customer.id }),
      ...form,
    };
    onSave(payload);
  };

  // ----------------------------------------------------------------------

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {isEditMode ? 'Update Customer' : 'Register Customer'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>

          {/* ---------- BASIC DETAILS ---------- */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              1. Basic Customer Details
            </Typography>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Customer Name"
                  fullWidth
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Shop / Business Name"
                  fullWidth
                  value={form.shop_name}
                  onChange={(e) => handleChange('shop_name', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Primary Mobile"
                  fullWidth
                  value={form.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleChange('mobile', val);
                  }}
                  inputProps={{ maxLength: 10, inputMode: 'numeric' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">+91</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Alternate Mobile"
                  fullWidth
                  value={form.alternate_mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleChange('alternate_mobile', val);
                  }}
                  inputProps={{ maxLength: 10, inputMode: 'numeric' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">+91</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Area / City"
                  fullWidth
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  label="Full Delivery Address"
                  fullWidth
                  multiline
                  rows={2}
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ---------- CREDIT & OUTSTANDING ---------- */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mt={3}>
              2. Credit & Outstanding
            </Typography>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.has_outstanding}
                      onChange={(e) =>
                        handleChange('has_outstanding', e.target.checked)
                      }
                    />
                  }
                  label="Previous Outstanding"
                />
              </Grid>

              {form.has_outstanding && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Opening Balance (₹)"
                      fullWidth
                      value={form.opening_balance}
                      onChange={(e) =>
                        handleChange('opening_balance', e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Outstanding Reason"
                      fullWidth
                      value={form.outstanding_reason}
                      onChange={(e) =>
                        handleChange('outstanding_reason', e.target.value)
                      }
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <ToggleButtonGroup
                  fullWidth
                  exclusive
                  value={form.customer_type}
                  onChange={(_, val) =>
                    val && handleChange('customer_type', val)
                  }
                >
                  <ToggleButton value="GREEN" color="success">
                    Green – Credit Allowed
                  </ToggleButton>
                  <ToggleButton value="ORANGE" color="warning">
                    Orange – Bill to Bill
                  </ToggleButton>
                  <ToggleButton value="RED" color="error">
                    Red – Advance Only
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.has_credit_limit}
                      onChange={(e) =>
                        handleChange('has_credit_limit', e.target.checked)
                      }
                    />
                  }
                  label="Credit Limit"
                />
              </Grid>

              {form.has_credit_limit && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Max Credit Limit (₹)"
                      fullWidth
                      value={form.credit_limit}
                      onChange={(e) =>
                        handleChange('credit_limit', e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Credit Days"
                      fullWidth
                      value={form.credit_days}
                      onChange={(e) =>
                        handleChange('credit_days', e.target.value)
                      }
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.block_on_limit}
                      onChange={(e) =>
                        handleChange('block_on_limit', e.target.checked)
                      }
                    />
                  }
                  label="Block sales if limit exceeded"
                />
              </Grid>
            </Grid>
          </Box>

          {/* ---------- PAYMENT ---------- */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} mt={3}>
              3. Payment Preferences
            </Typography>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12}>
                <ToggleButtonGroup
                  fullWidth
                  exclusive
                  value={form.payment_mode}
                  onChange={(_, val) =>
                    val && handleChange('payment_mode', val)
                  }
                >
                  <ToggleButton value="CASH">Cash</ToggleButton>
                  <ToggleButton value="UPI">UPI</ToggleButton>
                  <ToggleButton value="BANK">Bank Transfer</ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {form.payment_mode === 'UPI' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="UPI Number (Optional)"
                    fullWidth
                    value={form.upi_number}
                    onChange={(e) =>
                      handleChange('upi_number', e.target.value)
                    }
                  />
                </Grid>
              )}
            </Grid>
          </Box>

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          {isEditMode ? 'Update' : 'Save & Register'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

EditCustomerDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  customer: PropTypes.object,
};
