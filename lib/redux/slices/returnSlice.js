// lib/redux/slices/returnSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

// Async thunks
export const fetchReturns = createAsyncThunk(
  'return/fetchReturns',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/returns');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data retur');
    }
  }
);

export const fetchReturnById = createAsyncThunk(
  'return/fetchReturnById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/returns/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data retur');
    }
  }
);

export const createReturn = createAsyncThunk(
  'return/createReturn',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/returns', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat retur');
    }
  }
);

export const updateReturnStatus = createAsyncThunk(
  'return/updateReturnStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/returns/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status retur');
    }
  }
);

const returnSlice = createSlice({
  name: 'return',
  initialState: {
    returns: [],
    currentReturn: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetReturnState: (state) => {
      state.currentReturn = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch returns
      .addCase(fetchReturns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturns.fulfilled, (state, action) => {
        state.loading = false;
        state.returns = action.payload;
      })
      .addCase(fetchReturns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch return by ID
      .addCase(fetchReturnById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReturnById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReturn = action.payload;
      })
      .addCase(fetchReturnById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create return
      .addCase(createReturn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.returns.push(action.payload);
      })
      .addCase(createReturn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update return status
      .addCase(updateReturnStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReturnStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.returns.findIndex(ret => ret._id === action.payload._id);
        if (index !== -1) {
          state.returns[index] = action.payload;
        }
        if (state.currentReturn && state.currentReturn._id === action.payload._id) {
          state.currentReturn = action.payload;
        }
      })
      .addCase(updateReturnStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetReturnState } = returnSlice.actions;
export default returnSlice.reducer;