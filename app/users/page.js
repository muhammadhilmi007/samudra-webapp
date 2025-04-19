'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  Shield, 
  UserPlus, 
  Users, 
  UserCog,
  Loader2,
  Check
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/hooks/use-toast';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/DynamicSidebar';
import { logout } from '@/lib/auth';
import AuthGuard from '@/components/auth/auth-guard';
import { HasAccess } from '@/components/auth/rbac-guard';
import UserRoles from '@/components/forms/UserRoles';
import UserPermissions from '@/components/forms/UserPermissions';
import API_URL from '@/lib/api';
import { getInitials } from '@/lib/utils';

export default function UsersPage() {
  return (
    <AuthGuard requiredPermissions={['manage_users', 'view_users', 'admin_access']}>
      <UsersContent />
    </AuthGuard>
  );
}

function UsersContent() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch roles
        const rolesResponse = await axios.get(`${API_URL}/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch branches
        const branchesResponse = await axios.get(`${API_URL}/branches`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUsers(usersResponse.data.data);
        setRoles(rolesResponse.data.data);
        setBranches(branchesResponse.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data pengguna');
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterBranch('all');
    setFilterStatus('all');
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Berhasil Logout',
        description: 'Anda telah berhasil keluar dari sistem',
        variant: 'default',
      });
      // Redirect will happen automatically due to auth state change
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal melakukan logout. Silakan coba lagi.',
        variant: 'destructive',
      });
      console.error('Logout error:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/users/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove user from state
      setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
      toast.success('Pengguna berhasil dihapus');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus pengguna');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleViewUserDetail = async (user) => {
    setSelectedUser(user);
    
    try {
      // Fetch user permissions
      const response = await axios.get(`${API_URL}/users/${user._id}/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserPermissions(response.data.data);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      toast.error('Gagal memuat izin pengguna');
      setUserPermissions([]);
    }
    
    setIsUserDetailOpen(true);
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const response = await axios.patch(
        `${API_URL}/users/${user._id}/status`,
        { aktif: !user.aktif },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update user in state
      setUsers(prev => prev.map(u => 
        u._id === user._id ? { ...u, aktif: !u.aktif } : u
      ));
      
      toast.success(`Pengguna berhasil ${!user.aktif ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(error.response?.data?.message || 'Gagal mengubah status pengguna');
    }
  };

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    // Filter by search term
    const matchesSearch = 
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by role
    const matchesRole = filterRole === 'all' || 
      (user.roles && user.roles.some(role => role.id === filterRole));
    
    // Filter by branch
    const matchesBranch = filterBranch === 'all' || 
      (user.cabangId && user.cabangId === filterBranch);
    
    // Filter by status
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.aktif) || 
      (filterStatus === 'inactive' && !user.aktif);
    
    return matchesSearch && matchesRole && matchesBranch && matchesStatus;
  });

  // Get branch name by ID
  const getBranchName = (branchId) => {
    if (!branchId) return '-';
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };

  // Get primary role name - enhanced to handle various role formats
  const getPrimaryRoleName = (user) => {
    // Special case for direktur
    if (user.username === 'ahmad_direktur') {
      return 'Direktur';
    }

    // Handle case with roles array
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Find primary role
      const primaryRole = user.roles.find(role => role.isPrimary);
      
      if (primaryRole) {
        // Handle different role name formats
        return primaryRole.name || primaryRole.namaRole || 'Role';
      }
      
      // If no primary role is marked, use the first role
      const firstRole = user.roles[0];
      return firstRole.name || firstRole.namaRole || 'Role';
    }
    
    // Fallback to legacy role field
    if (user.role) {
      // If role is an object
      if (typeof user.role === 'object') {
        return user.role.name || user.role.namaRole || 'Role';
      }
      // If role is a string
      return user.role;
    }
    
    // Default fallback
    return '-';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuButtonClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-lxl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna</h1>
                <p className="text-muted-foreground">
                  Kelola pengguna, peran, dan izin akses
                </p>
              </div>
              <HasAccess resource="users" action="create">
                <Link href="/users/add">
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Tambah Pengguna
                  </Button>
                </Link>
              </HasAccess>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-md border shadow-sm p-4">
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">Semua Pengguna</TabsTrigger>
                    <TabsTrigger value="active">Aktif</TabsTrigger>
                    <TabsTrigger value="inactive">Nonaktif</TabsTrigger>
                  </TabsList>
                  
                  <div className="relative flex max-w-sm mb-4">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Cari pengguna..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="w-full sm:w-auto">
                      <Select
                        value={filterRole}
                        onValueChange={setFilterRole}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Semua Peran" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Peran</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role._id} value={role._id}>
                              {role.namaRole}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full sm:w-auto">
                      <Select
                        value={filterBranch}
                        onValueChange={setFilterBranch}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Semua Cabang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Cabang</SelectItem>
                          {branches.map((branch) => (
                            <SelectItem key={branch._id} value={branch._id}>
                              {branch.namaCabang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full sm:w-auto">
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleClearFilters}
                      className="h-10 w-10"
                      title="Hapus filter"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <TabsContent value="all" className="mt-0">
                    <UserTable 
                      users={filteredUsers}
                      onDelete={handleDeleteClick}
                      onViewDetail={handleViewUserDetail}
                      onToggleStatus={handleToggleUserStatus}
                      getBranchName={getBranchName}
                      getPrimaryRoleName={getPrimaryRoleName}
                    />
                  </TabsContent>
                  
                  <TabsContent value="active" className="mt-0">
                    <UserTable 
                      users={filteredUsers.filter(user => user.aktif)}
                      onDelete={handleDeleteClick}
                      onViewDetail={handleViewUserDetail}
                      onToggleStatus={handleToggleUserStatus}
                      getBranchName={getBranchName}
                      getPrimaryRoleName={getPrimaryRoleName}
                    />
                  </TabsContent>
                  
                  <TabsContent value="inactive" className="mt-0">
                    <UserTable 
                      users={filteredUsers.filter(user => !user.aktif)}
                      onDelete={handleDeleteClick}
                      onViewDetail={handleViewUserDetail}
                      onToggleStatus={handleToggleUserStatus}
                      getBranchName={getBranchName}
                      getPrimaryRoleName={getPrimaryRoleName}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* User Detail Dialog */}
      <AlertDialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedUser && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mr-2">
                    {selectedUser.fotoProfil ? (
                      <img
                        src={`${API_URL}/uploads/${selectedUser.fotoProfil}`}
                        alt={selectedUser.nama}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(selectedUser.nama)}</span>
                    )}
                  </div>
                  {selectedUser.nama}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Detail pengguna dan izin akses
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="py-4">
                <Tabs defaultValue="info">
                  <TabsList className="mb-4 w-full">
                    <TabsTrigger value="info">Informasi</TabsTrigger>
                    <TabsTrigger value="roles">Peran</TabsTrigger>
                    <TabsTrigger value="permissions">Izin Akses</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Informasi Dasar</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Nama:</span>
                            <p>{selectedUser.nama}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Username:</span>
                            <p>{selectedUser.username}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <p>{selectedUser.email || '-'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Telepon:</span>
                            <p>{selectedUser.telepon || '-'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge variant={selectedUser.aktif ? "success" : "destructive"}>
                              {selectedUser.aktif ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Informasi Pekerjaan</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Jabatan:</span>
                            <p>{selectedUser.jabatan || '-'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Cabang:</span>
                            <p>{getBranchName(selectedUser.cabangId)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Peran Utama:</span>
                            <p>{getPrimaryRoleName(selectedUser)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Login Terakhir:</span>
                            <p>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Belum pernah login'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="roles">
                    <UserRoles 
                      userId={selectedUser._id} 
                      roles={selectedUser.roles || []} 
                      showEditButton={true} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="permissions">
                    <UserPermissions permissions={userPermissions} />
                  </TabsContent>
                </Tabs>
              </div>
              
              <AlertDialogFooter>
                <Link href={`/users/${selectedUser._id}/edit`} passHref>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Pengguna
                  </Button>
                </Link>
                <Link href={`/users/${selectedUser._id}/roles`} passHref>
                  <Button>
                    <UserCog className="mr-2 h-4 w-4" />
                    Kelola Peran
                  </Button>
                </Link>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <span className="font-semibold">
                {userToDelete?.nama}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// UserTable component
function UserTable({ users, onDelete, onViewDetail, onToggleStatus, getBranchName, getPrimaryRoleName }) {
  if (users.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-2 p-4 text-center rounded-lg border bg-white">
        <div className="rounded-full bg-gray-100 p-3">
          <Users className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold">Tidak ada pengguna</h3>
        <p className="text-sm text-gray-500">
          Tidak ada pengguna yang sesuai dengan kriteria pencarian.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">No.</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Peran</TableHead>
            <TableHead>Cabang</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user._id} className="group">
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {user.fotoProfil ? (
                      <img
                        src={`${API_URL}/uploads/${user.fotoProfil}`}
                        alt={user.nama}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(user.nama)}</span>
                    )}
                  </div>
                  <div>
                    <div>{user.nama}</div>
                    <div className="text-xs text-gray-500">
                      {user.username}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {getPrimaryRoleName(user)}
                </Badge>
                {user.roles && user.roles.length > 1 && (
                  <Badge variant="secondary" className="ml-1 font-normal">
                    +{user.roles.length - 1}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{getBranchName(user.cabangId)}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge
                  variant={user.aktif ? "success" : "destructive"}
                  className="capitalize font-normal"
                >
                  {user.aktif ? "Aktif" : "Nonaktif"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="icon"
                    title="Lihat Detail"
                    onClick={() => onViewDetail(user)}
                    className="h-8 w-8"
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                  <HasAccess resource="users" action="edit">
                    <Link href={`/users/${user._id}/edit`}>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Edit"
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </HasAccess>
                  <HasAccess resource="users" action="edit">
                    <Button
                      variant="outline"
                      size="icon"
                      title={user.aktif ? "Nonaktifkan" : "Aktifkan"}
                      onClick={() => onToggleStatus(user)}
                      className={`h-8 w-8 ${user.aktif ? "text-amber-500 hover:text-amber-700 hover:bg-amber-50" : "text-green-500 hover:text-green-700 hover:bg-green-50"}`}
                    >
                      <span className="sr-only">{user.aktif ? "Nonaktifkan" : "Aktifkan"}</span>
                      {user.aktif ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </HasAccess>
                  <HasAccess resource="users" action="delete">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Hapus"
                      onClick={() => onDelete(user)}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </HasAccess>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
