"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  fetchSTTs,
  fetchSTTsByStatus,
  fetchSTTsByBranch,
  generateSTTPDF,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/sttSlice";
import { fetchBranches } from "@/lib/redux/slices/cabangSlice";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  FileText,
  Eye,
  Printer,
  Loader2,
  Package,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

export default function STTListPage() {
  const dispatch = useDispatch();
  const { stts, loading, error, success } = useSelector((state) => state.stt);
  const { branches } = useSelector((state) => state.cabang);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [printingSTTId, setPrintingSTTId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "STT", link: "/stt", active: true },
  ];

  useEffect(() => {
    dispatch(fetchSTTs());
    dispatch(fetchBranches());
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
        description: "Operasi STT berhasil dilakukan",
        variant: "success",
      });
      dispatch(clearSuccess());
    }
  }, [error, success, toast, dispatch]);

  // Handle filter changes
  useEffect(() => {
    if (filterBranch) {
      dispatch(fetchSTTsByBranch(filterBranch));
    }

    if (filterStatus) {
      dispatch(fetchSTTsByStatus(filterStatus));
    }
  }, [dispatch, filterBranch, filterStatus]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterBranch("");
    setFilterStatus("");
    setSortField("createdAt");
    setSortDirection("desc");
    dispatch(fetchSTTs());
  };

  const handlePrintSTT = async (id) => {
    try {
      setPrintingSTTId(id);
      await dispatch(generateSTTPDF(id));
      toast({
        title: "STT dicetak",
        description: "Surat Tanda Terima berhasil dicetak dan diunduh.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Gagal mencetak STT",
        description:
          "Terjadi kesalahan saat mencetak STT. Silakan coba lagi nanti.",
        variant: "destructive",
      });
    } finally {
      setPrintingSTTId(null);
    }
  };

  // Find branch name by id
  const getBranchName = (branchId) => {
    const branch = branches.find((branch) => branch._id === branchId);
    return branch ? branch.namaCabang : "-";
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Pending", variant: "warning" },
      MUAT: { label: "Dimuat", variant: "info" },
      TRANSIT: { label: "Transit", variant: "info" },
      LANSIR: { label: "Lansir", variant: "warning" },
      TERKIRIM: { label: "Terkirim", variant: "success" },
      RETURN: { label: "Retur", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "secondary",
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Get payment type badge
  const getPaymentTypeBadge = (paymentType) => {
    const typeMap = {
      CASH: { label: "CASH", variant: "success" },
      COD: { label: "COD", variant: "info" },
      CAD: { label: "CAD", variant: "warning" },
    };

    const typeInfo = typeMap[paymentType] || {
      label: paymentType,
      variant: "secondary",
    };

    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  // Filter and sort data
  const filteredSTTs = stts.filter((stt) => {
    const matchesSearch =
      stt.noSTT?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stt.namaBarang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stt.komoditi?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = filterBranch
      ? stt.cabangAsalId === filterBranch || stt.cabangTujuanId === filterBranch
      : true;

    const matchesStatus = filterStatus ? stt.status === filterStatus : true;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  // Sort data
  const sortedSTTs = [...filteredSTTs].sort((a, b) => {
    let valueA = a[sortField];
    let valueB = b[sortField];

    // Special cases for date fields
    if (sortField === "createdAt" || sortField === "updatedAt") {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }

    // Default comparison
    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

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
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Surat Tanda Terima (STT)
                </h1>
                <p className="text-muted-foreground">
                  Kelola dokumen Surat Tanda Terima untuk pengiriman barang
                </p>
              </div>
              <Link href="/stt/tambah">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat STT Baru
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari STT, nama barang, komoditi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="w-full md:w-64">
                  <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter cabang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Cabang</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.namaCabang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="MUAT">Dimuat</SelectItem>
                      <SelectItem value="TRANSIT">Transit</SelectItem>
                      <SelectItem value="LANSIR">Lansir</SelectItem>
                      <SelectItem value="TERKIRIM">Terkirim</SelectItem>
                      <SelectItem value="RETURN">Retur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchQuery ||
                  filterBranch ||
                  filterStatus ||
                  sortField !== "createdAt" ||
                  sortDirection !== "desc") && (
                  <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    className="h-10 px-3 lg:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reset Filter
                  </Button>
                )}
              </div>

              <div className="bg-white rounded-md border shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("noSTT")}
                        >
                          <div className="flex items-center">
                            No. STT
                            {sortField === "noSTT" &&
                              (sortDirection === "asc" ? (
                                <ArrowUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ArrowDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center">
                            Tanggal
                            {sortField === "createdAt" &&
                              (sortDirection === "asc" ? (
                                <ArrowUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ArrowDown className="ml-1 h-4 w-4" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead>Cabang Tujuan</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Pembayaran</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && !printingSTTId ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                              <span className="ml-2">Memuat data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : sortedSTTs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            {searchQuery || filterBranch || filterStatus ? (
                              <div>
                                Tidak ada STT yang cocok dengan filter yang
                                dipilih
                              </div>
                            ) : (
                              <div>Belum ada data STT</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedSTTs.map((stt) => (
                          <TableRow key={stt._id}>
                            <TableCell>
                              <div className="font-medium">{stt.noSTT}</div>
                            </TableCell>
                            <TableCell>{formatDate(stt.createdAt)}</TableCell>
                            <TableCell>
                              {getBranchName(stt.cabangTujuanId)}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {stt.namaBarang}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {stt.komoditi}, {stt.jumlahColly} colly,{" "}
                                {stt.berat} kg
                              </div>
                            </TableCell>
                            <TableCell>
                              {getPaymentTypeBadge(stt.paymentType)}
                            </TableCell>
                            <TableCell>{formatCurrency(stt.harga)}</TableCell>
                            <TableCell>{getStatusBadge(stt.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/stt/${stt._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Lihat</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePrintSTT(stt._id)}
                                  disabled={printingSTTId === stt._id}
                                >
                                  {printingSTTId === stt._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Printer className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Cetak</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
