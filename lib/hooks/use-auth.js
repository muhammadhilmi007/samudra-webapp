import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if we're in a browser environment before accessing localStorage
    if (typeof window !== 'undefined') {
      // Check if user is logged in
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user data:', e);
          // Clear invalid data
          localStorage.removeItem('user');
        }
      }

      setLoading(false);
    }
  }, []);

  // Login user
  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Store token and user in localStorage (only in browser)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Set token and user in state
        setToken(token);
        setUser(user);
        
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message || 'Login gagal'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Terjadi kesalahan saat login'
      };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Call logout API if token exists
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and state (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      setToken(null);
      setUser(null);
      
      // Redirect to login page
      router.push('/login');
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    try {
      if (!token) return;
      
      const response = await authAPI.getMe();
      
      if (response.data.success) {
        const userData = response.data.data;
        
        // Update user in localStorage (only in browser) and state
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        setUser(userData);
        
        return { success: true, user: userData };
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      
      // If token is invalid, logout
      if (error.response?.status === 401) {
        logout();
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Terjadi kesalahan saat memperbarui data pengguna'
      };
    }
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    
    // Direct permission check
    if (user.permissions.includes(permission)) {
      return true;
    }
    
    // Check for wildcard permissions (e.g., manage_all_*)
    const wildcardPermissions = user.permissions.filter(p => p.includes('_all_'));
    
    // Extract resource type from permission (e.g., 'view_employees' -> 'employees')
    const parts = permission.split('_');
    if (parts.length >= 2) {
      const action = parts[0]; // e.g., 'view'
      const resource = parts.slice(1).join('_'); // e.g., 'employees'
      
      // Check for wildcard permissions like 'manage_all_resources'
      const hasWildcardPermission = wildcardPermissions.some(wp => {
        const wpParts = wp.split('_');
        if (wpParts.length < 3) return false;
        
        const wpAction = wpParts[0]; // e.g., 'manage'
        const wpResource = wpParts.slice(2).join('_'); // e.g., 'resources'
        
        // 'manage' action includes all other actions
        const actionMatches = wpAction === 'manage' || wpAction === action;
        
        // Check if resource matches (singular/plural handling)
        let resourceMatches = false;
        if (resource.endsWith('s') && wpResource === resource) {
          resourceMatches = true;
        } else if (wpResource.endsWith('s') && wpResource === `${resource}s`) {
          resourceMatches = true;
        }
        
        return actionMatches && resourceMatches;
      });
      
      if (hasWildcardPermission) {
        return true;
      }
      
      // Check for branch-specific permissions
      if (permission.includes('_branch_') ||
          (resource.includes('branch') && !permission.includes('_all_'))) {
        const branchPermission = `${action}_branch_${resource}`;
        const managePermission = `manage_branch_${resource}`;
        
        if (user.permissions.includes(branchPermission) ||
            user.permissions.includes(managePermission)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    if (!user || !user.permissions || !Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions) => {
    if (!user || !user.permissions || !Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  // Check if user has role
  const hasRole = (roleCode) => {
    if (!user) return false;
    
    // Check legacy role field
    if (user.role === roleCode) return true;
    
    // Check roles array
    return user.roles?.some(role => role.code === roleCode) || false;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roleCodes) => {
    if (!user || !Array.isArray(roleCodes)) return false;
    
    // Check legacy role field
    if (user.role && roleCodes.includes(user.role)) return true;
    
    // Check roles array
    return user.roles?.some(role => roleCodes.includes(role.code)) || false;
  };

  // Check if user has access to a resource
  const hasAccess = (resource, action, resourceData = null) => {
    if (!user) return false;
    
    // Map resource and action to permission patterns
    const permissionPatterns = [
      // Global permissions
      `${action}_all_${resource}s`,
      `manage_all_${resource}s`,
      'admin_access',
      
      // Resource-specific permissions
      `${action}_${resource}`,
      `manage_${resource}`,
      
      // Branch-specific permissions
      `${action}_branch_${resource}s`,
      `manage_branch_${resource}s`
    ];
    
    // Check if user has any of these permissions
    if (hasAnyPermission(permissionPatterns)) {
      return true;
    }
    
    // Check for owner-based access
    if (resourceData && user.id) {
      const ownerPermission = `${action}_own_${resource}`;
      
      if (hasPermission(ownerPermission) &&
          ((resourceData.userId && resourceData.userId === user.id) ||
           (resourceData.createdBy && resourceData.createdBy === user.id))) {
        return true;
      }
    }
    
    return false;
  };

  // Get user's primary role
  const getPrimaryRole = () => {
    if (!user || !user.roles) return null;
    return user.roles.find(role => role.isPrimary) || null;
  };

  // Get user's roles
  const getUserRoles = () => {
    if (!user || !user.roles) return [];
    return user.roles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUserData,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        hasAccess,
        getPrimaryRole,
        getUserRoles
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Return a default value if context is not available (during SSR)
  if (context === undefined) {
    return {
      user: null,
      token: null,
      loading: true,
      login: async () => ({ success: false, message: 'Auth context not available' }),
      logout: async () => {},
      refreshUserData: async () => ({ success: false, message: 'Auth context not available' }),
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      hasRole: () => false,
      hasAnyRole: () => false,
      hasAccess: () => false,
      getPrimaryRole: () => null,
      getUserRoles: () => []
    };
  }
  
  return context;
};