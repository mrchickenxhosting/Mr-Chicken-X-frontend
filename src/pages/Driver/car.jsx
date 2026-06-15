import { Helmet } from 'react-helmet-async';

import { CarMasterPage } from 'src/sections/Masters/Car/view';

// ----------------------------------------------------------------------

export default function LifitingPage() {
  return (
    <>
      <Helmet>
        <title> Cars</title>
      </Helmet>

      <CarMasterPage />
    </>
  );
}
