import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { truckQueueAPI } from '@/lib/api'

// Async thunks
export const fetchTruckQueues = createAsyncThunk(
  'truckQueue/fetchTruckQueues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await truckQueueAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data antrian truck'
      )
    }
  }
)

export const fetchTruckQueueById = createAsyncThunk(
  'truckQueue/fetchTruckQueueById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await truckQueueAPI.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data antrian truck'
      )
    }
  }
)

export const createTruckQueue = createAsyncThunk(
  'truckQueue/createTruckQueue',
  async (queueData, { rejectWithValue }) => {
    try {
      const response = await truckQueueAPI.create(queueData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat antrian truck baru'
      )
    }
  }
)

export const updateTruckQueue = createAsyncThunk(
  'truckQueue/updateTruckQueue',
  async ({ id, queueData }, { rejectWithValue }) => {
    try {
      const response = await truckQueueAPI.update(id, queueData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui antrian truck'
      )
    }
  }
)

export const updateTruckQueueStatus = createAsyncThunk(
  'truckQueue/updateTruckQueueStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await truckQueueAPI.updateStatus(id, status)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui status antrian truck'
      )
    }
  }
)

export const deleteTruckQueue = createAsyncThunk(
  'truckQueue/deleteTruckQueue',
  async (id, { rejectWithValue }) => {
    try {
      const response = await truckQueueAPI.delete(id)
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal menghapus antrian truck'
      )
    }
  }
)

// Initial state
const initialState = {
  truckQueues: [],
  currentTruckQueue: null,
  loading: false,
  error: null,
  success: false,
}

// Truck Queue slice
const truckQueueSlice = createSlice({
  name: 'truckQueue',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    setCurrentTruckQueue: (state, action) => {
      state.currentTruckQueue = action.payload
    },
    clearCurrentTruckQueue: (state) => {
      state.currentTruckQueue = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all truck queues
      .addCase(fetchTruckQueues.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTruckQueues.fulfilled, (state, action) => {
        state.loading = false
        state.truckQueues = action.payload.data
        state.error = null
      })
      .addCase(fetchTruckQueues.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch truck queue by ID
      .addCase(fetchTruckQueueById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTruckQueueById.fulfilled, (state, action) => {
        state.loading = false
        state.currentTruckQueue = action.payload.data
        state.error = null
      })
      .addCase(fetchTruckQueueById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create truck queue
      .addCase(createTruckQueue.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createTruckQueue.fulfilled, (state, action) => {
        state.loading = false
        state.truckQueues.push(action.payload.data)
        state.currentTruckQueue = action.payload.data
        state.error = null
        state.success = true
      })
      .addCase(createTruckQueue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update truck queue
      .addCase(updateTruckQueue.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateTruckQueue.fulfilled, (state, action) => {
        state.loading = false
        state.truckQueues = state.truckQueues.map(queue => 
          queue._id === action.payload.data._id ? action.payload.data : queue
        )
        state.currentTruckQueue = action.payload.data
        state.error = null
        state.success = true
      })
      .addCase(updateTruckQueue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update truck queue status
      .addCase(updateTruckQueueStatus.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateTruckQueueStatus.fulfilled, (state, action) => {
        state.loading = false
        state.truckQueues = state.truckQueues.map(queue => 
          queue._id === action.payload.data._id ? action.payload.data : queue
        )
        if (state.currentTruckQueue && state.currentTruckQueue._id === action.payload.data._id) {
          state.currentTruckQueue = action.payload.data
        }
        state.error = null
        state.success = true
      })
      .addCase(updateTruckQueueStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Delete truck queue
      .addCase(deleteTruckQueue.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(deleteTruckQueue.fulfilled, (state, action) => {
        state.loading = false
        state.truckQueues = state.truckQueues.filter(queue => 
          queue._id !== action.payload.id
        )
        state.error = null
        state.success = true
      })
      .addCase(deleteTruckQueue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
  }
})

export const { 
  clearError, 
  clearSuccess, 
  setCurrentTruckQueue, 
  clearCurrentTruckQueue
} = truckQueueSlice.actions

export default truckQueueSlice.reducer