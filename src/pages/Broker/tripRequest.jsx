
import { Helmet } from 'react-helmet-async';

import BrokerTripsPage from 'src/sections/BrokerTrips/TripRequests/view/TripRequest-view';
// ----------------------------------------------------------------------

export default function LifitingPage() {
  return (
    <>
      <Helmet>
        <title> Broker Trips</title>
      </Helmet>

      <BrokerTripsPage />
    </>
  );
}
