// app/kendaraan/page.js
"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchVehicles, deleteVehicle } from "@/lib/redux/slices/vehicleSlice";
import { fetchBranches } from "@/lib/redux/slices/cabangSlice";
import { fetchEmployees } from "@/lib/redux/slices/pegawaiSlice";
import { logout } from "@/lib/redux/slices/authSlice";
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
import Sidebar from '@/components/layout/DynamicSidebar'

export default function VehicleListPage() {
  const dispatch = useDispatch();
  const { vehicles, loading, error, success } = useSelector(
    (state) => state.vehicle
  );
  const { branches } = useSelector((state) => state.cabang);
  const { toast } = useToast();

  // Initialize filter states with "all" instead of empty string
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortField, setSortField] = useState("noPolisi");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get user data from Redux auth state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Kendaraan", link: "/kendaraan", active: true },
  ];

  useEffect(() => {
    // Prepare query parameters
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add filters if they exist
    if (searchQuery) params.search = searchQuery;
    
    // Only add cabangId filter if it's not "all"
    if (filterBranch && filterBranch !== "all") {
      params.cabangId = filterBranch;
    }
    
    // Only add type filter if it's not "all"
    if (filterType && filterType !== "all") {
      params.tipe = filterType;
    }
    
    // Fetch data with the filtered params
    dispatch(fetchVehicles(params));
    dispatch(fetchBranches());
    dispatch(fetchEmployees());
  }, [
    dispatch,
    searchQuery,
    filterBranch,
    filterType,
    currentPage,
    itemsPerPage,
  ]);

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
    setFilterBranch("all"); // Set to "all" instead of empty string
    setFilterType("all"); // Set to "all" instead of empty string
    setSortField("noPolisi");
    setSortDirection("asc");
    // Pass empty params object to fetch all vehicles
    dispatch(fetchVehicles({}));
  };

  // Add a function to handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Find branch name by id
  const getBranchName = (branchId) => {
    if (!branchId) return "-";

    // Make sure branches is available and not empty
    if (!branches || !Array.isArray(branches)) return "-";

    // Handle case where branchId is an object
    const searchId =
      typeof branchId === "object" && branchId?._id
        ? branchId._id.toString()
        : branchId?.toString();

    console.log("Looking for branch with ID:", searchId);
    console.log(
      "Available branches:",
      branches.map((b) => ({ id: b._id, name: b.namaCabang }))
    );

    // Try to find the branch with more flexible comparison
    const branch = branches.find((branch) => String(branch._id) === searchId);

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

  // Filter and sort data - improved filtering logic
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      vehicle.noPolisi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.namaKendaraan?.toLowerCase().includes(searchQuery.toLowerCase());

    // Branch filter - improved to handle object or string IDs
    const matchesBranch = 
      !filterBranch || 
      filterBranch === "all" || 
      (vehicle.cabangId && (
        (typeof vehicle.cabangId === 'object' && vehicle.cabangId._id === filterBranch) ||
        (typeof vehicle.cabangId === 'string' && vehicle.cabangId === filterBranch)
      ));

    // Type filter
    const matchesType = 
      !filterType || 
      filterType === "all" || 
      vehicle.tipe === filterType;

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

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Error",
        description: "Gagal logout. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

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
                  <Select 
                    value={filterBranch} 
                    onValueChange={setFilterBranch}
                    defaultValue="all"
                  >
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
                  <Select 
                    value={filterType} 
                    onValueChange={setFilterType}
                    defaultValue="all"
                  >
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

                {(searchQuery ||
                  filterBranch ||
                  filterType ||
                  sortField !== "noPolisi" ||
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
                                Tidak ada kendaraan yang cocok dengan filter
                                yang dipilih
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
                              <div className="font-medium">
                                {vehicle.noPolisi}
                              </div>
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
