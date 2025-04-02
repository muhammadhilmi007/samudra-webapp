import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { pegawaiAPI, roleAPI } from '@/lib/api'

// Async thunks for employees
export const fetchEmployees = createAsyncThunk(
  'pegawai/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pegawaiAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data pegawai'
      )
    }
  }
)

export const fetchEmployeeById = createAsyncThunk(
  'pegawai/fetchEmployeeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await pegawaiAPI.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data pegawai'
      )
    }
  }
)

export const fetchEmployeesByBranch = createAsyncThunk(
  'pegawai/fetchEmployeesByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await pegawaiAPI.getByBranch(branchId)
      return { branchId, data: response.data }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data pegawai berdasarkan cabang'
      )
    }
  }
)

export const createEmployee = createAsyncThunk(
  'pegawai/createEmployee',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await pegawaiAPI.create(formData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat pegawai baru'
      )
    }
  }
)

export const updateEmployee = createAsyncThunk(
  'pegawai/updateEmployee',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await pegawaiAPI.update(id, formData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui pegawai'
      )
    }
  }
)

export const deleteEmployee = createAsyncThunk(
  'pegawai/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await pegawaiAPI.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal menghapus pegawai'
      )
    }
  }
)

export const uploadProfilePicture = createAsyncThunk(
  'pegawai/uploadProfilePicture',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await pegawaiAPI.uploadProfilePicture(id, formData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengunggah foto profil'
      )
    }
  }
)

export const uploadDocument = createAsyncThunk(
  'pegawai/uploadDocument',
  async ({ id, docType, formData }, { rejectWithValue }) => {
    try {
      const response = await pegawaiAPI.uploadDocument(id, docType, formData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengunggah dokumen'
      )
    }
  }
)

// Async thunks for roles
export const fetchRoles = createAsyncThunk(
  'pegawai/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roleAPI.getAll()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data role'
      )
    }
  }
)

export const fetchRoleById = createAsyncThunk(
  'pegawai/fetchRoleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await roleAPI.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal mengambil data role'
      )
    }
  }
)

export const createRole = createAsyncThunk(
  'pegawai/createRole',
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await roleAPI.create(roleData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal membuat role baru'
      )
    }
  }
)

export const updateRole = createAsyncThunk(
  'pegawai/updateRole',
  async ({ id, roleData }, { rejectWithValue }) => {
    try {
      const response = await roleAPI.update(id, roleData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal memperbarui role'
      )
    }
  }
)

export const deleteRole = createAsyncThunk(
  'pegawai/deleteRole',
  async (id, { rejectWithValue }) => {
    try {
      await roleAPI.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Gagal menghapus role'
      )
    }
  }
)

// Initial state
const initialState = {
  employees: [],
  employeesByBranch: {},
  currentEmployee: null,
  roles: [],
  currentRole: null,
  loading: false,
  error: null,
  success: false,
}

// Pegawai slice
const pegawaiSlice = createSlice({
  name: 'pegawai',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    setCurrentEmployee: (state, action) => {
      state.currentEmployee = action.payload
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null
    },
    setCurrentRole: (state, action) => {
      state.currentRole = action.payload
    },
    clearCurrentRole: (state) => {
      state.currentRole = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false
        state.employees = action.payload.data
        state.error = null
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false
        state.currentEmployee = action.payload.data
        state.error = null
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch employees by branch
      .addCase(fetchEmployeesByBranch.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployeesByBranch.fulfilled, (state, action) => {
        state.loading = false
        state.employeesByBranch[action.payload.branchId] = action.payload.data.data
        state.error = null
      })
      .addCase(fetchEmployeesByBranch.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false
        state.employees.push(action.payload.data)
        state.error = null
        state.success = true
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false
        state.employees = state.employees.map(emp => 
          emp._id === action.payload.data._id ? action.payload.data : emp
        )
        state.currentEmployee = action.payload.data
        state.error = null
        state.success = true
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false
        state.employees = state.employees.filter(emp => emp._id !== action.payload)
        state.error = null
        state.success = true
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Upload profile picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false
        const updatedEmployee = action.payload.data
        state.employees = state.employees.map(emp => 
          emp._id === updatedEmployee._id ? updatedEmployee : emp
        )
        if (state.currentEmployee && state.currentEmployee._id === updatedEmployee._id) {
          state.currentEmployee = updatedEmployee
        }
        state.error = null
        state.success = true
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false
        const updatedEmployee = action.payload.data
        state.employees = state.employees.map(emp => 
          emp._id === updatedEmployee._id ? updatedEmployee : emp
        )
        if (state.currentEmployee && state.currentEmployee._id === updatedEmployee._id) {
          state.currentEmployee = updatedEmployee
        }
        state.error = null
        state.success = true
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Fetch all roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false
        state.roles = action.payload.data
        state.error = null
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch role by ID
      .addCase(fetchRoleById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.loading = false
        state.currentRole = action.payload.data
        state.error = null
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create role
      .addCase(createRole.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false
        state.roles.push(action.payload.data)
        state.error = null
        state.success = true
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Update role
      .addCase(updateRole.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false
        state.roles = state.roles.map(role => 
          role._id === action.payload.data._id ? action.payload.data : role
        )
        state.currentRole = action.payload.data
        state.error = null
        state.success = true
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
      
      // Delete role
      .addCase(deleteRole.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false
        state.roles = state.roles.filter(role => role._id !== action.payload)
        state.error = null
        state.success = true
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.success = false
      })
  }
})

export const { 
  clearError, 
  clearSuccess, 
  setCurrentEmployee, 
  clearCurrentEmployee,
  setCurrentRole,
  clearCurrentRole
} = pegawaiSlice.actions

export default pegawaiSlice.reducer