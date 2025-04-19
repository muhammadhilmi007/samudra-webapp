"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  fetchDeliveries,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/deliverySlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FileText,
  Eye,
  Printer,
  Truck,
  Loader2,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'
import DataTable from "@/components/data-tables/data-table";

export default function LansirListPage() {
  const dispatch = useDispatch();
  const { deliveries, loading, error, success } = useSelector((state) => state.delivery);
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data
  const user = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Lansir", link: "/lansir", active: true },
  ];

  useEffect(() => {
    dispatch(fetchDeliveries());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }

    if (success) {
      toast({
        title: "Berhasil",
        description: "Operasi lansir berhasil dilakukan",
        variant: "success",
      });
      dispatch(clearSuccess());
    }
  }, [error, success, toast, dispatch]);

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out...");
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      "LANSIR": { label: "Dalam Proses", variant: "warning" },
      "TERKIRIM": { label: "Terkirim", variant: "success" },
      "BELUM SELESAI": { label: "Belum Selesai", variant: "destructive" },
      "PENDING": { label: "Pending", variant: "secondary" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "secondary",
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const columns = [
    {
      field: "idLansir",
      header: "ID Lansir",
      sortable: true,
      render: (row) => (
        <div className="font-medium text-primary">{row.idLansir}</div>
      ),
    },
    {
      field: "berangkat",
      header: "Tanggal",
      sortable: true,
      render: (row) => formatDate(row.berangkat),
    },
    {
      field: "cabangId",
      header: "Cabang",
      render: (row) => row.cabangId?.namaCabang || "-",
    },
    {
      field: "antrianKendaraanId",
      header: "Kendaraan",
      render: (row) => {
        const kendaraan = row.antrianKendaraanId?.kendaraanId;
        return kendaraan ? (
          <div>
            <div className="font-medium">{kendaraan.noPolisi}</div>
            <div className="text-xs text-muted-foreground">{kendaraan.namaKendaraan}</div>
          </div>
        ) : "-";
      },
    },
    {
      field: "sttIds",
      header: "Jumlah STT",
      render: (row) => (
        <span className="font-medium">{row.sttIds?.length || 0}</span>
      ),
    },
    {
      field: "namaPenerima",
      header: "Penerima",
      render: (row) => row.namaPenerima || "-",
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      render: (row) => getStatusBadge(row.status),
    },
  ];

  const rowActions = [
    {
      icon: Eye,
      label: "Lihat Detail",
      onClick: (row) => window.location.href = `/lansir/${row._id}`,
      showLabel: false,
      inline: true,
    },
    {
      icon: FileText,
      label: "Cetak Form",
      onClick: (row) => console.log("Print Form", row),
      showLabel: false,
      inline: true,
    },
    {
      icon: CheckCircle,
      label: "Update Status",
      onClick: (row) => console.log("Update Status", row),
      dropdown: true,
      inline: false,
    },
  ];

  const filters = [
    {
      field: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "LANSIR", label: "Dalam Proses" },
        { value: "TERKIRIM", label: "Terkirim" },
        { value: "BELUM SELESAI", label: "Belum Selesai" },
        { value: "PENDING", label: "Pending" },
      ],
    },
    {
      field: "cabangId",
      label: "Cabang",
      type: "select",
      options: [
        { value: "1", label: "Jakarta" },
        { value: "2", label: "Bandung" },
        { value: "3", label: "Surabaya" },
      ],
    },
    {
      field: "dateRange",
      label: "Tanggal",
      type: "dateRange",
    },
  ];

  const actions = [
    {
      label: "Buat Lansir",
      variant: "default",
      icon: Plus,
      onClick: () => window.location.href = "/lansir/tambah",
    },
    {
      label: "Lihat Antrian Kendaraan",
      variant: "outline",
      icon: Truck,
      onClick: () => window.location.href = "/lansir/antrian",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuButtonClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-1xl space-y-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Daftar Lansir
                </h1>
                <p className="text-muted-foreground">
                  Kelola pengiriman barang ke penerima
                </p>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={deliveries}
              loading={loading}
              error={error}
              rowActions={rowActions}
              filters={filters}
              actions={actions}
              searchPlaceholder="Cari ID lansir, penerima..."
              searchFields={["idLansir", "namaPenerima"]}
              emptyMessage="Belum ada data lansir"
              onRowClick={(row) => window.location.href = `/lansir/${row._id}`}
            />
          </div>
        </main>
      </div>
    </div>
  );
}