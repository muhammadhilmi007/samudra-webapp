import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { sttAPI } from '@/lib/api'
import { downloadBlob } from '@/lib/utils'

// Async thunks
export const fetchSTTs = createAsyncThunk(
  'stt/fetchSTTs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sttAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data STT'
      )
    }
  }
)

export const fetchSTTById = createAsyncThunk(
  'stt/fetchSTTById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sttAPI.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data STT'
      )
    }
  }
)

export const fetchSTTsByBranch = createAsyncThunk(
  'stt/fetchSTTsByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await sttAPI.getByBranch(branchId)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data STT berdasarkan cabang'
      )
    }
  }
)

export const fetchSTTsBySender = createAsyncThunk(
  'stt/fetchSTTsBySender',
  async (senderId, { rejectWithValue }) => {
    try {
      const response = await sttAPI.getBySender(senderId)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data STT berdasarkan pengirim'
      )
    }
  }
)

export const fetchSTTsByRecipient = createAsyncThunk(
  'stt/fetchSTTsByRecipient',
  async (recipientId, { rejectWithValue }) => {
    try {
      const response = await sttAPI.getByRecipient(recipientId)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data STT berdasarkan penerima'
      )
    }
  }
)

export const fetchSTTsByStatus = createAsyncThunk(
  'stt/fetchSTTsByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const response = await sttAPI.getByStatus(status)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data STT berdasarkan status'
      )
    }
  }
)

export const createSTT = createAsyncThunk(
  'stt/createSTT',
  async (sttData, { rejectWithValue }) => {
    try {
      const response = await sttAPI.create(sttData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat STT baru'
      )
    }
  }
)

export const updateSTT = createAsyncThunk(
  'stt/updateSTT',
  async ({ id, sttData }, { rejectWithValue }) => {
    try {
      const response = await sttAPI.update(id, sttData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui STT'
      )
    }
  }
)

export const trackSTT = createAsyncThunk(
  'stt/trackSTT',
  async (sttNumber, { rejectWithValue }) => {
    try {
      const response = await sttAPI.track(sttNumber)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal melacak STT'
      )
    }
  }
)

export const generateSTTPDF = createAsyncThunk(
  'stt/generateSTTPDF',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sttAPI.generatePDF(id)
      
      // Generate filename
      const date = new Date()
      const filename = `STT_${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${id}.pdf`
      
      // Download the blob
      downloadBlob(response, filename)
      
      return { success: true }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat PDF STT'
      )
    }
  }
)

// Initial state
const initialState = {
  stts: [],
  sttsByBranch: {},
  sttsBySender: {},
  sttsByRecipient: {},
  sttsByStatus: {},
  trackedSTT: null,
  currentSTT: null,
  createdSTTId: null,
  loading: false,
  error: null,
  success: false,
}

// STT slice
const sttSlice = createSlice({
  name: 'stt',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    setCurrentSTT: (state, action) => {
      state.currentSTT = action.payload
    },
    clearCurrentSTT: (state) => {
      state.currentSTT = null
    },
    clearCreatedSTTId: (state) => {
      state.createdSTTId = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all STTs
      .addCase(fetchSTTs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSTTs.fulfilled, (state, action) => {
        state.loading = false
        state.stts = action.payload.data
        state.error = null
      })
      .addCase(fetchSTTs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch STT by ID
      .addCase(fetchSTTById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSTTById.fulfilled, (state, action) => {
        state.loading = false
        state.currentSTT = action.payload.data
        state.error = null
      })
      .addCase(fetchSTTById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch STTs by branch
      .addCase(fetchSTTsByBranch.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSTTsByBranch.fulfilled, (state, action) => {
        state.loading = false
        state.sttsByBranch[action.meta.arg] = action.payload.data
        state.error = null
      })
      .addCase(fetchSTTsByBranch.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch STTs by sender
      .addCase(fetchSTTsBySender.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSTTsBySender.fulfilled, (state, action) => {
        state.loading = false
        state.sttsBySender[action.meta.arg] = action.payload.data
        state.error = null
      })
      .addCase(fetchSTTsBySender.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch STTs by recipient
      .addCase(fetchSTTsByRecipient.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSTTsByRecipient.fulfilled, (state, action) => {
        state.loading = false
        state.sttsByRecipient[action.meta.arg] = action.payload.data
        state.error = null
      })
      .addCase(fetchSTTsByRecipient.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch STTs by status
      .addCase(fetchSTTsByStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSTTsByStatus.fulfilled, (state, action) => {
        state.loading = false
        state.sttsByStatus[action.meta.arg] = action.payload.data
        state.error = null
      })
      .addCase(fetchSTTsByStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create STT
      .addCase(createSTT.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
        state.createdSTTId = null
      })
      .addCase(createSTT.fulfilled, (state, action) => {
        state.loading = false
        state.stts.push(action.payload.data)
        state.currentSTT = action.payload.data
        state.createdSTTId = action.payload.data._id
        state.error = null
        state.success = true
      })
      .addCase(createSTT.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update STT
      .addCase(updateSTT.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateSTT.fulfilled, (state, action) => {
        state.loading = false
        state.stts = state.stts.map(stt => 
          stt._id === action.payload.data._id ? action.payload.data : stt
        )
        state.currentSTT = action.payload.data
        state.error = null
        state.success = true
      })
      .addCase(updateSTT.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Track STT
      .addCase(trackSTT.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(trackSTT.fulfilled, (state, action) => {
        state.loading = false
        state.trackedSTT = action.payload.data
        state.error = null
      })
      .addCase(trackSTT.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Generate STT PDF
      .addCase(generateSTTPDF.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateSTTPDF.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(generateSTTPDF.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { 
  clearError, 
  clearSuccess, 
  setCurrentSTT, 
  clearCurrentSTT,
  clearCreatedSTTId
} = sttSlice.actions

export default sttSlice.reducer