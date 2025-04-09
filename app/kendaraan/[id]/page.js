// app/kendaraan/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import VehicleForm from "@/components/forms/vehicle-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { fetchVehicleById } from "@/lib/redux/slices/vehicleSlice";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import ErrorMessage from "@/components/shared/error-message";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function EditVehiclePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.vehicle);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data - in a real app, this would come from your auth system
  const user = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@example.com",
  };

  // No need to fetch vehicle here - the form component handles it
  // This avoids duplicate fetches that can cause unnecessary re-renders

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Kendaraan", link: "/kendaraan" },
    { title: "Edit Kendaraan", link: `/kendaraan/${id}`, active: true },
  ];

  // Mock logout function
  const handleLogout = () => {
    console.log("User logged out");
    // Implement actual logout logic here
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
