'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import PageHeader from '@/components/layout/header';
import AuthGuard from '@/components/auth/auth-guard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import API_URL from '@/lib/api';

export default function RolesPage() {
  return (
    <AuthGuard requiredPermissions={['manage_roles', 'view_roles', 'admin_access']}>
      <RolesContent />
    </AuthGuard>
  );
}

function RolesContent() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [currentRoleForPermissions, setCurrentRoleForPermissions] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [formData, setFormData] = useState({
    namaRole: '',
    kodeRole: '',
    deskripsi: '',
    isActive: true,
    isSystem: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch roles
        const rolesResponse = await axios.get(`${API_URL}/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch permissions by category
        const permissionsResponse = await axios.get(`${API_URL}/permissions/by-category`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRoles(rolesResponse.data.data);
        setPermissions(permissionsResponse.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching roles and permissions:', error);
        toast.error('Gagal memuat data peran dan izin');
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleCreateRole = async () => {
    try {
      // Validate form
      if (!formData.namaRole || !formData.kodeRole) {
        toast.error('Nama dan kode peran harus diisi');
        return;
      }

      const response = await axios.post(
        `${API_URL}/roles`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Add new role to state
      setRoles(prev => [...prev, response.data.data]);

      // Reset form
      setFormData({
        namaRole: '',
        kodeRole: '',
        deskripsi: '',
        isActive: true,
        isSystem: false
      });

      setIsDialogOpen(false);
      toast.success('Peran berhasil dibuat');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat peran');
    }
  };

  const handleUpdateRole = async () => {
    try {
      // Validate form
      if (!formData.namaRole || !formData.kodeRole) {
        toast.error('Nama dan kode peran harus diisi');
        return;
      }

      const response = await axios.put(
        `${API_URL}/roles/${editingRole._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update role in state
      setRoles(prev => prev.map(r => 
        r._id === editingRole._id ? response.data.data : r
      ));

      // Reset form
      setFormData({
        namaRole: '',
        kodeRole: '',
        deskripsi: '',
        isActive: true,
        isSystem: false
      });

      setEditingRole(null);
      setIsDialogOpen(false);
      toast.success('Peran berhasil diperbarui');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui peran');
    }
  };

  const handleDeleteRole = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus peran ini?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/roles/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Remove role from state
      setRoles(prev => prev.filter(r => r._id !== id));
      toast.success('Peran berhasil dihapus');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus peran');
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setFormData({
      namaRole: role.namaRole,
      kodeRole: role.kodeRole,
      deskripsi: role.deskripsi || '',
      isActive: role.isActive,
      isSystem: role.isSystem || false
    });
    setIsDialogOpen(true);
  };

  const handleOpenPermissionsDialog = async (role) => {
    try {
      setCurrentRoleForPermissions(role);
      
      // Fetch current permissions for this role
      const response = await axios.get(`${API_URL}/role-permissions/by-role/${role._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Create a map of permission IDs to selected state
      const permissionMap = {};
      response.data.data.forEach(rp => {
        permissionMap[rp.permissionId._id] = true;
      });
      
      setSelectedPermissions(permissionMap);
      setIsPermissionDialogOpen(true);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast.error('Gagal memuat izin untuk peran ini');
    }
  };

  const handlePermissionChange = (permissionId, checked) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionId]: checked
    }));
  };

  const handleSavePermissions = async () => {
    try {
      // Convert selected permissions to array of permission IDs
      const permissionIds = Object.keys(selectedPermissions).filter(id => selectedPermissions[id]);
      
      await axios.post(
        `${API_URL}/role-permissions/batch`,
        {
          roleId: currentRoleForPermissions._id,
          permissionIds
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setIsPermissionDialogOpen(false);
      setCurrentRoleForPermissions(null);
      toast.success('Izin peran berhasil diperbarui');
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan izin peran');
    }
  };

  const filteredRoles = roles.filter(role => {
    return (
      role.namaRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.kodeRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.deskripsi && role.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Manajemen Peran"
        subtitle="Kelola peran dan izin akses untuk sistem"
        actions={
          <Button onClick={() => {
            setEditingRole(null);
            setFormData({
              namaRole: '',
              kodeRole: '',
              deskripsi: '',
              isActive: true,
              isSystem: false
            });
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Peran
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Cari peran..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map(role => (
          <Card key={role._id} className={!role.isActive ? 'opacity-70' : ''}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{role.namaRole}</CardTitle>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditRole(role)}
                    disabled={role.isSystem}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteRole(role._id)}
                    disabled={role.isSystem}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Badge variant="outline">{role.kodeRole}</Badge>
              {role.isSystem && (
                <Badge variant="secondary" className="ml-2">
                  Sistem
                </Badge>
              )}
              {!role.isActive && (
                <Badge variant="destructive" className="ml-2">
                  Tidak Aktif
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pb-2">
              {role.deskripsi && (
                <p className="text-sm text-muted-foreground mb-2">
                  {role.deskripsi}
                </p>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/roles/${role._id}/users`)}
                >
                  <Users className="h-4 w-4 mr-1" /> Pengguna
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleOpenPermissionsDialog(role)}
                >
                  Kelola Izin <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Peran' : 'Tambah Peran Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingRole 
                ? 'Edit detail peran yang sudah ada' 
                : 'Tambahkan peran baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="namaRole">Nama Peran</Label>
              <Input
                id="namaRole"
                name="namaRole"
                value={formData.namaRole}
                onChange={handleInputChange}
                placeholder="Manajer Cabang"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kodeRole">Kode Peran</Label>
              <Input
                id="kodeRole"
                name="kodeRole"
                value={formData.kodeRole}
                onChange={handleInputChange}
                placeholder="branch_manager"
              />
              <p className="text-xs text-muted-foreground">
                Hanya huruf kecil, angka, dan underscore
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Input
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Peran untuk manajer cabang"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={editingRole ? handleUpdateRole : handleCreateRole}>
              {editingRole ? 'Perbarui' : 'Tambah'} Peran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog 
        open={isPermissionDialogOpen} 
        onOpenChange={setIsPermissionDialogOpen}
        className="max-w-4xl"
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Kelola Izin untuk Peran: {currentRoleForPermissions?.namaRole}
            </DialogTitle>
            <DialogDescription>
              Pilih izin yang akan diberikan untuk peran ini
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Accordion type="multiple" className="w-full">
              {Object.keys(permissions).map(category => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="text-base font-medium">
                    {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                      {permissions[category].map(permission => (
                        <div key={permission._id} className="flex items-start space-x-2 p-2 border rounded-md">
                          <Checkbox
                            id={`permission-${permission._id}`}
                            checked={!!selectedPermissions[permission._id]}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission._id, checked)
                            }
                          />
                          <div>
                            <Label 
                              htmlFor={`permission-${permission._id}`}
                              className="font-medium"
                            >
                              {permission.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.code}
                            </p>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSavePermissions}>
              Simpan Izin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}