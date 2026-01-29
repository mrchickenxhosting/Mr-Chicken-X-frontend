import { Helmet } from 'react-helmet-async';

import { DriverMasterPage } from 'src/sections/Masters/Drivers/view';

// ----------------------------------------------------------------------

export default function DriverPage() {
  return (
    <>
      <Helmet>
        <title> Driver Master</title>
      </Helmet>

      <DriverMasterPage />
    </>
  );
}
