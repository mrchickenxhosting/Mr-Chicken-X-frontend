import { Helmet } from 'react-helmet-async';

import BrokerMasterPage from 'src/sections/Masters/Broker/view/Broker-view';

// ----------------------------------------------------------------------

export default function ManagerPage() {
  return (
    <>
      <Helmet>
        <title> Broker Master</title>
      </Helmet>

      <BrokerMasterPage />
    </>
  );
}
