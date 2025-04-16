"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Button, 
  Card, 
  CardContent, 
  FormControl, 
  FormLabel, 
  Input, 
  Select, 
  Switch, 
  Textarea 
} from '@/components/ui/index';
import api from '@/lib/api';

const MenuForm = ({ menu, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [parentMenus, setParentMenus] = useState([]);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    setValue
  } = useForm({
    defaultValues: {
      name: menu?.name || '',
      code: menu?.code || '',
      path: menu?.path || '',
      icon: menu?.icon || 'circle',
      parentId: menu?.parentId || '',
      order: menu?.order || 0,
      isActive: menu?.isActive !== false,
      requiredPermissions: menu?.requiredPermissions || []
    }
  });
  
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(menu?.requiredPermissions || []);
  
  // Fetch parent menus (top-level menus)
  useEffect(() => {
    const fetchParentMenus = async () => {
      try {
        const response = await api.get('/menus', {
          params: { parentId: 'null', isActive: 'true' }
        });
        
        // Filter out the current menu (to prevent circular references)
        const filteredMenus = menu?._id 
          ? response.data.data.filter(m => m._id !== menu._id)
          : response.data.data;
          
        setParentMenus(filteredMenus);
      } catch (error) {
        console.error('Error fetching parent menus:', error);
        toast.error('Gagal mengambil data menu induk');
      }
    };
    
    fetchParentMenus();
  }, [menu]);
  
  // Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await api.get('/permissions', {
          params: { isActive: 'true' }
        });
        setPermissions(response.data.data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        toast.error('Gagal mengambil data permission');
      }
    };
    
    fetchPermissions();
  }, []);
  
  // Set initial selected permissions
  useEffect(() => {
    if (menu?.requiredPermissions) {
      setSelectedPermissions(menu.requiredPermissions);
    }
  }, [menu]);
  
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Add selected permissions to the data
      data.requiredPermissions = selectedPermissions;
      
      let response;
      
      if (menu?._id) {
        // Update existing menu
        response = await api.put(`/menus/${menu._id}`, data);
        toast.success('Menu berhasil diperbarui');
      } else {
        // Create new menu
        response = await api.post('/menus', data);
        toast.success('Menu berhasil dibuat');
      }
      
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      
      reset();
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan menu');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setSelectedPermissions(prev => [...prev, value]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== value));
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormControl invalid={!!errors.name}>
            <FormLabel htmlFor="name">Nama Menu</FormLabel>
            <Input
              id="name"
              placeholder="Masukkan nama menu"
              {...register('name', { required: 'Nama menu harus diisi' })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </FormControl>
          
          <FormControl invalid={!!errors.code}>
            <FormLabel htmlFor="code">Kode Menu</FormLabel>
            <Input
              id="code"
              placeholder="Masukkan kode menu (huruf kecil, angka, underscore)"
              {...register('code', { 
                required: 'Kode menu harus diisi',
                pattern: {
                  value: /^[a-z0-9_]+$/,
                  message: 'Kode menu hanya boleh berisi huruf kecil, angka, dan underscore'
                }
              })}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code.message}</p>
            )}
          </FormControl>
          
          <FormControl invalid={!!errors.path}>
            <FormLabel htmlFor="path">Path Menu</FormLabel>
            <Input
              id="path"
              placeholder="Masukkan path menu (contoh: /dashboard)"
              {...register('path', { required: 'Path menu harus diisi' })}
            />
            {errors.path && (
              <p className="text-sm text-red-500">{errors.path.message}</p>
            )}
          </FormControl>
          
          <FormControl invalid={!!errors.icon}>
            <FormLabel htmlFor="icon">Icon</FormLabel>
            <Input
              id="icon"
              placeholder="Masukkan nama icon (contoh: home, users, settings)"
              {...register('icon')}
            />
            <p className="text-xs text-gray-500 mt-1">
              Gunakan nama icon dari Feather Icons atau Lucide Icons
            </p>
          </FormControl>
          
          <FormControl>
            <FormLabel htmlFor="parentId">Menu Induk</FormLabel>
            <Select
              id="parentId"
              {...register('parentId')}
            >
              <option value="">Tidak ada (Menu Utama)</option>
              {parentMenus.map(parent => (
                <option key={parent._id} value={parent._id}>
                  {parent.name}
                </option>
              ))}
            </Select>
          </FormControl>
          
          <FormControl invalid={!!errors.order}>
            <FormLabel htmlFor="order">Urutan</FormLabel>
            <Input
              id="order"
              type="number"
              min="0"
              {...register('order', { 
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: 'Urutan minimal 0'
                }
              })}
            />
            {errors.order && (
              <p className="text-sm text-red-500">{errors.order.message}</p>
            )}
          </FormControl>
          
          <FormControl>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                {...register('isActive')}
                defaultChecked={menu?.isActive !== false}
              />
              <FormLabel htmlFor="isActive" className="cursor-pointer">
                Menu Aktif
              </FormLabel>
            </div>
          </FormControl>
          
          <div className="space-y-2">
            <FormLabel>Permission yang Dibutuhkan</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border p-3 rounded-md max-h-60 overflow-y-auto">
              {permissions.map(permission => (
                <div key={permission._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`permission-${permission._id}`}
                    value={permission.code}
                    checked={selectedPermissions.includes(permission.code)}
                    onChange={handlePermissionChange}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`permission-${permission._id}`} className="text-sm">
                    {permission.name}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Pilih permission yang dibutuhkan untuk mengakses menu ini
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : menu?._id ? 'Perbarui Menu' : 'Buat Menu'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MenuForm;