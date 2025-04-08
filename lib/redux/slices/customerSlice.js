import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customerAPI } from "@/lib/api";

// Async thunks
export const fetchCustomers = createAsyncThunk(
  "customer/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data pelanggan"
      );
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customer/fetchCustomerById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data pelanggan"
      );
    }
  }
);

export const fetchSenders = createAsyncThunk(
  "customer/fetchSenders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getSenders();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data pengirim"
      );
    }
  }
);

export const fetchRecipients = createAsyncThunk(
  "customer/fetchRecipients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getRecipients();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data penerima"
      );
    }
  }
);

export const fetchCustomersByBranch = createAsyncThunk(
  "customer/fetchCustomersByBranch",
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getByBranch(branchId);
      return { branchId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengambil data pelanggan berdasarkan cabang"
      );
    }
  }
);

// Fix the fetchCustomerSTTs and fetchCustomerPickups thunks
export const fetchCustomerSTTs = createAsyncThunk(
  "customer/fetchCustomerSTTs",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomerSTTs(customerId);
      return response.data; // Return the data directly
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data STT pelanggan"
      );
    }
  }
);

export const fetchCustomerPickups = createAsyncThunk(
  "customer/fetchCustomerPickups",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCustomerPickups(customerId);
      return response.data; // Return the data directly
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengambil data pengambilan pelanggan"
      );
    }
  }
);

export const fetchCustomerCollections = createAsyncThunk(
  "customer/fetchCustomerCollections",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getCollections(customerId);
      return { customerId, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengambil data penagihan pelanggan"
      );
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customer/createCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      // Ensure cabangId is a string
      const normalizedData = {
        ...customerData,
        cabangId: customerData.cabangId?.toString(),
      };
      console.log("Creating customer with data:", normalizedData);

      const response = await customerAPI.create(normalizedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal membuat pelanggan baru"
      );
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customer/updateCustomer",
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const response = await customerAPI.update(id, customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal memperbarui pelanggan"
      );
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customer/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await customerAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal menghapus pelanggan"
      );
    }
  }
);

// Initial state
const initialState = {
  customers: [],
  senders: [],
  recipients: [],
  customersByBranch: {},
  customerSTTs: {},
  customerCollections: {},
  customerPickups: {},
  currentCustomer: null,
  loading: false,
  error: null,
  success: false,
};

// Customer slice
const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
    clearCustomerState: (state) => {
      state.success = false;
      state.error = null;
      state.currentCustomer = null;
      state.customerSTTs = {};
      state.customerPickups = {};
    },
    setCustomerSTTs: (state, action) => {
      const { customerId, data } = action.payload;
      if (!state.customerSTTs) state.customerSTTs = {};
      state.customerSTTs[customerId] = data;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        // Get the customers data
        const customersData = action.payload.data || [];

        // Normalize the customers data
        state.customers = customersData.map((customer) => ({
          ...customer,
          _id: customer._id?.toString(),
          cabangId:
            customer.cabangId?._id?.toString() || customer.cabangId?.toString(),
        }));

        console.log("Normalized customers:", state.customers);

        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch senders
      .addCase(fetchSenders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSenders.fulfilled, (state, action) => {
        state.loading = false;
        state.senders = action.payload.data;
        state.error = null;
      })
      .addCase(fetchSenders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch recipients
      .addCase(fetchRecipients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipients.fulfilled, (state, action) => {
        state.loading = false;
        state.recipients = action.payload.data;
        state.error = null;
      })
      .addCase(fetchRecipients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch customers by branch
      .addCase(fetchCustomersByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomersByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.customersByBranch[action.payload.branchId] =
          action.payload.data.data;
        state.error = null;
      })
      .addCase(fetchCustomersByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch customer STTs
      .addCase(fetchCustomerSTTs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerSTTs.fulfilled, (state, action) => {
        state.loading = false;
        state.customerSTTs = action.payload; // Store the data directly
      })
      .addCase(fetchCustomerSTTs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch customer collections
      .addCase(fetchCustomerCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.customerCollections[action.payload.customerId] =
          action.payload.data.data;
        state.error = null;
      })
      .addCase(fetchCustomerCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch customer pickups
      .addCase(fetchCustomerPickups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerPickups.fulfilled, (state, action) => {
        state.loading = false;
        state.customerPickups = action.payload; // Store the data directly
      })
      .addCase(fetchCustomerPickups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentCustomer = action.payload.data;
        // Add to customers array if it exists
        if (state.customers) {
          state.customers.push(action.payload.data);
        }
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Gagal membuat pelanggan";
      })

      // Update the updateCustomer handling
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload.data;
        // Update in customers list if exists
        if (state.customers) {
          state.customers = state.customers.map((customer) =>
            customer._id === action.payload.data._id
              ? action.payload.data
              : customer
          );
        }
        state.success = true;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload
        );
        state.error = null;
        state.success = true;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setCurrentCustomer,
  clearCurrentCustomer,
  clearCustomerState,
} = customerSlice.actions;

export default customerSlice.reducer;
