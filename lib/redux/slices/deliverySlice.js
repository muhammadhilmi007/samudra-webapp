import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { deliveryAPI } from '@/lib/api'
import { downloadBlob } from '@/lib/utils'

// Async thunks
export const fetchDeliveries = createAsyncThunk(
  'delivery/fetchDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await deliveryAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data lansir'
      )
    }
  }
)

export const fetchDeliveryById = createAsyncThunk(
  'delivery/fetchDeliveryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deliveryAPI.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data lansir'
      )
    }
  }
)

export const createDelivery = createAsyncThunk(
  'delivery/createDelivery',
  async (deliveryData, { rejectWithValue }) => {
    try {
      const response = await deliveryAPI.create(deliveryData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat lansir baru'
      )
    }
  }
)

export const updateDelivery = createAsyncThunk(
  'delivery/updateDelivery',
  async ({ id, deliveryData }, { rejectWithValue }) => {
    try {
      const response = await deliveryAPI.update(id, deliveryData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui lansir'
      )
    }
  }
)

export const updateDeliveryStatus = createAsyncThunk(
  'delivery/updateDeliveryStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await deliveryAPI.updateStatus(id, status)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui status lansir'
      )
    }
  }
)

export const generateDeliveryForm = createAsyncThunk(
  'delivery/generateDeliveryForm',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deliveryAPI.generateForm(id)
      
      // Generate filename
      const date = new Date()
      const filename = `LANSIR_${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${id}.pdf`
      
      // Download the blob
      downloadBlob(response, filename)
      
      return { success: true }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat PDF Form Lansir'
      )
    }
  }
)

// Initial state
const initialState = {
  deliveries: [],
  currentDelivery: null,
  loading: false,
  error: null,
  success: false,
}

// Delivery slice
const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    setCurrentDelivery: (state, action) => {
      state.currentDelivery = action.payload
    },
    clearCurrentDelivery: (state) => {
      state.currentDelivery = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all deliveries
      .addCase(fetchDeliveries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.loading = false
        state.deliveries = action.payload.data
        state.error = null
      })
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch delivery by ID
      .addCase(fetchDeliveryById.pending, (state) => {
        state.loading = true
        state.error = null
      })
     
      .addCase(fetchDeliveryById.fulfilled, (state, action) => {
        state.loading = false
        state.currentDelivery = action.payload.data
        state.error = null
      })
      .addCase(fetchDeliveryById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create delivery
      .addCase(createDelivery.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createDelivery.fulfilled, (state, action) => {
        state.loading = false
        state.deliveries.push(action.payload.data)
        state.currentDelivery = action.payload.data
        state.error = null
        state.success = true
      })
      .addCase(createDelivery.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update delivery
      .addCase(updateDelivery.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateDelivery.fulfilled, (state, action) => {
        state.loading = false
        state.deliveries = state.deliveries.map(delivery => 
          delivery._id === action.payload.data._id ? action.payload.data : delivery
        )
        state.currentDelivery = action.payload.data
        state.error = null
        state.success = true
      })
      .addCase(updateDelivery.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update delivery status
      .addCase(updateDeliveryStatus.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        state.loading = false
        state.deliveries = state.deliveries.map(delivery => 
          delivery._id === action.payload.data._id ? action.payload.data : delivery
        )
        if (state.currentDelivery && state.currentDelivery._id === action.payload.data._id) {
          state.currentDelivery = action.payload.data
        }
        state.error = null
        state.success = true
      })
      .addCase(updateDeliveryStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Generate delivery form
      .addCase(generateDeliveryForm.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateDeliveryForm.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(generateDeliveryForm.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
 })
 
 export const { 
  clearError, 
  clearSuccess, 
  setCurrentDelivery, 
  clearCurrentDelivery
 } = deliverySlice.actions
 
 export default deliverySlice.reducer