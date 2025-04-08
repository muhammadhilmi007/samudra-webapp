import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (if in browser)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired/invalid)
    if (error.response && error.response.status === 401) {
      // If in browser environment, clear localStorage and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Don't redirect if already on login page to avoid loops
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  changePassword: (data) => api.put("/auth/change-password", data),
  refreshToken: () => api.post("/auth/refresh-token"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    api.post("/auth/reset-password", { token, password }),
};

// Divisi API methods
export const divisiAPI = {
  getAll: () => api.get("/divisions"),
  getById: (id) => api.get(`/divisions/${id}`),
  create: (data) => api.post("/divisions", data),
  update: (id, data) => api.put(`/divisions/${id}`, data),
  delete: (id) => api.delete(`/divisions/${id}`),
};

// Cabang API methods
export const cabangAPI = {
  getAll: () => api.get("/branches"),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => {
    // Ensure divisiId is properly formatted
    const formattedData = {
      ...data,
      divisiId: data.divisiId?.toString(),
    };

    console.log("Creating branch with data:", formattedData);
    return api.post("/branches", formattedData);
  },
  update: (id, data) => {
    // Ensure divisiId is properly formatted
    const formattedData = {
      ...data,
      divisiId: data.divisiId?.toString(),
    };

    console.log(`Updating branch ${id} with data:`, formattedData);
    return api.put(`/branches/${id}`, formattedData);
  },
  delete: (id) => api.delete(`/branches/${id}`),
  getByDivision: (divisionId) => api.get(`/branches/by-division/${divisionId}`),
  getStats: (id) => api.get(`/branches/${id}/stats`),
  // Role methods
  getRoles: () => api.get("/employees/roles"),
  getRoleById: (id) => api.get(`/employees/roles/${id}`),
  createRole: (data) => api.post("/employees/roles", data),
  updateRole: (id, data) => api.put(`/employees/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/employees/roles/${id}`),
};

// Pegawai API methods
// Pegawai (Employee) API
export const pegawaiAPI = {
  getAll: (params = {}) => api.get("/employees", { params }),
  getById: (id) => api.get(`/employees/${id}`),
  getByBranch: (branchId) => api.get(`/employees/branch/${branchId}`),
  create: (data) => {
    // Check if any of the data is a File object (for multipart/form-data)
    const isMultipart = Object.values(data).some(
      (value) => value instanceof File || value instanceof Blob
    );

    if (isMultipart) {
      const formData = new FormData();

      // Append all data to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      return api.post("/employees", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // Regular JSON data
    return api.post("/employees", data);
  },
  update: (id, data) => {
    // Check if any of the data is a File object (for multipart/form-data)
    const isMultipart = Object.values(data).some(
      (value) => value instanceof File || value instanceof Blob
    );

    if (isMultipart) {
      const formData = new FormData();

      // Append all data to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      return api.put(`/employees/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // Regular JSON data
    return api.put(`/employees/${id}`, data);
  },
  delete: (id) => api.delete(`/employees/${id}`),
  uploadProfilePicture: (id, formData) =>
    api.post(`/employees/${id}/profile-picture`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  uploadDocument: (id, docType, formData) =>
    api.post(`/employees/${id}/documents/${docType}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Role API methods
export const roleAPI = {
  getAll: () => api.get("/roles"),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post("/roles", data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
};

// Customer API methods
export const customerAPI = {
  getAll: () => api.get("/customers"),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => {
    console.log("Creating customer with data:", data);
    return api.post("/customers", data);
  },
  update: (id, data) => {
    // Ensure cabangId is properly formatted
    const formattedData = {
      ...data,
      cabangId: data.cabangId?.toString(),
    };

    console.log(`API updating customer ${id} with data:`, formattedData);
    console.log("API branch ID being sent:", formattedData.cabangId);

    return api.put(`/customers/${id}`, formattedData);
  },
  delete: (id) => api.delete(`/customers/${id}`),
  getByBranch: (branchId) => api.get(`/customers/by-branch/${branchId}`),
  getSenders: () => api.get("/customers/senders"),
  getRecipients: () => api.get("/customers/recipients"),
  getSTTs: (id) => api.get(`/customers/${id}/stts`),
  getPickups: (id) => api.get(`/customers/${id}/pickups`),
  getCollections: (customerId) =>
    api.get(`/customers/${customerId}/collections`),
};

// // Vehicle API methods
// export const vehicleAPI = {
//   getAll: () => api.get('/vehicles'),
//   getById: (id) => api.get(`/vehicles/${id}`),
//   create: (data) => api.post('/vehicles', data),
//   update: (id, data) => api.put(`/vehicles/${id}`, data),
//   delete: (id) => api.delete(`/vehicles/${id}`),
//   getByBranch: (branchId) => api.get(`/vehicles/by-branch/${branchId}`),
//   getTrucks: () => api.get('/vehicles/trucks'),
//   getDeliveryVehicles: () => api.get('/vehicles/delivery'),
// }

// Kendaraan API endpoints
// Updated Vehicle API methods in lib/api.js
export const vehicleAPI = {
  getAll: (params = {}) => api.get("/vehicles", { params }),

  getById: (id) => api.get(`/vehicles/${id}`),

  getByBranch: (branchId) => api.get(`/vehicles/by-branch/${branchId}`),

  getTrucks: (params = {}) => api.get("/vehicles/trucks", { params }),

  getDeliveryVehicles: (params = {}) =>
    api.get("/vehicles/delivery", { params }),

  getAvailableForPickup: (params = {}) =>
    api.get("/vehicles/available-for-pickup", { params }),

  getAvailableForLoading: (params = {}) =>
    api.get("/vehicles/available-for-loading", { params }),

  create: (data) => api.post("/vehicles", data),

  update: (id, data) => api.put(`/vehicles/${id}`, data),

  delete: (id) => api.delete(`/vehicles/${id}`),

  uploadPhoto: (id, formData, photoType = "driver") => {
    // Add photoType to formData if not already included
    if (photoType && !formData.has("photoType")) {
      formData.append("photoType", photoType);
    }

    return api.post(`/vehicles/${id}/upload-photo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { photoType }, // Also include in query params for flexibility
    });
  },

  uploadDocument: (id, formData, documentType = "driverIDCard") => {
    // Add documentType to formData if not already included
    if (documentType && !formData.has("documentType")) {
      formData.append("documentType", documentType);
    }

    return api.post(`/vehicles/${id}/upload-document`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: { documentType }, // Also include in query params for flexibility
    });
  },

  // Mobile optimized methods
  getMobileVehicles: (params = {}) => api.get("/vehicles/mobile", { params }),
};

// Pickup Request API methods
export const pickupRequestAPI = {
  getAll: () => api.get("/pickup-requests"),
  getById: (id) => api.get(`/pickup-requests/${id}`),
  create: (data) => api.post("/pickup-requests", data),
  update: (id, data) => api.put(`/pickup-requests/${id}`, data),
  updateStatus: (id, status) =>
    api.put(`/pickup-requests/${id}/status`, { status }),
  delete: (id) => api.delete(`/pickup-requests/${id}`),
  getPending: () => api.get("/pickup-requests/pending"),
  getByCustomer: (customerId) =>
    api.get(`/pickup-requests/customer/${customerId}`),
  getByBranch: (branchId) => api.get(`/pickup-requests/by-branch/${branchId}`),
  linkToPickup: (id, pickupId) =>
    api.put(`/pickup-requests/${id}/link`, { pickupId }),
};

// // Pickup Request API endpoints
// export const pickupRequestAPI = {
//   getAll: () => api.get('/pickup-requests'),
//   getById: (id) => api.get(`/pickup-requests/${id}`),
//   getByBranch: (branchId) => api.get(`/pickup-requests/by-branch/${branchId}`),
//   getPending: () => api.get('/pickup-requests/pending'),
//   create: (data) => api.post('/pickup-requests', data),
//   update: (id, data) => api.put(`/pickup-requests/${id}`, data),
//   updateStatus: (id, status) => api.put(`/pickup-requests/${id}/status`, { status }),
// }

// Pickup API methods
export const pickupAPI = {
  getAll: () => api.get("/pickups"),
  getById: (id) => api.get(`/pickups/${id}`),
  create: (data) => api.post("/pickups", data),
  update: (id, data) => api.put(`/pickups/${id}`, data),
  delete: (id) => api.delete(`/pickups/${id}`),
  getBySender: (senderId) => api.get(`/pickups/by-sender/${senderId}`),
  addSTT: (id, sttId) => api.put(`/pickups/${id}/add-stt`, { sttId }),
  removeSTT: (id, sttId) => api.put(`/pickups/${id}/remove-stt`, { sttId }),
  updateStatus: (id, status) => api.put(`/pickups/${id}/status`, { status }),
  getByBranch: (branchId) => api.get(`/pickups/by-branch/${branchId}`),
};

// // Pickup API endpoints
// export const pickupAPI = {
//   getAll: () => api.get('/pickups'),
//   getById: (id) => api.get(`/pickups/${id}`),
//   getByBranch: (branchId) => api.get(`/pickups/by-branch/${branchId}`),
//   getBySender: (senderId) => api.get(`/pickups/by-sender/${senderId}`),
//   create: (data) => api.post('/pickups', data),
//   update: (id, data) => api.put(`/pickups/${id}`, data),
// }

// STT API methods
export const sttAPI = {
  getAll: () => api.get("/stt"),
  getById: (id) => api.get(`/stt/${id}`),
  create: (data) => api.post("/stt", data),
  update: (id, data) => api.put(`/stt/${id}`, data),
  updateStatus: (id, status) => api.put(`/stt/${id}/status`, { status }),
  generatePDF: (id) =>
    api.get(`/stt/generate-pdf/${id}`, { responseType: "blob" }),
  trackSTT: (sttNumber) => api.get(`/stt/track/${sttNumber}`),
  getByBranch: (branchId) => api.get(`/stt/by-branch/${branchId}`),
  getByStatus: (status) => api.get(`/stt/by-status/${status}`),
  getBySender: (senderId) => api.get(`/stt/by-sender/${senderId}`),
  getByRecipient: (recipientId) => api.get(`/stt/by-recipient/${recipientId}`),
};

// // STT API endpoints
// export const sttAPI = {
//   getAll: () => api.get('/stt'),
//   getById: (id) => api.get(`/stt/${id}`),
//   getByBranch: (branchId) => api.get(`/stt/by-branch/${branchId}`),
//   getBySender: (senderId) => api.get(`/stt/by-sender/${senderId}`),
//   getByRecipient: (recipientId) => api.get(`/stt/by-recipient/${recipientId}`),
//   getByStatus: (status) => api.get(`/stt/by-status/${status}`),
//   generatePDF: (id) => api.get(`/stt/generate-pdf/${id}`, { responseType: 'blob' }),
//   track: (sttNumber) => api.get(`/stt/track/${sttNumber}`),
//   create: (data) => api.post('/stt', data),
//   update: (id, data) => api.put(`/stt/${id}`, data),
// }

// Truck Queue API methods
export const truckQueueAPI = {
  getAll: () => api.get("/antrian-truck"),
  getById: (id) => api.get(`/antrian-truck/${id}`),
  create: (data) => api.post("/antrian-truck", data),
  update: (id, data) => api.put(`/antrian-truck/${id}`, data),
  delete: (id) => api.delete(`/antrian-truck/${id}`),
  updateStatus: (id, status) =>
    api.put(`/antrian-truck/${id}/status`, { status }),
  getByBranch: (branchId) => api.get(`/antrian-truck/by-branch/${branchId}`),
  getByStatus: (status) => api.get(`/antrian-truck/by-status/${status}`),
};

// Loading API methods
export const loadingAPI = {
  getAll: () => api.get("/loadings"),
  getById: (id) => api.get(`/loadings/${id}`),
  getByBranch: (branchId) => api.get(`/loadings/by-branch/${branchId}`),
  create: (data) => api.post("/loadings", data),
  update: (id, data) => api.put(`/loadings/${id}`, data),
  updateStatus: (id, status) => api.put(`/loadings/${id}/status`, { status }),
  getBySTT: (sttId) => api.get(`/loadings/by-stt/${sttId}`),
  getByTruck: (truckId) => api.get(`/loadings/by-truck/${truckId}`),
  generateDMB: (id) =>
    api.get(`/loadings/generate-dmb/${id}`, { responseType: "blob" }),
};

// Vehicle Queue API methods
export const vehicleQueueAPI = {
  getAll: () => api.get("/vehicle-queues"),
  getById: (id) => api.get(`/vehicle-queues/${id}`),
  create: (data) => api.post("/vehicle-queues", data),
  update: (id, data) => api.put(`/vehicle-queues/${id}`, data),
  delete: (id) => api.delete(`/vehicle-queues/${id}`),
  updateStatus: (id, status) =>
    api.put(`/vehicle-queues/${id}/status`, { status }),
  getByBranch: (branchId) => api.get(`/vehicle-queues/by-branch/${branchId}`),
  getByStatus: (status) => api.get(`/vehicle-queues/by-status/${status}`),
};

// Delivery API methods
export const deliveryAPI = {
  getAll: () => api.get("/deliveries"),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post("/deliveries", data),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  updateStatus: (id, status) => api.put(`/deliveries/${id}/status`, { status }),
  getByBranch: (branchId) => api.get(`/deliveries/by-branch/${branchId}`),
  getBySTT: (sttId) => api.get(`/deliveries/by-stt/${sttId}`),
  getByVehicle: (vehicleId) => api.get(`/deliveries/by-vehicle/${vehicleId}`),
  generateForm: (id) =>
    api.get(`/deliveries/generate-form/${id}`, { responseType: "blob" }),
};

// Return API methods
export const returnAPI = {
  getAll: () => api.get("/returns"),
  getById: (id) => api.get(`/returns/${id}`),
  create: (data) => api.post("/returns", data),
  update: (id, data) => api.put(`/returns/${id}`, data),
  updateStatus: (id, status) => api.put(`/returns/${id}/status`, { status }),
  getBySTT: (sttId) => api.get(`/returns/by-stt/${sttId}`),
  getByBranch: (branchId) => api.get(`/returns/by-branch/${branchId}`),
};

// Collection API methods
export const collectionAPI = {
  getAll: () => api.get("/collections"),
  getById: (id) => api.get(`/collections/${id}`),
  getByBranch: (branchId) => api.get(`/collections/by-branch/${branchId}`),
  create: (data) => api.post("/collections", data),
  update: (id, data) => api.put(`/collections/${id}`, data),
  updateStatus: (id, status) =>
    api.put(`/collections/${id}/status`, { status }),
  addPayment: (id, paymentData) =>
    api.put(`/collections/${id}/payment`, paymentData),
  getByCustomer: (customerId) =>
    api.get(`/collections/by-customer/${customerId}`),
  getByStatus: (status) => api.get(`/collections/by-status/${status}`),
  generateInvoice: (id) =>
    api.get(`/collections/generate-invoice/${id}`, { responseType: "blob" }),
};

// Account API methods
export const accountAPI = {
  getAll: () => api.get("/finance/accounts"),
  getById: (id) => api.get(`/finance/accounts/${id}`),
  create: (data) => api.post("/finance/accounts", data),
  update: (id, data) => api.put(`/finance/accounts/${id}`, data),
  delete: (id) => api.delete(`/finance/accounts/${id}`),
  getByType: (type) => api.get(`/finance/accounts/by-type/${type}`),
};

// Journal API methods
export const journalAPI = {
  getAll: () => api.get("/finance/journals"),
  getById: (id) => api.get(`/finance/journals/${id}`),
  create: (data) => api.post("/finance/journals", data),
  update: (id, data) => api.put(`/finance/journals/${id}`, data),
  delete: (id) => api.delete(`/finance/journals/${id}`),
  updateStatus: (id, status) =>
    api.put(`/finance/journals/${id}/status`, { status }),
  getByDateRange: (startDate, endDate) =>
    api.get("/finance/journals/by-date-range", {
      params: { startDate, endDate },
    }),
  getByBranch: (branchId) => api.get(`/finance/journals/by-branch/${branchId}`),
  getByType: (type) => api.get(`/finance/journals/by-type/${type}`),
};

// Cash API methods
export const cashAPI = {
  // Branch cash
  getBranchTransactions: () => api.get("/finance/cash/branch"),
  getBranchTransaction: (id) => api.get(`/finance/cash/branch/${id}`),
  createBranchTransaction: (data) => api.post("/finance/cash/branch", data),
  updateBranchTransaction: (id, data) =>
    api.put(`/finance/cash/branch/${id}`, data),
  getBranchTransactionsByBranch: (branchId) =>
    api.get(`/finance/cash/branch/by-branch/${branchId}`),
  getBranchTransactionsByType: (type) =>
    api.get(`/finance/cash/branch/by-type/${type}`),
  getBranchTransactionsByDateRange: (startDate, endDate) =>
    api.get("/finance/cash/branch/by-date-range", {
      params: { startDate, endDate },
    }),

  // Headquarters cash
  getHQTransactions: () => api.get("/finance/cash/headquarters"),
  getHQTransaction: (id) => api.get(`/finance/cash/headquarters/${id}`),
  createHQTransaction: (data) => api.post("/finance/cash/headquarters", data),
  updateHQTransaction: (id, data) =>
    api.put(`/finance/cash/headquarters/${id}`, data),
  updateHQTransactionStatus: (id, status) =>
    api.put(`/finance/cash/headquarters/${id}/status`, { status }),
  getHQTransactionsByType: (type) =>
    api.get(`/finance/cash/headquarters/by-type/${type}`),
  getHQTransactionsByDateRange: (startDate, endDate) =>
    api.get("/finance/cash/headquarters/by-date-range", {
      params: { startDate, endDate },
    }),
};

// Bank Statement API methods
export const bankAPI = {
  getAll: () => api.get("/finance/bank-statements"),
  getById: (id) => api.get(`/finance/bank-statements/${id}`),
  create: (data) => api.post("/finance/bank-statements", data),
  update: (id, data) => api.put(`/finance/bank-statements/${id}`, data),
  validate: (id) => api.put(`/finance/bank-statements/${id}/validate`),
  getByBranch: (branchId) =>
    api.get(`/finance/bank-statements/by-branch/${branchId}`),
  getByDateRange: (startDate, endDate) =>
    api.get("/finance/bank-statements/by-date-range", {
      params: { startDate, endDate },
    }),
  getSummary: () => api.get("/finance/bank-statements/summary"),
};

// Asset API methods
export const assetAPI = {
  getAll: () => api.get("/assets"),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post("/assets", data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  updateStatus: (id, status) => api.put(`/assets/${id}/status`, { status }),
  calculateDepreciation: (data) =>
    api.post("/assets/calculate-depreciation", data),
  getByBranch: (branchId) => api.get(`/assets/by-branch/${branchId}`),
  getByType: (type) => api.get(`/assets/by-type/${type}`),
  getByStatus: (status) => api.get(`/assets/by-status/${status}`),
};

// Pending Packages API endpoints
export const pendingPackagesAPI = {
  getAll: () => api.get("/pending-packages"),
  getById: (id) => api.get(`/pending-packages/${id}`),
  getByBranch: (branchId) => api.get(`/pending-packages/by-branch/${branchId}`),
  getBySTT: (sttId) => api.get(`/pending-packages/by-stt/${sttId}`),
  create: (data) => api.post("/pending-packages", data),
  update: (id, data) => api.put(`/pending-packages/${id}`, data),
  updateStatus: (id, status) =>
    api.put(`/pending-packages/${id}/status`, { status }),
};

// Report API methods
export const reportAPI = {
  getBranchDashboardStats: (branchId) =>
    api.get(`/reports/branches/${branchId}/dashboard`),
  getLoadingManifest: (params) =>
    api.get("/reports/loading-manifest", { params }),
  getSales: (params) => api.get("/reports/sales", { params }),
  getSalesByBranch: (branchId, params) =>
    api.get(`/reports/sales-by-branch/${branchId}`, { params }),
  getRevenue: (params) => api.get("/reports/revenue", { params }),
  getMonthlyRevenue: (params) =>
    api.get("/reports/revenue/monthly", { params }),
  getDailyRevenue: (params) => api.get("/reports/revenue/daily", { params }),
  getReturns: (params) => api.get("/reports/returns", { params }),
  getReceivables: (params) => api.get("/reports/receivables", { params }),
  getCollections: (params) => api.get("/reports/collections", { params }),
  getDailyCashByBranch: (branchId, params) =>
    api.get(`/reports/cash-daily/${branchId}`, { params }),
  getBalanceSheet: (params) => api.get("/reports/balance-sheet", { params }),
  getProfitLoss: (params) => api.get("/reports/profit-loss", { params }),
  getDashboardStats: () => api.get("/reports/dashboard-stats"),
  exportReport: (reportType, params) =>
    api.get(`/reports/export/${reportType}`, {
      params,
      responseType: "blob",
    }),
};

// Mobile API methods
export const mobileAPI = {
  trackSTT: (sttNumber) => api.get(`/mobile/tracking/${sttNumber}`),
  getPickupRequests: () => api.get("/mobile/pickup-requests"),
  updatePickupRequestStatus: (id, status) =>
    api.put(`/mobile/pickup-requests/${id}/status`, { status }),
  getTruckQueues: () => api.get("/mobile/truck-queues"),
  createTruckQueue: (data) => api.post("/mobile/truck-queues", data),
  getSTTsForTruckAssignment: () => api.get("/mobile/stt/truck-assignment"),
  assignSTTToTruck: (data) => api.post("/mobile/stt/truck-assignment", data),
  getDeliveries: () => api.get("/mobile/deliveries"),
  updateDeliveryStatus: (id, status) =>
    api.put(`/mobile/deliveries/${id}/status`, { status }),
};

export default api;
