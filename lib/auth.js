"use client"

import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { store } from '@/lib/redux/store'
import { setUser, clearUser } from '@/lib/redux/slices/authSlice'

// Standardized storage keys
const TOKEN_KEY = 'samudra_auth_token'
const USER_DATA_KEY = 'samudra_user_data'

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

/**
 * Login pengguna dan dapatkan token JWT
 */
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    })
    
    if (response.data.token) {
      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, response.data.token)
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user))
      
      // Update Redux store
      store.dispatch(setUser({
        user: response.data.user,
        token: response.data.token,
        isAuthenticated: true
      }))
      
      return response.data
    }
    
    return null
  } catch (error) {
    throw error.response?.data?.message || 'Login failed'
  }
}

/**
 * Logout pengguna dan hapus data dari storage
 */
export const logout = async () => {
  try {
    const token = getAuthToken()
    
    if (token) {
      // Call logout API to invalidate token on server
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(err => console.warn('Logout API error:', err))
    }
  } catch (error) {
    console.error('Error during logout:', error)
  } finally {
    // Always clear local storage and Redux store
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_DATA_KEY)
    
    // Update Redux store
    store.dispatch(clearUser())
  }
}

/**
 * Refresh token jika diperlukan
 *
 * Fungsi ini akan mencoba memperbaharui token JWT jika token lama sudah hampir kadaluarsa.
 * Jika refresh berhasil, token baru akan disimpan di localStorage dan Redux store.
 * Jika refresh gagal, user akan di-logout.
 *
 * @returns {Promise<string|null>} Token baru jika berhasil, null jika gagal
 */
export const refreshToken = async () => {
  try {
    const currentToken = getAuthToken();
    
    // Check if we have a token to refresh
    if (!currentToken) {
      console.warn('No token available for refresh');
      return null;
    }
    
    // Add a timeout to the request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await axios.post(
      `${API_URL}/auth/refresh-token`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        },
        signal: controller.signal
      }
    );
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (response.data.token) {
      // Store the new token
      localStorage.setItem(TOKEN_KEY, response.data.token);
      
      // Update user data if it's also returned
      if (response.data.user) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user));
      }
      
      // Update Redux store with new token
      const user = response.data.user || getCurrentUser();
      if (user) {
        store.dispatch(setUser({
          user,
          token: response.data.token,
          isAuthenticated: true
        }));
      }
      
      console.log('Token refreshed successfully');
      return response.data.token;
    }
    
    console.warn('Token refresh response did not contain a new token');
    return null;
  } catch (error) {
    // Handle specific error cases
    if (error.name === 'AbortError') {
      console.error('Token refresh request timed out');
    } else if (error.response?.status === 401) {
      console.error('Unauthorized during token refresh - token may be invalid');
    } else if (error.response?.status === 403) {
      console.error('Forbidden during token refresh - user may lack permissions');
    } else {
      console.error('Error refreshing token:', error);
    }
    
    // Logout the user on refresh failure
    await logout();
    return null;
  }
}

/**
 * Ambil token dari localStorage
 */
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/**
 * Ambil data user yang sedang login
 */
export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    // First check if token is valid
    if (!isAuthenticated()) {
      // If token is invalid, clear user data
      logout()
      return null
    }
    
    const userStr = localStorage.getItem(USER_DATA_KEY)
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch (error) {
        console.error('Error parsing user data:', error)
        logout()
        return null
      }
    }
  }
  return null
}

/**
 * Cek apakah token masih valid
 *
 * Fungsi ini memeriksa apakah token JWT masih valid dan belum kadaluarsa.
 * Jika token hampir kadaluarsa (kurang dari 5 menit), fungsi ini akan mencoba
 * memperbaharui token secara otomatis di background.
 *
 * @returns {boolean} True jika token valid, false jika tidak
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (!decoded.exp) {
      console.error('Token does not contain expiration claim');
      return false;
    }
    
    if (decoded.exp < currentTime) {
      console.warn('Token has expired');
      // Clear the expired token
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }
      return false;
    }
    
    // Check if token is about to expire (less than 5 minutes)
    if (decoded.exp - currentTime < 300) {
      console.log('Token is about to expire, refreshing in background');
      
      // Use setTimeout to avoid blocking the current execution
      setTimeout(() => {
        refreshToken().catch(err => {
          console.error('Background token refresh failed:', err);
          // If refresh fails and token is very close to expiry (less than 1 minute),
          // we should consider the user as not authenticated
          if (decoded.exp - Date.now() / 1000 < 60) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem(TOKEN_KEY);
              store.dispatch(clearUser());
            }
          }
        });
      }, 0);
    }
    
    // Validate other required claims if needed
    if (!decoded.sub) {
      console.warn('Token does not contain subject claim');
      // We still consider it valid if it has an expiration that's not passed
    }
    
    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    
    // Clear the invalid token
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    
    return false;
  }
}

/**
 * Cek apakah user memiliki role tertentu
 * Mendukung role hierarchy
 */
export const hasRole = (requiredRole) => {
  const user = getCurrentUser()
  if (!user || !user.role) return false
  
  // Role hierarchy (higher index has more privileges)
  const roleHierarchy = [
    'kenek', 'supir', 'pelanggan', 'checker', 'debt_collector', 'kasir',
    'staff_penjualan', 'staff_admin', 'kepala_gudang', 'kepala_cabang',
    'manajer_distribusi', 'manajer_sdm', 'manajer_operasional',
    'manajer_pemasaran', 'manajer_keuangan', 'manajer_admin', 'direktur'
  ]
  
  const userRoleIndex = roleHierarchy.indexOf(user.role.toLowerCase())
  
  if (Array.isArray(requiredRole)) {
    // Check if user has any of the required roles
    return requiredRole.some(role => {
      const requiredRoleIndex = roleHierarchy.indexOf(role.toLowerCase())
      // User has this role or a higher role
      return userRoleIndex >= requiredRoleIndex && requiredRoleIndex !== -1
    })
  }
  
  // Check for single role
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole.toLowerCase())
  // User has this role or a higher role
  return userRoleIndex >= requiredRoleIndex && requiredRoleIndex !== -1
}

/**
 * Cek apakah user memiliki permission tertentu
 */
export const hasPermission = (requiredPermission) => {
  const user = getCurrentUser()
  if (!user || !user.permissions) return false
  
  // Get user permissions directly from the user object
  // These are populated from the backend during login
  const userPermissions = user.permissions || []
  
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some(perm => userPermissions.includes(perm))
  }
  
  return userPermissions.includes(requiredPermission)
}

/**
 * Ambil cabang dari user yang sedang login
 */
export const getUserBranchId = () => {
  const user = getCurrentUser()
  return user?.cabangId || null
}

/**
 * Update data user di localStorage dan Redux store
 */
export const updateUserData = (userData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    
    // Update Redux store
    const token = getAuthToken()
    if (token) {
      store.dispatch(setUser({
        user: userData,
        token,
        isAuthenticated: true
      }))
    }
  }
}

/**
 * Sinkronkan state autentikasi antara localStorage dan Redux
 * Panggil fungsi ini saat aplikasi dimulai
 */
export const syncAuthState = () => {
  const token = getAuthToken()
  const user = getCurrentUser()
  
  if (token && user && isAuthenticated()) {
    // Valid authentication, update Redux store
    store.dispatch(setUser({
      user,
      token,
      isAuthenticated: true
    }))
    return true
  } else {
    // Invalid or missing authentication, clear Redux store
    store.dispatch(clearUser())
    return false
  }
}

/**
 * Cek apakah user memiliki akses ke resource tertentu
 * Kombinasi dari pengecekan role dan permission
 */
/**
 * Cek apakah user memiliki akses ke resource tertentu
 * Kombinasi dari pengecekan role dan permission
 *
 * Fungsi ini memeriksa apakah user memiliki akses ke resource dan action tertentu
 * berdasarkan role dan permission yang dimiliki.
 *
 * @param {string} resource - Resource yang ingin diakses (e.g., 'pickups', 'customers')
 * @param {string} action - Action yang ingin dilakukan (e.g., 'view', 'create', 'edit', 'delete')
 * @param {Object} [options] - Opsi tambahan
 * @param {boolean} [options.strict=false] - Jika true, hanya cek role yang persis sama, bukan hierarchy
 * @param {boolean} [options.requireAll=false] - Jika true, user harus memiliki semua permission yang diperlukan
 * @returns {boolean} True jika user memiliki akses, false jika tidak
 */
export const hasAccess = (resource, action, options = {}) => {
  // Import the RESOURCE_ACCESS_MAP from rbac.js
  const { RESOURCE_ACCESS_MAP, roleHasAccess } = require('@/lib/utils/rbac');
  
  const user = getCurrentUser();
  if (!user) return false;
  
  // If user has no role or permissions, they can't have access
  if (!user.role && (!user.permissions || user.permissions.length === 0)) {
    return false;
  }
  
  // Special case for pickup module
  if (resource === 'pickups') {
    // Check if user has branch access for pickups
    const userBranchId = user.cabangId;
    
    // For branch-specific actions, user must have a branch assigned
    if (['view', 'create', 'edit', 'delete'].includes(action) && !userBranchId) {
      // Only directors and managers can access without branch assignment
      if (!['direktur', 'manajer_distribusi', 'manajer_operasional'].includes(user.role?.toLowerCase())) {
        return false;
      }
    }
    
    // Check for specific pickup permissions
    const pickupPermission = `pickup:${action}`;
    if (hasPermission(pickupPermission)) {
      return true;
    }
  }
  
  // Check if resource and action exist in the access map
  if (RESOURCE_ACCESS_MAP[resource] && RESOURCE_ACCESS_MAP[resource][action]) {
    if (user.role) {
      if (options.strict) {
        // Strict mode: check exact role match
        return RESOURCE_ACCESS_MAP[resource][action].includes(user.role.toLowerCase());
      } else {
        // Use role hierarchy
        return roleHasAccess ?
          roleHasAccess(user.role.toLowerCase(), resource, action) :
          RESOURCE_ACCESS_MAP[resource][action].includes(user.role.toLowerCase());
      }
    }
  }
  
  // If resource or action not found in the map, fall back to permission check
  const permissionToCheck = `${resource}:${action}`;
  return hasPermission(permissionToCheck);
}