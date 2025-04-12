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
 */
export const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
    
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token)
      
      // Update Redux store with new token
      const user = getCurrentUser()
      if (user) {
        store.dispatch(setUser({
          user,
          token: response.data.token,
          isAuthenticated: true
        }))
      }
      
      return response.data.token
    }
    
    return null
  } catch (error) {
    console.error('Error refreshing token:', error)
    await logout()
    return null
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
 */
export const isAuthenticated = () => {
  const token = getAuthToken()
  if (!token) return false
  
  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      return false
    }
    
    // Check if token is about to expire (less than 5 minutes)
    if (decoded.exp - currentTime < 300) {
      // Trigger token refresh in background
      refreshToken().catch(err => console.error('Background token refresh failed:', err))
    }
    
    return true
  } catch (error) {
    console.error('Invalid token:', error)
    return false
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
export const hasAccess = (resource, action) => {
  // Import the RESOURCE_ACCESS_MAP from rbac.js
  const { RESOURCE_ACCESS_MAP } = require('@/lib/utils/rbac')
  
  const user = getCurrentUser()
  if (!user || !user.role) return false
  
  // Check if resource and action exist in the access map
  if (RESOURCE_ACCESS_MAP[resource] && RESOURCE_ACCESS_MAP[resource][action]) {
    return RESOURCE_ACCESS_MAP[resource][action].includes(user.role.toLowerCase())
  }
  
  // If resource or action not found in the map, fall back to permission check
  return hasPermission(`${resource}:${action}`)
}