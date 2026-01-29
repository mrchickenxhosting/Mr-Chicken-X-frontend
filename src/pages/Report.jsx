import { Helmet } from 'react-helmet-async';

import ReportsPage from 'src/sections/Report/report-page';

// ----------------------------------------------------------------------

export default function ReportPage() {
  return (
    <>
      <Helmet>
        <title> Report</title>
      </Helmet>

      <ReportsPage />
    </>
  );
}
