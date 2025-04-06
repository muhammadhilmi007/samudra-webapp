"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/hooks/use-toast";
import AssetForm from "@/components/forms/asset-form";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function TambahAsetPage() {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSubmit = (data) => {
    setSubmitting(true);

    // Simulasi API call untuk menambah aset
    setTimeout(() => {
      setSubmitting(false);

      toast({
        title: "Aset berhasil ditambahkan",
        description: `Aset baru "${data.namaAset}" telah berhasil ditambahkan ke sistem.`,
      });

      router.push("/aset");
    }, 1000);
  };

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out...");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={mockUser}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuButtonClick={() => setSidebarOpen(true)}
          user={mockUser}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-1xl space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/aset">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Tambah Aset Baru</h1>
            </div>

            <AssetForm
              onSubmit={handleSubmit}
              onCancel={() => router.push("/aset")}
              isSubmitting={submitting}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
