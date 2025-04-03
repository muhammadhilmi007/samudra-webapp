import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadingAPI } from '@/lib/api'
import { downloadBlob } from '@/lib/utils'

// Async thunks
export const fetchLoadings = createAsyncThunk(
  'loading/fetchLoadings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loadingAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data muatan'
      )
    }
  }
)

export const fetchLoadingById = createAsyncThunk(
  'loading/fetchLoadingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await loadingAPI.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data muatan'
      )
    }
  }
)

export const createLoading = createAsyncThunk(
  'loading/createLoading',
  async (loadingData, { rejectWithValue }) => {
    try {
      const response = await loadingAPI.create(loadingData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat muatan baru'
      )
    }
  }
)

export const updateLoading = createAsyncThunk(
  'loading/updateLoading',
  async ({ id, loadingData }, { rejectWithValue }) => {
    try {
      const response = await loadingAPI.update(id, loadingData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui muatan'
      )
    }
  }
)

export const updateLoadingStatus = createAsyncThunk(
  'loading/updateLoadingStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await loadingAPI.updateStatus(id, status)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui status muatan'
      )
    }
  }
)

export const generateDMB = createAsyncThunk(
  'loading/generateDMB',
  async (id, { rejectWithValue }) => {
    try {
      const response = await loadingAPI.generateDMB(id)
      
      // Generate filename
      const date = new Date()
      const filename = `DMB_${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${id}.pdf`
      
      // Download the blob
      downloadBlob(response, filename)
      
      return { success: true }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat PDF Daftar Muat Barang'
      )
    }
  }
)

// Initial state
const initialState = {
  loadings: [],
  currentLoading: null,
  loading: false,
  error: null,
  success: false,
}

// Loading slice
const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    setCurrentLoading: (state, action) => {
      state.currentLoading = action.payload
    },
    clearCurrentLoading: (state) => {
      state.currentLoading = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all loadings
      .addCase(fetchLoadings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLoadings.fulfilled, (state, action) => {
        state.loading = false
        state.loadings = action.payload.data
        state.error = null
      })
      .addCase(fetchLoadings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch loading by ID
      .addCase(fetchLoadingById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLoadingById.fulfilled, (state, action) => {
        state.loading = false
        state.currentLoading = action.payload.data
        state.error = null
      })
      .addCase(fetchLoadingById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create loading
      .addCase(createLoading.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createLoading.fulfilled, (state, action) => {
        state.loading = false
        state.loadings.push(action.payload.data)
        state.currentLoading = action.payload.data
        state.error = null
        state.success = true
      })
      .addCase(createLoading.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update loading
      .addCase(updateLoading.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateLoading.fulfilled, (state, action) => {
        state.loading = false
        state.loadings = state.loadings.map(loading => 
          loading._id === action.payload.data._id ? action.payload.data : loading
        )
        state.currentLoading = action.payload.data
        state.error = null
        state.success = true
      })
      .addCase(updateLoading.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update loading status
      .addCase(updateLoadingStatus.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateLoadingStatus.fulfilled, (state, action) => {
        state.loading = false
        state.loadings = state.loadings.map(loading => 
          loading._id === action.payload.data._id ? action.payload.data : loading
        )
        if (state.currentLoading && state.currentLoading._id === action.payload.data._id) {
          state.currentLoading = action.payload.data
        }
        state.error = null
        state.success = true
      })
      .addCase(updateLoadingStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Generate DMB
      .addCase(generateDMB.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateDMB.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(generateDMB.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
}
})

export const { 
clearError, 
clearSuccess, 
setCurrentLoading, 
clearCurrentLoading
} = loadingSlice.actions

export default loadingSlice.reducer