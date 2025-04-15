/**
 * Vehicle Queue Redux Slice
 *
 * This slice manages the state for vehicle queues in the application.
 * It includes actions for CRUD operations and status management.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleQueueAPI } from '@/lib/api';

/**
 * Async thunks for vehicle queue operations
 * These handle asynchronous API calls and update the Redux store accordingly
 */
/**
 * Fetch all vehicle queues
 *
 * This thunk retrieves all vehicle queues from the API.
 * It updates the vehicleQueues array in the state when successful.
 */
export const fetchVehicleQueues = createAsyncThunk(
  'vehicleQueue/fetchVehicleQueues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Gagal mengambil data antrian kendaraan'
      );
    }
  }
);

/**
 * Fetch a vehicle queue by ID
 *
 * This thunk retrieves a specific vehicle queue by its ID.
 * It updates the currentVehicleQueue in the state when successful.
 *
 * @param {string} id - The ID of the vehicle queue to fetch
 */
export const fetchVehicleQueueById = createAsyncThunk(
  'vehicleQueue/fetchVehicleQueueById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Gagal mengambil data antrian kendaraan'
      );
    }
  }
);

export const fetchVehicleQueuesByBranch = createAsyncThunk(
  'vehicleQueue/fetchVehicleQueuesByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.getByBranch(branchId);
      return { branchId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data antrian kendaraan berdasarkan cabang'
      );
    }
  }
);

export const fetchVehicleQueuesByStatus = createAsyncThunk(
  'vehicleQueue/fetchVehicleQueuesByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.getByStatus(status);
      return { status, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data antrian kendaraan berdasarkan status'
      );
    }
  }
);

/**
 * Create a new vehicle queue
 *
 * This thunk creates a new vehicle queue with the provided data.
 * It adds the new queue to the vehicleQueues array in the state when successful.
 *
 * @param {Object} queueData - The data for the new vehicle queue
 */
export const createVehicleQueue = createAsyncThunk(
  'vehicleQueue/createVehicleQueue',
  async (queueData, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.create(queueData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Gagal membuat antrian kendaraan baru'
      );
    }
  }
);

/**
 * Update an existing vehicle queue
 *
 * This thunk updates a vehicle queue with the provided data.
 * It updates the corresponding queue in the vehicleQueues array when successful.
 *
 * @param {Object} params - The parameters object
 * @param {string} params.id - The ID of the vehicle queue to update
 * @param {Object} params.queueData - The updated data for the vehicle queue
 */
export const updateVehicleQueue = createAsyncThunk(
  'vehicleQueue/updateVehicleQueue',
  async ({ id, queueData }, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.update(id, queueData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Gagal memperbarui antrian kendaraan'
      );
    }
  }
);

/**
 * Update the status of a vehicle queue
 *
 * This thunk updates only the status of a vehicle queue.
 * It's a specialized version of the update operation focused on status changes.
 *
 * @param {Object} params - The parameters object
 * @param {string} params.id - The ID of the vehicle queue
 * @param {string} params.status - The new status (MENUNGGU, LANSIR, KEMBALI)
 */
export const updateVehicleQueueStatus = createAsyncThunk(
  'vehicleQueue/updateVehicleQueueStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await vehicleQueueAPI.updateStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Gagal memperbarui status antrian kendaraan'
      );
    }
  }
);

/**
 * Delete a vehicle queue
 *
 * This thunk deletes a vehicle queue by its ID.
 * It removes the queue from the vehicleQueues array in the state when successful.
 *
 * @param {string} id - The ID of the vehicle queue to delete
 */
export const deleteVehicleQueue = createAsyncThunk(
  'vehicleQueue/deleteVehicleQueue',
  async (id, { rejectWithValue }) => {
    try {
      await vehicleQueueAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'Gagal menghapus antrian kendaraan'
      );
    }
  }
);

/**
 * Initial state for the vehicle queue slice
 *
 * @property {Array} vehicleQueues - List of all vehicle queues
 * @property {Object} vehicleQueuesByBranch - Vehicle queues organized by branch ID
 * @property {Object} vehicleQueuesByStatus - Vehicle queues organized by status
 * @property {Object|null} currentVehicleQueue - The currently selected vehicle queue
 * @property {boolean} loading - Indicates if an async operation is in progress
 * @property {string|null} error - Error message if an operation failed
 * @property {boolean} success - Indicates if the last operation was successful
 */
const initialState = {
  vehicleQueues: [],
  vehicleQueuesByBranch: {},
  vehicleQueuesByStatus: {},
  currentVehicleQueue: null,
  loading: false,
  error: null,
  success: false,
};

/**
 * Vehicle Queue Redux Slice
 *
 * This slice manages the state for vehicle queues in the application.
 * It includes reducers for handling async operations and updating the state.
 */
const vehicleQueueSlice = createSlice({
  name: 'vehicleQueue',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentVehicleQueue: (state, action) => {
      state.currentVehicleQueue = action.payload;
    },
    clearCurrentVehicleQueue: (state) => {
      state.currentVehicleQueue = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all vehicle queues
      .addCase(fetchVehicleQueues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleQueues.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both response formats (data or direct array)
        state.vehicleQueues = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchVehicleQueues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch vehicle queue by ID
      .addCase(fetchVehicleQueueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleQueueById.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both response formats (data or direct object)
        state.currentVehicleQueue = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchVehicleQueueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch vehicle queues by branch
      .addCase(fetchVehicleQueuesByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleQueuesByBranch.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both response formats
        const responseData = action.payload.data.data || action.payload.data;
        state.vehicleQueuesByBranch[action.payload.branchId] = responseData;
        state.error = null;
      })
      .addCase(fetchVehicleQueuesByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch vehicle queues by status
      .addCase(fetchVehicleQueuesByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleQueuesByStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both response formats
        const responseData = action.payload.data.data || action.payload.data;
        state.vehicleQueuesByStatus[action.payload.status] = responseData;
        state.error = null;
      })
      .addCase(fetchVehicleQueuesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create vehicle queue
      .addCase(createVehicleQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createVehicleQueue.fulfilled, (state, action) => {
        state.loading = false;
        // Handle response formats consistently
        const newQueue = action.payload.data || action.payload;
        
        // Add to local collection if exists
        if (state.vehicleQueues) {
          state.vehicleQueues.push(newQueue);
        }
        
        // Update currentVehicleQueue
        state.currentVehicleQueue = newQueue;
        state.success = true;
        state.error = null;
        
        console.log('Vehicle queue created successfully:', newQueue);
      })
      .addCase(createVehicleQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Gagal menambahkan antrian kendaraan';
        state.success = false;
        
        console.error('Error creating vehicle queue:', state.error);
      })
      
      // Update vehicle queue
      .addCase(updateVehicleQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateVehicleQueue.fulfilled, (state, action) => {
        state.loading = false;
        
        // Handle response formats consistently
        const updatedQueue = action.payload.data || action.payload;
        
        // Update in local collection if exists
        if (state.vehicleQueues) {
          const index = state.vehicleQueues.findIndex(
            (q) => q._id === updatedQueue._id
          );
          if (index !== -1) {
            state.vehicleQueues[index] = updatedQueue;
          }
        }
        
        // Update branch collection if exists
        if (updatedQueue.cabangId && state.vehicleQueuesByBranch[updatedQueue.cabangId]) {
          const branchIndex = state.vehicleQueuesByBranch[updatedQueue.cabangId].findIndex(
            (q) => q._id === updatedQueue._id
          );
          if (branchIndex !== -1) {
            state.vehicleQueuesByBranch[updatedQueue.cabangId][branchIndex] = updatedQueue;
          }
        }
        
        // Update currentVehicleQueue if it's the same queue
        if (state.currentVehicleQueue && state.currentVehicleQueue._id === updatedQueue._id) {
          state.currentVehicleQueue = updatedQueue;
        }
        
        state.success = true;
        state.error = null;
        
        console.log('Vehicle queue updated successfully:', updatedQueue);
      })
      .addCase(updateVehicleQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Gagal memperbarui antrian kendaraan';
        state.success = false;
        
        console.error('Error updating vehicle queue:', state.error);
      })
      
      // Update vehicle queue status
      .addCase(updateVehicleQueueStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateVehicleQueueStatus.fulfilled, (state, action) => {
        state.loading = false;
        
        // Handle response formats consistently
        const updatedQueue = action.payload.data || action.payload;
        
        // Update in local collection if exists
        if (state.vehicleQueues) {
          const index = state.vehicleQueues.findIndex(
            (q) => q._id === updatedQueue._id
          );
          if (index !== -1) {
            state.vehicleQueues[index] = updatedQueue;
          }
        }
        
        // Update currentVehicleQueue if it's the same queue
        if (state.currentVehicleQueue && state.currentVehicleQueue._id === updatedQueue._id) {
          state.currentVehicleQueue = updatedQueue;
        }
        
        state.success = true;
        state.error = null;
        
        console.log('Vehicle queue status updated successfully:', updatedQueue);
      })
      .addCase(updateVehicleQueueStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Gagal memperbarui status antrian kendaraan';
        state.success = false;
        
        console.error('Error updating vehicle queue status:', state.error);
      })
      
      // Delete vehicle queue
      .addCase(deleteVehicleQueue.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteVehicleQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleQueues = state.vehicleQueues.filter(queue => queue._id !== action.payload);
        state.error = null;
        state.success = true;
        
        console.log('Vehicle queue deleted successfully:', action.payload);
      })
      .addCase(deleteVehicleQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Gagal menghapus antrian kendaraan';
        state.success = false;
        
        console.error('Error deleting vehicle queue:', state.error);
      })
  }
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentVehicleQueue, 
  clearCurrentVehicleQueue 
} = vehicleQueueSlice.actions;

export default vehicleQueueSlice.reducer;