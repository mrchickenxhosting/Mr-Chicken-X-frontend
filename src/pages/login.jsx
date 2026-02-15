import { Helmet } from 'react-helmet-async';

import { LoginView } from 'src/sections/login';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Login | Mr-Chicken-X </title>
      </Helmet>

      <LoginView />
    </>
  );
}
