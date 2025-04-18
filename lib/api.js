import axios from "axios";
import { store } from "@/lib/redux/store";
import { logout, refreshToken } from "@/lib/redux/slices/authSlice";

// Standardized storage keys
const TOKEN_KEY = 'samudra_auth_token';

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  async (config) => {
    // Get token from localStorage (if in browser)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
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
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired/invalid)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResult = await store.dispatch(refreshToken()).unwrap();
        
        if (refreshResult && refreshResult.token) {
          // Update the Authorization header with the new token
          originalRequest.headers.Authorization = `Bearer ${refreshResult.token}`;
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, logout the user
        if (typeof window !== "undefined") {
          store.dispatch(logout());
          
          // Don't redirect if already on login page to avoid loops
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      }
    }
    
    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response && error.response.status === 403) {
      // Redirect to unauthorized page
      if (typeof window !== "undefined" && !window.location.pathname.includes("/unauthorized")) {
        window.location.href = "/unauthorized";
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
  // New methods for role-based access control
  getRoles: () => api.get("/auth/roles"),
  getPermissions: () => api.get("/auth/permissions"),
  getUserRoles: (userId) => api.get(`/auth/users/${userId}/roles`),
  assignRole: (userId, roleId) => api.post(`/auth/users/${userId}/roles`, { roleId }),
  removeRole: (userId, roleId) => api.delete(`/auth/users/${userId}/roles/${roleId}`),
  getUserPermissions: (userId) => api.get(`/auth/users/${userId}/permissions`),
  assignPermission: (userId, permissionId) => api.post(`/auth/users/${userId}/permissions`, { permissionId }),
  removePermission: (userId, permissionId) => api.delete(`/auth/users/${userId}/permissions/${permissionId}`),
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
};

// Role API methods
export const roleAPI = {
  getAll: () => api.get("/roles"),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post("/roles", data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
  // New methods for role-based access control
  getPermissions: (roleId) => api.get(`/roles/${roleId}/permissions`),
  assignPermission: (roleId, permissionId) => api.post(`/roles/${roleId}/permissions`, { permissionId }),
  removePermission: (roleId, permissionId) => api.delete(`/roles/${roleId}/permissions/${permissionId}`),
  getUsers: (roleId) => api.get(`/roles/${roleId}/users`),
};

// Permission API methods
export const permissionAPI = {
  getAll: () => api.get("/permissions"),
  getById: (id) => api.get(`/permissions/${id}`),
  create: (data) => api.post("/permissions", data),
  update: (id, data) => api.put(`/permissions/${id}`, data),
  delete: (id) => api.delete(`/permissions/${id}`),
  getRoles: (permissionId) => api.get(`/permissions/${permissionId}/roles`),
  getUsers: (permissionId) => api.get(`/permissions/${permissionId}/users`),
};

// Pegawai API methods
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

// Customer API methods
export const customerAPI = {
  getAll: (params = {}) => api.get("/customers", { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post("/customers", data),
  update: (id, data) => {
    console.log(`Updating customer ${id} with data:`, data);
    return api.put(`/customers/${id}`, data);
  },
  delete: (id) => api.delete(`/customers/${id}`),
  getSenders: () => api.get("/customers/senders"),
  getRecipients: () => api.get("/customers/recipients"),
  getByBranch: (branchId) => api.get(`/customers/by-branch/${branchId}`),
  getCustomerSTTs: (customerId) => api.get(`/customers/${customerId}/stts`),
  getCustomerCollections: (customerId) =>
    api.get(`/customers/${customerId}/collections`),
  getCustomerPickups: (customerId) =>
    api.get(`/customers/${customerId}/pickups`),
};

// Vehicle API
export const vehicleAPI = {
  getAll: (params = {}) => api.get("/vehicles", { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  getByBranch: (branchId) => api.get(`/vehicles/by-branch/${branchId}`),
  create: (data) => api.post("/vehicles", data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  uploadPhoto: (id, photoType, formData) =>
    api.post(`/vehicles/${id}/upload-photo?type=${photoType}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadDocument: (id, documentType, formData) =>
    api.post(`/vehicles/${id}/upload-document?type=${documentType}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getTrucks: (params = {}) => api.get("/vehicles/trucks", { params }),

  getDeliveryVehicles: (params = {}) =>
    api.get("/vehicles/delivery", { params }),

  getAvailableForPickup: (params = {}) =>
    api.get("/vehicles/available-for-pickup", { params }),

  getAvailableForLoading: (params = {}) =>
    api.get("/vehicles/available-for-loading", { params }),
};

/**
 * Enhanced Pickup API methods
 *
 * This module provides methods for interacting with the pickup endpoints of the API.
 * It includes CRUD operations, status management, STT management, and special queries.
 *
 * @namespace pickupAPI
 */
export const pickupAPI = {
  /**
   * Get all pickups with optional filtering parameters
   *
   * @function getAll
   * @memberof pickupAPI
   * @param {Object} params - Query parameters for filtering, pagination, and sorting
   * @param {string} [params.status] - Filter by status (PENDING, BERANGKAT, SELESAI, CANCELLED)
   * @param {string} [params.search] - Search term for pickup number or sender name
   * @param {string} [params.startDate] - Filter by start date (ISO format)
   * @param {string} [params.endDate] - Filter by end date (ISO format)
   * @param {string} [params.supirId] - Filter by driver ID
   * @param {string} [params.kendaraanId] - Filter by vehicle ID
   * @param {string} [params.cabangId] - Filter by branch ID
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=10] - Number of items per page
   * @param {string} [params.sort="-tanggal"] - Sort field and direction (prefix with - for descending)
   * @returns {Promise<Object>} Promise object with pickup data and pagination info
   */
  getAll: (params = {}) => api.get("/pickups", { params }),
  
  /**
   * Get a pickup by ID
   *
   * @function getById
   * @memberof pickupAPI
   * @param {string} id - The pickup ID
   * @returns {Promise<Object>} Promise object with pickup data
   */
  getById: (id) => api.get(`/pickups/${id}`),
  
  /**
   * Create a new pickup
   *
   * @function create
   * @memberof pickupAPI
   * @param {Object} data - The pickup data
   * @returns {Promise<Object>} Promise object with created pickup data
   */
  create: (data) => {
    // Validate required fields
    const requiredFields = ['pengirimId', 'alamatPengambilan', 'tujuan', 'jumlahColly', 'supirId', 'kendaraanId'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return Promise.reject({
        response: {
          data: {
            message: `Missing required fields: ${missingFields.join(', ')}`
          }
        }
      });
    }
    
    // Ensure numeric fields are properly formatted
    if (typeof data.jumlahColly === 'string') {
      data.jumlahColly = parseInt(data.jumlahColly, 10);
    }
    
    // Handle empty or 'all' kenekId
    if (data.kenekId === '' || data.kenekId === 'all') {
      data.kenekId = null;
    }
    
    return api.post("/pickups", data);
  },
  
  /**
   * Update an existing pickup
   *
   * @function update
   * @memberof pickupAPI
   * @param {string} id - The pickup ID
   * @param {Object} data - The updated pickup data
   * @returns {Promise<Object>} Promise object with updated pickup data
   */
  update: (id, data) => {
    // Ensure numeric fields are properly formatted
    if (typeof data.jumlahColly === 'string') {
      data.jumlahColly = parseInt(data.jumlahColly, 10);
    }
    
    // Handle empty or 'all' kenekId
    if (data.kenekId === '' || data.kenekId === 'all') {
      data.kenekId = null;
    }
    
    return api.put(`/pickups/${id}`, data);
  },
  
  /**
   * Delete a pickup
   *
   * @function delete
   * @memberof pickupAPI
   * @param {string} id - The pickup ID
   * @returns {Promise<Object>} Promise object with deletion result
   */
  delete: (id) => api.delete(`/pickups/${id}`),

  /**
   * Update a pickup's status
   *
   * @function updateStatus
   * @memberof pickupAPI
   * @param {string} id - The pickup ID
   * @param {Object} data - The status update data
   * @param {string} data.status - The new status (PENDING, BERANGKAT, SELESAI, CANCELLED)
   * @param {string} [data.notes] - Optional notes for the status change
   * @returns {Promise<Object>} Promise object with updated pickup data
   */
  updateStatus: (id, data) => {
    // Validate status
    const validStatuses = ['PENDING', 'BERANGKAT', 'SELESAI', 'CANCELLED'];
    if (!validStatuses.includes(data.status)) {
      return Promise.reject({
        response: {
          data: {
            message: `Invalid status: ${data.status}. Must be one of: ${validStatuses.join(', ')}`
          }
        }
      });
    }
    
    // Require notes for CANCELLED status
    if (data.status === 'CANCELLED' && !data.notes) {
      return Promise.reject({
        response: {
          data: {
            message: 'Notes are required when cancelling a pickup'
          }
        }
      });
    }
    
    return api.put(`/pickups/${id}/status`, data);
  },

  /**
   * Add an STT to a pickup
   *
   * @function addSTT
   * @memberof pickupAPI
   * @param {string} id - The pickup ID
   * @param {string} sttId - The STT ID to add
   * @returns {Promise<Object>} Promise object with updated pickup data
   */
  addSTT: (id, sttId) => api.put(`/pickups/${id}/add-stt`, { sttId }),
  
  /**
   * Remove an STT from a pickup
   *
   * @function removeSTT
   * @memberof pickupAPI
   * @param {string} id - The pickup ID
   * @param {string} sttId - The STT ID to remove
   * @returns {Promise<Object>} Promise object with updated pickup data
   */
  removeSTT: (id, sttId) => api.put(`/pickups/${id}/remove-stt`, { sttId }),

  /**
   * Get pickups by driver
   *
   * @function getByDriver
   * @memberof pickupAPI
   * @param {string} driverId - The driver ID
   * @returns {Promise<Object>} Promise object with pickup data
   */
  getByDriver: (driverId) => api.get(`/pickups/by-driver/${driverId}`),
  
  /**
   * Get pickups by sender
   *
   * @function getBySender
   * @memberof pickupAPI
   * @param {string} senderId - The sender ID
   * @returns {Promise<Object>} Promise object with pickup data
   */
  getBySender: (senderId) => api.get(`/pickups/by-sender/${senderId}`),
  
  /**
   * Get today's pickups
   *
   * @function getToday
   * @memberof pickupAPI
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Promise object with today's pickup data
   */
  getToday: (params = {}) => api.get("/pickups/today", { params }),
};

/**
 * Enhanced Pickup Request API methods
 *
 * This module provides methods for interacting with the pickup request endpoints of the API.
 * It includes CRUD operations, status management, and special queries.
 *
 * @namespace pickupRequestAPI
 */
export const pickupRequestAPI = {
  /**
   * Get all pickup requests with optional filtering parameters
   *
   * @function getAll
   * @memberof pickupRequestAPI
   * @param {Object} params - Query parameters for filtering, pagination, and sorting
   * @param {string} [params.status] - Filter by status (PENDING, FINISH, CANCELLED)
   * @param {string} [params.search] - Search term for request number or customer name
   * @param {string} [params.startDate] - Filter by start date (ISO format)
   * @param {string} [params.endDate] - Filter by end date (ISO format)
   * @param {string} [params.cabangId] - Filter by branch ID
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=10] - Number of items per page
   * @param {string} [params.sort="-tanggal"] - Sort field and direction (prefix with - for descending)
   * @returns {Promise<Object>} Promise object with pickup request data and pagination info
   */
  getAll: (params = {}) => api.get("/pickup-requests", { params }),
  
  /**
   * Get a pickup request by ID
   *
   * @function getById
   * @memberof pickupRequestAPI
   * @param {string} id - The pickup request ID
   * @returns {Promise<Object>} Promise object with pickup request data
   */
  getById: (id) => api.get(`/pickup-requests/${id}`),
  
  /**
   * Create a new pickup request
   *
   * @function create
   * @memberof pickupRequestAPI
   * @param {Object} data - The pickup request data
   * @param {string} data.pengirimId - ID of the sender
   * @param {string} data.alamatPengambilan - Pickup address
   * @param {string} data.tujuan - Destination
   * @param {number} data.jumlahColly - Number of packages
   * @param {string} [data.notes] - Additional notes
   * @returns {Promise<Object>} Promise object with created pickup request data
   */
  create: (data) => {
    // Validate required fields
    const requiredFields = ['pengirimId', 'alamatPengambilan', 'tujuan', 'jumlahColly'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return Promise.reject({
        response: {
          data: {
            message: `Missing required fields: ${missingFields.join(', ')}`
          }
        }
      });
    }
    
    // Ensure numeric fields are properly formatted
    if (typeof data.jumlahColly === 'string') {
      data.jumlahColly = parseInt(data.jumlahColly, 10);
    }
    
    return api.post("/pickup-requests", data);
  },
  
  /**
   * Update an existing pickup request
   *
   * @function update
   * @memberof pickupRequestAPI
   * @param {string} id - The pickup request ID
   * @param {Object} data - The updated pickup request data
   * @returns {Promise<Object>} Promise object with updated pickup request data
   */
  update: (id, data) => {
    // Ensure numeric fields are properly formatted
    if (typeof data.jumlahColly === 'string') {
      data.jumlahColly = parseInt(data.jumlahColly, 10);
    }
    
    return api.put(`/pickup-requests/${id}`, data);
  },
  
  /**
   * Update a pickup request's status
   *
   * @function updateStatus
   * @memberof pickupRequestAPI
   * @param {string} id - The pickup request ID
   * @param {Object} data - The status update data
   * @param {string} data.status - The new status (PENDING, FINISH, CANCELLED)
   * @param {string} [data.notes] - Optional notes for the status change
   * @returns {Promise<Object>} Promise object with updated pickup request data
   */
  updateStatus: (id, data) => {
    // Validate status
    const validStatuses = ['PENDING', 'FINISH', 'CANCELLED'];
    if (!validStatuses.includes(data.status)) {
      return Promise.reject({
        response: {
          data: {
            message: `Invalid status: ${data.status}. Must be one of: ${validStatuses.join(', ')}`
          }
        }
      });
    }
    
    // Require notes for CANCELLED status
    if (data.status === 'CANCELLED' && !data.notes) {
      return Promise.reject({
        response: {
          data: {
            message: 'Notes are required when cancelling a pickup request'
          }
        }
      });
    }
    
    return api.put(`/pickup-requests/${id}/status`, data);
  },

  /**
   * Get pending pickup requests
   *
   * @function getPending
   * @memberof pickupRequestAPI
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Promise object with pending pickup request data
   */
  getPending: (params = {}) => api.get("/pickup-requests/pending", { params }),
  
  /**
   * Get pickup requests by customer
   *
   * @function getByCustomer
   * @memberof pickupRequestAPI
   * @param {string} customerId - The customer ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Promise object with customer's pickup request data
   */
  getByCustomer: (customerId, params = {}) =>
    api.get(`/pickup-requests/customer/${customerId}`, { params }),
  
  /**
   * Get pickup requests by branch
   *
   * @function getByBranch
   * @memberof pickupRequestAPI
   * @param {string} branchId - The branch ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Promise object with branch's pickup request data
   */
  getByBranch: (branchId, params = {}) =>
    api.get(`/pickup-requests/by-branch/${branchId}`, { params }),
};

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

/**
 * Vehicle Queue API methods
 *
 * These endpoints manage the vehicle queue system for lansir operations.
 * Vehicle queues track the order and status of vehicles waiting for or currently
 * performing lansir operations.
 *
 * @namespace vehicleQueueAPI
 */
export const vehicleQueueAPI = {
  /**
   * Get all vehicle queues
   *
   * @function getAll
   * @memberof vehicleQueueAPI
   * @returns {Promise<Object>} Promise object with all vehicle queues
   * @example
   * // Get all vehicle queues
   * const response = await vehicleQueueAPI.getAll();
   * const vehicleQueues = response.data;
   */
  getAll: () => api.get("/vehicle-queues"),
  
  /**
   * Get a specific vehicle queue by ID
   *
   * @function getById
   * @memberof vehicleQueueAPI
   * @param {string} id - The ID of the vehicle queue
   * @returns {Promise<Object>} Promise object with the vehicle queue data
   * @example
   * // Get vehicle queue with ID '123'
   * const response = await vehicleQueueAPI.getById('123');
   * const vehicleQueue = response.data;
   */
  getById: (id) => api.get(`/vehicle-queues/${id}`),
  
  /**
   * Create a new vehicle queue
   *
   * @function create
   * @memberof vehicleQueueAPI
   * @param {Object} data - The vehicle queue data
   * @param {string} data.kendaraanId - ID of the vehicle
   * @param {string} data.supirId - ID of the driver
   * @param {string} data.kenekId - ID of the helper (optional)
   * @param {string} data.cabangId - ID of the branch
   * @param {string} data.status - Status of the queue (MENUNGGU, LANSIR, KEMBALI)
   * @returns {Promise<Object>} Promise object with the created vehicle queue
   * @example
   * // Create a new vehicle queue
   * const newQueue = {
   *   kendaraanId: 'vehicle123',
   *   supirId: 'driver456',
   *   kenekId: 'helper789', // optional
   *   cabangId: 'branch101',
   *   status: 'MENUNGGU'
   * };
   * const response = await vehicleQueueAPI.create(newQueue);
   * const createdQueue = response.data;
   */
  create: (data) => api.post("/vehicle-queues", data),
  
  /**
   * Update an existing vehicle queue
   *
   * @function update
   * @memberof vehicleQueueAPI
   * @param {string} id - The ID of the vehicle queue to update
   * @param {Object} data - The updated vehicle queue data
   * @returns {Promise<Object>} Promise object with the updated vehicle queue
   * @example
   * // Update vehicle queue with ID '123'
   * const updatedData = {
   *   status: 'LANSIR',
   *   supirId: 'newDriver789'
   * };
   * const response = await vehicleQueueAPI.update('123', updatedData);
   * const updatedQueue = response.data;
   */
  update: (id, data) => api.put(`/vehicle-queues/${id}`, data),
  
  /**
   * Delete a vehicle queue
   *
   * @function delete
   * @memberof vehicleQueueAPI
   * @param {string} id - The ID of the vehicle queue to delete
   * @returns {Promise<Object>} Promise object with the deletion result
   * @example
   * // Delete vehicle queue with ID '123'
   * await vehicleQueueAPI.delete('123');
   */
  delete: (id) => api.delete(`/vehicle-queues/${id}`),
  
  /**
   * Update the status of a vehicle queue
   *
   * @function updateStatus
   * @memberof vehicleQueueAPI
   * @param {string} id - The ID of the vehicle queue
   * @param {string} status - The new status (MENUNGGU, LANSIR, KEMBALI)
   * @returns {Promise<Object>} Promise object with the updated vehicle queue
   * @example
   * // Update status of vehicle queue with ID '123' to 'KEMBALI'
   * const response = await vehicleQueueAPI.updateStatus('123', 'KEMBALI');
   * const updatedQueue = response.data;
   */
  updateStatus: (id, status) =>
    api.put(`/vehicle-queues/${id}/status`, { status }),
  
  /**
   * Get vehicle queues by branch
   *
   * @function getByBranch
   * @memberof vehicleQueueAPI
   * @param {string} branchId - The ID of the branch
   * @returns {Promise<Object>} Promise object with vehicle queues for the specified branch
   * @example
   * // Get all vehicle queues for branch with ID 'branch101'
   * const response = await vehicleQueueAPI.getByBranch('branch101');
   * const branchQueues = response.data;
   */
  getByBranch: (branchId) => api.get(`/vehicle-queues/by-branch/${branchId}`),
  
  /**
   * Get vehicle queues by status
   *
   * @function getByStatus
   * @memberof vehicleQueueAPI
   * @param {string} status - The status to filter by (MENUNGGU, LANSIR, KEMBALI)
   * @returns {Promise<Object>} Promise object with vehicle queues with the specified status
   * @example
   * // Get all vehicle queues with status 'LANSIR'
   * const response = await vehicleQueueAPI.getByStatus('LANSIR');
   * const lansingQueues = response.data;
   */
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
