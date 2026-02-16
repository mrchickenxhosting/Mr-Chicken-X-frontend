import { useState } from 'react';
import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableRow({
  row,
  onEdit,
  onEnable,
  onDisable,
  onDelete,
}) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  // customer credit type color
  const customerTypeColor = (type) => {
    switch (type) {
      case 'GREEN':
        return 'success';
      case 'ORANGE':
        return 'warning';
      case 'RED':
        return 'error';
      default:
        return 'default';
    }
  };

  const isActive = row.status;

  return (
    <>
      <TableRow
        hover
        tabIndex={-1}
        sx={{ opacity: isActive ? 1 : 0.5 }}
      >
        {/* CUSTOMER CODE */}
        <TableCell>
          <Label variant="soft">{row.customer_code}</Label>
        </TableCell>

        {/* CUSTOMER NAME */}
        <TableCell>{row.name}</TableCell>

        {/* SHOP NAME */}
        <TableCell>{row.shop_name || '-'}</TableCell>

        {/* MOBILE */}
<TableCell>
  <div style={{ lineHeight: 1.4 }}>
    <strong>{row.mobile}</strong>

    {row.alternate_mobile && (
      <div
        style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          marginTop: 2,
        }}
      >
        Alt: {row.alternate_mobile}
      </div>
    )}
  </div>
</TableCell>
        {/* CITY */}
        <TableCell>
  <div style={{ lineHeight: 1.4 }}>
    <strong>{row.city || '-'}</strong>

    {row.address && (
      <div
        style={{
          fontSize: '0.75rem',
          color: '#6b7280', // MUI grey-ish
          marginTop: 2,
        }}
      >
        {row.address}
      </div>
    )}
  </div>
</TableCell>


<TableCell>
  <Label
    color={Number(row.outstanding) > 0 ? 'error' : 'success'}
  >
    ₹ {Math.round(Number(row.outstanding || 0)).toLocaleString('en-IN')}
  </Label>
</TableCell>


        {/* CUSTOMER TYPE */}
        <TableCell>
          <Label color={customerTypeColor(row.customer_type)}>
            {row.customer_type}
          </Label>
        </TableCell>

        {/* STATUS */}
        <TableCell>
          <Chip
            label={isActive ? 'Active' : 'Disabled'}
            color={isActive ? 'success' : 'error'}
            size="small"
            variant="outlined"
          />
        </TableCell>

        {/* ACTIONS */}
        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 160 } }}
      >
        {/* EDIT */}
        <MenuItem
          onClick={() => {
            onEdit(row);
            handleCloseMenu();
          }}
        >
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        {/* ENABLE / DISABLE */}
        {isActive ? (
          <MenuItem
            onClick={() => {
              onDisable();
              handleCloseMenu();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:slash-fill" sx={{ mr: 2 }} />
            Disable
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              onEnable();
              handleCloseMenu();
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ mr: 2 }} />
            Enable
          </MenuItem>
        )}

        {/* DELETE */}
        <MenuItem
          onClick={() => {
            onDelete();
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onEnable: PropTypes.func.isRequired,
  onDisable: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
