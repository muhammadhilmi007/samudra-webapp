'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import API_URL from '@/lib/api';

export default function PermissionsPage() {
  return (
    <AuthGuard requiredPermissions={['manage_permissions']}>
      <PermissionsContent />
    </AuthGuard>
  );
}

function PermissionsContent() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    isActive: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch permissions grouped by category
        const response = await axios.get(`${API_URL}/permissions/by-category`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch categories
        const categoriesResponse = await axios.get(`${API_URL}/permissions/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Flatten permissions for easier filtering
        const allPermissions = [];
        Object.keys(response.data.data).forEach(category => {
          response.data.data[category].forEach(permission => {
            allPermissions.push({
              ...permission,
              category
            });
          });
        });
        
        setPermissions(allPermissions);
        setCategories(categoriesResponse.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        toast.error('Gagal memuat data izin');
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

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePermission = async () => {
    try {
      // Validate form
      if (!formData.name || !formData.code || !formData.category) {
        toast.error('Nama, kode, dan kategori harus diisi');
        return;
      }

      const response = await axios.post(
        `${API_URL}/permissions`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Add new permission to state
      setPermissions(prev => [...prev, {
        ...response.data.data,
        category: formData.category
      }]);

      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        category: '',
        isActive: true
      });

      setIsDialogOpen(false);
      toast.success('Izin berhasil dibuat');
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat izin');
    }
  };

  const handleUpdatePermission = async () => {
    try {
      // Validate form
      if (!formData.name || !formData.code || !formData.category) {
        toast.error('Nama, kode, dan kategori harus diisi');
        return;
      }

      const response = await axios.put(
        `${API_URL}/permissions/${editingPermission._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update permission in state
      setPermissions(prev => prev.map(p => 
        p._id === editingPermission._id 
          ? { ...response.data.data, category: formData.category } 
          : p
      ));

      // Reset form
      setFormData({
        name: '',
        code: '',
        description: '',
        category: '',
        isActive: true
      });

      setEditingPermission(null);
      setIsDialogOpen(false);
      toast.success('Izin berhasil diperbarui');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui izin');
    }
  };

  const handleDeletePermission = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus izin ini?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/permissions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Remove permission from state
      setPermissions(prev => prev.filter(p => p._id !== id));
      toast.success('Izin berhasil dihapus');
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus izin');
    }
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      code: permission.code,
      description: permission.description || '',
      category: permission.category,
      isActive: permission.isActive
    });
    setIsDialogOpen(true);
  };

  const filteredPermissions = permissions.filter(permission => {
    // Filter by search term
    const matchesSearch = 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by category tab
    const matchesCategory = activeTab === 'all' || permission.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Manajemen Izin"
        subtitle="Kelola izin akses untuk sistem"
        actions={
          <Button onClick={() => {
            setEditingPermission(null);
            setFormData({
              name: '',
              code: '',
              description: '',
              category: '',
              isActive: true
            });
            setIsDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Izin
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Cari izin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' 
                  ? 'Semua Izin' 
                  : `Izin ${activeTab.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`}
              </CardTitle>
              <CardDescription>
                {filteredPermissions.length} izin ditemukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPermissions.map(permission => (
                  <Card key={permission._id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{permission.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {permission.code}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditPermission(permission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeletePermission(permission._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      {permission.description && (
                        <p className="text-sm text-muted-foreground">
                          {permission.description}
                        </p>
                      )}
                      <div className="flex items-center mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {permission.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Badge>
                        {!permission.isActive && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            Tidak Aktif
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? 'Edit Izin' : 'Tambah Izin Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingPermission 
                ? 'Edit detail izin yang sudah ada' 
                : 'Tambahkan izin baru ke sistem'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Izin</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Lihat Dashboard"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Kode Izin</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="view_dashboard"
              />
              <p className="text-xs text-muted-foreground">
                Hanya huruf kecil, angka, dan underscore
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Izin untuk melihat halaman dashboard"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={editingPermission ? handleUpdatePermission : handleCreatePermission}>
              {editingPermission ? 'Perbarui' : 'Tambah'} Izin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}