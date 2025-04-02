// app/kendaraan/page.js
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { fetchVehicles, deleteVehicle } from "@/lib/redux/slices/vehicleSlice";
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
  Truck,
  ArrowUpDown,
  Filter,
  X,
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

export default function VehicleListPage() {
  const dispatch = useDispatch();
  const { vehicles, loading, error, success } = useSelector((state) => state.vehicle);
  const { branches } = useSelector((state) => state.cabang);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortField, setSortField] = useState("noPolisi");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Kendaraan", link: "/kendaraan", active: true },
  ];

  useEffect(() => {
    dispatch(fetchVehicles());
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

    if (success) {
      toast({
        title: "Berhasil",
        description: "Operasi kendaraan berhasil dilakukan",
        variant: "success",
      });

      if (vehicleToDelete) {
        setVehicleToDelete(null);
      }
    }
  }, [error, success, toast, vehicleToDelete]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (vehicleToDelete) {
      await dispatch(deleteVehicle(vehicleToDelete._id));
      setDeleteDialogOpen(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterBranch("");
    setFilterType("");
    setSortField("noPolisi");
    setSortDirection("asc");
    dispatch(fetchVehicles());
  };

  // Find branch name by id
  const getBranchName = (branchId) => {
    const branch = branches.find((branch) => branch._id === branchId);
    return branch ? branch.namaCabang : "-";
  };

  // Format vehicle type for display
  const formatVehicleType = (type) => {
    const typeMap = {
      lansir: { label: "Lansir", variant: "success" },
      antar_cabang: { label: "Antar Cabang", variant: "info" },
    };

    const typeInfo = typeMap[type] || {
      label: type,
      variant: "secondary",
    };

    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  // Filter and sort data
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.noPolisi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.namaKendaraan?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = filterBranch ? vehicle.cabangId === filterBranch : true;

    const matchesType = filterType ? vehicle.tipe === filterType : true;

    return matchesSearch && matchesBranch && matchesType;
  });

  // Sort data
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let valueA = a[sortField];
    let valueB = b[sortField];

    // Handle nested fields
    if (sortField === "cabangId") {
      valueA = getBranchName(a.cabangId);
      valueB = getBranchName(b.cabangId);
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
                  Manajemen Kendaraan
                </h1>
                <p className="text-muted-foreground">
                  Kelola data kendaraan dan armada perusahaan
                </p>
              </div>
              <Link href="/kendaraan/tambah">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kendaraan
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari nomor polisi, nama kendaraan..."
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
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      <SelectItem value="lansir">Lansir</SelectItem>
                      <SelectItem value="antar_cabang">Antar Cabang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchQuery || filterBranch || filterType || sortField !== "noPolisi" || sortDirection !== "asc") && (
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
                          onClick={() => handleSort("noPolisi")}
                        >
                          <div className="flex items-center">
                            Nomor Polisi
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort("namaKendaraan")}
                        >
                          <div className="flex items-center">
                            Nama Kendaraan
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead>Supir</TableHead>
                        <TableHead>Cabang</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                              <span className="ml-2">Memuat data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : sortedVehicles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            {searchQuery || filterBranch || filterType ? (
                              <div>
                                Tidak ada kendaraan yang cocok dengan filter yang
                                dipilih
                              </div>
                            ) : (
                              <div>Belum ada data kendaraan</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedVehicles.map((vehicle) => (
                          <TableRow key={vehicle._id}>
                            <TableCell>
                              <div className="font-medium">{vehicle.noPolisi}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {vehicle.namaKendaraan}
                              </div>
                            </TableCell>
                            <TableCell>
                              {vehicle.supirId?.nama || "-"}
                            </TableCell>
                            <TableCell>
                              {getBranchName(vehicle.cabangId)}
                            </TableCell>
                            <TableCell>
                              {formatVehicleType(vehicle.tipe)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/kendaraan/${vehicle._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Lihat</span>
                                  </Button>
                                </Link>
                                <Link href={`/kendaraan/${vehicle._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(vehicle)}
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
            <AlertDialogTitle>Konfirmasi Hapus Kendaraan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kendaraan{" "}
              <span className="font-semibold">
                {vehicleToDelete?.noPolisi} ({vehicleToDelete?.namaKendaraan})
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
    </div>
  );
}