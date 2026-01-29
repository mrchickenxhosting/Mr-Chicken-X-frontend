import { useState } from 'react';
import PropTypes from 'prop-types';

import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableRow({
  row,
  onEdit,
}) {
  const [open, setOpen] = useState(null);

  const handleCloseMenu = () => {
    setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox">

         <TableCell>{row.customer_name}</TableCell>
      <TableCell>{row.cage_number}</TableCell>
      <TableCell>{row.bird_count}</TableCell>
      <TableCell>{row.weight}</TableCell>
      <TableCell>₹{row.total_amount}</TableCell>
      <TableCell>{row.payment_mode}</TableCell>
      <TableCell>₹{row.cash_amount}</TableCell>
      <TableCell>₹{row.upi_amount}</TableCell>
      <TableCell>
        {new Date(row.created_at).toLocaleTimeString()}
      </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem
          onClick={() => {
            onEdit(row);
            handleCloseMenu();
          }}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  row: PropTypes.object,
  onEdit: PropTypes.func,
};
