/**
 * Role-Based Access Control (RBAC) utility functions
 * This file contains utility functions for managing roles and permissions
 */

/**
 * Role hierarchy (higher index has more privileges)
 * This defines the hierarchy of roles in the system
 */
export const ROLE_HIERARCHY = [
  'kenek',              // 0: Asisten driver kendaraan
  'supir',              // 1: Supir kendaraan
  'pelanggan',          // 2: Pelanggan
  'checker',            // 3: Checker barang
  'debt_collector',     // 4: Penagih hutang
  'kasir',              // 5: Kasir
  'staff_penjualan',    // 6: Staf penjualan
  'staff_admin',        // 7: Staf administrasi
  'kepala_gudang',      // 8: Kepala gudang
  'kepala_cabang',      // 9: Kepala cabang
  'manajer_distribusi', // 10: Manajer distribusi
  'manajer_sdm',        // 11: Manajer SDM
  'manajer_operasional',// 12: Manajer operasional
  'manajer_pemasaran',  // 13: Manajer pemasaran
  'manajer_keuangan',   // 14: Manajer keuangan
  'manajer_admin',      // 15: Manajer administrasi
  'direktur'            // 16: Direktur
];

/**
 * Default permissions for each role
 * This defines the default permissions assigned to each role
 */
export const ROLE_PERMISSIONS = {
  'kenek': [
    'view_stt',
    'view_branch_vehicles'
  ],
  'supir': [
    'view_dashboard',
    'view_branch_vehicles',
    'view_branch_stt'
  ],
  'pelanggan': [
    'view_dashboard',
    'view_stt'
  ],
  'checker': [
    'view_dashboard',
    'view_branch_stt',
    'edit_branch_stt',
    'view_branch_vehicles'
  ],
  'debt_collector': [
    'view_dashboard',
    'view_branch_finances',
    'view_branch_customers',
    'manage_branch_transactions'
  ],
  'kasir': [
    'view_dashboard',
    'view_branch_finances',
    'manage_branch_transactions'
  ],
  'staff_penjualan': [
    'view_dashboard',
    'view_branch_customers',
    'create_customers',
    'view_branch_stt',
    'create_branch_stt'
  ],
  'staff_admin': [
    'view_dashboard',
    'view_branch_customers',
    'create_customers',
    'edit_customers',
    'view_branch_stt',
    'create_branch_stt'
  ],
  'kepala_gudang': [
    'view_dashboard',
    'manage_branch_pickups',
    'view_branch_vehicles',
    'edit_vehicle',
    'view_branch_stt',
    'edit_branch_stt'
  ],
  'kepala_cabang': [
    'view_dashboard',
    'manage_branch_employees',
    'view_branches',
    'view_branch_stt',
    'create_branch_stt',
    'edit_branch_stt',
    'manage_branch_pickups',
    'view_branch_vehicles',
    'create_vehicle',
    'edit_vehicle',
    'view_branch_finances',
    'manage_branch_transactions',
    'view_branch_customers',
    'create_customers',
    'edit_customers',
    'view_branch_reports'
  ],
  'manajer_distribusi': [
    'view_dashboard',
    'view_branches',
    'view_customers',
    'view_stt',
    'view_reports',
    'export_reports',
    'manage_pickups',
    'manage_vehicles',
    'view_vehicles'
  ],
  'manajer_sdm': [
    'view_dashboard',
    'view_reports',
    'export_reports',
    'manage_employees',
    'view_employees',
    'create_employee',
    'edit_employee',
    'delete_employee'
  ],
  'manajer_operasional': [
    'view_dashboard',
    'view_customers',
    'view_branches',
    'view_reports',
    'export_reports',
    'manage_vehicles',
    'view_vehicles',
    'create_vehicle',
    'edit_vehicle',
    'delete_vehicle',
    'view_stt',
    'manage_pickups'
  ],
  'manajer_pemasaran': [
    'view_dashboard',
    'view_reports',
    'export_reports',
    'view_stt',
    'manage_customers',
    'view_customers',
    'create_customers',
    'edit_customers',
    'delete_customers'
  ],
  'manajer_keuangan': [
    'view_dashboard',
    'view_customers',
    'view_branches',
    'view_reports',
    'export_reports',
    'manage_finances',
    'view_finances'
  ],
  'manajer_admin': [
    'view_dashboard',
    'manage_employees',
    'view_employees',
    'create_employee',
    'edit_employee',
    'delete_employee',
    'manage_branches',
    'view_branches',
    'create_branch',
    'edit_branch',
    'delete_branch',
    'manage_divisions',
    'view_divisions',
    'manage_customers',
    'view_customers',
    'create_customers',
    'edit_customers',
    'delete_customers',
    'manage_roles',
    'view_roles',
    'create_role',
    'edit_role',
    'delete_role'
  ],
  'direktur': [
    'view_dashboard',
    'manage_employees',
    'view_employees',
    'create_employee',
    'edit_employee',
    'delete_employee',
    'manage_branches',
    'view_branches',
    'create_branch',
    'edit_branch',
    'delete_branch',
    'manage_divisions',
    'view_divisions',
    'view_stt',
    'manage_pickups',
    'manage_vehicles',
    'view_vehicles',
    'create_vehicle',
    'edit_vehicle',
    'delete_vehicle',
    'manage_finances',
    'view_finances',
    'manage_customers',
    'view_customers',
    'create_customers',
    'edit_customers',
    'delete_customers',
    'manage_roles',
    'view_roles',
    'create_role',
    'edit_role',
    'delete_role',
    'view_reports',
    'export_reports'
  ]
};

/**
 * Resource-based access control mapping
 * This defines which roles have access to which resources and actions
 */
export const RESOURCE_ACCESS_MAP = {
  'dashboard': {
    'view': ['staff_admin', 'staff_penjualan', 'kasir', 'debt_collector', 'checker', 'supir', 'kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_sdm', 'manajer_operasional', 'manajer_pemasaran', 'manajer_keuangan', 'manajer_admin', 'direktur'],
    'manage': ['manajer_admin', 'direktur']
  },
  'users': {
    'view': ['kepala_cabang', 'manajer_sdm', 'manajer_admin', 'direktur'],
    'create': ['manajer_sdm', 'manajer_admin', 'direktur'],
    'edit': ['manajer_sdm', 'manajer_admin', 'direktur'],
    'delete': ['manajer_admin', 'direktur']
  },
  'roles': {
    'view': ['manajer_admin', 'direktur'],
    'create': ['manajer_admin', 'direktur'],
    'edit': ['manajer_admin', 'direktur'],
    'delete': ['direktur']
  },
  'permissions': {
    'view': ['manajer_admin', 'direktur'],
    'manage': ['direktur']
  },
  'branches': {
    'view': ['kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'manajer_keuangan', 'manajer_admin', 'direktur'],
    'create': ['manajer_admin', 'direktur'],
    'edit': ['manajer_admin', 'direktur'],
    'delete': ['direktur']
  },
  'divisions': {
    'view': ['manajer_admin', 'direktur'],
    'create': ['manajer_admin', 'direktur'],
    'edit': ['manajer_admin', 'direktur'],
    'delete': ['direktur']
  },
  'employees': {
    'view': ['kepala_cabang', 'manajer_sdm', 'manajer_admin', 'direktur'],
    'create': ['kepala_cabang', 'manajer_sdm', 'manajer_admin', 'direktur'],
    'edit': ['kepala_cabang', 'manajer_sdm', 'manajer_admin', 'direktur'],
    'delete': ['manajer_sdm', 'manajer_admin', 'direktur']
  },
  'customers': {
    'view': ['staff_admin', 'staff_penjualan', 'debt_collector', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'manajer_pemasaran', 'manajer_keuangan', 'manajer_admin', 'direktur'],
    'create': ['staff_admin', 'staff_penjualan', 'kepala_cabang', 'manajer_pemasaran', 'manajer_admin', 'direktur'],
    'edit': ['staff_admin', 'kepala_cabang', 'manajer_pemasaran', 'manajer_admin', 'direktur'],
    'delete': ['manajer_pemasaran', 'manajer_admin', 'direktur']
  },
  'vehicles': {
    'view': ['kenek', 'supir', 'checker', 'kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'create': ['kepala_cabang', 'manajer_operasional', 'direktur'],
    'edit': ['kepala_gudang', 'kepala_cabang', 'manajer_operasional', 'direktur'],
    'delete': ['manajer_operasional', 'direktur']
  },
  'pickups': {
    'view': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'create': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'edit': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'delete': ['manajer_distribusi', 'manajer_operasional', 'direktur'],
    'approve': ['kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur']
  },
  'stt': {
    'view': ['kenek', 'supir', 'pelanggan', 'checker', 'staff_penjualan', 'staff_admin', 'kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'manajer_pemasaran', 'direktur'],
    'create': ['staff_penjualan', 'staff_admin', 'kepala_cabang', 'direktur'],
    'edit': ['checker', 'kepala_gudang', 'kepala_cabang', 'direktur'],
    'delete': ['direktur'],
    'approve': ['kepala_cabang', 'direktur']
  },
  'loadings': {
    'view': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'create': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'edit': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'delete': ['manajer_distribusi', 'manajer_operasional', 'direktur'],
    'approve': ['kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur']
  },
  'deliveries': {
    'view': ['supir', 'kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'create': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'edit': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'delete': ['manajer_distribusi', 'manajer_operasional', 'direktur'],
    'approve': ['kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur']
  },
  'returns': {
    'view': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'create': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'edit': ['kepala_gudang', 'kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur'],
    'delete': ['manajer_distribusi', 'manajer_operasional', 'direktur'],
    'approve': ['kepala_cabang', 'manajer_distribusi', 'manajer_operasional', 'direktur']
  },
  'collections': {
    'view': ['kasir', 'debt_collector', 'kepala_cabang', 'manajer_keuangan', 'direktur'],
    'create': ['kasir', 'debt_collector', 'kepala_cabang', 'manajer_keuangan', 'direktur'],
    'edit': ['kasir', 'debt_collector', 'kepala_cabang', 'manajer_keuangan', 'direktur'],
    'delete': ['manajer_keuangan', 'direktur'],
    'approve': ['kepala_cabang', 'manajer_keuangan', 'direktur']
  },
  'finance': {
    'view': ['kasir', 'debt_collector', 'kepala_cabang', 'manajer_keuangan', 'direktur'],
    'create': ['kasir', 'debt_collector', 'kepala_cabang', 'manajer_keuangan', 'direktur'],
    'edit': ['kasir', 'debt_collector', 'kepala_cabang', 'manajer_keuangan', 'direktur'],
    'delete': ['manajer_keuangan', 'direktur'],
    'approve': ['manajer_keuangan', 'direktur']
  },
  'reports': {
    'view': ['kepala_cabang', 'manajer_distribusi', 'manajer_sdm', 'manajer_operasional', 'manajer_pemasaran', 'manajer_keuangan', 'direktur'],
    'export': ['manajer_distribusi', 'manajer_sdm', 'manajer_operasional', 'manajer_pemasaran', 'manajer_keuangan', 'direktur']
  },
  'settings': {
    'view': ['manajer_admin', 'direktur'],
    'edit': ['direktur']
  }
};

/**
 * Check if a role has a higher or equal rank than another role
 * 
 * @param {string} role - The role to check
 * @param {string} targetRole - The target role to compare against
 * @returns {boolean} - True if role has higher or equal rank than targetRole
 */
export const isRoleAtLeast = (role, targetRole) => {
  const roleIndex = ROLE_HIERARCHY.indexOf(role.toLowerCase());
  const targetRoleIndex = ROLE_HIERARCHY.indexOf(targetRole.toLowerCase());
  
  return roleIndex >= targetRoleIndex && targetRoleIndex !== -1;
};

/**
 * Get all permissions for a role
 * 
 * @param {string} role - The role to get permissions for
 * @returns {string[]} - Array of permissions for the role
 */
export const getPermissionsForRole = (role) => {
  const roleLower = role.toLowerCase();
  
  // If role doesn't exist in hierarchy, return empty array
  if (!ROLE_HIERARCHY.includes(roleLower)) {
    return [];
  }
  
  // Get permissions for the role
  return ROLE_PERMISSIONS[roleLower] || [];
};

/**
 * Check if a role has access to a resource and action
 * 
 * @param {string} role - The role to check
 * @param {string} resource - The resource to check access for
 * @param {string} action - The action to check access for
 * @returns {boolean} - True if role has access to the resource and action
 */
export const roleHasAccess = (role, resource, action) => {
  const roleLower = role.toLowerCase();
  
  // Check if resource and action exist in the access map
  if (RESOURCE_ACCESS_MAP[resource] && RESOURCE_ACCESS_MAP[resource][action]) {
    // Check if role is in the allowed roles for this resource and action
    const allowedRoles = RESOURCE_ACCESS_MAP[resource][action];
    
    // Check if role is directly allowed
    if (allowedRoles.includes(roleLower)) {
      return true;
    }
    
    // Check if role has a higher rank than any of the allowed roles
    return allowedRoles.some(allowedRole => isRoleAtLeast(roleLower, allowedRole));
  }
  
  return false;
};

/**
 * Get all resources and actions a role has access to
 * 
 * @param {string} role - The role to get access for
 * @returns {Object} - Object with resources and actions the role has access to
 */
export const getRoleAccess = (role) => {
  const roleLower = role.toLowerCase();
  const access = {};
  
  // Iterate through all resources and actions
  Object.entries(RESOURCE_ACCESS_MAP).forEach(([resource, actions]) => {
    access[resource] = {};
    
    Object.entries(actions).forEach(([action, allowedRoles]) => {
      // Check if role is directly allowed or has a higher rank
      access[resource][action] = allowedRoles.includes(roleLower) || 
        allowedRoles.some(allowedRole => isRoleAtLeast(roleLower, allowedRole));
    });
  });
  
  return access;
};