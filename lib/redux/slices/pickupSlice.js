// lib/redux/slices/pickupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

// Async thunks
export const fetchPickupRequests = createAsyncThunk(
  'pickup/fetchPickupRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/pickup-requests');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data request pengambilan');
    }
  }
);

export const fetchPickupRequestById = createAsyncThunk(
  'pickup/fetchPickupRequestById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/pickup-requests/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data request pengambilan');
    }
  }
);

export const createPickupRequest = createAsyncThunk(
  'pickup/createPickupRequest',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/pickup-requests', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat request pengambilan');
    }
  }
);

export const updatePickupRequestStatus = createAsyncThunk(
  'pickup/updatePickupRequestStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/pickup-requests/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status request pengambilan');
    }
  }
);

export const fetchPickups = createAsyncThunk(
  'pickup/fetchPickups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/pickups');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data pengambilan');
    }
  }
);

export const fetchPickupById = createAsyncThunk(
  'pickup/fetchPickupById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/pickups/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data pengambilan');
    }
  }
);

export const createPickup = createAsyncThunk(
  'pickup/createPickup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/pickups', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat pengambilan');
    }
  }
);

export const updatePickupStatus = createAsyncThunk(
  'pickup/updatePickupStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/pickups/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status pengambilan');
    }
  }
);

const pickupSlice = createSlice({
  name: 'pickup',
  initialState: {
    pickupRequests: [],
    pickupRequest: null,
    pickups: [],
    pickup: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetPickupState: (state) => {
      state.pickupRequest = null;
      state.pickup = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch pickup requests
      .addCase(fetchPickupRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickupRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pickupRequests = action.payload;
      })
      .addCase(fetchPickupRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch pickup request by ID
      .addCase(fetchPickupRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickupRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.pickupRequest = action.payload;
      })
      .addCase(fetchPickupRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create pickup request
      .addCase(createPickupRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPickupRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.pickupRequests.push(action.payload);
      })
      .addCase(createPickupRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update pickup request status
      .addCase(updatePickupRequestStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePickupRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pickupRequests.findIndex(req => req._id === action.payload._id);
        if (index !== -1) {
          state.pickupRequests[index] = action.payload;
        }
        if (state.pickupRequest && state.pickupRequest._id === action.payload._id) {
          state.pickupRequest = action.payload;
        }
      })
      .addCase(updatePickupRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch pickups
      .addCase(fetchPickups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickups.fulfilled, (state, action) => {
        state.loading = false;
        state.pickups = action.payload;
      })
      .addCase(fetchPickups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch pickup by ID
      .addCase(fetchPickupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickupById.fulfilled, (state, action) => {
        state.loading = false;
        state.pickup = action.payload;
      })
      .addCase(fetchPickupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create pickup
      .addCase(createPickup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPickup.fulfilled, (state, action) => {
        state.loading = false;
        state.pickups.push(action.payload);
      })
      .addCase(createPickup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update pickup status
      .addCase(updatePickupStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePickupStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pickups.findIndex(pickup => pickup._id === action.payload._id);
        if (index !== -1) {
          state.pickups[index] = action.payload;
        }
        if (state.pickup && state.pickup._id === action.payload._id) {
          state.pickup = action.payload;
        }
      })
      .addCase(updatePickupStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetPickupState } = pickupSlice.actions;
export default pickupSlice.reducer;