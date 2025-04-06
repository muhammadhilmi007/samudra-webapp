// lib/redux/slices/vehicleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { vehicleAPI } from '@/lib/api'

// Async thunks
export const fetchVehicles = createAsyncThunk(
  'vehicle/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getAll();
      
      // Check if response has expected structure
      if (!response.data || !Array.isArray(response.data.data)) {
        return rejectWithValue('Unexpected API response format');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data kendaraan: ' + (error.message || 'Unknown error')
      );
    }
  }
);


export const fetchVehicleById = createAsyncThunk(
  'vehicle/fetchVehicleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data kendaraan'
      )
    }
  }
)

export const fetchVehiclesByBranch = createAsyncThunk(
  'vehicle/fetchVehiclesByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getByBranch(branchId)
      return { branchId, data: response.data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data kendaraan berdasarkan cabang'
      )
    }
  }
)

export const fetchTrucks = createAsyncThunk(
  'vehicle/fetchTrucks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getTrucks()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data truck'
      )
    }
  }
)

export const fetchDeliveryVehicles = createAsyncThunk(
  'vehicle/fetchDeliveryVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.getDeliveryVehicles()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data kendaraan pengiriman'
      )
    }
  }
)

export const createVehicle = createAsyncThunk(
  'vehicle/createVehicle',
  async (vehicleData, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.create(vehicleData)
      
      // Validate response structure
      if (!response?.data) {
        console.error('Invalid response structure:', response);
        return rejectWithValue('Invalid response structure from server');
      }

      // If data is nested within data property
      if (response.data.data) {
        return response.data;
      }

      // If data is directly in the response.data
      return { data: response.data };
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Gagal membuat kendaraan baru'
      )
    }
  }
)

export const updateVehicle = createAsyncThunk(
  'vehicle/updateVehicle',
  async ({ id, vehicleData }, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.update(id, vehicleData)
      
      // Validate basic response
      if (!response?.data) {
        console.error('Invalid response structure:', response);
        return rejectWithValue('Invalid response from server');
      }

      // If data is nested within data property
      if (response.data.data) {
        return response.data;
      }

      // If data is directly in the response.data
      return { data: response.data };
      
    } catch (error) {
      console.error('Error updating vehicle:', error.response || error);
      return rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        'Gagal memperbarui kendaraan'
      )
    }
  }
)

export const deleteVehicle = createAsyncThunk(
  'vehicle/deleteVehicle',
  async (id, { rejectWithValue }) => {
    try {
      await vehicleAPI.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal menghapus kendaraan'
      )
    }
  }
)

export const uploadVehiclePhoto = createAsyncThunk(
  'vehicle/uploadVehiclePhoto',
  async ({ id, photoType, formData }, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.uploadPhoto(id, formData)
      return { 
        id, 
        photoType, 
        data: response.data 
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengunggah foto'
      )
    }
  }
)

export const uploadVehicleDocument = createAsyncThunk(
  'vehicle/uploadVehicleDocument',
  async ({ id, documentType, formData }, { rejectWithValue }) => {
    try {
      const response = await vehicleAPI.uploadDocument(id, formData)
      return { 
        id, 
        documentType, 
        data: response.data 
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengunggah dokumen'
      )
    }
  }
)

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
}

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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
      })
      
      // Create vehicle
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles.push(action.payload.data);
        state.currentVehicle = action.payload.data;
        state.error = null;
        state.success = true;
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.vehicles = state.vehicles.map(vehicle => 
          vehicle._id === action.payload.data._id ? action.payload.data : vehicle
        );
        state.currentVehicle = action.payload.data;
        state.error = null;
        state.success = true;
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.error = null;
        state.success = true;
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        if (state.currentVehicle && state.currentVehicle._id === action.payload.id) {
          if (action.payload.photoType === 'driver') {
            state.currentVehicle.fotoSupir = action.payload.data.photoUrl;
          } else if (action.payload.photoType === 'helper') {
            state.currentVehicle.fotoKenek = action.payload.data.photoUrl;
          }
        }
        state.uploadError = null;
        state.uploadSuccess = true;
      })
      .addCase(uploadVehiclePhoto.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload;
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
        if (state.currentVehicle && state.currentVehicle._id === action.payload.id) {
          if (action.payload.documentType === 'driverIDCard') {
            state.currentVehicle.fotoKTPSupir = action.payload.data.documentUrl;
          } else if (action.payload.documentType === 'helperIDCard') {
            state.currentVehicle.fotoKTPKenek = action.payload.data.documentUrl;
          }
        }
        state.uploadError = null;
        state.uploadSuccess = true;
      })
      .addCase(uploadVehicleDocument.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload;
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