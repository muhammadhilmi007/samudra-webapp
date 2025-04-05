// lib/redux/slices/pickupSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

// Async thunks
export const fetchPickupRequests = createAsyncThunk(
  'pickup/fetchPickupRequests',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/pickup-requests', { params });
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
      const response = await api.get(`/pickup-requests/${id}`);
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
      const response = await api.post('/pickup-requests', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat request pengambilan');
    }
  }
);

export const updatePickupRequestStatus = createAsyncThunk(
  'pickup/updatePickupRequestStatus',
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pickup-requests/${id}/status`, { status, notes });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status request pengambilan');
    }
  }
);

export const fetchPickups = createAsyncThunk(
  'pickup/fetchPickups',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/pickups', { params });
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
      const response = await api.get(`/pickups/${id}`);
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
      const response = await api.post('/pickups', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membuat pengambilan');
    }
  }
);

export const updatePickup = createAsyncThunk(
  'pickup/updatePickup',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pickups/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengupdate pengambilan');
    }
  }
);

export const updatePickupStatus = createAsyncThunk(
  'pickup/updatePickupStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pickups/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengubah status pengambilan');
    }
  }
);

export const addSTTToPickup = createAsyncThunk(
  'pickup/addSTTToPickup',
  async ({ id, sttIds }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pickups/${id}/add-stt`, { sttIds });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menambahkan STT ke pengambilan');
    }
  }
);

export const removeSTTFromPickup = createAsyncThunk(
  'pickup/removeSTTFromPickup',
  async ({ id, sttId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pickups/${id}/remove-stt`, { sttId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gagal menghapus STT dari pengambilan');
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
    success: false
  },
  reducers: {
    resetPickupState: (state) => {
      state.pickupRequest = null;
      state.pickup = null;
      state.error = null;
      state.success = false;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearError: (state) => {
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
        state.success = false;
      })
      .addCase(createPickupRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.pickupRequests.push(action.payload);
        state.success = true;
      })
      .addCase(createPickupRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update pickup request status
      .addCase(updatePickupRequestStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      // lib/redux/slices/pickupSlice.js (continued)
      .addCase(updatePickupRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pickupRequests.findIndex(req => req._id === action.payload._id);
        if (index !== -1) {
          state.pickupRequests[index] = action.payload;
        }
        if (state.pickupRequest && state.pickupRequest._id === action.payload._id) {
          state.pickupRequest = action.payload;
        }
        state.success = true;
      })
      .addCase(updatePickupRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
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
        state.success = false;
      })
      .addCase(createPickup.fulfilled, (state, action) => {
        state.loading = false;
        state.pickups.push(action.payload);
        state.success = true;
      })
      .addCase(createPickup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update pickup
      .addCase(updatePickup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePickup.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pickups.findIndex(pickup => pickup._id === action.payload._id);
        if (index !== -1) {
          state.pickups[index] = action.payload;
        }
        if (state.pickup && state.pickup._id === action.payload._id) {
          state.pickup = action.payload;
        }
        state.success = true;
      })
      .addCase(updatePickup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update pickup status
      .addCase(updatePickupStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
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
        state.success = true;
      })
      .addCase(updatePickupStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Add STT to pickup
      .addCase(addSTTToPickup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addSTTToPickup.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pickups.findIndex(pickup => pickup._id === action.payload._id);
        if (index !== -1) {
          state.pickups[index] = action.payload;
        }
        if (state.pickup && state.pickup._id === action.payload._id) {
          state.pickup = action.payload;
        }
        state.success = true;
      })
      .addCase(addSTTToPickup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Remove STT from pickup
      .addCase(removeSTTFromPickup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeSTTFromPickup.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pickups.findIndex(pickup => pickup._id === action.payload._id);
        if (index !== -1) {
          state.pickups[index] = action.payload;
        }
        if (state.pickup && state.pickup._id === action.payload._id) {
          state.pickup = action.payload;
        }
        state.success = true;
      })
      .addCase(removeSTTFromPickup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { resetPickupState, clearSuccess, clearError } = pickupSlice.actions;
export default pickupSlice.reducer;

