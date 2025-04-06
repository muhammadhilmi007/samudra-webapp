// app/antrian-kendaraan/page.js
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  fetchVehicleQueues,
  deleteVehicleQueue,
  updateVehicleQueueStatus,
} from "@/lib/redux/slices/vehicleQueueSlice";
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
  Edit,
  Trash2,
  Eye,
  Loader2,
  ArrowUpDown,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/lib/hooks/use-toast";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function VehicleQueueListPage() {
  const dispatch = useDispatch();
  const { vehicleQueues, loading, error, success } = useSelector(
    (state) => state.vehicleQueue
  );
  const { branches } = useSelector((state) => state.cabang);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("urutan");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [queueToDelete, setQueueToDelete] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [queueToUpdate, setQueueToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [prevSuccess, setPrevSuccess] = useState(false);

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Antrian Kendaraan", link: "/antrian-kendaraan", active: true },
  ];

  useEffect(() => {
    dispatch(fetchVehicleQueues());
    dispatch(fetchBranches());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }

    if (success && !prevSuccess) {
      toast({
        title: "Berhasil",
        description: "Operasi antrian kendaraan berhasil dilakukan",
        variant: "success",
      });

      if (queueToDelete) {
        setQueueToDelete(null);
      }

      if (queueToUpdate) {
        setQueueToUpdate(null);
      }
    }

    // Update previous success state
    setPrevSuccess(success);
  }, [error, success, toast, queueToDelete, queueToUpdate]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteClick = (queue) => {
    setQueueToDelete(queue);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (queueToDelete) {
      await dispatch(deleteVehicleQueue(queueToDelete._id));
      setDeleteDialogOpen(false);
    }
  };

  const handleStatusClick = (queue) => {
    setQueueToUpdate(queue);
    setNewStatus(queue.status);
    setStatusDialogOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (queueToUpdate && newStatus) {
      await dispatch(
        updateVehicleQueueStatus({ id: queueToUpdate._id, status: newStatus })
      );
      setStatusDialogOpen(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterBranch("all");
    setFilterStatus("all");
    setSortField("urutan");
    setSortDirection("asc");
  };

  // Find branch name by id
  const getBranchName = (branchId) => {
    const branch = branches.find((branch) => branch._id === branchId);
    return branch ? branch.namaCabang : "-";
  };

  // Format queue status for display
  const formatQueueStatus = (status) => {
    const statusMap = {
      MENUNGGU: { label: "Menunggu", variant: "warning" },
      LANSIR: { label: "Lansir", variant: "info" },
      KEMBALI: { label: "Kembali", variant: "success" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "secondary",
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Filter and sort data
  const filteredQueues = vehicleQueues.filter((queue) => {
    // Check if kendaraanId exists and has fields we want to search
    const vehicleMatch =
      queue.kendaraanId &&
      (queue.kendaraanId.noPolisi
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        queue.kendaraanId.namaKendaraan
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()));

    // Check if driver or helper names match
    const driverMatch = queue.supirId?.nama
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const helperMatch = queue.kenekId?.nama
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesSearch =
      vehicleMatch || driverMatch || helperMatch || !searchQuery;
    const matchesBranch =
      !filterBranch ||
      filterBranch === "all" ||
      queue.cabangId === filterBranch;
    const matchesStatus =
      !filterStatus || filterStatus === "all" || queue.status === filterStatus;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  // Sort data
  const sortedQueues = [...filteredQueues].sort((a, b) => {
    let valueA, valueB;

    if (sortField === "kendaraan") {
      valueA = a.kendaraanId?.namaKendaraan || a.kendaraanId?.noPolisi || "";
      valueB = b.kendaraanId?.namaKendaraan || b.kendaraanId?.noPolisi || "";
    } else if (sortField === "cabangId") {
      valueA = getBranchName(a.cabangId);
      valueB = getBranchName(b.cabangId);
    } else if (sortField === "status") {
      valueA = a.status || "";
      valueB = b.status || "";
    } else if (sortField === "supir") {
      valueA = a.supirId?.nama || "";
      valueB = b.supirId?.nama || "";
    } else {
      valueA = a[sortField];
      valueB = b[sortField];
    }

    // Handle case-insensitive string comparison
    if (typeof valueA === "string" && typeof valueB === "string") {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
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
                  Manajemen Antrian Kendaraan
                </h1>
                <p className="text-muted-foreground">
                  Kelola antrian kendaraan lansir dalam sistem
                </p>
              </div>
              <Link href="/antrian-kendaraan/tambah">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Antrian
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari nomor polisi, nama kendaraan, supir..."
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
                      <SelectItem value="MENUNGGU">Menunggu</SelectItem>
                      <SelectItem value="LANSIR">Lansir</SelectItem>
                      <SelectItem value="KEMBALI">Kembali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchQuery ||
                  filterBranch ||
                  filterStatus ||
                  sortField !== "urutan" ||
                  sortDirection !== "asc") && (
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
                          onClick={() => handleSort("urutan")}
                        >
                          <div className="flex items-center">
                            No. Urut
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("kendaraan")}
                        >
                          <div className="flex items-center">
                            Kendaraan
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("supir")}
                        >
                          <div className="flex items-center">
                            Supir
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead>Kenek</TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("cabangId")}
                        >
                          <div className="flex items-center">
                            Cabang
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center">
                            Status
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                              <span className="ml-2">Memuat data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : sortedQueues.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            {searchQuery || filterBranch || filterStatus ? (
                              <div>
                                Tidak ada antrian kendaraan yang cocok dengan
                                filter yang dipilih
                              </div>
                            ) : (
                              <div>Belum ada data antrian kendaraan</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedQueues.map((queue) => (
                          <TableRow key={queue._id}>
                            <TableCell>
                              <div className="font-medium">{queue.urutan}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {queue.kendaraanId?.namaKendaraan || "-"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {queue.kendaraanId?.noPolisi || "-"}
                              </div>
                            </TableCell>
                            <TableCell>{queue.supirId?.nama || "-"}</TableCell>
                            <TableCell>{queue.kenekId?.nama || "-"}</TableCell>
                            <TableCell>
                              {getBranchName(queue.cabangId)}
                            </TableCell>
                            <TableCell>
                              {formatQueueStatus(queue.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusClick(queue)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  <span className="sr-only">Update Status</span>
                                </Button>
                                <Link href={`/antrian-kendaraan/${queue._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(queue)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Hapus</span>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Konfirmasi Hapus Antrian Kendaraan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus antrian kendaraan{" "}
              <span className="font-semibold">
                {queueToDelete?.kendaraanId?.noPolisi || "yang dipilih"}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Status Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Status Antrian</AlertDialogTitle>
            <AlertDialogDescription>
              Pilih status baru untuk kendaraan{" "}
              <span className="font-semibold">
                {queueToUpdate?.kendaraanId?.noPolisi || "yang dipilih"}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MENUNGGU">Menunggu</SelectItem>
                <SelectItem value="LANSIR">Lansir</SelectItem>
                <SelectItem value="KEMBALI">Kembali</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusUpdate}>
              Update Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
