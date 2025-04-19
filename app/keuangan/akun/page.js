// app/keuangan/akun/page.js
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAccounts } from "@/lib/redux/slices/financeSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/data-tables/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/hooks/use-toast";
import Link from "next/link";
import { PlusCircle, FileDown, Filter } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

export default function AccountsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { accounts, loading, error } = useSelector((state) => state.finance);
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const columns = [
    {
      accessorKey: "kodeAccount",
      header: "Kode Akun",
      cell: ({ row }) => (
        <Link
          href={`/keuangan/akun/${row.original._id}`}
          className="font-medium hover:underline"
        >
          {row.original.kodeAccount}
        </Link>
      ),
    },
    {
      accessorKey: "namaAccount",
      header: "Nama Akun",
    },
    {
      accessorKey: "tipeAccount",
      header: "Tipe Akun",
      cell: ({ row }) => {
        const tipe = row.original.tipeAccount;
        let color = "bg-gray-100 text-gray-800";

        if (tipe === "Pendapatan") color = "bg-green-100 text-green-800";
        if (tipe === "Biaya") color = "bg-red-100 text-red-800";
        if (tipe === "Aset") color = "bg-blue-100 text-blue-800";
        if (tipe === "Kewajiban") color = "bg-orange-100 text-orange-800";
        if (tipe === "Ekuitas") color = "bg-purple-100 text-purple-800";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}
          >
            {tipe}
          </span>
        );
      },
    },
    {
      accessorKey: "deskripsi",
      header: "Deskripsi",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/keuangan/akun/${row.original._id}`}>
            <Button variant="ghost" size="sm">
              Detail
            </Button>
          </Link>
          <Link href={`/keuangan/akun/${row.original._id}/edit`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out...");
  };

  // Filter data berdasarkan tab aktif
  const filteredData = accounts.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "pendapatan") return item.tipeAccount === "Pendapatan";
    if (activeTab === "biaya") return item.tipeAccount === "Biaya";
    if (activeTab === "aset") return item.tipeAccount === "Aset";
    if (activeTab === "kewajiban") return item.tipeAccount === "Kewajiban";
    if (activeTab === "ekuitas") return item.tipeAccount === "Ekuitas";
    return true;
  });

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Keuangan", href: "/keuangan" },
    { label: "Akun", href: "/keuangan/akun" },
  ];

  if (error) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center text-red-500">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex justify-between items-center mb-4 mt-4">
              <h1 className="text-2xl font-bold">Daftar Akun</h1>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/keuangan/akun/tambah">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Akun
                  </Link>
                </Button>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Ekspor
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle>Manajemen Akun</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="all"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="mt-2"
                >
                  <TabsList>
                    <TabsTrigger value="all">Semua</TabsTrigger>
                    <TabsTrigger value="pendapatan">Pendapatan</TabsTrigger>
                    <TabsTrigger value="biaya">Biaya</TabsTrigger>
                    <TabsTrigger value="aset">Aset</TabsTrigger>
                    <TabsTrigger value="kewajiban">Kewajiban</TabsTrigger>
                    <TabsTrigger value="ekuitas">Ekuitas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="p-0 mt-2">
                    <DataTable
                      columns={columns}
                      data={filteredData}
                      loading={loading}
                      searchPlaceholder="Cari akun..."
                      searchColumn="namaAccount"
                    />
                  </TabsContent>
                  <TabsContent value="pendapatan" className="p-0 mt-2">
                    <DataTable
                      columns={columns}
                      data={filteredData}
                      loading={loading}
                      searchPlaceholder="Cari akun pendapatan..."
                      searchColumn="namaAccount"
                    />
                  </TabsContent>
                  <TabsContent value="biaya" className="p-0 mt-2">
                    <DataTable
                      columns={columns}
                      data={filteredData}
                      loading={loading}
                      searchPlaceholder="Cari akun biaya..."
                      searchColumn="namaAccount"
                    />
                  </TabsContent>
                  <TabsContent value="aset" className="p-0 mt-2">
                    <DataTable
                      columns={columns}
                      data={filteredData}
                      loading={loading}
                      searchPlaceholder="Cari akun aset..."
                      searchColumn="namaAccount"
                    />
                  </TabsContent>
                  <TabsContent value="kewajiban" className="p-0 mt-2">
                    <DataTable
                      columns={columns}
                      data={filteredData}
                      loading={loading}
                      searchPlaceholder="Cari akun kewajiban..."
                      searchColumn="namaAccount"
                    />
                  </TabsContent>
                  <TabsContent value="ekuitas" className="p-0 mt-2">
                    <DataTable
                      columns={columns}
                      data={filteredData}
                      loading={loading}
                      searchPlaceholder="Cari akun ekuitas..."
                      searchColumn="namaAccount"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
