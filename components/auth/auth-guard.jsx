// components/auth/auth-guard.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '@/lib/redux/slices/authSlice';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children, requiredRoles = [], requiredPermissions = [] }) {
  const [loading, setLoading] = useState(true);
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
      } catch (error) {
        // Redirect to login if authentication fails
        router.push('/login');
        return;
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [dispatch, isAuthenticated, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Check if the user has the required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    router.push('/unauthorized');
    return null;
  }

  // Check if the user has at least one of the required permissions
  if (
    requiredPermissions.length > 0 &&
    user?.permissions &&
    !requiredPermissions.some(perm => user.permissions.includes(perm))
  ) {
    router.push('/unauthorized');
    return null;
  }

  // User is authenticated and has required roles/permissions
  return children;
}