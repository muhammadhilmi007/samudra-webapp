// app/kendaraan/[id]/page.js
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import VehicleForm from "@/components/forms/vehicle-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { fetchVehicleById } from "@/lib/redux/slices/vehicleSlice";
import { logout } from "@/lib/redux/slices/authSlice";
import { useToast } from "@/lib/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import ErrorMessage from "@/components/shared/error-message";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

export default function EditVehiclePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const { loading, error } = useSelector((state) => state.vehicle);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // No need to fetch vehicle here - the form component handles it
  // This avoids duplicate fetches that can cause unnecessary re-renders

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Kendaraan", link: "/kendaraan" },
    { title: "Edit Kendaraan", link: `/kendaraan/${id}`, active: true },
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
            {error ? (
              <ErrorMessage message={error} />
            ) : (
              <VehicleForm vehicleId={id} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
