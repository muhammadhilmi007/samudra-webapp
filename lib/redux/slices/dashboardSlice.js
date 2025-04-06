// lib/redux/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reportAPI } from "@/lib/api";

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data dashboard"
      );
    }
  }
);

export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchDashboardSummary",
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getDashboardSummary(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Gagal mengambil data ringkasan dashboard"
      );
    }
  }
);

export const fetchBranchDashboardStats = createAsyncThunk(
  "dashboard/fetchBranchDashboardStats",
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getBranchDashboardStats(branchId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data dashboard cabang"
      );
    }
  }
);

export const fetchChartData = createAsyncThunk(
  "dashboard/fetchChartData",
  async ({ chartType, params }, { rejectWithValue }) => {
    try {
      const response = await reportAPI.getChartData(chartType, params);
      return { chartType, data: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil data grafik"
      );
    }
  }
);

// Initial state
const initialState = {
  dashboardStats: null,
  dashboardSummary: null,
  chartData: {},
  branchStats: null, // Add this line
  loading: false,
  error: null,
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload.data;
        state.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch branch dashboard stats
      .addCase(fetchBranchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.branchStats = action.payload.data;
        state.error = null;
      })
      .addCase(fetchBranchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch dashboard summary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardSummary = action.payload.data;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch chart data
      .addCase(fetchChartData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData = {
          ...state.chartData,
          [action.payload.chartType]: action.payload.data,
        };
        state.error = null;
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
