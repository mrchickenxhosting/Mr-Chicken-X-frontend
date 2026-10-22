import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import { getUser, isAuthenticated } from 'src/utils/session';

import DashboardLayout from 'src/layouts/dashboard';

// ================= PAGES =================
export const LoginPage = lazy(() => import('src/pages/login'));
export const ChangePasswordPage = lazy(() =>
  import('src/pages/change-password')
);
export const IndexPage = lazy(() => import('src/pages/dashboard'));

export const ManagerPage = lazy(() => import('src/pages/Masters/managers'));
export const DriverPage = lazy(() => import('src/pages/Masters/drivers'));
export const CustomerPage = lazy(() => import('src/pages/Masters/customers'));
export const FarmerPage = lazy(() => import('src/pages/Masters/farmers'));
export const LifterPage = lazy(() => import('src/pages/Masters/lifter'));
export const BrokerPage = lazy(() => import('src/pages/Masters/broker'));

export const BrokerTripPage = lazy(() =>
  import('src/pages/Broker/tripRequest')
);

export const OutstandingPage = lazy(() => import('src/pages/outstanding'));

export const TripsPage = lazy(() => import('src/pages/Trip/trips'));
export const SalesPage = lazy(() => import('src/pages/Trip/sales'));
export const CloseDayPage = lazy(() => import('src/pages/Trip/dayclouser'));

export const CarMasterPage = lazy(() => import('src/pages/Driver/car'));
export const LifitingPage = lazy(() => import('src/pages/Driver/lifiting'));
export const ChickenSalesPage = lazy(() =>
  import('src/pages/Driver/chickenSales')
);

export const AdminDashPage = lazy(() => import('src/pages/Admin/adminDash'));
export const TraderPage = lazy(() => import('src/pages/Admin/traders'));

export const ReportPage = lazy(() => import('src/pages/Report'));

export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ========================================

const BrokerOnlyRoute = ({ children }) => {
  const user = getUser();

  if (user?.role !== 'BROKER') {
    return <Navigate to="/" replace />;
  }

  return children;
};

BrokerOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const NonBrokerRoute = ({ children }) => {
  const user = getUser();

  if (user?.role === 'BROKER') {
    return <Navigate to="/brokertrip" replace />;
  }

  return children;
};

NonBrokerRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function Router() {
  const user = getUser();
  const isBroker = user?.role === 'BROKER';

  const routes = useRoutes([
    {
      element: isAuthenticated() ? (
        <DashboardLayout>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ) : (
        <Navigate to="/login" replace />
      ),

      children: [
        // Default route
        {
          index: true,
          element: isBroker ? (
            <Navigate to="/brokertrip" replace />
          ) : (
            <NonBrokerRoute>
              <IndexPage />
            </NonBrokerRoute>
          ),
        },

        // Broker page: only accessible to BROKER
        {
          path: 'brokertrip',
          element: (
            <BrokerOnlyRoute>
              <BrokerTripPage />
            </BrokerOnlyRoute>
          ),
        },

        // Masters
        {
          path: 'user/lifter',
          element: <NonBrokerRoute><LifterPage /></NonBrokerRoute>,
        },
        {
          path: 'user/cars',
          element: <NonBrokerRoute><CarMasterPage /></NonBrokerRoute>,
        },
        {
          path: 'user/drivers',
          element: <NonBrokerRoute><DriverPage /></NonBrokerRoute>,
        },
        {
          path: 'user/farmers',
          element: <NonBrokerRoute><FarmerPage /></NonBrokerRoute>,
        },
        {
          path: 'user/managers',
          element: <NonBrokerRoute><ManagerPage /></NonBrokerRoute>,
        },
        {
          path: 'user/customers',
          element: <NonBrokerRoute><CustomerPage /></NonBrokerRoute>,
        },
        {
          path: 'user/broker',
          element: <NonBrokerRoute><BrokerPage /></NonBrokerRoute>,
        },

        // Outstanding
        {
          path: 'outstanding',
          element: <NonBrokerRoute><OutstandingPage /></NonBrokerRoute>,
        },

        // Trips / Sales
        {
          path: 'trips',
          element: <NonBrokerRoute><TripsPage /></NonBrokerRoute>,
        },
        {
          path: 'sales',
          element: <NonBrokerRoute><SalesPage /></NonBrokerRoute>,
        },
        {
          path: 'close-day',
          element: <NonBrokerRoute><CloseDayPage /></NonBrokerRoute>,
        },

        // Driver
        {
          path: 'chicken-sales',
          element: <NonBrokerRoute><ChickenSalesPage /></NonBrokerRoute>,
        },
        {
          path: 'lifting',
          element: <NonBrokerRoute><LifitingPage /></NonBrokerRoute>,
        },

        // Admin
        {
          path: 'admin/dashboard',
          element: <NonBrokerRoute><AdminDashPage /></NonBrokerRoute>,
        },
        {
          path: 'admin/traders',
          element: <NonBrokerRoute><TraderPage /></NonBrokerRoute>,
        },

        // Reports
        {
          path: 'reports',
          element: <NonBrokerRoute><ReportPage /></NonBrokerRoute>,
        },
      ],
    },

    // Public
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'change-password',
      element: isAuthenticated() ? (
        <Suspense fallback={null}>
          <ChangePasswordPage />
        </Suspense>
      ) : (
        <Navigate to="/login" replace />
      ),
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
