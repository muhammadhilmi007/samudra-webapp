// app/(auth)/logout/page.js
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/lib/redux/slices/authSlice';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await dispatch(logout()).unwrap();
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // Even if the API call fails, we still want to redirect to login
        router.push('/login');
      }
    };

    performLogout();
  }, [dispatch, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="mt-4 text-lg">Logging out...</p>
    </div>
  );
}