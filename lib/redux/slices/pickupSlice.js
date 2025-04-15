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
 *
 * This thunk creates a new pickup record with validation and error handling.
 * It ensures that all required fields are present and properly formatted.
 *
 * @param {Object} data - The pickup data to create
 * @returns {Object} The created pickup data or error information
 */
export const createPickup = createAsyncThunk(
  "pickup/createPickup",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      // Validate required fields
      const requiredFields = ['pengirimId', 'alamatPengambilan', 'tujuan', 'jumlahColly', 'supirId', 'kendaraanId'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return rejectWithValue(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Convert string types to proper types if needed
      if (typeof data.jumlahColly === "string") {
        data.jumlahColly = parseInt(data.jumlahColly, 10);
        
        if (isNaN(data.jumlahColly)) {
          return rejectWithValue("Jumlah colly harus berupa angka");
        }
      }

      // Handle empty or 'all' kenekId
      if (data.kenekId === "" || data.kenekId === "all") {
        data.kenekId = null;
      }

      // Set default status if not provided
      if (!data.status) {
        data.status = "PENDING";
      }

      // Validate status
      const validStatuses = ['PENDING', 'BERANGKAT', 'SELESAI', 'CANCELLED'];
      if (!validStatuses.includes(data.status)) {
        return rejectWithValue(`Status tidak valid: ${data.status}`);
      }

      const response = await pickupAPI.create(data);
      
      // Clear any previous errors
      dispatch(clearError());
      
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
 *
 * This thunk updates an existing pickup record with validation and error handling.
 * It ensures that all fields are properly formatted and validates the data before submission.
 *
 * @param {Object} params - The parameters for the update operation
 * @param {string} params.id - The ID of the pickup to update
 * @param {Object} params.data - The pickup data to update
 * @returns {Object} The updated pickup data or error information
 */
export const updatePickup = createAsyncThunk(
  "pickup/updatePickup",
  async ({ id, data }, { rejectWithValue, dispatch, getState }) => {
    try {
      // Validate ID
      if (!id) {
        return rejectWithValue("ID pengambilan tidak valid");
      }
      
      // Get current pickup data to merge with updates
      const currentPickup = getState().pickup.pickup;
      
      // Convert string types to proper types if needed
      if (typeof data.jumlahColly === "string") {
        data.jumlahColly = parseInt(data.jumlahColly, 10);
        
        if (isNaN(data.jumlahColly)) {
          return rejectWithValue("Jumlah colly harus berupa angka");
        }
      }

      // Handle empty or 'all' kenekId
      if (data.kenekId === "" || data.kenekId === "all") {
        data.kenekId = null;
      }
      
      // Validate status if it's being updated
      if (data.status) {
        const validStatuses = ['PENDING', 'BERANGKAT', 'SELESAI', 'CANCELLED'];
        if (!validStatuses.includes(data.status)) {
          return rejectWithValue(`Status tidak valid: ${data.status}`);
        }
        
        // Require notes for CANCELLED status
        if (data.status === 'CANCELLED' && !data.notes && (!currentPickup || !currentPickup.notes)) {
          return rejectWithValue("Catatan diperlukan saat membatalkan pengambilan");
        }
      }

      const response = await pickupAPI.update(id, data);
      
      // Clear any previous errors
      dispatch(clearError());
      
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
 *
 * This thunk updates the status of a pickup with validation and error handling.
 * It ensures that the status is valid and that required notes are provided for certain status changes.
 *
 * @param {Object} params - The parameters for the status update
 * @param {string} params.id - The ID of the pickup
 * @param {string} params.status - The new status (PENDING, BERANGKAT, SELESAI, CANCELLED)
 * @param {string} [params.notes] - Optional notes for the status change (required for CANCELLED)
 * @returns {Object} The updated pickup data or error information
 */
export const updatePickupStatus = createAsyncThunk(
  "pickup/updatePickupStatus",
  async ({ id, status, notes }, { rejectWithValue, dispatch }) => {
    try {
      // Validate ID
      if (!id) {
        return rejectWithValue("ID pengambilan tidak valid");
      }
      
      // Validate status
      const validStatuses = ['PENDING', 'BERANGKAT', 'SELESAI', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return rejectWithValue(`Status tidak valid: ${status}. Harus salah satu dari: ${validStatuses.join(', ')}`);
      }
      
      // Require notes for CANCELLED status
      if (status === 'CANCELLED' && !notes) {
        return rejectWithValue("Catatan diperlukan saat membatalkan pengambilan");
      }
      
      const data = { status };
      if (notes) {
        data.notes = notes;
      }

      const response = await pickupAPI.updateStatus(id, data);
      
      // Clear any previous errors
      dispatch(clearError());
      
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
 *
 * This thunk adds an STT (Surat Tanda Terima) to a pickup with validation and error handling.
 *
 * @param {Object} params - The parameters for adding an STT
 * @param {string} params.id - The ID of the pickup
 * @param {string} params.sttId - The ID of the STT to add
 * @returns {Object} The updated pickup data or error information
 */
export const addSTTToPickup = createAsyncThunk(
  "pickup/addSTTToPickup",
  async ({ id, sttId }, { rejectWithValue, dispatch }) => {
    try {
      // Validate parameters
      if (!id) {
        return rejectWithValue("ID pengambilan tidak valid");
      }
      
      if (!sttId) {
        return rejectWithValue("ID STT tidak valid");
      }
      
      const response = await pickupAPI.addSTT(id, sttId);
      
      // Clear any previous errors
      dispatch(clearError());
      
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
 *
 * This thunk removes an STT (Surat Tanda Terima) from a pickup with validation and error handling.
 *
 * @param {Object} params - The parameters for removing an STT
 * @param {string} params.id - The ID of the pickup
 * @param {string} params.sttId - The ID of the STT to remove
 * @returns {Object} The updated pickup data or error information
 */
export const removeSTTFromPickup = createAsyncThunk(
  "pickup/removeSTTFromPickup",
  async ({ id, sttId }, { rejectWithValue, dispatch }) => {
    try {
      // Validate parameters
      if (!id) {
        return rejectWithValue("ID pengambilan tidak valid");
      }
      
      if (!sttId) {
        return rejectWithValue("ID STT tidak valid");
      }
      
      const response = await pickupAPI.removeSTT(id, sttId);
      
      // Clear any previous errors
      dispatch(clearError());
      
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
