import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function TableEmptyRows({
  emptyRows,
  height,
  message,
  colSpan = 9,
}) {
  // If message is provided → show message row
  if (message) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan}>
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ py: 6 }}
          >
            <Typography variant="h6" color="text.secondary">
              {message.title}
            </Typography>

            {message.subtitle && (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ mt: 0.5 }}
              >
                {message.subtitle}
              </Typography>
            )}
          </Stack>
        </TableCell>
      </TableRow>
    );
  }

  // Default behavior (spacing rows)
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow
      sx={{
        ...(height && {
          height: height * emptyRows,
        }),
      }}
    >
      <TableCell colSpan={colSpan} />
    </TableRow>
  );
}

TableEmptyRows.propTypes = {
  emptyRows: PropTypes.number,
  height: PropTypes.number,
  colSpan: PropTypes.number,
  message: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
  }),
};
