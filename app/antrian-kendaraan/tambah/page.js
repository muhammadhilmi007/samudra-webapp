// app/antrian-kendaraan/tambah/page.js
"use client";

import VehicleQueueForm from "@/components/forms/vehicle-queue-form.jsx";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/redux/slices/authSlice";
import { hasAccess } from "@/lib/auth";
import { useToast } from "@/lib/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

export default function AddVehicleQueuePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    // Check if user has access to create vehicle queue
    if (!hasAccess('vehicles', 'create')) {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki izin untuk membuat antrian kendaraan baru",
        variant: "destructive",
      });
      router.push("/unauthorized");
      return;
    }
  }, [router, toast]);

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Antrian Kendaraan", link: "/antrian-kendaraan" },
    { title: "Tambah Antrian Kendaraan", link: "/antrian-kendaraan/tambah", active: true },
  ];

  // Logout function
  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
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
            <VehicleQueueForm />
          </div>
        </main>
      </div>
    </div>
  );
}