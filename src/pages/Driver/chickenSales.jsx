import { Helmet } from 'react-helmet-async';

import SalesPage from 'src/sections/Driver/Sales/sales-page';


// ----------------------------------------------------------------------

export default function ChickenSalesPage() {
  return (
    <>
      <Helmet>
        <title> Chicken Sales</title>
      </Helmet>

      <SalesPage />
    </>
  );
}
