import { Helmet } from 'react-helmet-async';

import { LifterMasterPage } from 'src/sections/Masters/Lifter/view';

// ----------------------------------------------------------------------

export default function DriverPage() {
  return (
    <>
      <Helmet>
        <title> Driver Master</title>
      </Helmet>

      <LifterMasterPage />
    </>
  );
}
