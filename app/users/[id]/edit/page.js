'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
  ArrowLeft, 
  Save, 
  Loader2, 
  User, 
  Shield, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Key,
  Upload
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import PageHeader from '@/components/layout/header';
import AuthGuard from '@/components/auth/auth-guard';
import UserRoles from '@/components/UserRoles';
import API_URL from '@/lib/api';
import { getInitials } from '@/lib/utils';

export default function EditUserPage({ params }) {
  return (
    <AuthGuard requiredPermissions={['manage_users']}>
      <EditUserContent params={params} />
    </AuthGuard>
  );
}

function EditUserContent({ params }) {
  const userId = params.id;
  const router = useRouter();
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [activeTab, setActiveTab] = useState('basic-info');
  const [changePassword, setChangePassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    telepon: '',
    alamat: '',
    jabatan: '',
    cabangId: '',
    password: '',
    confirmPassword: '',
    aktif: true
  });
  
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user details
        const userResponse = await axios.get(`${API_URL}/users/${userId}`, {
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
        
        // Fetch user roles
        const userRolesResponse = await axios.get(`${API_URL}/users/${userId}/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(userResponse.data.data);
        setRoles(rolesResponse.data.data);
        setBranches(branchesResponse.data.data);
        setUserRoles(userRolesResponse.data.data);
        
        // Set form data from user
        const userData = userResponse.data.data;
        setFormData({
          nama: userData.nama || '',
          username: userData.username || '',
          email: userData.email || '',
          telepon: userData.telepon || '',
          alamat: userData.alamat || '',
          jabatan: userData.jabatan || '',
          cabangId: userData.cabangId || '',
          password: '',
          confirmPassword: '',
          aktif: userData.aktif !== undefined ? userData.aktif : true
        });
        
        // Set image preview if user has profile image
        if (userData.fotoProfil) {
          setImagePreview(`${API_URL}/uploads/${userData.fotoProfil}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Gagal memuat data pengguna');
        setLoading(false);
        router.push('/users');
      }
    };

    if (token && userId) {
      fetchData();
    }
  }, [token, userId, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nama.trim()) {
      errors.nama = 'Nama harus diisi';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Username harus diisi';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    if (!formData.cabangId) {
      errors.cabangId = 'Cabang harus dipilih';
    }
    
    if (changePassword) {
      if (!formData.password) {
        errors.password = 'Password harus diisi';
      } else if (formData.password.length < 6) {
        errors.password = 'Password minimal 6 karakter';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password tidak sesuai';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Harap perbaiki error pada form');
      return;
    }
    
    setSaving(true);
    
    try {
      // Prepare data for update
      const updateData = {
        nama: formData.nama,
        username: formData.username,
        email: formData.email,
        telepon: formData.telepon,
        alamat: formData.alamat,
        jabatan: formData.jabatan,
        cabangId: formData.cabangId,
        aktif: formData.aktif
      };
      
      // Add password if changing
      if (changePassword && formData.password) {
        updateData.password = formData.password;
      }
      
      // Update user
      await axios.put(
        `${API_URL}/users/${userId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Upload profile image if changed
      if (profileImage) {
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        
        await axios.post(
          `${API_URL}/users/${userId}/profile-image`,
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
      }
      
      toast.success('Pengguna berhasil diperbarui');
      router.push('/users');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui pengguna');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Edit Pengguna"
        subtitle="Perbarui informasi dan akses pengguna"
        actions={
          <div className="flex gap-2">
            <Link href="/users">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
              </Button>
            </Link>
            <Button 
              onClick={handleSubmit}
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
                  Simpan
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Profil Pengguna</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-xl">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt={formData.nama} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(formData.nama)}</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              
              <h3 className="text-lg font-medium">{formData.nama}</h3>
              <p className="text-sm text-muted-foreground">{formData.username}</p>
              
              <div className="mt-4 w-full">
                <div className="flex items-center justify-between">
                  <Label htmlFor="user-status">Status Pengguna</Label>
                  <Switch
                    id="user-status"
                    checked={formData.aktif}
                    onCheckedChange={(checked) => handleSwitchChange('aktif', checked)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.aktif ? 'Pengguna aktif dan dapat login' : 'Pengguna tidak aktif dan tidak dapat login'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* User Roles Card */}
          <UserRoles 
            userId={userId} 
            roles={userRoles} 
            showEditButton={true} 
          />
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="basic-info">Informasi Dasar</TabsTrigger>
                  <TabsTrigger value="account">Akun & Keamanan</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <TabsContent value="basic-info" className="mt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nama">
                          Nama Lengkap <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="nama"
                            name="nama"
                            value={formData.nama}
                            onChange={handleInputChange}
                            className="pl-10"
                            placeholder="Nama lengkap"
                          />
                        </div>
                        {formErrors.nama && (
                          <p className="text-sm text-destructive">{formErrors.nama}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="jabatan">Jabatan</Label>
                        <Input
                          id="jabatan"
                          name="jabatan"
                          value={formData.jabatan}
                          onChange={handleInputChange}
                          placeholder="Jabatan"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cabangId">
                        Cabang <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.cabangId}
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, cabangId: value }));
                            setFormErrors(prev => ({ ...prev, cabangId: undefined }));
                          }}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Pilih cabang" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch._id} value={branch._id}>
                                {branch.namaCabang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {formErrors.cabangId && (
                        <p className="text-sm text-destructive">{formErrors.cabangId}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="pl-10"
                            placeholder="Email"
                          />
                        </div>
                        {formErrors.email && (
                          <p className="text-sm text-destructive">{formErrors.email}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="telepon">Telepon</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="telepon"
                            name="telepon"
                            value={formData.telepon}
                            onChange={handleInputChange}
                            className="pl-10"
                            placeholder="Nomor telepon"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="alamat">Alamat</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="alamat"
                          name="alamat"
                          value={formData.alamat}
                          onChange={handleInputChange}
                          className="pl-10 min-h-[100px]"
                          placeholder="Alamat lengkap"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="account" className="mt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">
                        Username <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Username"
                      />
                      {formErrors.username && (
                        <p className="text-sm text-destructive">{formErrors.username}</p>
                      )}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                          id="change-password"
                          checked={changePassword}
                          onCheckedChange={setChangePassword}
                        />
                        <Label htmlFor="change-password" className="font-medium">
                          Ubah Password
                        </Label>
                      </div>
                      
                      {changePassword && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="password">
                              Password Baru <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="pl-10"
                                placeholder="Password baru"
                              />
                            </div>
                            {formErrors.password && (
                              <p className="text-sm text-destructive">{formErrors.password}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                              Konfirmasi Password <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="pl-10"
                                placeholder="Konfirmasi password baru"
                              />
                            </div>
                            {formErrors.confirmPassword && (
                              <p className="text-sm text-destructive">{formErrors.confirmPassword}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSubmit}
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
                    Simpan Perubahan
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
