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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import PageHeader from '@/components/layout/header';
import API_URL from '@/lib/api';

export default function UserRolesPage() {
  const { id } = useParams();
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const token = auth?.token;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [primaryRoleId, setPrimaryRoleId] = useState(null);

  // Check if user has permission to manage employees
  const canManageEmployees = user?.permissions?.includes('manage_employees');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user roles
        const response = await axios.get(`${API_URL}/user-roles/by-user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserData(response.data.data);
        setRoles(response.data.data.roles);
        
        // Set primary role
        const primaryRole = response.data.data.roles.find(role => role.assigned && role.isPrimary);
        if (primaryRole) {
          setPrimaryRoleId(primaryRole.roleId);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        toast.error('Gagal memuat data peran pengguna');
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [id, token]);

  const handleRoleToggle = (roleId) => {
    setRoles(prevRoles => 
      prevRoles.map(role => 
        role.roleId === roleId 
          ? { ...role, assigned: !role.assigned } 
          : role
      )
    );
  };

  const handlePrimaryRoleChange = (roleId) => {
    setPrimaryRoleId(roleId);
  };

  const handleSave = async () => {
    if (!canManageEmployees) {
      toast.error('Anda tidak memiliki izin untuk mengelola peran pegawai');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare roles data
      const assignedRoles = roles
        .filter(role => role.assigned)
        .map(role => ({
          roleId: role.roleId,
          isPrimary: role.roleId === primaryRoleId
        }));
      
      // Ensure at least one role is assigned
      if (assignedRoles.length === 0) {
        toast.error('Pegawai harus memiliki minimal satu peran');
        setSaving(false);
        return;
      }
      
      // Ensure one role is set as primary
      if (!assignedRoles.some(role => role.isPrimary)) {
        assignedRoles[0].isPrimary = true;
      }
      
      // Save changes
      await axios.post(
        `${API_URL}/user-roles/batch`,
        {
          userId: id,
          roles: assignedRoles
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Peran pegawai berhasil diperbarui');
      router.push(`/pegawai/${id}`);
    } catch (error) {
      console.error('Error saving user roles:', error);
      toast.error('Gagal menyimpan peran pegawai');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!userData) {
    return (
      <div className="container mx-auto p-4">
        <p>Pegawai tidak ditemukan</p>
        <Button onClick={() => router.push('/pegawai')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title={`Kelola Peran: ${userData.userName}`}
        subtitle="Tetapkan peran dan izin akses untuk pegawai"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/pegawai/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || !canManageEmployees}
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
          <CardTitle>Peran yang Tersedia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pilih peran yang akan diberikan kepada pegawai ini. Setiap pegawai harus memiliki minimal satu peran.
            Tetapkan satu peran sebagai peran utama.
          </p>
          
          <div className="space-y-6">
            {roles.map((role) => (
              <div key={role.roleId} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.roleId}`}
                      checked={role.assigned}
                      onCheckedChange={() => handleRoleToggle(role.roleId)}
                      disabled={!canManageEmployees}
                    />
                    <div>
                      <Label htmlFor={`role-${role.roleId}`} className="text-base font-medium">
                        {role.role.namaRole}
                      </Label>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant="outline">{role.role.kodeRole}</Badge>
                        {role.assigned && (
                          <div className="flex items-center space-x-2">
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`primary-${role.roleId}`}
                                checked={primaryRoleId === role.roleId}
                                onCheckedChange={() => handlePrimaryRoleChange(role.roleId)}
                                disabled={!role.assigned || !canManageEmployees}
                              />
                              <Label htmlFor={`primary-${role.roleId}`} className="text-sm">
                                Peran Utama
                              </Label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {role.role.deskripsi && (
                  <p className="text-sm text-muted-foreground mt-2 ml-6">
                    {role.role.deskripsi}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}