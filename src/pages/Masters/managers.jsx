import { Helmet } from 'react-helmet-async';

import ManagerMasterPage from 'src/sections/Masters/Managers/view/manager-view';

// ----------------------------------------------------------------------

export default function ManagerPage() {
  return (
    <>
      <Helmet>
        <title> Manager Master</title>
      </Helmet>

      <ManagerMasterPage />
    </>
  );
}
