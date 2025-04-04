import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { vehicleQueueAPI } from '@/lib/api'

// Async thunks
export const fetchVehicleQueues = createAsyncThunk(
  'vehicleQueue/fetchVehicleQueues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data antrian kendaraan'
      )
    }
  }
)

export const fetchVehicleQueueById = createAsyncThunk(
  'vehicleQueue/fetchVehicleQueueById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data antrian kendaraan'
      )
    }
  }
)

export const createVehicleQueue = createAsyncThunk(
  'vehicleQueue/createVehicleQueue',
  async (queueData, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.create(queueData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat antrian kendaraan baru'
      )
    }
  }
)

export const updateVehicleQueue = createAsyncThunk(
  'vehicleQueue/updateVehicleQueue',
  async ({ id, queueData }, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.update(id, queueData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui antrian kendaraan'
      )
    }
  }
)

export const updateVehicleQueueStatus = createAsyncThunk(
  'vehicleQueue/updateVehicleQueueStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.updateStatus(id, status)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui status antrian kendaraan'
      )
    }
  }
)

export const deleteVehicleQueue = createAsyncThunk(
  'vehicleQueue/deleteVehicleQueue',
  async (id, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.delete(id)
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal menghapus antrian kendaraan'
      )
    }
  }
)

// Initial state
const initialState = {
  vehicleQueues: [],
  currentVehicleQueue: null,
  loading: false,
  error: null,
  success: false,
}

// Vehicle Queue slice
const vehicleQueueSlice = createSlice({
  name: 'vehicleQueue',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    setCurrentVehicleQueue: (state, action) => {
      state.currentVehicleQueue = action.payload
    },
    clearCurrentVehicleQueue: (state) => {
      state.currentVehicleQueue = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all vehicle queues
      .addCase(fetchVehicleQueues.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVehicleQueues.fulfilled, (state, action) => {
        state.loading = false
        state.vehicleQueues = action.payload
        state.error = null
      })
      .addCase(fetchVehicleQueues.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch vehicle queue by ID
      .addCase(fetchVehicleQueueById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVehicleQueueById.fulfilled, (state, action) => {
        state.loading = false
        state.currentVehicleQueue = action.payload
        state.error = null
      })
      .addCase(fetchVehicleQueueById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create vehicle queue
      .addCase(createVehicleQueue.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createVehicleQueue.fulfilled, (state, action) => {
        state.loading = false
        state.vehicleQueues.push(action.payload)
        state.currentVehicleQueue = action.payload
        state.error = null
        state.success = true
      })
      .addCase(createVehicleQueue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update vehicle queue
      .addCase(updateVehicleQueue.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateVehicleQueue.fulfilled, (state, action) => {
        state.loading = false
        state.vehicleQueues = state.vehicleQueues.map(queue => 
          queue._id === action.payload._id ? action.payload : queue
        )
        state.currentVehicleQueue = action.payload
        state.error = null
        state.success = true
      })
      .addCase(updateVehicleQueue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update vehicle queue status
      .addCase(updateVehicleQueueStatus.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateVehicleQueueStatus.fulfilled, (state, action) => {
        state.loading = false
        state.vehicleQueues = state.vehicleQueues.map(queue => 
          queue._id === action.payload._id ? action.payload : queue
        )
        if (state.currentVehicleQueue && state.currentVehicleQueue._id === action.payload._id) {
          state.currentVehicleQueue = action.payload
        }
        state.error = null
        state.success = true
      })
      .addCase(updateVehicleQueueStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Delete vehicle queue
      .addCase(deleteVehicleQueue.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(deleteVehicleQueue.fulfilled, (state, action) => {
        state.loading = false
        state.vehicleQueues = state.vehicleQueues.filter(queue => 
          queue._id !== action.payload.id
        )
        state.error = null
        state.success = true
      })
      .addCase(deleteVehicleQueue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
  }
})

export const { 
  clearError, 
  clearSuccess, 
  setCurrentVehicleQueue, 
  clearCurrentVehicleQueue
} = vehicleQueueSlice.actions

export default vehicleQueueSlice.reducer