import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import { isAuthenticated } from 'src/utils/session';

import DashboardLayout from 'src/layouts/dashboard';

// ================= PAGES =================
export const LoginPage = lazy(() => import('src/pages/login'));
export const IndexPage = lazy(() => import('src/pages/dashboard'));

export const ManagerPage = lazy(() => import('src/pages/Masters/managers'));
export const DriverPage = lazy(() => import('src/pages/Masters/drivers'));
export const CustomerPage = lazy(() => import('src/pages/Masters/customers'));
export const FarmerPage = lazy(() => import('src/pages/Masters/farmers'));

export const OutstandingPage = lazy(() => import('src/pages/outstanding'));

export const TripsPage = lazy(() => import('src/pages/Trip/trips'));
export const SalesPage = lazy(() => import('src/pages/Trip/sales'));
export const CloseDayPage = lazy(() => import('src/pages/Trip/dayclouser'));

export const ChickenSalesPage = lazy(() => import('src/pages/Driver/chickenSales'));
export const LifitingPage = lazy(() => import('src/pages/Driver/lifiting'));

export const AdminDashPage = lazy(() => import('src/pages/Admin/adminDash'));
export const TraderPage = lazy(() => import('src/pages/Admin/traders'));

export const ReportPage = lazy(() => import('src/pages/Report'));

export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ========================================

export default function Router() {
  const routes = useRoutes([
    {
      element: isAuthenticated() ? (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ) : (
        <Navigate to="/login" replace />
      ),
      children: [
        { index: true, element: <IndexPage /> }, // dashboard (default)

        // Masters
        { path: 'user/managers', element: <ManagerPage /> },
        { path: 'user/drivers', element: <DriverPage /> },
        { path: 'user/customers', element: <CustomerPage /> },
        { path: 'user/farmers', element: <FarmerPage /> },

        // Outstanding
        { path: 'outstanding', element: <OutstandingPage /> },

        // Trips / Sales
        { path: 'trips', element: <TripsPage /> },
        { path: 'sales', element: <SalesPage /> },
        { path: 'close-day', element: <CloseDayPage /> },

        // Driver
        {path: 'chicken-sales', element: <ChickenSalesPage /> },
        {path: 'lifting', element: <LifitingPage /> },

        // Admin
        {path: 'admin/dashboard', element: <AdminDashPage /> },
        {path: 'admin/traders', element: <TraderPage /> },

        // Reports
        { path: 'reports', element: <ReportPage /> },
      ],
    },

    // Public
    { path: 'login', element: <LoginPage /> },
    { path: '404', element: <Page404 /> },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);

  return routes;
}
