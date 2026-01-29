import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import {useRef, useState, useEffect,  } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';

import { getUser } from 'src/utils/session';

import { account } from 'src/_mock/account';

import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';

import { NAV } from './config-layout';
import { getNavConfig } from './config-navigation';


// ----------------------------------------------------------------------

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
  const upLg = useResponsive('up', 'lg');
  const user = getUser();
  const navConfig = getNavConfig();


  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const renderAccount = (collapsed) =>
    !collapsed && (
      <Box
        sx={{
          my: 3,
          mx: 2.5,
          py: 2,
          px: 2.5,
          display: 'flex',
          borderRadius: 1.5,
          alignItems: 'center',
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
        }}
      >
        <Avatar src={account.photoURL} alt="photoURL" />
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle2">{user?.name}</Typography>
        </Box>
      </Box>
    );

  const renderMenu = (collapsed) => (
    <Stack component="nav" spacing={0.5} sx={{ px: collapsed ? 0 : 2 }}>
      {navConfig.map((item) => (
        <NavItem
          key={item.title}
          item={item}
          isCollapsed={collapsed}
        />
      ))}
    </Stack>
  );

  const renderHeader = (collapsed) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        px: 2,
        py: 2,
      }}
    >
      <Logo sx={{ ...(collapsed && { transform: 'scale(0.8)' }) }} />
    </Box>
  );

  return (
    <>
      {/* Collapse / Expand Arrow */}
      {upLg && (
        <IconButton
          onClick={toggleCollapse}
          sx={{
            position: 'fixed',
            top: 24,
            left: isCollapsed ? 80 - 15 : NAV.WIDTH - 15,
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: (theme) => theme.zIndex.drawer + 2,
            boxShadow: (theme) => theme.shadows[1],
            transition: 'left 0.3s',
          }}
        >
          <Icon
            icon={
              isCollapsed
                ? 'eva:arrow-ios-forward-fill'
                : 'eva:arrow-ios-back-fill'
            }
            width={20}
          />
        </IconButton>
      )}

      <Box
        sx={{
          flexShrink: { lg: 0 },
          width: { lg: isCollapsed ? 80 : NAV.WIDTH },
          transition: 'width 0.3s',
        }}
      >
        {upLg ? (
          <Box
            sx={{
              height: 1,
              position: 'fixed',
              width: isCollapsed ? 80 : NAV.WIDTH,
              transition: 'width 0.3s',
              bgcolor: 'background.paper',
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              zIndex: (theme) => theme.zIndex.drawer,
            }}
          >
            {renderHeader(isCollapsed)}

            <Scrollbar
              sx={{
                height: 1,
                '& .simplebar-content': {
                  height: 1,
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
            >
              {renderAccount(isCollapsed)}
              {renderMenu(isCollapsed)}
              <Box sx={{ flexGrow: 1 }} />
            </Scrollbar>
          </Box>
        ) : (
          <Drawer
            open={openNav}
            onClose={onCloseNav}
            PaperProps={{ sx: { width: NAV.WIDTH } }}
          >
            {renderHeader(false)}
            <Scrollbar>
              {renderAccount(false)}
              {renderMenu(false)}
            </Scrollbar>
          </Drawer>
        )}
      </Box>
    </>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item, isCollapsed }) {
  const pathname = usePathname();
  const anchorRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [openInline, setOpenInline] = useState(false);

  const isActive =
    item.path &&
    (pathname === item.path ||
      pathname.startsWith(`${item.path}/`));

  const isChildActive =
    item.children &&
    item.children.some(
      (child) =>
        pathname === child.path ||
        pathname.startsWith(`${child.path}/`)
    );

  const active = isActive || isChildActive;

const handleOpenPopover = (event) => {
  if (isCollapsed && item.children) {
    setAnchorEl(event.currentTarget);
  }
};

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const parentButton = (
    <ListItemButton
  ref={anchorRef}
  component={!item.children ? RouterLink : 'div'}
  href={!item.children ? item.path : undefined}
  onClick={() => !isCollapsed && item.children && setOpenInline((p) => !p)}
  onMouseEnter={handleOpenPopover}
  sx={{
    minHeight: 44,
    justifyContent: isCollapsed ? 'center' : 'flex-start',
    ...(active && {
      color: 'primary.main',
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
    }),
  }}
>

      <Box sx={{ width: 24, height: 24 }}>{item.icon}</Box>

      {!isCollapsed && (
        <Box sx={{ ml: 2, flexGrow: 1 }}>{item.title}</Box>
      )}

      {!isCollapsed && item.children && (
        <Icon
          icon={
            openInline
              ? 'eva:chevron-up-fill'
              : 'eva:chevron-down-fill'
          }
          width={18}
        />
      )}
    </ListItemButton>
  );

  return (
    <>
      {isCollapsed && item.children ? (
        <>
          <Tooltip title={item.title} placement="right">
            {parentButton}
          </Tooltip>

          <Popover
  open={Boolean(anchorEl)}
  anchorEl={anchorEl}
  onClose={handleClosePopover}
  anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
  transformOrigin={{ vertical: 'center', horizontal: 'left' }}
  disableRestoreFocus
  PaperProps={{
    sx: {
      p: 1,
      minWidth: 180,
      pointerEvents: 'auto',
    },
    onMouseEnter: () => setAnchorEl(anchorRef.current),
    onMouseLeave: handleClosePopover,
  }}
>

            <Stack spacing={0.5}>
              {item.children.map((child) => {
                const childActive =
                  pathname === child.path ||
                  pathname.startsWith(`${child.path}/`);

                return (
                  <ListItemButton
                    key={child.title}
                    component={RouterLink}
                    href={child.path}
                    sx={{
                      borderRadius: 0.75,
                      typography: 'body2',
                      ...(childActive && {
                        color: 'primary.main',
                        fontWeight: 'fontWeightSemiBold',
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.08),
                      }),
                    }}
                  >
                    {child.title}
                  </ListItemButton>
                );
              })}
            </Stack>
          </Popover>
        </>
      ) : (
        <>
          {parentButton}

          {!isCollapsed &&
            item.children &&
            openInline && (
              <Stack spacing={0.5} sx={{ pl: 4, mt: 0.5 }}>
                {item.children.map((child) => {
                  const childActive =
                    pathname === child.path ||
                    pathname.startsWith(`${child.path}/`);

                  return (
                    <ListItemButton
                      key={child.title}
                      component={RouterLink}
                      href={child.path}
                      sx={{
                        minHeight: 36,
                        borderRadius: 0.75,
                        typography: 'body2',
                        ...(childActive && {
                          color: 'primary.main',
                          fontWeight: 'fontWeightSemiBold',
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.08),
                        }),
                      }}
                    >
                      {child.title}
                    </ListItemButton>
                  );
                })}
              </Stack>
            )}
        </>
      )}
    </>
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
  isCollapsed: PropTypes.bool,
};
