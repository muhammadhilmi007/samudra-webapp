import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cabangAPI } from '@/lib/api'

// Async thunks
export const fetchBranches = createAsyncThunk(
  'cabang/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cabangAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data cabang'
      )
    }
  }
)

export const fetchBranchById = createAsyncThunk(
  'cabang/fetchBranchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await cabangAPI.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data cabang'
      )
    }
  }
)

export const fetchBranchesByDivision = createAsyncThunk(
  'cabang/fetchBranchesByDivision',
  async (divisionId, { rejectWithValue }) => {
    try {
      const response = await cabangAPI.getByDivision(divisionId)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data cabang berdasarkan divisi'
      )
    }
  }
)

export const createBranch = createAsyncThunk(
  'cabang/createBranch',
  async (branchData, { rejectWithValue }) => {
    try {
      const response = await cabangAPI.create(branchData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat cabang baru'
      )
    }
  }
)

export const updateBranch = createAsyncThunk(
  'cabang/updateBranch',
  async ({ id, branchData }, { rejectWithValue }) => {
    try {
      const response = await cabangAPI.update(id, branchData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui cabang'
      )
    }
  }
)

export const deleteBranch = createAsyncThunk(
  'cabang/deleteBranch',
  async (id, { rejectWithValue }) => {
    try {
      await cabangAPI.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal menghapus cabang'
      )
    }
  }
)

// Initial state
const initialState = {
  branches: [],
  branchesByDivision: {},
  currentBranch: null,
  loading: false,
  error: null,
  success: false,
}

// Branch slice
const cabangSlice = createSlice({
  name: 'cabang',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    setCurrentBranch: (state, action) => {
      state.currentBranch = action.payload
    },
    clearCurrentBranch: (state) => {
      state.currentBranch = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all branches
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different possible response structures
        let branchesData = [];
        if (action.payload?.data) {
          branchesData = Array.isArray(action.payload.data) 
            ? action.payload.data 
            : [action.payload.data];
        } else if (Array.isArray(action.payload)) {
          branchesData = action.payload;
        }
        
        // Filter out any items with empty IDs before normalizing
        const filteredBranches = branchesData.filter(branch => 
          branch && (branch._id || branch.id)
        );
        
        // Normalize branch data to ensure consistent ID formats
        const normalizedBranches = filteredBranches.map(branch => ({
          ...branch,
          _id: (branch._id || branch.id)?.toString() || `branch-${Date.now()}-${Math.random()}`
        }));
        
        state.branches = normalizedBranches;
        state.error = null;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch branch by ID
      .addCase(fetchBranchById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBranchById.fulfilled, (state, action) => {
        state.loading = false
        state.currentBranch = action.payload.data
        state.error = null
      })
      .addCase(fetchBranchById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch branches by division
      .addCase(fetchBranchesByDivision.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBranchesByDivision.fulfilled, (state, action) => {
        state.loading = false
        // Fix: Properly extract divisionId from action.meta.arg
        const divisionId = action.meta.arg
        
        // Normalize the data structure
        let branchesData = [];
        if (action.payload?.data) {
          branchesData = Array.isArray(action.payload.data) 
            ? action.payload.data 
            : [action.payload.data];
        } else if (Array.isArray(action.payload)) {
          branchesData = action.payload;
        }
        
        // Normalize branch data
        const normalizedBranches = branchesData.map(branch => ({
          ...branch,
          _id: (branch._id || branch.id)?.toString() || `branch-${Date.now()}-${Math.random()}`
        }));
        
        state.branchesByDivision[divisionId] = normalizedBranches;
        state.error = null;
      })
      .addCase(fetchBranchesByDivision.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create branch
      .addCase(createBranch.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false
        // Normalize the new branch data
        const newBranch = action.payload.data || action.payload;
        const normalizedBranch = {
          ...newBranch,
          _id: (newBranch._id || newBranch.id)?.toString() || `branch-${Date.now()}-${Math.random()}`
        };
        
        state.branches.push(normalizedBranch);
        state.error = null;
        state.success = true;
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update branch
      .addCase(updateBranch.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false
        // Normalize the updated branch data
        const updatedBranch = action.payload.data || action.payload;
        const branchId = updatedBranch._id || updatedBranch.id;
        
        state.branches = state.branches.map(branch => 
          branch._id === branchId ? {
            ...updatedBranch,
            _id: branchId.toString()
          } : branch
        );
        
        state.currentBranch = {
          ...updatedBranch,
          _id: branchId.toString()
        };
        
        state.error = null;
        state.success = true;
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Delete branch
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false
        state.branches = state.branches.filter(branch => branch._id !== action.payload)
        state.error = null
        state.success = true
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
  }
})

export const { 
  clearError, 
  clearSuccess, 
  setCurrentBranch, 
  clearCurrentBranch 
} = cabangSlice.actions

export default cabangSlice.reducer