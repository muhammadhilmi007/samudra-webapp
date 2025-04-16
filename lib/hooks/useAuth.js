"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import * as authService from '@/lib/auth';

// Create API instance
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessibleMenus, setAccessibleMenus] = useState([]);
  
  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Sync auth state from localStorage to Redux
        const isAuthenticated = authService.syncAuthState();
        
        if (isAuthenticated) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
          
          // Fetch user's accessible menus
          await fetchUserMenus();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // Fetch user's accessible menus
  const fetchUserMenus = async () => {
    try {
      const response = await api.get('/menus/user');
      setAccessibleMenus(response.data.data);
    } catch (error) {
      console.error('Error fetching user menus:', error);
    }
  };
  
  // Login function
  const login = async (username, password) => {
    try {
      const result = await authService.login(username, password);
      setUser(result.user);
      
      // Fetch user's accessible menus after login
      await fetchUserMenus();
      
      return result;
    } catch (error) {
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setAccessibleMenus([]);
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  // Check if user has a specific role
  const hasRole = (requiredRole) => {
    return authService.hasRole(requiredRole);
  };
  
  // Check if user has a specific permission
  const checkPermission = (requiredPermission) => {
    return authService.hasPermission(requiredPermission);
  };
  
  // Check if user has access to a specific menu
  const hasMenuAccess = (menuCode) => {
    if (!accessibleMenus || accessibleMenus.length === 0) return false;
    
    // Recursive function to search for menu in the tree
    const findMenu = (menus, code) => {
      for (const menu of menus) {
        if (menu.code === code) {
          return true;
        }
        
        if (menu.children && menu.children.length > 0) {
          const found = findMenu(menu.children, code);
          if (found) return true;
        }
      }
      
      return false;
    };
    
    return findMenu(accessibleMenus, menuCode);
  };
  
  // Get user's branch ID
  const getUserBranchId = () => {
    return authService.getUserBranchId();
  };
  
  // Update user data
  const updateUserData = (userData) => {
    authService.updateUserData(userData);
    setUser(userData);
  };
  
  // Context value
  const value = {
    user,
    loading,
    accessibleMenus,
    login,
    logout,
    hasRole,
    checkPermission,
    hasMenuAccess,
    getUserBranchId,
    updateUserData,
    refreshMenus: fetchUserMenus
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;