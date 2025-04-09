// lib/redux/slices/vehicleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehicleAPI } from '@/lib/api';

// Helper function to normalize API responses
const normalizeResponse = (response) => {
  if (!response) return null;
  
  // If the data is nested within data property
  if (response.data && response.data.data) {
    return response.data;
  }
  
  // If data is directly in the response.data
  if (response.data) {
    return { data: response.data };
  }
  
  // Last resort - return the response itself
  return { data: response };
};

// Async thunks
export const fetchVehicles = createAsyncThunk(
  'vehicle/fetchVehicles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getAll(params);
      return normalizeResponse(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data kendaraan'
      );
    }
  }
);

export const fetchVehicleById = createAsyncThunk(
  'vehicle/fetchVehicleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getById(id);
      return normalizeResponse(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data kendaraan'
      );
    }
  }
);

export const fetchVehiclesByBranch = createAsyncThunk(
  'vehicle/fetchVehiclesByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getByBranch(branchId);
      const normalized = normalizeResponse(response);
      return { branchId, data: normalized.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data kendaraan berdasarkan cabang'
      );
    }
  }
);

export const fetchTrucks = createAsyncThunk(
  'vehicle/fetchTrucks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getTrucks(params);
      return normalizeResponse(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data truck'
      );
    }
  }
);

export const fetchDeliveryVehicles = createAsyncThunk(
  'vehicle/fetchDeliveryVehicles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getDeliveryVehicles(params);
      return normalizeResponse(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data kendaraan pengiriman'
      );
    }
  }
);

export const createVehicle = createAsyncThunk(
  'vehicle/createVehicle',
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.create(vehicleData);
      return normalizeResponse(response);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Gagal membuat kendaraan baru'
      );
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicle/updateVehicle',
  async ({ id, vehicleData }, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.update(id, vehicleData);
      return normalizeResponse(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui data kendaraan'
      );
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicle/deleteVehicle',
  async (id, { rejectWithValue }) => {
    try {
      await vehicleAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal menghapus kendaraan'
      );
    }
  }
);

export const uploadVehiclePhoto = createAsyncThunk(
  'vehicle/uploadVehiclePhoto',
  async ({ id, photoType, formData }, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.uploadPhoto(id, formData, photoType);
      const normalized = normalizeResponse(response);
      return { 
        id, 
        photoType, 
        data: normalized.data,
        photoUrl: normalized.data.photoUrl || normalized.data.data?.photoUrl
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengunggah foto'
      );
    }
  }
);

export const uploadVehicleDocument = createAsyncThunk(
  'vehicle/uploadVehicleDocument',
  async ({ id, documentType, formData }, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.uploadDocument(id, formData, documentType);
      const normalized = normalizeResponse(response);
      return { 
        id, 
        documentType, 
        data: normalized.data,
        documentUrl: normalized.data.documentUrl || normalized.data.data?.documentUrl
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengunggah dokumen'
      );
    }
  }
);

// Initial state
const initialState = {
  vehicles: [],
  vehiclesByBranch: {},
  trucks: [],
  deliveryVehicles: [],
  currentVehicle: null,
  loading: false,
  error: null,
  success: false,
  uploading: false,
  uploadSuccess: false,
  uploadError: null,
};

// Vehicle slice
const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.uploadError = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.uploadSuccess = false;
    },
    setCurrentVehicle: (state, action) => {
      state.currentVehicle = action.payload;
    },
    clearCurrentVehicle: (state) => {
      state.currentVehicle = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload.data;
        state.error = null;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Fetch vehicle by ID
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVehicle = action.payload.data;
        state.error = null;
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Fetch vehicles by branch
      .addCase(fetchVehiclesByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehiclesByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.vehiclesByBranch[action.payload.branchId] = action.payload.data;
        state.error = null;
      })
      .addCase(fetchVehiclesByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Fetch trucks
      .addCase(fetchTrucks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrucks.fulfilled, (state, action) => {
        state.loading = false;
        state.trucks = action.payload.data;
        state.error = null;
      })
      .addCase(fetchTrucks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Fetch delivery vehicles
      .addCase(fetchDeliveryVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryVehicles = action.payload.data;
        state.error = null;
      })
      .addCase(fetchDeliveryVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Create vehicle
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.vehicles.push(action.payload.data);
          state.currentVehicle = action.payload.data;
        }
        state.error = null;
        state.success = true;
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.success = false;
      })
      
      // Update vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentVehicle = action.payload.data;
        
        // Also update the vehicle in the vehicles array if it exists
        if (state.vehicles && state.vehicles.length > 0) {
          const index = state.vehicles.findIndex(v => v._id === action.payload.data._id);
          if (index !== -1) {
            state.vehicles[index] = action.payload.data;
          }
        }
      })
      
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.success = false;
      })
      
      // Delete vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = state.vehicles.filter(vehicle => vehicle._id !== action.payload);
        if (state.currentVehicle && state.currentVehicle._id === action.payload) {
          state.currentVehicle = null;
        }
        state.error = null;
        state.success = true;
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.success = false;
      })
      
      // Upload vehicle photo
      .addCase(uploadVehiclePhoto.pending, (state) => {
        state.uploading = true;
        state.uploadError = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadVehiclePhoto.fulfilled, (state, action) => {
        state.uploading = false;
        
        // Handle updating the current vehicle if it matches
        if (state.currentVehicle && state.currentVehicle._id === action.payload.id) {
          if (action.payload.photoType === 'driver' || action.payload.photoType === 'driverPhoto') {
            state.currentVehicle.fotoSupir = action.payload.photoUrl;
          } else if (action.payload.photoType === 'helper' || action.payload.photoType === 'helperPhoto') {
            state.currentVehicle.fotoKenek = action.payload.photoUrl;
          }
        }
        
        // Update in vehicles array if present
        state.vehicles = state.vehicles.map(vehicle => {
          if (vehicle._id === action.payload.id) {
            const updatedVehicle = { ...vehicle };
            if (action.payload.photoType === 'driver' || action.payload.photoType === 'driverPhoto') {
              updatedVehicle.fotoSupir = action.payload.photoUrl;
            } else if (action.payload.photoType === 'helper' || action.payload.photoType === 'helperPhoto') {
              updatedVehicle.fotoKenek = action.payload.photoUrl;
            }
            return updatedVehicle;
          }
          return vehicle;
        });
        
        state.uploadError = null;
        state.uploadSuccess = true;
      })
      .addCase(uploadVehiclePhoto.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload || action.error.message;
        state.uploadSuccess = false;
      })
      
      // Upload vehicle document
      .addCase(uploadVehicleDocument.pending, (state) => {
        state.uploading = true;
        state.uploadError = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadVehicleDocument.fulfilled, (state, action) => {
        state.uploading = false;
        
        // Handle updating the current vehicle if it matches
        if (state.currentVehicle && state.currentVehicle._id === action.payload.id) {
          if (action.payload.documentType === 'driverIDCard') {
            state.currentVehicle.fotoKTPSupir = action.payload.documentUrl;
          } else if (action.payload.documentType === 'helperIDCard') {
            state.currentVehicle.fotoKTPKenek = action.payload.documentUrl;
          }
        }
        
        // Update in vehicles array if present
        state.vehicles = state.vehicles.map(vehicle => {
          if (vehicle._id === action.payload.id) {
            const updatedVehicle = { ...vehicle };
            if (action.payload.documentType === 'driverIDCard') {
              updatedVehicle.fotoKTPSupir = action.payload.documentUrl;
            } else if (action.payload.documentType === 'helperIDCard') {
              updatedVehicle.fotoKTPKenek = action.payload.documentUrl;
            }
            return updatedVehicle;
          }
          return vehicle;
        });
        
        state.uploadError = null;
        state.uploadSuccess = true;
      })
      .addCase(uploadVehicleDocument.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload || action.error.message;
        state.uploadSuccess = false;
      })
  }
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentVehicle, 
  clearCurrentVehicle 
} = vehicleSlice.actions;

export default vehicleSlice.reducer;