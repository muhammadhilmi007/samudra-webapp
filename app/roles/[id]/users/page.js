'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, UserPlus } from 'lucide-react';
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import API_URL from '@/lib/api';

export default function RoleUsersPage() {
  return (
    <AuthGuard requiredPermissions={['manage_roles', 'view_employees']}>
      <RoleUsersContent />
    </AuthGuard>
  );
}

function RoleUsersContent() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch role details
        const roleResponse = await axios.get(`${API_URL}/roles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch users with this role
        const usersResponse = await axios.get(`${API_URL}/user-roles/by-role/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRole(roleResponse.data.data);
        setUsers(usersResponse.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching role users:', error);
        toast.error('Gagal memuat data pengguna peran');
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [id, token]);

  const handleOpenAddUserDialog = async () => {
    try {
      // Fetch all users
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter out users who already have this role
      const existingUserIds = users.map(u => u.userId._id);
      const filteredUsers = response.data.data.filter(
        user => !existingUserIds.includes(user._id)
      );
      
      setAvailableUsers(filteredUsers);
      setSelectedUserId(filteredUsers.length > 0 ? filteredUsers[0]._id : '');
      setIsPrimary(false);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching available users:', error);
      toast.error('Gagal memuat daftar pengguna');
    }
  };

  const handleAddUser = async () => {
    try {
      if (!selectedUserId) {
        toast.error('Pilih pengguna terlebih dahulu');
        return;
      }

      // Add user to role
      const response = await axios.post(
        `${API_URL}/user-roles`,
        {
          userId: selectedUserId,
          roleId: id,
          isPrimary
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Fetch updated user data
      const userResponse = await axios.get(`${API_URL}/users/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add new user to the list
      setUsers(prev => [...prev, {
        _id: response.data.data._id,
        userId: userResponse.data.data,
        roleId: { _id: id, ...role },
        isPrimary
      }]);
      
      setIsDialogOpen(false);
      toast.success('Pengguna berhasil ditambahkan ke peran');
    } catch (error) {
      console.error('Error adding user to role:', error);
      toast.error(error.response?.data?.message || 'Gagal menambahkan pengguna ke peran');
    }
  };

  const handleRemoveUser = async (userRoleId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna dari peran ini?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/user-roles/${userRoleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Remove user from the list
      setUsers(prev => prev.filter(u => u._id !== userRoleId));
      toast.success('Pengguna berhasil dihapus dari peran');
    } catch (error) {
      console.error('Error removing user from role:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus pengguna dari peran');
    }
  };

  const handleSetPrimary = async (userRoleId, userId) => {
    try {
      await axios.put(
        `${API_URL}/user-roles/${userRoleId}`,
        {
          isPrimary: true
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update users list to reflect the change
      setUsers(prev => prev.map(u => ({
        ...u,
        isPrimary: u._id === userRoleId
      })));
      
      toast.success('Peran utama berhasil diperbarui');
    } catch (error) {
      console.error('Error setting primary role:', error);
      toast.error(error.response?.data?.message || 'Gagal menetapkan peran utama');
    }
  };

  const filteredUsers = users.filter(user => {
    const userData = user.userId;
    return (
      userData.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!role) {
    return (
      <div className="container mx-auto p-4">
        <p>Peran tidak ditemukan</p>
        <Button onClick={() => router.push('/roles')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Peran
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title={`Pengguna dengan Peran: ${role.namaRole}`}
        subtitle={`Kelola pengguna yang memiliki peran ${role.namaRole}`}
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push('/roles')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
            <Button onClick={handleOpenAddUserDialog}>
              <UserPlus className="mr-2 h-4 w-4" /> Tambah Pengguna
            </Button>
          </div>
        }
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>
            {users.length} pengguna dengan peran {role.namaRole}
          </CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
            <Input
              placeholder="Cari pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Button type="submit" size="icon" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Tidak ada pengguna dengan peran ini
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(userRole => (
                  <TableRow key={userRole._id}>
                    <TableCell className="font-medium">
                      {userRole.userId.nama}
                    </TableCell>
                    <TableCell>{userRole.userId.username}</TableCell>
                    <TableCell>{userRole.userId.jabatan}</TableCell>
                    <TableCell>
                      {userRole.userId.cabang?.namaCabang || '-'}
                    </TableCell>
                    <TableCell>
                      {userRole.isPrimary && (
                        <Badge>Peran Utama</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {!userRole.isPrimary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetPrimary(userRole._id, userRole.userId._id)}
                          >
                            Jadikan Utama
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveUser(userRole._id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna ke Peran</DialogTitle>
            <DialogDescription>
              Pilih pengguna yang akan ditambahkan ke peran {role.namaRole}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {availableUsers.length === 0 ? (
              <p>Tidak ada pengguna yang tersedia untuk ditambahkan</p>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="userId">Pengguna</label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pengguna" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map(user => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.nama} ({user.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isPrimary">Jadikan sebagai peran utama</label>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleAddUser}
              disabled={availableUsers.length === 0 || !selectedUserId}
            >
              Tambah Pengguna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}