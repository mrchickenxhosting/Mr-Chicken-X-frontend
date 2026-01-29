import { Helmet } from 'react-helmet-async';

import { DaySalesPage } from 'src/sections/Trip/view';

// ----------------------------------------------------------------------

export default function SalesPage() {
  return (
    <>
      <Helmet>
        <title> Sales</title>
      </Helmet>

      <DaySalesPage/>
    </>
  );
}
