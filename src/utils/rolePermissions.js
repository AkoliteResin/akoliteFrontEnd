// Role-based access control configuration
export const rolePermissions = {
  Admin: [
    'Sales',
    'General Manager',
    'Store Manager',
    'Production Team',
    'Account',
    'Collection',
    'Procurement',
    'Logistics',
  ],
  Sales: [
    'Sales',
  ],
  'General Manager': [
    'General Manager',
  ],
  'Store Manager': [
    'Store Manager',
  ],
  'Production Team': [
    'Production Team',
  ],
  Account: [
    'Account',
  ],
  Collection: [
    'Collection',
  ],
  Procurement: [
    'Procurement',
  ],
  Logistics: [
    'Logistics',
  ],
};

// Check if user has access to a menu item
export const hasAccessToMenu = (userRole, menuTitle) => {
  if (userRole === 'Admin') {
    return true; // Admin has access to everything
  }
  
  const allowedMenus = rolePermissions[userRole] || [];
  return allowedMenus.includes(menuTitle);
};

// Get only accessible menu items for a user
export const getAccessibleMenuItems = (userRole, allMenuItems) => {
  return allMenuItems.filter(item => hasAccessToMenu(userRole, item.title));
};
