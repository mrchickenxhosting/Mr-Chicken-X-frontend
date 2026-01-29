import { Helmet } from 'react-helmet-async';

import CustomerOutstandingPage from 'src/sections/Outstanding/view/customer-outstanding';

// ----------------------------------------------------------------------

export default function OutstandingPage() {
  return (
    <>
      <Helmet>
        <title> Outstanding </title>
      </Helmet>

      <CustomerOutstandingPage />
    </>
  );
}
