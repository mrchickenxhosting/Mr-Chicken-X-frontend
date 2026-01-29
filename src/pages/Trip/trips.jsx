import { Helmet } from 'react-helmet-async';

import DriverTripsPage from 'src/sections/Driver/Trip/view/Trip-view';

// ----------------------------------------------------------------------

export default function TripsPage() {
  return (
    <>
      <Helmet>
        <title> Trips</title>
      </Helmet>

     <DriverTripsPage />
    </>
  );
}
