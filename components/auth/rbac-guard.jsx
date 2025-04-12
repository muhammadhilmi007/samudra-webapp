// components/auth/rbac-guard.jsx
"use client";

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { hasRole, hasPermission, hasAccess } from '@/lib/auth';

/**
 * RBACGuard component for conditionally rendering UI elements based on user roles and permissions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} [props.requiredRoles=[]] - Roles required to render the children
 * @param {string[]} [props.requiredPermissions=[]] - Permissions required to render the children
 * @param {Object} [props.requiredAccess] - Resource-based access control
 * @param {string} [props.requiredAccess.resource] - Resource to check access for
 * @param {string} [props.requiredAccess.action] - Action to check access for
 * @param {React.ReactNode} [props.fallback=null] - Component to render if not authorized
 * @returns {React.ReactNode}
 */
export default function RBACGuard({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  requiredAccess = null,
  fallback = null
}) {
  const [authorized, setAuthorized] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setAuthorized(false);
      return;
    }

    let isAuthorized = true;

    // Check roles if specified
    if (requiredRoles.length > 0) {
      isAuthorized = isAuthorized && requiredRoles.some(role => hasRole(role));
    }

    // Check permissions if specified
    if (requiredPermissions.length > 0) {
      isAuthorized = isAuthorized && requiredPermissions.some(perm => hasPermission(perm));
    }

    // Check resource-based access if specified
    if (requiredAccess && requiredAccess.resource && requiredAccess.action) {
      isAuthorized = isAuthorized && hasAccess(requiredAccess.resource, requiredAccess.action);
    }

    setAuthorized(isAuthorized);
  }, [isAuthenticated, user, requiredRoles, requiredPermissions, requiredAccess]);

  // Render children if authorized, otherwise render fallback
  return authorized ? children : fallback;
}

/**
 * HasRole component for conditionally rendering UI elements based on user roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if user has the required role
 * @param {string|string[]} props.role - Role(s) required to render the children
 * @param {React.ReactNode} [props.fallback=null] - Component to render if user doesn't have the required role
 * @returns {React.ReactNode}
 */
export function HasRole({ children, role, fallback = null }) {
  const roles = Array.isArray(role) ? role : [role];
  return (
    <RBACGuard requiredRoles={roles} fallback={fallback}>
      {children}
    </RBACGuard>
  );
}

/**
 * HasPermission component for conditionally rendering UI elements based on user permissions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if user has the required permission
 * @param {string|string[]} props.permission - Permission(s) required to render the children
 * @param {React.ReactNode} [props.fallback=null] - Component to render if user doesn't have the required permission
 * @returns {React.ReactNode}
 */
export function HasPermission({ children, permission, fallback = null }) {
  const permissions = Array.isArray(permission) ? permission : [permission];
  return (
    <RBACGuard requiredPermissions={permissions} fallback={fallback}>
      {children}
    </RBACGuard>
  );
}

/**
 * HasAccess component for conditionally rendering UI elements based on resource-based access control
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if user has access
 * @param {string} props.resource - Resource to check access for
 * @param {string} props.action - Action to check access for
 * @param {React.ReactNode} [props.fallback=null] - Component to render if user doesn't have access
 * @returns {React.ReactNode}
 */
export function HasAccess({ children, resource, action, fallback = null }) {
  return (
    <RBACGuard requiredAccess={{ resource, action }} fallback={fallback}>
      {children}
    </RBACGuard>
  );
}