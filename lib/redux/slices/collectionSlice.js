// lib/redux/slices/collectionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collectionAPI } from '@/lib/api';
import { downloadBlob } from '@/lib/utils';

// Async thunks
export const fetchCollections = createAsyncThunk(
  'collection/fetchCollections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data penagihan'
      );
    }
  }
);

export const fetchCollectionById = createAsyncThunk(
  'collection/fetchCollectionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data penagihan'
      );
    }
  }
);

export const fetchCollectionsByBranch = createAsyncThunk(
  'collection/fetchCollectionsByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.getByBranch(branchId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data penagihan cabang'
      );
    }
  }
);

export const fetchCollectionsByCustomer = createAsyncThunk(
  'collection/fetchCollectionsByCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.getByCustomer(customerId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data penagihan pelanggan'
      );
    }
  }
);

export const createCollection = createAsyncThunk(
  'collection/createCollection',
  async (collectionData, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.create(collectionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat penagihan baru'
      );
    }
  }
);

export const updateCollection = createAsyncThunk(
  'collection/updateCollection',
  async ({ id, collectionData }, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.update(id, collectionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui penagihan'
      );
    }
  }
);

export const updateCollectionStatus = createAsyncThunk(
  'collection/updateCollectionStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.updateStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui status penagihan'
      );
    }
  }
);

export const deleteCollection = createAsyncThunk(
  'collection/deleteCollection',
  async (id, { rejectWithValue }) => {
    try {
      await collectionAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal menghapus penagihan'
      );
    }
  }
);

export const generateInvoice = createAsyncThunk(
  'collection/generateInvoice',
  async (id, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.generateInvoice(id);
      
      // Generate filename
      const date = new Date();
      const filename = `Invoice_${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${id}.pdf`;
      
      // Download the blob
      downloadBlob(response, filename);
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat invoice'
      );
    }
  }
);

export const addPayment = createAsyncThunk(
  'collection/addPayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.addPayment(id, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal menambahkan pembayaran'
      );
    }
  }
);

// Initial state
const initialState = {
  collections: [],
  collectionsByBranch: {},
  collectionsByCustomer: {},
  currentCollection: null,
  loading: false,
  error: null,
  success: false,
};

// Collection slice
const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentCollection: (state, action) => {
      state.currentCollection = action.payload;
    },
    clearCurrentCollection: (state) => {
      state.currentCollection = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all collections
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch collection by ID
      .addCase(fetchCollectionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollectionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCollection = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCollectionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch collections by branch
      .addCase(fetchCollectionsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollectionsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.collectionsByBranch[action.meta.arg] = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCollectionsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch collections by customer
      .addCase(fetchCollectionsByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollectionsByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.collectionsByCustomer[action.meta.arg] = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCollectionsByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create collection
      .addCase(createCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.loading = false;
        state.collections.push(action.payload.data);
        state.error = null;
        state.success = true;
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update collection
      .addCase(updateCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = state.collections.map(collection => 
          collection._id === action.payload.data._id ? action.payload.data : collection
        );
        state.currentCollection = action.payload.data;
        state.error = null;
        state.success = true;
      })
      .addCase(updateCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update collection status
      .addCase(updateCollectionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCollectionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = state.collections.map(collection => 
          collection._id === action.payload.data._id ? action.payload.data : collection
        );
        if (state.currentCollection && state.currentCollection._id === action.payload.data._id) {
          state.currentCollection = action.payload.data;
        }
        state.error = null;
        state.success = true;
      })
      .addCase(updateCollectionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete collection
      .addCase(deleteCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = state.collections.filter(collection => collection._id !== action.payload);
        state.error = null;
        state.success = true;
      })
      .addCase(deleteCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Generate invoice
      .addCase(generateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateInvoice.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add payment
      .addCase(addPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = state.collections.map(collection => 
          collection._id === action.payload.data._id ? action.payload.data : collection
        );
        if (state.currentCollection && state.currentCollection._id === action.payload.data._id) {
          state.currentCollection = action.payload.data;
        }
        state.error = null;
        state.success = true;
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentCollection, 
  clearCurrentCollection
} = collectionSlice.actions;

export default collectionSlice.reducer;