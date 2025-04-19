"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import MuatForm from "@/components/forms/muat-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { fetchLoadingById } from "@/lib/redux/slices/loadingSlice";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import ErrorMessage from "@/components/shared/error-message";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

export default function EditMuatPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, error, currentLoading } = useSelector((state) => state.loading);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data - in a real app, this would come from your auth system
  const user = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@example.com",
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchLoadingById(id));
    }
  }, [dispatch, id]);

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Muatan", link: "/muat" },
    { title: "Edit Muatan", link: `/muat/${id}`, active: true },
  ];

  // Mock logout function
  const handleLogout = () => {
    console.log("User logged out");
    // Implement actual logout logic here
  };

  if (loading && !currentLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !loading && !currentLoading) {
    return (
      <div className="py-8">
        <ErrorMessage title="Error memuat data muatan" description={error} />
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
          <div className="mx-auto max-w-7xl space-y-6">
            <Breadcrumbs items={breadcrumbItems} />
            <MuatForm loadingId={id} />
          </div>
        </main>
      </div>
    </div>
  );
}