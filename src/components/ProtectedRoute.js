import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { hasAccessToMenu } from '../utils/rolePermissions';

// Map routes to menu titles
const routeToMenuMap = {
  '/sales': 'Sales',
  '/client-payments': 'Sales',
  '/future-orders': 'Sales',
  '/clients-details': 'Sales',
  '/payments-due': 'Sales',
  '/general-manager': 'General Manager',
  '/day-summary': 'General Manager',
  '/expenses': 'General Manager',
  '/location-report': 'General Manager',
  '/client-inactivity': 'General Manager',
  '/all-orders': 'General Manager',
  '/purchase-report': 'General Manager',
  '/raw-materials': 'General Manager', // Also for Store Manager and Production Team
  '/resin-calculator': 'General Manager', // Also for Store Manager
  '/resin-production': 'Production Team',
  '/produce': 'Production Team',
  '/store-manager': 'Store Manager',
  '/production-team': 'Production Team',
  '/production': 'Production Team',
  '/account': 'Account',
  '/billing': 'Account',
  '/billing-history': 'Account',
  '/collection': 'Collection',
  '/payment-collected': 'Collection',
  '/sellers': 'Procurement',
};

const ProtectedRoute = ({ userRole, path, children }) => {
  // Get the menu title for this route
  const menuTitle = routeToMenuMap[path];

  // If no menu mapping, allow access (probably a generic route like home)
  if (!menuTitle) {
    return children;
  }

  // Check if user has access
  if (userRole === 'Admin' || hasAccessToMenu(userRole, menuTitle)) {
    return children;
  }

  // Unauthorized - show access denied
  return (
    <Box sx={{ p: 3, textAlign: 'center', mt: 10 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#ef4444', mb: 2 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" color="textSecondary">
        You don't have permission to access this page. Your role is: <strong>{userRole}</strong>
      </Typography>
    </Box>
  );
};

export default ProtectedRoute;
