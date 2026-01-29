import { Helmet } from 'react-helmet-async';

import { TraderMasterPage } from 'src/sections/Masters/Traders/view';

// ----------------------------------------------------------------------

export default function TraderPage() {
  return (
    <>
      <Helmet>
        <title> Trader</title>
      </Helmet>

      <TraderMasterPage />
    </>
  );
}
