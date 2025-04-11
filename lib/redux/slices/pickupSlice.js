// lib/redux/slices/pickupSlice.js - Improved Redux Slice
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { pickupAPI, pickupRequestAPI } from "@/lib/api";

// Async thunks

/**
 * Fetch pickup requests with optional params
 */
export const fetchPickupRequests = createAsyncThunk(
  "pickup/fetchPickupRequests",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await pickupRequestAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengambil data request pengambilan"
      );
    }
  }
);

/**
 * Fetch a pickup request by ID
 */
export const fetchPickupRequestById = createAsyncThunk(
  "pickup/fetchPickupRequestById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await pickupRequestAPI.getById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengambil data request pengambilan"
      );
    }
  }
);

/**
 * Create a new pickup request
 */
export const createPickupRequest = createAsyncThunk(
  "pickup/createPickupRequest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await pickupRequestAPI.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal membuat request pengambilan"
      );
    }
  }
);

/**
 * Update a pickup request's status
 */
export const updatePickupRequestStatus = createAsyncThunk(
  "pickup/updatePickupRequestStatus",
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const response = await pickupRequestAPI.updateStatus(id, {
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

/**
 * Fetch all pickups with optional filtering
 */
export const fetchPickups = createAsyncThunk(
  "pickup/fetchPickups",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await pickupAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data pengambilan"
      );
    }
  }
);

/**
 * Fetch a single pickup by ID
 */
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

/**
 * Create a new pickup
 */
export const createPickup = createAsyncThunk(
  "pickup/createPickup",
  async (data, { rejectWithValue }) => {
    try {
      // Convert string types to proper types if needed
      if (typeof data.jumlahColly === "string") {
        data.jumlahColly = parseInt(data.jumlahColly);
      }

      // Handle empty or 'all' kenekId
      if (data.kenekId === "" || data.kenekId === "all") {
        data.kenekId = null;
      }

      const response = await pickupAPI.create(data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal membuat pengambilan"
      );
    }
  }
);

/**
 * Update an existing pickup
 */
export const updatePickup = createAsyncThunk(
  "pickup/updatePickup",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Convert string types to proper types if needed
      if (typeof data.jumlahColly === "string") {
        data.jumlahColly = parseInt(data.jumlahColly);
      }

      // Handle empty or 'all' kenekId
      if (data.kenekId === "" || data.kenekId === "all") {
        data.kenekId = null;
      }

      const response = await pickupAPI.update(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengupdate pengambilan"
      );
    }
  }
);

/**
 * Delete a pickup by ID
 */
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

/**
 * Update a pickup's status
 */
export const updatePickupStatus = createAsyncThunk(
  "pickup/updatePickupStatus",
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const data = { status };
      if (notes) {
        data.notes = notes;
      }

      const response = await pickupAPI.updateStatus(id, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengubah status pengambilan"
      );
    }
  }
);

/**
 * Add an STT to a pickup
 */
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

/**
 * Remove an STT from a pickup
 */
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

/**
 * Fetch pickups by driver
 */
export const fetchPickupsByDriver = createAsyncThunk(
  "pickup/fetchPickupsByDriver",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await pickupAPI.getByDriver(driverId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengambil data pengambilan supir"
      );
    }
  }
);

/**
 * Fetch today's pickup data for dashboard
 */
export const fetchTodayPickups = createAsyncThunk(
  "pickup/fetchTodayPickups",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await pickupAPI.getToday(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengambil data pengambilan hari ini"
      );
    }
  }
);

// Initial state
const initialState = {
  // Pickups data
  pickups: [],
  pickup: null,
  todayPickups: {
    counts: {
      PENDING: 0,
      BERANGKAT: 0,
      SELESAI: 0,
      CANCELLED: 0,
      TOTAL: 0,
    },
    recent: [],
  },

  // Pickup requests data
  pickupRequests: [],
  pickupRequest: null,

  // Pagination data
  pagination: {
    currentPage: 1,
    totalPages: 0,
    total: 0,
  },

  // Status flags
  loading: false,
  loadingRequest: false,
  submitting: false,
  error: null,
  success: false,
  loadingToday: false,
};

// Create the slice
const pickupSlice = createSlice({
  name: "pickup",
  initialState,
  reducers: {
    resetPickupState: (state) => {
      return {
        ...initialState,
        pickups: state.pickups,
        pickupRequests: state.pickupRequests,
        pagination: state.pagination,
      };
    },
    clearPickup: (state) => {
      state.pickup = null;
    },
    clearPickupRequest: (state) => {
      state.pickupRequest = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Handle pickup requests
    builder
      // Fetch pickup requests
      .addCase(fetchPickupRequests.pending, (state) => {
        state.loadingRequest = true;
        state.error = null;
      })
      .addCase(fetchPickupRequests.fulfilled, (state, action) => {
        state.loadingRequest = false;
        state.pickupRequests = action.payload.data || [];

        if (action.payload.pagination) {
          state.pagination = {
            currentPage: action.payload.pagination.page || 1,
            totalPages: action.payload.pagination.totalPages || 0,
            total: action.payload.total || 0,
          };
        }
      })
      .addCase(fetchPickupRequests.rejected, (state, action) => {
        state.loadingRequest = false;
        state.error = action.payload;
      })

      // Fetch pickup request by ID
      .addCase(fetchPickupRequestById.pending, (state) => {
        state.loadingRequest = true;
        state.error = null;
      })
      .addCase(fetchPickupRequestById.fulfilled, (state, action) => {
        state.loadingRequest = false;
        state.pickupRequest = action.payload;
      })
      .addCase(fetchPickupRequestById.rejected, (state, action) => {
        state.loadingRequest = false;
        state.error = action.payload;
      })

      // Create pickup request
      .addCase(createPickupRequest.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPickupRequest.fulfilled, (state, action) => {
        state.submitting = false;
        state.pickupRequests = [action.payload, ...state.pickupRequests];
        state.success = true;
      })
      .addCase(createPickupRequest.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update pickup request status
      .addCase(updatePickupRequestStatus.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePickupRequestStatus.fulfilled, (state, action) => {
        state.submitting = false;

        // Update in list if exists
        const index = state.pickupRequests.findIndex(
          (req) => req._id === action.payload._id
        );

        if (index !== -1) {
          state.pickupRequests[index] = action.payload;
        }

        // Update current item if matches
        if (state.pickupRequest?._id === action.payload._id) {
          state.pickupRequest = action.payload;
        }

        state.success = true;
      })
      .addCase(updatePickupRequestStatus.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
        state.success = false;
      })

      // Pickups

      // Fetch pickups
      .addCase(fetchPickups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickups.fulfilled, (state, action) => {
        state.loading = false;
        state.pickups = action.payload.data.data || [];

        if (action.payload.pagination) {
          state.pagination = {
            currentPage: action.payload.pagination.page || 1,
            totalPages: action.payload.pagination.totalPages || 0,
            total: action.payload.total || 0,
          };
        }
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
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPickup.fulfilled, (state, action) => {
        state.submitting = false;
        state.pickup = action.payload;

        // Add to list if not already exists
        const exists = state.pickups.some((p) => p._id === action.payload._id);
        if (!exists) {
          state.pickups = [action.payload, ...state.pickups];
        }

        state.success = true;
      })
      .addCase(createPickup.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update pickup
      .addCase(updatePickup.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePickup.fulfilled, (state, action) => {
        state.submitting = false;

        // Update current item
        state.pickup = action.payload;

        // Update in list if exists
        const index = state.pickups.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.pickups[index] = action.payload;
        }

        state.success = true;
      })
      .addCase(updatePickup.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete pickup
      .addCase(deletePickup.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deletePickup.fulfilled, (state, action) => {
        state.submitting = false;

        // Remove from list
        state.pickups = state.pickups.filter((p) => p._id !== action.payload);

        // Clear current item if matches
        if (state.pickup?._id === action.payload) {
          state.pickup = null;
        }

        state.success = true;
      })
      .addCase(deletePickup.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update pickup status
      .addCase(updatePickupStatus.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePickupStatus.fulfilled, (state, action) => {
        state.submitting = false;

        // Update current item
        state.pickup = action.payload;

        // Update in list if exists
        const index = state.pickups.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.pickups[index] = action.payload;
        }

        state.success = true;
      })
      .addCase(updatePickupStatus.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
        state.success = false;
      })

      // Add STT to pickup
      .addCase(addSTTToPickup.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addSTTToPickup.fulfilled, (state, action) => {
        state.submitting = false;

        // Update current item
        state.pickup = action.payload;

        // Update in list if exists
        const index = state.pickups.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.pickups[index] = action.payload;
        }

        state.success = true;
      })
      .addCase(addSTTToPickup.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
        state.success = false;
      })

      // Remove STT from pickup
      .addCase(removeSTTFromPickup.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeSTTFromPickup.fulfilled, (state, action) => {
        state.submitting = false;

        // Update current item
        state.pickup = action.payload;

        // Update in list if exists
        const index = state.pickups.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.pickups[index] = action.payload;
        }

        state.success = true;
      })
      .addCase(removeSTTFromPickup.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
        state.success = false;
      })

      // Fetch pickups by driver
      .addCase(fetchPickupsByDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickupsByDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.pickups = action.payload.data.data || [];

        if (action.payload.pagination) {
          state.pagination = {
            currentPage: action.payload.pagination.page || 1,
            totalPages: action.payload.pagination.totalPages || 0,
            total: action.payload.total || 0,
          };
        }
      })
      .addCase(fetchPickupsByDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch today's pickups
      .addCase(fetchTodayPickups.pending, (state) => {
        state.loadingToday = true;
        state.error = null;
      })
      .addCase(fetchTodayPickups.fulfilled, (state, action) => {
        state.loadingToday = false;
        state.todayPickups = action.payload;
      })
      .addCase(fetchTodayPickups.rejected, (state, action) => {
        state.loadingToday = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetPickupState,
  clearPickup,
  clearPickupRequest,
  clearError,
  clearSuccess,
} = pickupSlice.actions;

export default pickupSlice.reducer;
