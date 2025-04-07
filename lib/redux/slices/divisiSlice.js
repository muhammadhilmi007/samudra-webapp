import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { divisiAPI } from '@/lib/api'

// Async thunks
export const fetchDivisions = createAsyncThunk(
  'divisi/fetchDivisions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await divisiAPI.getAll();
      // Log the response for debugging
      console.log("Division API response:", response);
      // Return the data array directly
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data divisi'
      );
    }
  }
);

export const fetchDivisionById = createAsyncThunk(
  'divisi/fetchDivisionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await divisiAPI.getById(id)
      // Log the response for debugging
      console.log("Division by ID response:", response);
      // Handle potential nested data structure
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data divisi'
      )
    }
  }
)

export const createDivision = createAsyncThunk(
  'divisi/createDivision',
  async (divisiData, { rejectWithValue }) => {
    try {
      const response = await divisiAPI.create(divisiData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat divisi baru'
      )
    }
  }
)

export const updateDivision = createAsyncThunk(
  'divisi/updateDivision',
  async ({ id, divisiData }, { rejectWithValue }) => {
    try {
      const response = await divisiAPI.update(id, divisiData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui divisi'
      )
    }
  }
)

export const deleteDivision = createAsyncThunk(
  'divisi/deleteDivision',
  async (id, { rejectWithValue }) => {
    try {
      await divisiAPI.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal menghapus divisi'
      )
    }
  }
)

// Initial state
const initialState = {
  divisions: [],
  currentDivision: null,
  loading: false,
  error: null,
  success: false,
}

// Divisi slice
const divisiSlice = createSlice({
  name: 'divisi',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    setCurrentDivision: (state, action) => {
      state.currentDivision = action.payload
    },
    clearCurrentDivision: (state) => {
      state.currentDivision = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all divisions
      .addCase(fetchDivisions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDivisions.fulfilled, (state, action) => {
        // Ensure we properly handle the division data and normalize the IDs
        const normalizedDivisions = Array.isArray(action.payload) 
          ? action.payload.map(div => ({
              ...div,
              _id: div._id?.toString() || div._id // Ensure ID is a string
            }))
          : [];
        
        state.divisions = normalizedDivisions;
        state.loading = false;
        
        // Debug log
        console.log('Normalized divisions:', state.divisions);
      })

      .addCase(fetchDivisions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch division by ID
      .addCase(fetchDivisionById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDivisionById.fulfilled, (state, action) => {
        state.loading = false
        state.currentDivision = action.payload
        state.error = null
        console.log('Current division set to:', state.currentDivision);
      })
      .addCase(fetchDivisionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create division
      .addCase(createDivision.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createDivision.fulfilled, (state, action) => {
        state.loading = false
        state.divisions.push(action.payload) // Remove .data
        state.error = null
        state.success = true
      })
      .addCase(createDivision.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update division
      .addCase(updateDivision.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateDivision.fulfilled, (state, action) => {
        state.loading = false
        state.divisions = state.divisions.map(div => 
          div._id === action.payload._id ? action.payload : div // Remove .data
        )
        state.currentDivision = action.payload // Remove .data
        state.error = null
        state.success = true
      })
      .addCase(updateDivision.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Delete division
      .addCase(deleteDivision.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(deleteDivision.fulfilled, (state, action) => {
        state.loading = false
        state.divisions = state.divisions.filter(div => div._id !== action.payload)
        state.error = null
        state.success = true
      })
      .addCase(deleteDivision.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
  }
})

export const { 
  clearError, 
  clearSuccess, 
  setCurrentDivision, 
  clearCurrentDivision 
} = divisiSlice.actions

export default divisiSlice.reducer