'use client';

import { useAuth } from '@/lib/hooks/use-auth';

/**
 * PermissionGuard component for conditionally rendering UI elements based on permissions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} [props.permissions=[]] - Permissions required to render children (any of these)
 * @param {string[]} [props.allPermissions=[]] - Permissions required to render children (all of these)
 * @param {string[]} [props.roles=[]] - Roles required to render children (any of these)
 * @param {Object} [props.resourceAccess] - Resource-based access control
 * @param {string} [props.resourceAccess.resource] - Resource to check access for
 * @param {string} [props.resourceAccess.action] - Action to check access for
 * @param {React.ReactNode} [props.fallback=null] - Component to render if unauthorized
 * @returns {React.ReactNode}
 */
export default function PermissionGuard({ 
  children, 
  permissions = [], 
  allPermissions = [],
  roles = [], 
  resourceAccess = null,
  fallback = null
}) {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    hasRole, 
    hasAnyRole, 
    hasAccess 
  } = useAuth();

  // Check authorization based on roles and permissions
  let isAuthorized = true;

  // Check roles if specified
  if (roles.length > 0) {
    isAuthorized = isAuthorized && hasAnyRole(roles);
  }

  // Check any permissions if specified
  if (permissions.length > 0) {
    isAuthorized = isAuthorized && hasAnyPermission(permissions);
  }

  // Check all permissions if specified
  if (allPermissions.length > 0) {
    isAuthorized = isAuthorized && hasAllPermissions(allPermissions);
  }

  // Check resource-based access if specified
  if (resourceAccess) {
    const { resource, action, data } = resourceAccess;
    if (resource && action) {
      isAuthorized = isAuthorized && hasAccess(resource, action, data);
    }
  }

  // Check for admin override - if user has admin role or admin_access permission
  if (!isAuthorized && (hasRole('admin') || hasPermission('admin_access'))) {
    isAuthorized = true;
  }

  // Render children if authorized, otherwise render fallback
  return isAuthorized ? children : fallback;
}