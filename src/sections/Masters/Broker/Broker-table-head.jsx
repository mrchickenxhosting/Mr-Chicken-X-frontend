import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import { visuallyHidden } from './utils';

// ----------------------------------------------------------------------

export default function BrokerTableHead({
  order,
  orderBy,
  headLabel,
  onRequestSort,
}) {
  const onSort = (property) => (event) => {
    if (!property) return;
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell, index) => (
          <TableCell
            key={headCell.id || `action-${index}`}
            align={headCell.align || 'left'}
            sortDirection={
              headCell.id && orderBy === headCell.id ? order : false
            }
            sx={{
              width: headCell.width,
              minWidth: headCell.minWidth,
              whiteSpace: 'nowrap',
            }}
          >
            {headCell.id ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={onSort(headCell.id)}
              >
                {headCell.label}

                {orderBy === headCell.id && (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                )}
              </TableSortLabel>
            ) : (
              headCell.label || ''
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

BrokerTableHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  headLabel: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      align: PropTypes.string,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  onRequestSort: PropTypes.func.isRequired,
};