import { Helmet } from 'react-helmet-async';

import ChangePasswordView from 'src/sections/auth/change-password-view';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Change Password | Mr-Chicken-X </title>
      </Helmet>

      <ChangePasswordView />
    </>
  );
}
