// app/kendaraan/tambah/page.js
"use client";
import VehicleForm from "@/components/forms/vehicle-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/lib/redux/slices/authSlice";
import { useToast } from "@/lib/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function AddVehiclePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Kendaraan", link: "/kendaraan" },
    { title: "Tambah Kendaraan", link: "/kendaraan/tambah", active: true },
  ];

  // Implement actual logout function
  const handleLogout = async () => {
    try {
      await dispatch(logout());
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Error",
        description: "Gagal logout. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

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
            <VehicleForm />
          </div>
        </main>
      </div>
    </div>
  );
}