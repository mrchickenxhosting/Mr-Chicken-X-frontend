import { Helmet } from 'react-helmet-async';

import { FarmerMasterPage } from 'src/sections/Masters/Farmers/view';

// ----------------------------------------------------------------------

export default function FarmerPage() {
  return (
    <>
      <Helmet>
        <title> Farmer Master</title>
      </Helmet>

      <FarmerMasterPage />
    </>
  );
}
