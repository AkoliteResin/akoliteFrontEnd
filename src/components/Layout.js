import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { menuItems } from '../utils/menuItems';
import { hasAccessToMenu, getAccessibleMenuItems } from '../utils/rolePermissions';

const drawerWidth = 280;

export default function Layout({ onLogout, user }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Filter menu items based on user role
  const accessibleMenuItems = getAccessibleMenuItems(user?.role, menuItems);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#111827', color: 'white' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, minHeight: 70, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, letterSpacing: '0.05em', color: '#fff', '&:hover': { opacity: 0.8 } }}>
          AKOLITE <span style={{ color: theme.palette.primary.main }}>ADMIN</span>
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {accessibleMenuItems.map((item) => {
          const isActive = location.pathname === item.link;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isSubmenuOpen = expandedMenu === item.title;
          const isSubmenuActive = hasSubmenu && item.submenu.some(sub => location.pathname === sub.link);

          const handleToggleSubmenu = () => {
            setExpandedMenu(isSubmenuOpen ? null : item.title);
          };

          const handleItemClick = () => {
            // If has submenu, toggle it
            if (hasSubmenu) {
              handleToggleSubmenu();
            }
            // If has link, navigate to it
            if (item.link) {
              navigate(item.link);
              if (isMobile) setMobileOpen(false);
            }
          };

          return (
            <div key={item.title}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={handleItemClick}
                  disabled={!item.link && !hasSubmenu}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive || isSubmenuActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive || isSubmenuActive ? theme.palette.primary.light : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title} 
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem', 
                      fontWeight: isActive || isSubmenuActive ? 600 : 400,
                      color: isActive || isSubmenuActive ? '#fff' : 'rgba(255,255,255,0.7)'
                    }} 
                  />
                  {hasSubmenu && (isSubmenuOpen ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>

              {/* Submenu */}
              {hasSubmenu && (
                <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.submenu.map((subitem) => {
                      const isSubActive = location.pathname === subitem.link;
                      return (
                        <ListItem key={subitem.title} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => {
                              navigate(subitem.link);
                              if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                              borderRadius: 1,
                              bgcolor: isSubActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.1)',
                              },
                              pl: 2,
                            }}
                          >
                            <ListItemText 
                              primary={subitem.title} 
                              primaryTypographyProps={{ 
                                fontSize: '0.85rem', 
                                fontWeight: isSubActive ? 600 : 400,
                                color: isSubActive ? '#fff' : 'rgba(255,255,255,0.6)'
                              }} 
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </div>
          );
        })}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#fff' }}>{user?.name || 'Admin User'}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{user?.email}</Typography>
          </Box>
        </Box>
        <button
          onClick={() => {
            onLogout();
            navigate('/login');
          }}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Logout
        </button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f4f6' }}>
      <CssBaseline />
      
      {/* Top App Bar (Mobile Only or Full Width if needed, but usually Sidebar covers left) */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            {menuItems.find(i => i.link === location.pathname)?.title || 'Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8 // Toolbar height
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
