// app/antrian-kendaraan/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/lib/redux/slices/authSlice";
import { hasAccess } from "@/lib/auth";
import { useToast } from "@/lib/hooks/use-toast";
import VehicleQueueForm from "@/components/forms/vehicle-queue-form.jsx";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { fetchVehicleQueueById } from "@/lib/redux/slices/vehicleQueueSlice";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import ErrorMessage from "@/components/shared/error-message";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

export default function EditVehicleQueuePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const { loading, error, currentVehicleQueue } = useSelector((state) => state.vehicleQueue);
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user has access to edit vehicle queue
    if (!hasAccess('vehicles', 'edit')) {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki izin untuk mengedit antrian kendaraan",
        variant: "destructive",
      });
      router.push("/unauthorized");
      return;
    }
    
    // Fetch vehicle queue data
    const loadVehicleQueue = async () => {
      if (id) {
        try {
          await dispatch(fetchVehicleQueueById(id)).unwrap();
        } catch (error) {
          console.error("Error fetching vehicle queue:", error);
          toast({
            title: "Error",
            description: "Gagal memuat data antrian kendaraan. Silakan coba lagi.",
            variant: "destructive",
          });
        }
      }
    };
    
    loadVehicleQueue();
  }, [dispatch, id, router, toast]);

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Antrian Kendaraan", link: "/antrian-kendaraan" },
    { title: "Edit Antrian Kendaraan", link: `/antrian-kendaraan/${id}`, active: true },
  ];

  // Logout function
  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  if (loading && !currentVehicleQueue) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !loading && !currentVehicleQueue) {
    return (
      <div className="py-8">
        <ErrorMessage title="Error memuat data antrian kendaraan" description={error} />
      </div>
    );
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
            <VehicleQueueForm queueId={id} />
          </div>
        </main>
      </div>
    </div>
  );
}