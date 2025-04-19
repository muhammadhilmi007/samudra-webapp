'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageHeader from '@/components/PageHeader';
import { API_URL } from '@/lib/api';

export default function RolePermissionsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleData, setRoleData] = useState(null);
  const [permissionsByCategory, setPermissionsByCategory] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user has permission to manage roles
  const canManageRoles = user?.permissions?.includes('manage_roles');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch role permissions
        const response = await axios.get(`${API_URL}/role-permissions/by-role/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRoleData(response.data.data);
        setPermissionsByCategory(response.data.data.permissionsByCategory);
        
        // Set initial active category
        const categories = Object.keys(response.data.data.permissionsByCategory);
        if (categories.length > 0) {
          setActiveCategory(categories[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching role permissions:', error);
        toast.error('Gagal memuat data izin peran');
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [id, token]);

  const handlePermissionToggle = (permissionId) => {
    setPermissionsByCategory(prevPermissions => {
      const newPermissions = { ...prevPermissions };
      
      // Find and update the permission in the correct category
      Object.keys(newPermissions).forEach(category => {
        newPermissions[category] = newPermissions[category].map(permission => 
          permission.permissionId === permissionId 
            ? { ...permission, assigned: !permission.assigned } 
            : permission
        );
      });
      
      return newPermissions;
    });
  };

  const handleSave = async () => {
    if (!canManageRoles) {
      toast.error('Anda tidak memiliki izin untuk mengelola izin peran');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare permissions data
      const assignedPermissions = [];
      
      Object.values(permissionsByCategory).forEach(categoryPermissions => {
        categoryPermissions.forEach(permission => {
          if (permission.assigned) {
            assignedPermissions.push(permission.permissionId);
          }
        });
      });
      
      // Save changes
      await axios.post(
        `${API_URL}/role-permissions/batch`,
        {
          roleId: id,
          permissions: assignedPermissions
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Izin peran berhasil diperbarui');
      router.push(`/roles/${id}`);
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast.error('Gagal menyimpan izin peran');
    } finally {
      setSaving(false);
    }
  };

  // Filter permissions based on search query
  const filteredPermissionsByCategory = searchQuery 
    ? Object.fromEntries(
        Object.entries(permissionsByCategory).map(([category, permissions]) => [
          category,
          permissions.filter(permission => 
            permission.permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            permission.permission.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (permission.permission.description && 
              permission.permission.description.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        ]).filter(([_, permissions]) => permissions.length > 0)
      )
    : permissionsByCategory;

  const categories = Object.keys(filteredPermissionsByCategory);
  
  // If active category is not in filtered categories, set to first available
  useEffect(() => {
    if (categories.length > 0 && (!activeCategory || !categories.includes(activeCategory))) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!roleData) {
    return (
      <div className="container mx-auto p-4">
        <p>Peran tidak ditemukan</p>
        <Button onClick={() => router.push('/roles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title={`Kelola Izin: ${roleData.roleName}`}
        subtitle="Tetapkan izin akses untuk peran ini"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/roles/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || !canManageRoles}
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Simpan
                </>
              )}
            </Button>
          </div>
        }
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Izin yang Tersedia</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari izin..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              Tidak ada izin yang sesuai dengan pencarian
            </p>
          ) : (
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="mb-4 flex flex-wrap h-auto">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category} className="mb-1">
                    {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                      {filteredPermissionsByCategory[category].filter(p => p.assigned).length}/
                      {filteredPermissionsByCategory[category].length}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map(category => (
                <TabsContent key={category} value={category} className="space-y-4">
                  {filteredPermissionsByCategory[category].map((permission) => (
                    <div key={permission.permissionId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.permissionId}`}
                            checked={permission.assigned}
                            onCheckedChange={() => handlePermissionToggle(permission.permissionId)}
                            disabled={!canManageRoles}
                          />
                          <div>
                            <Label htmlFor={`permission-${permission.permissionId}`} className="text-base font-medium">
                              {permission.permission.name}
                            </Label>
                            <div className="text-sm text-muted-foreground mt-1">
                              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                                {permission.permission.code}
                              </code>
                            </div>
                          </div>
                        </div>
                      </div>
                      {permission.permission.description && (
                        <p className="text-sm text-muted-foreground mt-2 ml-6">
                          {permission.permission.description}
                        </p>
                      )}
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}