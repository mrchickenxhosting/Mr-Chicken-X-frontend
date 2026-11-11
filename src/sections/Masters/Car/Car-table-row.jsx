
import { useState } from 'react';
import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const API_BASE_URL = 'https://backend.poultrylink.tech';

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

  const isActive = row.is_active;
  const hasRcBook = Boolean(row.rc_book_url);

  // Build RC Book URL without nested ternary.
  let rcBookUrl = '';

  if (hasRcBook) {
    if (/^https?:\/\//i.test(row.rc_book_url)) {
      rcBookUrl = row.rc_book_url;
    } else {
      const filePath = row.rc_book_url.startsWith('/')
        ? row.rc_book_url
        : `/${row.rc_book_url}`;

      rcBookUrl = `${API_BASE_URL}${filePath}`;
    }
  }

  const handleViewRcBook = () => {
    if (!rcBookUrl) return;

    window.open(rcBookUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <TableRow
        hover
        tabIndex={-1}
        sx={{
          opacity: isActive ? 1 : 0.6,
        }}
      >
        <TableCell>{row.car_number}</TableCell>

        <TableCell>{row.model_name}</TableCell>

        <TableCell>{row.max_capacity_cages}</TableCell>

        {/* Car Status */}
        <TableCell>
          <Chip
            label={isActive ? 'Active' : 'Disabled'}
            color={isActive ? 'success' : 'error'}
            size="small"
            variant="outlined"
          />
        </TableCell>

        {/* RC Book */}
        <TableCell>
          {hasRcBook ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={<Iconify icon="eva:file-text-fill" />}
                label="Uploaded"
                color="success"
                size="small"
                variant="outlined"
              />

              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="eva:eye-fill" />}
                onClick={handleViewRcBook}
              >
                View
              </Button>
            </Stack>
          ) : (
            <Chip
              icon={<Iconify icon="eva:file-remove-outline" />}
              label="Not uploaded"
              color="default"
              size="small"
              variant="outlined"
            />
          )}
        </TableCell>

        {/* Actions */}
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
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: { width: 160 },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            onEdit(row);
            handleCloseMenu();
          }}
        >
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

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
