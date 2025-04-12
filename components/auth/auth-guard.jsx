// components/auth/auth-guard.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '@/lib/redux/slices/authSlice';
import { hasRole, hasPermission, hasAccess } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

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