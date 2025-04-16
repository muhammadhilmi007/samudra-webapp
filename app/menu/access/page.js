'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from '@/components/ui';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MenuAccessForm from '@/components/forms/MenuAccessForm';
import { useAuth } from '@/lib/hooks/useAuth';

const MenuAccessPage = () => {
  const router = useRouter();
  const { user, checkPermission } = useAuth();
  
  // Check if user has permission to manage menu access
  useEffect(() => {
    if (user && !checkPermission('manage_menus') && !checkPermission('manage_roles')) {
      toast.error('Anda tidak memiliki akses ke halaman ini');
      router.push('/dashboard');
    }
  }, [user, router, checkPermission]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Manajemen Akses Menu</h1>
          <p className="text-gray-500 mt-1">
            Atur akses menu untuk setiap role dalam sistem
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Akses Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <MenuAccessForm />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MenuAccessPage;