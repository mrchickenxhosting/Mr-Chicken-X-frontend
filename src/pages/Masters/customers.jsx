import { Helmet } from 'react-helmet-async';

import { CustomerMasterPage } from 'src/sections/Masters/Customers/view';

// ----------------------------------------------------------------------

export default function CustomerPage() {
  return (
    <>
      <Helmet>
        <title> Cutomer Master</title>
      </Helmet>

      <CustomerMasterPage />
    </>
  );
}
