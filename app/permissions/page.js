'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Select
} from '@/components/ui/index';
import {
  Edit, 
  Plus, 
  Trash2, 
  Search,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import PermissionForm from '@/components/forms/PermissionForm';
import api from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';

const PermissionsPage = () => {
  const router = useRouter();
  const { user, checkPermission } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Check if user has permission to manage permissions
  useEffect(() => {
    if (user && !checkPermission('manage_roles') && !checkPermission('view_roles')) {
      toast.error('Anda tidak memiliki akses ke halaman ini');
      router.push('/dashboard');
    }
  }, [user, router, checkPermission]);
  
  // Fetch permission categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/permissions/categories');
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching permission categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch permissions
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      
      const response = await api.get('/permissions', { params });
      setPermissions(response.data.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Gagal mengambil data permission');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPermissions();
  }, [searchQuery, categoryFilter]);
  
  // Handle edit permission
  const handleEditPermission = (permission) => {
    setSelectedPermission(permission);
    setIsFormDialogOpen(true);
  };
  
  // Handle delete permission
  const handleDeletePermission = (permission) => {
    setSelectedPermission(permission);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete permission
  const confirmDeletePermission = async () => {
    try {
      await api.delete(`/permissions/${selectedPermission._id}`);
      toast.success('Permission berhasil dihapus');
      fetchPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus permission');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPermission(null);
    }
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setSelectedPermission(null);
    fetchPermissions();
  };
  
  // Sync permissions with Role model
  const syncPermissions = async () => {
    setSyncLoading(true);
    try {
      const response = await api.post('/permissions/sync');
      toast.success(`${response.data.count} permission baru berhasil disinkronkan`);
      fetchPermissions();
    } catch (error) {
      console.error('Error syncing permissions:', error);
      toast.error('Gagal menyinkronkan permission');
    } finally {
      setSyncLoading(false);
      setIsSyncDialogOpen(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manajemen Permission</h1>
          
          <div className="flex space-x-2">
            {checkPermission('manage_roles') && (
              <>
                <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sinkronkan Permission
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sinkronkan Permission</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p>
                        Tindakan ini akan menyinkronkan permission dari Role model ke Permission model.
                        Permission baru akan dibuat untuk setiap permission yang ada di Role model
                        tetapi belum ada di Permission model.
                      </p>
                      <p className="text-sm text-amber-500 mt-2">
                        Perhatian: Permission yang sudah ada tidak akan diubah.
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsSyncDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button 
                        onClick={syncPermissions}
                        disabled={syncLoading}
                      >
                        {syncLoading ? 'Menyinkronkan...' : 'Sinkronkan'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Permission
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedPermission ? 'Edit Permission' : 'Tambah Permission Baru'}
                      </DialogTitle>
                    </DialogHeader>
                    <PermissionForm
                      permission={selectedPermission}
                      onSuccess={handleFormSuccess}
                      onCancel={() => setIsFormDialogOpen(false)}
                      inDialog={true}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Permission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Cari permission..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">Semua Kategori</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-4">Memuat data...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Permission</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Tidak ada data permission
                        </TableCell>
                      </TableRow>
                    ) : (
                      permissions.map(permission => (
                        <TableRow key={permission._id}>
                          <TableCell className="font-medium">{permission.name}</TableCell>
                          <TableCell>{permission.code}</TableCell>
                          <TableCell>
                            {permission.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {permission.description || '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {permission.isActive ? (
                              <Eye className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-red-500 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPermission(permission)}
                                disabled={!checkPermission('manage_roles')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePermission(permission)}
                                disabled={!checkPermission('manage_roles')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Permission</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Apakah Anda yakin ingin menghapus permission <strong>{selectedPermission?.name}</strong>?
            </p>
            <p className="text-sm text-red-500 mt-2">
              Perhatian: Permission yang sedang digunakan oleh role tidak dapat dihapus.
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDeletePermission}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PermissionsPage;