"use client";

import { useEffect, useState } from "react"; // Added useState import
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import STTForm from "@/components/forms/stt-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { fetchSTTById } from "@/lib/redux/slices/sttSlice";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import ErrorMessage from "@/components/shared/error-message";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

export default function EditSTTPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, error, currentSTT } = useSelector((state) => state.stt);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data - in a real app, this would come from your auth system
  const user = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@example.com",
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchSTTById(id));
    }
  }, [dispatch, id]);

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "STT", link: "/stt" },
    { title: "Edit STT", link: `/stt/${id}`, active: true },
  ];

  // Mock logout function
  const handleLogout = () => {
    console.log("User logged out");
    // Implement actual logout logic here
  };

  if (loading && !currentSTT) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !loading && !currentSTT) {
    return (
      <div className="py-8">
        <ErrorMessage title="Error memuat data STT" description={error} />
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
            <STTForm sttId={id} />
          </div>
        </main>
      </div>
    </div>
  );
}
