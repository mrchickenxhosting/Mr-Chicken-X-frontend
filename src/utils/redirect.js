
export const getDefaultRouteByRole = (user) => {
  if (!user) return '/login';

  // SUPERADMIN has highest priority
  if (user.role === 'SUPERADMIN') {
    return '/admin/traders';
  }

  // Platform admin behaves like trader
  if (user.isPlatformAdmin) {
    return '/';
  }

  switch (user.role) {
    case 'TRADER':
    case 'MANAGER':
      return '/';

    case 'DRIVER':
    case 'LIFTER':
      return '/lifting';

    case 'BROKER':
      return '/brokertrip';

    default:
      return '/login';
  }
};
