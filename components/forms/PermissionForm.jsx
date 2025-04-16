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
} from '@/components/ui';
import api from '@/lib/api';

const PermissionForm = ({ permission, onSuccess, onCancel, inDialog = false }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      name: permission?.name || '',
      code: permission?.code || '',
      description: permission?.description || '',
      category: permission?.category || '',
      isActive: permission?.isActive !== false
    }
  });
  
  // Fetch permission categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/permissions/categories');
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching permission categories:', error);
        toast.error('Gagal mengambil data kategori permission');
      }
    };
    
    fetchCategories();
  }, []);
  
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      let response;
      
      if (permission?._id) {
        // Update existing permission
        response = await api.put(`/permissions/${permission._id}`, data);
        toast.success('Permission berhasil diperbarui');
      } else {
        // Create new permission
        response = await api.post('/permissions', data);
        toast.success('Permission berhasil dibuat');
      }
      
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      
      reset();
    } catch (error) {
      console.error('Error saving permission:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan permission');
    } finally {
      setLoading(false);
    }
  };
  
  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormControl invalid={!!errors.name}>
        <FormLabel htmlFor="name">Nama Permission</FormLabel>
        <Input
          id="name"
          placeholder="Masukkan nama permission"
          {...register('name', { required: 'Nama permission harus diisi' })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </FormControl>
      
      <FormControl invalid={!!errors.code}>
        <FormLabel htmlFor="code">Kode Permission</FormLabel>
        <Input
          id="code"
          placeholder="Masukkan kode permission (huruf kecil, angka, underscore)"
          {...register('code', {
            required: 'Kode permission harus diisi',
            pattern: {
              value: /^[a-z0-9_]+$/,
              message: 'Kode permission hanya boleh berisi huruf kecil, angka, dan underscore'
            }
          })}
        />
        {errors.code && (
          <p className="text-sm text-red-500">{errors.code.message}</p>
        )}
      </FormControl>
      
      <FormControl invalid={!!errors.description}>
        <FormLabel htmlFor="description">Deskripsi</FormLabel>
        <Textarea
          id="description"
          placeholder="Masukkan deskripsi permission"
          {...register('description')}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </FormControl>
      
      <FormControl invalid={!!errors.category}>
        <FormLabel htmlFor="category">Kategori</FormLabel>
        <Select
          id="category"
          {...register('category', { required: 'Kategori harus diisi' })}
        >
          <option value="">Pilih Kategori</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </FormControl>
      
      <FormControl>
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            {...register('isActive')}
            defaultChecked={permission?.isActive !== false}
          />
          <FormLabel htmlFor="isActive" className="cursor-pointer">
            Permission Aktif
          </FormLabel>
        </div>
      </FormControl>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : permission?._id ? 'Perbarui Permission' : 'Buat Permission'}
        </Button>
      </div>
    </form>
  );

  // If used inside a dialog, return just the form without the Card wrapper
  if (inDialog) {
    return formContent;
  }

  // Otherwise, wrap the form in a Card
  return (
    <Card className="w-full">
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
};

export default PermissionForm;