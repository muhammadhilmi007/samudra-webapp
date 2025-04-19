/**
 * RBAC (Role-Based Access Control) utility functions
 * 
 * This file contains utility functions for working with roles, permissions,
 * and access control throughout the application.
 */

/**
 * Maps a resource type and action to permission patterns
 *
 * @param {string} resource - The resource type (e.g., 'employee', 'branch', 'customer')
 * @param {string} action - The action to perform (e.g., 'view', 'create', 'edit', 'delete')
 * @param {boolean} includeOwn - Whether to include own resource permissions
 * @returns {string[]} - Array of permission patterns that would grant access
 */
export const getPermissionPatterns = (resource, action, includeOwn = false) => {
  const patterns = [
    // Global permissions
    `${action}_all_${resource}s`,
    `manage_all_${resource}s`,
    'admin_access',
    
    // Resource-specific permissions
    `${action}_${resource}`,
    `manage_${resource}`,
    
    // Branch-specific permissions
    `${action}_branch_${resource}s`,
    `manage_branch_${resource}s`,
  ];
  
  // Add own resource permissions if requested
  if (includeOwn) {
    patterns.push(`${action}_own_${resource}`);
    patterns.push(`manage_own_${resource}`);
  }
  
  return patterns;
};

/**
 * Gets the display name for a permission code
 * 
 * @param {string} permissionCode - The permission code (e.g., 'view_employees')
 * @returns {string} - Human-readable permission name
 */
export const getPermissionDisplayName = (permissionCode) => {
  return permissionCode
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Groups permissions by category
 * 
 * @param {Array} permissions - Array of permission objects
 * @returns {Object} - Object with categories as keys and arrays of permissions as values
 */
export const groupPermissionsByCategory = (permissions) => {
  const grouped = {};
  
  permissions.forEach(permission => {
    const category = permission.category || 'other';
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push(permission);
  });
  
  return grouped;
};

/**
 * Gets the display name for a category
 * 
 * @param {string} category - The category code (e.g., 'user_management')
 * @returns {string} - Human-readable category name
 */
export const getCategoryDisplayName = (category) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Checks if a user has access to a specific resource
 *
 * @param {Object} user - The user object
 * @param {string} resourceType - The type of resource (e.g., 'employee', 'branch')
 * @param {string} resourceId - The ID of the resource
 * @param {string} action - The action to perform (e.g., 'view', 'edit')
 * @param {Object} resourceData - Additional resource data for context-based checks
 * @returns {boolean} - Whether the user has access
 */
export const checkResourceAccess = (user, resourceType, resourceId, action, resourceData = {}) => {
  if (!user || !user.permissions) return false;
  
  // Check for admin access first (super admin permission)
  if (user.permissions.includes('admin_access') ||
      (user.roles && user.roles.some(role => role.code === 'admin'))) {
    return true;
  }
  
  // Check for global permissions
  const globalPermissions = [
    `${action}_all_${resourceType}s`,
    `manage_all_${resourceType}s`,
  ];
  
  if (globalPermissions.some(perm => user.permissions.includes(perm))) {
    return true;
  }
  
  // Check for branch-specific permissions
  const branchPermissions = [
    `${action}_branch_${resourceType}s`,
    `manage_branch_${resourceType}s`,
  ];
  
  if (branchPermissions.some(perm => user.permissions.includes(perm))) {
    // For branch-specific resources, check if user belongs to the branch
    if (resourceType === 'branch') {
      return resourceId === user.cabangId;
    }
    
    // For other resources, check if they belong to user's branch
    if (resourceData.cabangId) {
      return resourceData.cabangId === user.cabangId;
    }
  }
  
  // Check for specific permissions
  const specificPermissions = [
    `${action}_${resourceType}`,
    `manage_${resourceType}`,
  ];
  
  if (specificPermissions.some(perm => user.permissions.includes(perm))) {
    return true;
  }
  
  // Check for owner-based access
  const ownerPermissions = [
    `${action}_own_${resourceType}`,
    `manage_own_${resourceType}`,
  ];
  
  if (ownerPermissions.some(perm => user.permissions.includes(perm))) {
    // Check if resource belongs to the user
    if (resourceData.userId && resourceData.userId === user.id) {
      return true;
    }
    
    // Check if resource was created by the user
    if (resourceData.createdBy && resourceData.createdBy === user.id) {
      return true;
    }
  }
  
  return false;
};

/**
 * Gets access level for a menu based on user permissions
 * 
 * @param {Object} user - The user object
 * @param {Object} menu - The menu object
 * @returns {Object} - Object with access flags (canView, canCreate, canEdit, canDelete)
 */
export const getMenuAccess = (user, menu) => {
  if (!user || !user.permissions || !menu) {
    return { canView: false, canCreate: false, canEdit: false, canDelete: false };
  }
  
  // Admin override - admins have full access to all menus
  if (user.permissions.includes('admin_access') ||
      (user.roles && user.roles.some(role => role.code === 'admin'))) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true };
  }
  
  // Check if user has required permissions for the menu
  if (menu.requiredPermissions && menu.requiredPermissions.length > 0) {
    // Check for direct permissions
    const hasDirectPermission = menu.requiredPermissions.some(permission =>
      user.permissions.includes(permission)
    );
    
    // Check for wildcard permissions
    const hasWildcardPermission = menu.requiredPermissions.some(permission => {
      const parts = permission.split('_');
      if (parts.length < 2) return false;
      
      const action = parts[0]; // e.g., 'view'
      const resource = parts.slice(1).join('_'); // e.g., 'employees'
      
      return user.permissions.some(userPerm => {
        if (userPerm.includes('_all_')) {
          const userPermParts = userPerm.split('_');
          if (userPermParts.length < 3) return false;
          
          const userAction = userPermParts[0]; // e.g., 'manage'
          const userResource = userPermParts.slice(2).join('_'); // e.g., 'resources'
          
          // 'manage' action includes all other actions
          const actionMatches = userAction === 'manage' || userAction === action;
          
          // Check if resource matches (singular/plural handling)
          let resourceMatches = false;
          if (resource.endsWith('s') && userResource === resource) {
            resourceMatches = true;
          } else if (userResource.endsWith('s') && userResource === `${resource}s`) {
            resourceMatches = true;
          }
          
          return actionMatches && resourceMatches;
        }
        return false;
      });
    });
    
    if (!hasDirectPermission && !hasWildcardPermission) {
      return { canView: false, canCreate: false, canEdit: false, canDelete: false };
    }
  }
  
  // Check for cached menu access if available
  if (user._menuAccess && user._menuAccess[menu._id]) {
    const menuAccess = user._menuAccess[menu._id];
    return {
      canView: menuAccess.canView,
      canCreate: menuAccess.canCreate,
      canEdit: menuAccess.canEdit,
      canDelete: menuAccess.canDelete
    };
  }
  
  // Default access based on permissions
  const menuCode = menu.code || '';
  const resourceName = menuCode.replace(/-/g, '_');
  
  return {
    canView: true,
    canCreate:
      user.permissions.includes(`create_${resourceName}`) ||
      user.permissions.includes(`manage_${resourceName}`) ||
      user.permissions.includes(`create_all_${resourceName}s`) ||
      user.permissions.includes(`manage_all_${resourceName}s`),
    canEdit:
      user.permissions.includes(`edit_${resourceName}`) ||
      user.permissions.includes(`manage_${resourceName}`) ||
      user.permissions.includes(`edit_all_${resourceName}s`) ||
      user.permissions.includes(`manage_all_${resourceName}s`),
    canDelete:
      user.permissions.includes(`delete_${resourceName}`) ||
      user.permissions.includes(`manage_${resourceName}`) ||
      user.permissions.includes(`delete_all_${resourceName}s`) ||
      user.permissions.includes(`manage_all_${resourceName}s`),
  };
};