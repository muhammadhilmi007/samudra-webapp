// app/antrian-kendaraan/tambah/page.js
"use client";

import VehicleQueueForm from "@/components/forms/vehicle-queue-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useState } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function AddVehicleQueuePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data - in a real app, this would come from your auth system
  const user = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@example.com",
  };

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Antrian Kendaraan", link: "/antrian-kendaraan" },
    { title: "Tambah Antrian Kendaraan", link: "/antrian-kendaraan/tambah", active: true },
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
            <VehicleQueueForm />
          </div>
        </main>
      </div>
    </div>
  );
}