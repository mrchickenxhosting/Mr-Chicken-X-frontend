import { getUser } from 'src/utils/session';
   
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

// ----------------------------------------------------------------------

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
    roles: ['TRADER', 'MANAGER'],
  },

  // ===== TRADER & MANAGER =====
  {
    title: 'Masters',
    icon: icon('ic_user'),
    roles: ['TRADER', 'MANAGER'],
    children: [
      { title: 'Managers', path: '/user/managers', roles: ['TRADER'] },
      { title: 'Delivery Patner', path: '/user/drivers', roles: ['TRADER', 'MANAGER'] },
      { title: 'Lifter', path: '/user/lifter', roles: ['TRADER', 'MANAGER'] },
      { title: 'Customers', path: '/user/customers', roles: ['TRADER', 'MANAGER'] },
      { title: 'Farmers', path: '/user/farmers', roles: ['TRADER', 'MANAGER'] },
    ],
  },

  {
    title: 'Customer Outstanding',
    path: '/outstanding',
    icon: icon('ic_customer'),
    roles: ['TRADER', 'MANAGER'],
  },

  {
    title: 'Trips/Sales',
    icon: icon('ic_cart'),
    roles: ['TRADER', 'MANAGER'],
    children: [
      { title: 'Trips', path: '/trips', roles: ['TRADER', 'MANAGER'] },
      { title: 'Sales', path: '/sales', roles: ['TRADER', 'MANAGER'] },
    ],
  },

  {
    title: 'Reports',
    path: '/reports',
    icon: icon('ic_report'),
    roles: ['TRADER'],
  },

  // ===== ADMIN =====
  {
    title: 'Admin',
    icon: icon('ic_admin'),
    roles: ['ADMIN'],
    children: [
      { title: 'Dashboard', path: '/admin/dashboard', roles: ['ADMIN'] },
      { title: 'Traders', path: '/admin/traders', roles: ['ADMIN'] },
    ],
  },

  // ===== DRIVER =====
  // {
  //   title: 'Trips',
  //   path: '/trips',
  //   icon: icon('ic_trip'),
  //   roles: ['DRIVER'],
  // },
  {
    title: 'Lifting',
    path: '/lifting',
    icon: icon('ic_loading'),
    roles: ['DRIVER','LIFTER'],
  },
  {
    title: 'Sales',
    path: '/chicken-sales',
    icon: icon('ic_cart'),
    roles: ['DRIVER'],
  },
];

// ----------------------------------------------------------------------
// 🔥 ROLE FILTER LOGIC (FINAL)
// ----------------------------------------------------------------------

const filterNavByRole = (items, user) => {
  if (!user) return [];

  /* ================= SUPERADMIN ================= */
  if (user.role === 'SUPERADMIN') {
    const adminItem = items.find((item) => item.title === 'Admin');

    if (!adminItem) return [];

    return [
      {
        ...adminItem,
        children: adminItem.children.filter((child) =>
          ['/admin/dashboard', '/admin/traders'].includes(child.path)
        ),
      },
    ];
  }

  /* ================= PLATFORM ADMIN ================= */
  if (user.isPlatformAdmin) {
    return items
      .filter(
        (item) =>
          !item.roles ||
          item.roles.includes('TRADER') ||
          item.roles.includes('ADMIN')
      )
      .map((item) => ({
        ...item,
        children: item.children
          ? item.children.filter(
              (child) =>
                !child.roles ||
                child.roles.includes('TRADER') ||
                child.roles.includes('ADMIN')
            )
          : undefined,
      }))
      .filter((item) => !item.children || item.children.length > 0);
  }

  /* ================= NORMAL USER ================= */
  const { role } = user;

  return items
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children
        ? item.children.filter(
            (child) => !child.roles || child.roles.includes(role)
          )
        : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0);
};

// ----------------------------------------------------------------------

export const getNavConfig = () => {
  const user = getUser();
  return filterNavByRole(navConfig, user);
};
