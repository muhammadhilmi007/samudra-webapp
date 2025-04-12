// app/unauthorized/page.js
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { logout } from '@/lib/redux/slices/authSlice';
import { useDispatch } from 'react-redux';

export default function UnauthorizedPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
        
        <p className="text-lg text-gray-600 mb-2">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        
        {user && (
          <p className="text-sm text-gray-500 mb-8">
            Anda login sebagai <span className="font-semibold">{user.nama || user.username}</span> dengan role <span className="font-semibold">{user.role || 'tidak diketahui'}</span>.
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={handleGoToDashboard}
          >
            Dashboard
          </Button>
          
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}