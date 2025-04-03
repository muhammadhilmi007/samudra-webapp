"use client"

import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const TOKEN_KEY = 'samudra_auth_token'
const USER_DATA_KEY = 'samudra_user_data'

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
      localStorage.setItem(TOKEN_KEY, response.data.token)
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data.user))
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
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_DATA_KEY)
  window.location.href = '/login'
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
      return response.data.token
    }
    
    return null
  } catch (error) {
    console.error('Error refreshing token:', error)
    logout()
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
      // If token is invalid, clear user data and redirect to login
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
    
    if (decoded.exp < currentTime) {
      // Token expired
      return false
    }
    
    return true
  } catch (error) {
    console.error('Invalid token:', error)
    return false
  }
}

/**
 * Cek apakah user memiliki role tertentu
 */
export const hasRole = (requiredRole) => {
  const user = getCurrentUser()
  if (!user || !user.role) return false
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role)
  }
  
  return user.role === requiredRole
}

/**
 * Cek apakah user memiliki permission tertentu
 */
export const hasPermission = (requiredPermission) => {
  const user = getCurrentUser()
  if (!user || !user.permissions) return false
  
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some(perm => user.permissions.includes(perm))
  }
  
  return user.permissions.includes(requiredPermission)
}

/**
 * Ambil cabang dari user yang sedang login
 */
export const getUserBranchId = () => {
  const user = getCurrentUser()
  return user?.cabangId || null
}

/**
 * Update data user di localStorage
 */
export const updateUserData = (userData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
  }
}