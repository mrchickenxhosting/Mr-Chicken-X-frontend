import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function AppWebsiteVisits({ title, subheader, chart, ...other }) {
  const { labels, colors, series, options } = chart;
  console.log(chart)

  const chartOptions = useChart({
    colors,
plotOptions: {
  bar: {
    columnWidth: '45%',
    borderRadius: 4,
    endingShape: 'rounded',
  },
},
    fill: {
      type: series.map((item) => item.fill || 'solid'),
    },
    labels,
xaxis: {
  type: 'category',
  tickAmount: 7, // show only 7 labels
},

    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => {
          if (typeof value === 'number') {
            return `₹${value.toLocaleString()}`;
          }
          return value;
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    stroke: {
      width: series.map((item) => (item.type === 'line' ? 3 : 0)),
    },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ p: 3, pb: 1 }}>
        <Chart
          dir="ltr"
          type="bar"   // ✅ change from line to bar
          series={series}
          options={chartOptions}
          width="100%"
          height={364}
        />
      </Box>
    </Card>
  );
}

AppWebsiteVisits.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chart: PropTypes.shape({
    labels: PropTypes.array.isRequired,
    series: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['line', 'column']).isRequired,
        fill: PropTypes.string,
        data: PropTypes.array.isRequired,
      })
    ).isRequired,
    colors: PropTypes.array,
    options: PropTypes.object,
  }).isRequired,
};
