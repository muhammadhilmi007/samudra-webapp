"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  fetchLoadings,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/loadingSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import DataTable from "@/components/data-tables/data-table";

export default function MuatanListPage() {
  const dispatch = useDispatch();
  const { loadings, loading, error, success } = useSelector((state) => state.loading);
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
    { title: "Muatan", link: "/muat", active: true },
  ];

  useEffect(() => {
    dispatch(fetchLoadings());
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
        description: "Operasi muatan berhasil dilakukan",
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
      "MUAT": { label: "Dalam Pemuatan", variant: "warning" },
      "BERANGKAT": { label: "Berangkat", variant: "info" },
      "SAMPAI": { label: "Sampai", variant: "success" },
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
      field: "idMuat",
      header: "ID Muatan",
      sortable: true,
      render: (row) => (
        <div className="font-medium text-primary">{row.idMuat}</div>
      ),
    },
    {
      field: "createdAt",
      header: "Tanggal",
      sortable: true,
      render: (row) => formatDate(row.createdAt),
    },
    {
      field: "cabangMuatId",
      header: "Cabang Asal",
      render: (row) => row.cabangMuatId?.namaCabang || "-",
    },
    {
      field: "cabangBongkarId",
      header: "Cabang Tujuan",
      render: (row) => row.cabangBongkarId?.namaCabang || "-",
    },
    {
      field: "antrianTruckId",
      header: "Truck",
      render: (row) => {
        const truck = row.antrianTruckId?.truckId;
        return truck ? (
          <div>
            <div className="font-medium">{truck.noPolisi}</div>
            <div className="text-xs text-muted-foreground">{truck.namaKendaraan}</div>
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
      onClick: (row) => window.location.href = `/muat/${row._id}`,
      showLabel: false,
      inline: true,
    },
    {
      icon: FileText,
      label: "Cetak DMB",
      onClick: (row) => console.log("Print DMB", row),
      showLabel: false,
      inline: true,
    },
    {
      icon: Truck,
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
        { value: "MUAT", label: "Dalam Pemuatan" },
        { value: "BERANGKAT", label: "Berangkat" },
        { value: "SAMPAI", label: "Sampai" },
        { value: "PENDING", label: "Pending" },
      ],
    },
    {
      field: "cabangMuatId",
      label: "Cabang Asal",
      type: "select",
      options: [
        { value: "1", label: "Jakarta" },
        { value: "2", label: "Bandung" },
        { value: "3", label: "Surabaya" },
      ],
    },
    {
      field: "cabangBongkarId",
      label: "Cabang Tujuan",
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
      label: "Buat Muatan",
      variant: "default",
      icon: Plus,
      onClick: () => window.location.href = "/muat/tambah",
    },
    {
      label: "Lihat Antrian Truck",
      variant: "outline",
      icon: Truck,
      onClick: () => window.location.href = "/muat/antrian",
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
                  Daftar Muatan
                </h1>
                <p className="text-muted-foreground">
                  Kelola muatan barang antar cabang
                </p>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={loadings}
              loading={loading}
              error={error}
              rowActions={rowActions}
              filters={filters}
              actions={actions}
              searchPlaceholder="Cari ID muatan..."
              searchFields={["idMuat"]}
              emptyMessage="Belum ada data muatan"
              onRowClick={(row) => window.location.href = `/muat/${row._id}`}
            />
          </div>
        </main>
      </div>
    </div>
  );
}