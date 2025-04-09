// lib/redux/slices/pickupSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { pickupAPI } from "@/lib/api";

// Async thunks
export const fetchPickupRequests = createAsyncThunk(
  "pickup/fetchPickupRequests",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/pickup-requests", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengambil data request pengambilan"
      );
    }
  }
);

export const fetchPickupRequestById = createAsyncThunk(
  "pickup/fetchPickupRequestById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pickup-requests/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengambil data request pengambilan"
      );
    }
  }
);

export const createPickupRequest = createAsyncThunk(
  "pickup/createPickupRequest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/pickup-requests", data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal membuat request pengambilan"
      );
    }
  }
);

export const updatePickupRequestStatus = createAsyncThunk(
  "pickup/updatePickupRequestStatus",
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/pickup-requests/${id}/status`, {
        status,
        notes,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengubah status request pengambilan"
      );
    }
  }
);

export const fetchPickups = createAsyncThunk(
  "pickup/fetchPickups",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await pickupAPI.getAll(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data pengambilan"
      );
    }
  }
);

export const fetchPickupById = createAsyncThunk(
  "pickup/fetchPickupById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await pickupAPI.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data pengambilan"
      );
    }
  }
);

export const createPickup = createAsyncThunk(
  "pickup/createPickup",
  async (data, { rejectWithValue }) => {
    try {
      const response = await pickupAPI.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal membuat pengambilan"
      );
    }
  }
);

export const updatePickup = createAsyncThunk(
  "pickup/updatePickup",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await pickupAPI.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengupdate pengambilan"
      );
    }
  }
);

export const deletePickup = createAsyncThunk(
  "pickup/deletePickup",
  async (id, { rejectWithValue }) => {
    try {
      await pickupAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal menghapus pengambilan"
      );
    }
  }
);

export const updatePickupStatus = createAsyncThunk(
  "pickup/updatePickupStatus",
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const response = await pickupAPI.updateStatus(id, { status, notes });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengubah status pengambilan"
      );
    }
  }
);

export const addSTTToPickup = createAsyncThunk(
  "pickup/addSTTToPickup",
  async ({ id, sttId }, { rejectWithValue }) => {
    try {
      const response = await pickupAPI.addSTT(id, sttId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal menambahkan STT ke pengambilan"
      );
    }
  }
);

export const removeSTTFromPickup = createAsyncThunk(
  "pickup/removeSTTFromPickup",
  async ({ id, sttId }, { rejectWithValue }) => {
    try {
      const response = await pickupAPI.removeSTT(id, sttId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal menghapus STT dari pengambilan"
      );
    }
  }
);

// Tambahkan thunk untuk mendapatkan pickup berdasarkan supir
export const fetchPickupsByDriver = createAsyncThunk(
  "pickup/fetchPickupsByDriver",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pickups/by-driver/${driverId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data pengambilan"
      );
    }
  }
);

const initialState = {
  pickups: [], // Initialize as empty array
  pickup: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
};

const pickupSlice = createSlice({
  name: "pickup",
  initialState,
  reducers: {
    clearPickup: (state) => {
      state.pickup = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPickups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickups.fulfilled, (state, action) => {
        state.loading = false;
        state.pickups = action.payload.data || [];
        state.totalPages = action.payload.pagination?.totalPages || 0;
        state.currentPage = action.payload.pagination?.page || 1;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchPickups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.pickups = []; // Reset to empty array on error
      })
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

      .addCase(fetchPickupsByDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickupsByDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.pickups = action.payload;
      })
      .addCase(fetchPickupsByDriver.rejected, (state, action) => {
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

      .addCase(updatePickupRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pickupRequests.findIndex(
          (req) => req._id === action.payload._id
        );
        if (index !== -1) {
          state.pickupRequests[index] = action.payload;
        }
        if (
          state.pickupRequest &&
          state.pickupRequest._id === action.payload._id
        ) {
          state.pickupRequest = action.payload;
        }
        state.success = true;
      })
      .addCase(updatePickupRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // // Fetch pickups
      // .addCase(fetchPickups.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchPickups.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.pickups = action.payload.data;
      //   state.totalPages = action.payload.totalPages;
      //   state.currentPage = action.payload.currentPage;
      // })
      // .addCase(fetchPickups.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })

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
        const index = state.pickups.findIndex(
          (pickup) => pickup._id === action.payload._id
        );
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
        const index = state.pickups.findIndex(
          (pickup) => pickup._id === action.payload._id
        );
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
        const index = state.pickups.findIndex(
          (pickup) => pickup._id === action.payload._id
        );
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
        const index = state.pickups.findIndex(
          (pickup) => pickup._id === action.payload._id
        );
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
  },
});

export const { resetPickupState, clearSuccess, clearError } =
  pickupSlice.actions;
export default pickupSlice.reducer;
