// components/auth/auth-guard.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '@/lib/redux/slices/authSlice';
import { hasRole, hasPermission, hasAccess } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

// Helper function to check if user has any of the required roles
const hasAnyRole = (requiredRoles) => {
  return requiredRoles.some(role => hasRole(role));
};

// Helper function to check if user has any of the required permissions
const hasAnyPermission = (requiredPermissions) => {
  return requiredPermissions.some(permission => hasPermission(permission));
};

/**
 * AuthGuard component for protecting routes based on authentication and authorization
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} [props.requiredRoles=[]] - Roles required to access the route
 * @param {string[]} [props.requiredPermissions=[]] - Permissions required to access the route
 * @param {Object} [props.requiredAccess] - Resource-based access control
 * @param {string} [props.requiredAccess.resource] - Resource to check access for
 * @param {string} [props.requiredAccess.action] - Action to check access for
 * @param {string} [props.redirectTo="/login"] - Where to redirect if unauthorized
 * @returns {React.ReactNode}
 */
export default function AuthGuard({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  requiredAccess = null,
  redirectTo = "/login"
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If not authenticated, fetch user data
        if (!isAuthenticated) {
          await dispatch(getMe()).unwrap();
        }

        // Check authorization based on roles and permissions
        let isAuthorized = true;

        // Check roles if specified
        if (requiredRoles.length > 0) {
          isAuthorized = isAuthorized && hasAnyRole(requiredRoles);
        }

        // Check permissions if specified
        if (requiredPermissions.length > 0) {
          isAuthorized = isAuthorized && hasAnyPermission(requiredPermissions);
        }

        // Check resource-based access if specified
        if (requiredAccess) {
          const { resource, action, data } = requiredAccess;
          if (resource && action) {
            isAuthorized = isAuthorized && hasAccess(resource, action, data);
          }
        }

        // Check for admin override - if user has admin role or admin_access permission
        if (!isAuthorized && (hasRole('admin') || hasPermission('admin_access'))) {
          console.log('Admin override applied for access control');
          isAuthorized = true;
        }
        
        // Check for direktur role override - enhanced detection
        const isDirektur = (
          // Check by username
          user?.username === 'ahmad_direktur' ||
          // Check in user.roles array
          user?.roles?.some(role => 
            role.name?.toLowerCase() === 'direktur' || 
            role.code?.toLowerCase() === 'direktur' || 
            role.kodeRole?.toLowerCase() === 'direktur') ||
          // Check in legacy user.role field
          (typeof user?.role === 'string' && user.role.toLowerCase() === 'direktur')
        );
          
        // Special override for RBAC features
        if (!isAuthorized && isDirektur) {
          // Check if this is an RBAC-related route
          const isRbacRoute = [
            '/users', 
            '/roles', 
            '/permissions', 
            '/menu-access'
          ].some(route => window.location.pathname.startsWith(route));
          
          if (isRbacRoute) {
            console.log('Direktur role override applied for RBAC access control');
            isAuthorized = true;
          } else {
            console.log('Direktur role override applied for general access control');
            isAuthorized = true;
          }
        }

        setAuthorized(isAuthorized);

        // Redirect if not authorized
        if (!isAuthorized) {
          router.push(requiredRoles.length > 0 || requiredPermissions.length > 0 || requiredAccess 
            ? '/unauthorized' 
            : redirectTo);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Redirect to login if authentication fails
        router.push(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [
    dispatch, 
    isAuthenticated, 
    router, 
    requiredRoles, 
    requiredPermissions, 
    requiredAccess, 
    redirectTo
  ]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // User is authenticated and authorized
  return authorized ? children : null;
}