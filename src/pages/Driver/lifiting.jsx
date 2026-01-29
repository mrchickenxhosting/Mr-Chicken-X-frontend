import { Helmet } from 'react-helmet-async';

import TripCageEntry from 'src/sections/Driver/Lifiting/trip-cage-entry';

// ----------------------------------------------------------------------

export default function LifitingPage() {
  return (
    <>
      <Helmet>
        <title> Lifting</title>
      </Helmet>

      <TripCageEntry />
    </>
  );
}
