"use client";

import CustomerForm from "@/components/forms/customer-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import Header from "@/components/layout/header";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/lib/redux/slices/authSlice";
import { useToast } from "@/lib/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";

export default function TambahPelangganPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Logout function
  const handleLogout = async () => {
    try {
      await dispatch(logout());
      router.push('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal logout. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Pelanggan", link: "/pelanggan" },
    { title: "Tambah Pelanggan", link: "/pelanggan/tambah", active: true },
  ];

  // If not authenticated and still loading, show nothing
  if (!isAuthenticated && !user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuButtonClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="mx-auto max-w-1xl space-y-6">
            <Breadcrumbs items={breadcrumbItems} />
            <CustomerForm />
          </div>
        </main>
      </div>
    </div>
  );
}
