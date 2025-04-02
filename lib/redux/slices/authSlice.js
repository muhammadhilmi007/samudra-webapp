import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Set base URL from environment variable
const API_URL = process.env.API_URL || 'http://localhost:5000/api'

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Login gagal. Silakan periksa username dan password Anda.'
      )
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout`, 
          {}, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      }
      
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      return true
    } catch (error) {
      // Even if the API call fails, we still want to remove local storage items
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      return rejectWithValue(
        error.response?.data?.message || 
        'Terjadi kesalahan saat logout.'
      )
    }
  }
)

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        return rejectWithValue('Tidak ada token. Silakan login terlebih dahulu.')
      }
      
      const response = await axios.get(
        `${API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      return response.data
    } catch (error) {
      // If unauthorized, clear local storage
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mendapatkan informasi pengguna.'
      )
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        return rejectWithValue('Tidak ada token. Silakan login terlebih dahulu.')
      }
      
      const response = await axios.put(
        `${API_URL}/auth/change-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengubah password.'
      )
    }
  }
)

// Check if we have user data in localStorage
const getUserFromStorage = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
  return null
}

const getTokenFromStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || null
  }
  return null
}

// Initial state
const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage(),
  loading: false,
  error: null,
  success: false
}

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    }
  },
  extraReducers: (builder) => {
    builder
      // Login reducers
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload
      })
      
      // Logout reducers
      .addCase(logout.pending, (state) => {
        state.loading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      
      // GetMe reducers
      .addCase(getMe.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.data
        state.error = null
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload
      })
      
      // Change password reducers
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
        state.success = true
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
  }
})

export const { clearError, clearSuccess } = authSlice.actions

export default authSlice.reducer