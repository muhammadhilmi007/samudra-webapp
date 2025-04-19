'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Shield, 
  User,
  UserCog,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import PageHeader from '@/components/layout/header';
import AuthGuard from '@/components/auth/auth-guard';
import UserRoles from '@/components/UserRoles';
import UserPermissions from '@/components/forms/UserPermissions';
import API_URL from '@/lib/api';
import { getInitials } from '@/lib/utils';

export default function UserRolesPage({ params }) {
  return (
    <AuthGuard requiredPermissions={['manage_users', 'manage_roles']}>
      <UserRolesContent params={params} />
    </AuthGuard>
  );
}

function UserRolesContent({ params }) {
  const userId = params.id;
  const router = useRouter();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [primaryRoleId, setPrimaryRoleId] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);
  const [previewPermissions, setPreviewPermissions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user details
        const userResponse = await axios.get(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch all roles
        const rolesResponse = await axios.get(`${API_URL}/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch user roles
        const userRolesResponse = await axios.get(`${API_URL}/users/${userId}/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch user permissions
        const userPermissionsResponse = await axios.get(`${API_URL}/users/${userId}/permissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(userResponse.data.data);
        setAllRoles(rolesResponse.data.data);
        setUserRoles(userRolesResponse.data.data);
        setUserPermissions(userPermissionsResponse.data.data);
        
        // Set selected roles from user roles
        const selectedRolesMap = {};
        let primaryRole = '';
        
        userRolesResponse.data.data.forEach(role => {
          selectedRolesMap[role.id] = true;
          if (role.isPrimary) {
            primaryRole = role.id;
          }
        });
        
        setSelectedRoles(selectedRolesMap);
        setPrimaryRoleId(primaryRole);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Gagal memuat data pengguna dan peran');
        setLoading(false);
        router.push('/users');
      }
    };

    if (token && userId) {
      fetchData();
    }
  }, [token, userId, router]);

  const handleRoleChange = (roleId, checked) => {
    setSelectedRoles(prev => ({
      ...prev,
      [roleId]: checked
    }));
    
    // If unchecking the primary role, reset primary role
    if (!checked && roleId === primaryRoleId) {
      setPrimaryRoleId('');
    }
    
    // If this is the first role being selected, make it primary
    if (checked && Object.keys(selectedRoles).filter(id => selectedRoles[id]).length === 0) {
      setPrimaryRoleId(roleId);
    }
  };

  const handlePrimaryRoleChange = (roleId) => {
    setPrimaryRoleId(roleId);
  };

  const handlePreviewPermissions = async () => {
    try {
      // Get selected role IDs
      const roleIds = Object.keys(selectedRoles).filter(id => selectedRoles[id]);
      
      if (roleIds.length === 0) {
        setPreviewPermissions([]);
        setShowPreview(true);
        return;
      }
      
      // Fetch permissions for selected roles
      const response = await axios.post(
        `${API_URL}/permissions/preview`,
        { roleIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPreviewPermissions(response.data.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing permissions:', error);
      toast.error('Gagal memuat pratinjau izin');
    }
  };

  const handleSaveRoles = async () => {
    // Validate that a primary role is selected if any roles are selected
    const selectedRoleIds = Object.keys(selectedRoles).filter(id => selectedRoles[id]);
    
    if (selectedRoleIds.length > 0 && !primaryRoleId) {
      toast.error('Pilih peran utama');
      return;
    }
    
    setSaving(true);
    
    try {
      // Format roles data
      const rolesData = selectedRoleIds.map(roleId => ({
        roleId,
        isPrimary: roleId === primaryRoleId
      }));
      
      // Save roles
      await axios.post(
        `${API_URL}/users/${userId}/roles`,
        { roles: rolesData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Peran pengguna berhasil diperbarui');
      router.push(`/users/${userId}/edit`);
    } catch (error) {
      console.error('Error saving user roles:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan peran pengguna');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Kelola Peran Pengguna"
        subtitle={`Atur peran untuk pengguna: ${user?.nama}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/users/${userId}/edit`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
              </Button>
            </Link>
            <Button 
              onClick={handleSaveRoles}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Peran
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* User Info Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* User Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Informasi Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-xl">
                  {user?.fotoProfil ? (
                    <img 
                      src={`${API_URL}/uploads/${user.fotoProfil}`} 
                      alt={user.nama} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(user?.nama || '')}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{user?.nama}</h3>
                  <p className="text-sm text-muted-foreground">{user?.username}</p>
                  <p className="text-sm">{user?.jabatan || ''}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={user?.aktif ? "success" : "destructive"}>
                    {user?.aktif ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <span className="text-sm text-muted-foreground">Peran Saat Ini:</span>
                  {userRoles.length === 0 ? (
                    <p className="text-sm italic mt-1">Tidak ada peran</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {userRoles.map(role => (
                        <div key={role.id} className="flex items-center">
                          <Badge 
                            variant={role.isPrimary ? "default" : "secondary"}
                            className="mr-2"
                          >
                            {role.name}
                          </Badge>
                          {role.isPrimary && (
                            <span className="text-xs text-muted-foreground">(Utama)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Current Permissions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Izin Akses Saat Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserPermissions permissions={userPermissions} />
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserCog className="mr-2 h-5 w-5 text-primary" />
                Pilih Peran
              </CardTitle>
              <CardDescription>
                Pilih satu atau lebih peran untuk pengguna ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allRoles.length === 0 ? (
                  <div className="text-center py-8">
                    <p>Tidak ada peran yang tersedia</p>
                  </div>
                ) : (
                  <>
                    {/* Role selection */}
                    <div className="space-y-4">
                      {allRoles.map(role => (
                        <div key={role._id} className="flex items-start space-x-3 p-3 border rounded-md">
                          <Checkbox
                            id={`role-${role._id}`}
                            checked={!!selectedRoles[role._id]}
                            onCheckedChange={(checked) => handleRoleChange(role._id, checked)}
                            disabled={!role.isActive}
                          />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <Label 
                                htmlFor={`role-${role._id}`}
                                className="font-medium"
                              >
                                {role.namaRole}
                              </Label>
                              <Badge variant="outline" className="ml-2">
                                {role.kodeRole}
                              </Badge>
                              {!role.isActive && (
                                <Badge variant="destructive" className="ml-2">
                                  Nonaktif
                                </Badge>
                              )}
                            </div>
                            {role.deskripsi && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {role.deskripsi}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Primary role selection */}
                    <div className="mt-6 border-t pt-4">
                      <h3 className="text-base font-medium mb-2">Peran Utama</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Pilih peran utama untuk pengguna ini. Peran utama akan digunakan sebagai peran default.
                      </p>
                      
                      {Object.keys(selectedRoles).filter(id => selectedRoles[id]).length === 0 ? (
                        <div className="flex items-center p-4 border rounded-md bg-muted">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                          <p className="text-sm">Pilih setidaknya satu peran terlebih dahulu</p>
                        </div>
                      ) : (
                        <RadioGroup 
                          value={primaryRoleId} 
                          onValueChange={handlePrimaryRoleChange}
                          className="space-y-2"
                        >
                          {allRoles
                            .filter(role => selectedRoles[role._id] && role.isActive)
                            .map(role => (
                              <div key={role._id} className="flex items-center space-x-2">
                                <RadioGroupItem value={role._id} id={`primary-${role._id}`} />
                                <Label htmlFor={`primary-${role._id}`}>{role.namaRole}</Label>
                              </div>
                            ))
                          }
                        </RadioGroup>
                      )}
                    </div>
                    
                    {/* Preview permissions button */}
                    <div className="mt-6 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={handlePreviewPermissions}
                        className="w-full"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Pratinjau Izin Akses
                      </Button>
                    </div>
                    
                    {/* Preview permissions */}
                    {showPreview && (
                      <div className="mt-4 border rounded-md p-4">
                        <h3 className="text-base font-medium mb-2">Pratinjau Izin Akses</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Berikut adalah izin akses yang akan dimiliki pengguna dengan peran yang dipilih:
                        </p>
                        
                        <UserPermissions permissions={previewPermissions} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveRoles}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Peran
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
