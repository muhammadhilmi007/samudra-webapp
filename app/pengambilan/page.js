"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPickups,
  updatePickupStatus,
} from "@/lib/redux/slices/pickupSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/data-tables/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/hooks/use-toast";
import StatusBadge from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  PlusCircle,
  FileDown,
  MoreHorizontal,
  Search,
  Calendar,
  Truck,
  User,
  Building,
  Filter,
  XCircle,
  CheckCircle,
  Clock,
  MapPin,
  Eye,
  Edit,
  Loader2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { vehicleAPI, pegawaiAPI, cabangAPI } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function PickupsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const {
    pickups = [],
    loading,
    error,
    pagination,
  } = useSelector((state) => state.pickup);

  // State for UI controls
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // State for reference data
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [branches, setBranches] = useState([]);

  // State for modals
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    id: null,
    status: null,
    notes: "",
  });

  // Get user data from Redux store
  const user = useSelector((state) => state.auth.currentUser) || {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
    role: "admin", // Default role
  };
  
  // Role-based permission check utility
  const hasPermission = (action) => {
    const role = user?.role?.toLowerCase() || "guest";
    
    // Define permissions for different roles
    const permissions = {
      admin: ["view", "create", "edit", "delete", "change_status"],
      manager: ["view", "create", "edit", "change_status"],
      operator: ["view", "create", "change_status"],
      driver: ["view", "change_status"],
      guest: ["view"]
    };
    
    // Check if user's role has permission for the action
    return permissions[role]?.includes(action) || false;
  };

  // Improved filters state with defaults
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    dateFrom: "",
    dateTo: "",
    supirId: "",
    kendaraanId: "",
    cabangId: "",
    page: 1,
    limit: 10,
    sort: "-tanggal",
  });

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [driversRes, vehiclesRes, branchesRes] = await Promise.all([
          pegawaiAPI.getAll(),
          vehicleAPI.getAll(),
          cabangAPI.getAll(),
        ]);

        // Process and set reference data
        setDrivers(driversRes.data.data || []);
        setVehicles(vehiclesRes.data.data || []);
        setBranches(branchesRes.data.data || []);
      } catch (error) {
        console.error("Error fetching reference data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data referensi",
          variant: "destructive",
        });
      }
    };

    fetchReferenceData();
  }, [toast]);

  // Handle filter changes with validation
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value === "ALL" ? "" : value,
      };

      // Reset page when filters change except page filter itself
      if (key !== "page") {
        newFilters.page = 1;
      }

      // Validate date range if both dates exist
      if (
        (key === "dateFrom" && prev.dateTo) ||
        (key === "dateTo" && prev.dateFrom)
      ) {
        const startDate = key === "dateFrom" ? value : prev.dateFrom;
        const endDate = key === "dateTo" ? value : prev.dateTo;

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          toast({
            title: "Error",
            description:
              "Tanggal awal tidak boleh lebih besar dari tanggal akhir",
            variant: "destructive",
          });
          return prev;
        }
      }

      return newFilters;
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      supirId: "",
      kendaraanId: "",
      cabangId: "",
      page: 1,
      limit: 10,
      sort: "-tanggal",
    });
    setActiveTab("all");
  };

  // Fetch pickups when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Build query parameters
        const params = {
          ...(filters.status && { status: filters.status }),
          ...(filters.search && { search: filters.search }),
          ...(filters.dateFrom && { startDate: filters.dateFrom }),
          ...(filters.dateTo && { endDate: filters.dateTo }),
          ...(filters.supirId && { supirId: filters.supirId }),
          ...(filters.kendaraanId && { kendaraanId: filters.kendaraanId }),
          ...(filters.cabangId &&
            filters.cabangId !== "ALL" && { cabangId: filters.cabangId }),
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
        };

        await dispatch(fetchPickups(params)).unwrap();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Gagal mengambil data pengambilan",
          variant: "destructive",
        });
      }
    };

    // Add debounce for search to prevent too many API calls
    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [dispatch, filters, toast]);

  // Open status change dialog
  const openStatusDialog = (id, status) => {
    setStatusDialog({
      isOpen: true,
      id,
      status,
      notes: "",
    });
  };

  // Close status change dialog
  const closeStatusDialog = () => {
    setStatusDialog({
      isOpen: false,
      id: null,
      status: null,
      notes: "",
    });
  };

  // Handle status changes
  const handleStatusChange = async () => {
    const { id, status, notes } = statusDialog;

    try {
      // Show loading toast
      toast({
        title: "Mengubah status...",
        description: "Mohon tunggu sebentar",
      });

      await dispatch(updatePickupStatus({ id, status, notes })).unwrap();

      // Determine appropriate message based on status
      const statusMessages = {
        BERANGKAT: {
          title: "Pengambilan Berangkat",
          description: "Pengambilan sedang dalam perjalanan",
          icon: <Truck className="h-4 w-4" />,
        },
        SELESAI: {
          title: "Pengambilan Selesai",
          description: "Pengambilan telah selesai dilakukan",
          icon: <CheckCircle className="h-4 w-4" />,
        },
        CANCELLED: {
          title: "Pengambilan Dibatalkan",
          description: "Pengambilan telah dibatalkan",
          icon: <XCircle className="h-4 w-4" />,
        },
        PENDING: {
          title: "Pengambilan Diaktifkan",
          description: "Pengambilan telah diaktifkan kembali",
          icon: <Clock className="h-4 w-4" />,
        },
      };

      const statusInfo = statusMessages[status] || {
        title: "Status Diubah",
        description: `Status diubah menjadi ${status}`,
      };

      toast({
        title: statusInfo.title,
        description: statusInfo.description,
        icon: statusInfo.icon,
        variant: status === "CANCELLED" ? "destructive" : "default",
      });

      // Close the dialog
      closeStatusDialog();

      // Refresh data
      dispatch(
        fetchPickups({
          ...filters,
          page: pagination.currentPage,
        })
      );
    } catch (error) {
      toast({
        title: "Gagal mengubah status",
        description: error.message || "Terjadi kesalahan saat mengubah status",
        variant: "destructive",
      });
      closeStatusDialog();
    }
  };

  // Enhanced table columns configuration
  const columns = [
    {
      accessorKey: "noPengambilan",
      header: "No Pengambilan",
      cell: ({ row }) => (
        <div className="font-medium">
          <Link
            href={`/pengambilan/${row.original._id}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.original.noPengambilan || "-"}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{formatDate(row.original.tanggal)}</span>
        </div>
      ),
      sortable: true,
    },
    {
      accessorKey: "pengirim",
      header: "Pengirim",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          {row.original.pengirimId ? (
            typeof row.original.pengirimId === "object" ? (
              <Link
                href={`/pelanggan/${row.original.pengirimId._id}`}
                className="text-gray-900 hover:text-blue-600"
              >
                {row.original.pengirimId.nama || "-"}
              </Link>
            ) : (
              <span className="text-gray-500">ID: {row.original.pengirimId}</span>
            )
          ) : (
            <span className="text-gray-500">
              {row.original.namaPengirim || "-"}
            </span>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      accessorKey: "alamatPengambilan",
      header: "Alamat Pengambilan",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <div
            className="max-w-[200px] truncate text-sm text-gray-600"
            title={row.original.alamatPengambilan}
          >
            {row.original.alamatPengambilan || "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "tujuan",
      header: "Tujuan",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <div
            className="max-w-[200px] truncate text-sm text-gray-600"
            title={row.original.tujuan}
          >
            {row.original.tujuan || "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "jumlahColly",
      header: "Jumlah Colly",
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.jumlahColly || 0}
        </div>
      ),
      sortable: true,
    },
    {
      accessorKey: "supir",
      header: "Supir",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          {row.original.supirId ? (
            typeof row.original.supirId === 'object' ? (
              <Link
                href={`/pegawai/${row.original.supirId._id}`}
                className="text-gray-900 hover:text-blue-600"
              >
                {row.original.supirId.nama || "-"}
              </Link>
            ) : (
              <span className="text-gray-500">ID: {row.original.supirId}</span>
            )
          ) : (
            <span className="text-gray-500">{row.original.namaSupir || "-"}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "kendaraan",
      header: "Kendaraan",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-gray-500" />
          {row.original.kendaraanId ? (
            typeof row.original.kendaraanId === 'object' ? (
              <Link
                href={`/kendaraan/${row.original.kendaraanId._id}`}
                className="text-gray-900 hover:text-blue-600"
              >
                {`${row.original.kendaraanId.namaKendaraan || ""} ${
                  row.original.kendaraanId.noPolisi
                    ? `- ${row.original.kendaraanId.noPolisi}`
                    : ""
                }`}
              </Link>
            ) : (
              <span className="text-gray-500">ID: {row.original.kendaraanId}</span>
            )
          ) : (
            <span className="text-gray-500">{row.original.namaKendaraan || "-"}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "estimasiPengambilan",
      header: "Estimasi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {row.original.estimasiPengambilan
              ? formatDate(row.original.estimasiPengambilan, true)
              : "-"}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge status={row.original.status} type="pickup" />
        </div>
      ),
      sortable: true,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            {/* View details - available to all users with view permission */}
            {hasPermission("view") && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/pengambilan/${row.original._id}`}
                  className="flex items-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Detail</span>
                </Link>
              </DropdownMenuItem>
            )}
            
            {/* Edit - only for users with edit permission */}
            {hasPermission("edit") && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/pengambilan/edit/${row.original._id}`}
                  className="flex items-center"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </Link>
              </DropdownMenuItem>
            )}

            {/* Status change actions - only for users with change_status permission */}
            {hasPermission("change_status") && (
              <>
                {row.original.status === "PENDING" && (
                  <DropdownMenuItem
                    onClick={() => openStatusDialog(row.original._id, "BERANGKAT")}
                    className="text-blue-600"
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    <span>Berangkat</span>
                  </DropdownMenuItem>
                )}

                {row.original.status === "BERANGKAT" && (
                  <DropdownMenuItem
                    onClick={() => openStatusDialog(row.original._id, "SELESAI")}
                    className="text-green-600"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Selesai</span>
                  </DropdownMenuItem>
                )}

                {["PENDING", "BERANGKAT"].includes(row.original.status) && (
                  <DropdownMenuItem
                    onClick={() => openStatusDialog(row.original._id, "CANCELLED")}
                    className="text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    <span>Batalkan</span>
                  </DropdownMenuItem>
                )}

                {row.original.status === "CANCELLED" && (
                  <DropdownMenuItem
                    onClick={() => openStatusDialog(row.original._id, "PENDING")}
                    className="text-amber-600"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Aktifkan Kembali</span>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Get tab counts
  const getTabCounts = () => {
    const counts = {
      all: pagination.total || 0,
      pending: pickups.filter((p) => p.status === "PENDING").length,
      berangkat: pickups.filter((p) => p.status === "BERANGKAT").length,
      selesai: pickups.filter((p) => p.status === "SELESAI").length,
      cancelled: pickups.filter((p) => p.status === "CANCELLED").length,
    };
    return counts;
  };

  const tabCounts = getTabCounts();

  // Handle pagination
  const handlePageChange = (page) => {
    handleFilterChange("page", page);
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
  ];

  // Function to get status dependent icons and colors
  const getStatusAttributes = (status) => {
    switch (status) {
      case "BERANGKAT":
        return {
          icon: <Truck className="h-6 w-6 text-blue-600" />,
          color: "bg-blue-50 border-blue-200 text-blue-700",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
          title: "Konfirmasi Keberangkatan",
          description: "Pengambilan akan diubah menjadi status berangkat",
        };
      case "SELESAI":
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          color: "bg-green-50 border-green-200 text-green-700",
          button: "bg-green-600 hover:bg-green-700 text-white",
          title: "Konfirmasi Penyelesaian",
          description: "Pastikan barang telah diambil dengan lengkap",
        };
      case "CANCELLED":
        return {
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          color: "bg-red-50 border-red-200 text-red-700",
          button: "bg-red-600 hover:bg-red-700 text-white",
          title: "Konfirmasi Pembatalan",
          description: "Pengambilan akan dibatalkan",
        };
      case "PENDING":
        return {
          icon: <Clock className="h-6 w-6 text-amber-600" />,
          color: "bg-amber-50 border-amber-200 text-amber-700",
          button: "bg-amber-600 hover:bg-amber-700 text-white",
          title: "Aktifkan Kembali",
          description: "Pengambilan akan diaktifkan kembali",
        };
      default:
        return {
          icon: null,
          color: "bg-gray-50 border-gray-200 text-gray-700",
          button: "bg-gray-600 hover:bg-gray-700 text-white",
          title: "Konfirmasi",
          description: "Konfirmasi perubahan status",
        };
    }
  };

  const statusAttr = getStatusAttributes(statusDialog.status);

  // Error handling UI
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuButtonClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              <Breadcrumbs items={breadcrumbItems} />
              <Card className="mt-6 border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-red-100 p-3 text-red-600">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-red-700">
                      Error
                    </h3>
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                    <Button
                      variant="outline"
                      className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => dispatch(fetchPickups(filters))}
                    >
                      Coba Lagi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuButtonClick={() => setSidebarOpen(true)} user={user} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-lxl space-y-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pengambilan Barang
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Kelola pengambilan barang dari pelanggan
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {hasPermission("create") && (
                  <Button
                    asChild
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  >
                    <Link href="/pengambilan/tambah">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Tambah Pengambilan
                    </Link>
                  </Button>
                )}
                {hasPermission("view") && (
                  <Button variant="outline" className="w-full sm:w-auto">
                    <FileDown className="mr-2 h-4 w-4" />
                    Ekspor Data
                  </Button>
                )}
              </div>
            </div>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-1">
                <div className="flex justify-between items-center">
                  <CardTitle>Daftar Pengambilan</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiltersVisible(!filtersVisible)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {filtersVisible ? "Sembunyikan Filter" : "Tampilkan Filter"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Enhanced Filter section with better organization */}
                {filtersVisible && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg border shadow-sm">
                    <div className="space-y-6">
                      {/* Quick Search */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Label
                            htmlFor="search"
                            className="text-sm font-medium text-gray-700"
                          >
                            Pencarian Cepat
                          </Label>
                          <div className="relative mt-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              id="search"
                              placeholder="Cari no. pengambilan, pengirim..."
                              value={filters.search}
                              onChange={(e) =>
                                handleFilterChange("search", e.target.value)
                              }
                              className="pl-8 bg-white"
                            />
                          </div>
                        </div>
                        <div className="w-full sm:w-48">
                          <Label
                            htmlFor="status"
                            className="text-sm font-medium text-gray-700"
                          >
                            Status
                          </Label>
                          <Select
                            value={filters.status || "ALL"}
                            onValueChange={(value) =>
                              handleFilterChange("status", value)
                            }
                            className="mt-1"
                          >
                            <SelectTrigger id="status" className="bg-white">
                              <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">Semua Status</SelectItem>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="BERANGKAT">
                                Berangkat
                              </SelectItem>
                              <SelectItem value="SELESAI">Selesai</SelectItem>
                              <SelectItem value="CANCELLED">
                                Dibatalkan
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Date Range */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Rentang Tanggal
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dateFrom" className="sr-only">
                              Dari Tanggal
                            </Label>
                            <div className="relative">
                              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                id="dateFrom"
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) =>
                                  handleFilterChange("dateFrom", e.target.value)
                                }
                                className="pl-8 bg-white"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="dateTo" className="sr-only">
                              Sampai Tanggal
                            </Label>
                            <div className="relative">
                              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                              <Input
                                id="dateTo"
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) =>
                                  handleFilterChange("dateTo", e.target.value)
                                }
                                className="pl-8 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Filters */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700">
                          Filter Tambahan
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="supirId" className="sr-only">
                              Supir
                            </Label>
                            <Select
                              value={filters.supirId || "ALL"}
                              onValueChange={(value) =>
                                handleFilterChange("supirId", value)
                              }
                            >
                              <SelectTrigger id="supirId" className="bg-white">
                                <SelectValue placeholder="Pilih Supir" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALL">Semua Supir</SelectItem>
                                {drivers.map((driver) => (
                                  <SelectItem
                                    key={driver._id}
                                    value={driver._id}
                                  >
                                    {driver.nama}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="kendaraanId" className="sr-only">
                              Kendaraan
                            </Label>
                            <Select
                              value={filters.kendaraanId || "ALL"}
                              onValueChange={(value) =>
                                handleFilterChange("kendaraanId", value)
                              }
                            >
                              <SelectTrigger
                                id="kendaraanId"
                                className="bg-white"
                              >
                                <SelectValue placeholder="Pilih Kendaraan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALL">
                                  Semua Kendaraan
                                </SelectItem>
                                {vehicles.map((vehicle) => (
                                  <SelectItem
                                    key={vehicle._id}
                                    value={vehicle._id}
                                  >
                                    {vehicle.namaKendaraan} - {vehicle.noPolisi}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="cabangId" className="sr-only">
                              Cabang
                            </Label>
                            <Select
                              value={filters.cabangId || "ALL"}
                              onValueChange={(value) =>
                                handleFilterChange("cabangId", value)
                              }
                            >
                              <SelectTrigger id="cabangId" className="bg-white">
                                <SelectValue placeholder="Pilih Cabang" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALL">
                                  Semua Cabang
                                </SelectItem>
                                {branches && branches.length > 0 ? (
                                  branches.map((branch) => (
                                    <SelectItem
                                      key={branch._id}
                                      value={branch._id}
                                    >
                                      {branch.nama}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="" disabled>
                                    Tidak ada data cabang tersedia
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={resetFilters}
                          className="bg-white"
                        >
                          Reset Filter
                        </Button>
                        <Button
                          onClick={() => setFiltersVisible(false)}
                          variant="outline"
                          className="bg-white"
                        >
                          Tutup Filter
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Tabs
                  value={activeTab}
                  onValueChange={(value) => {
                    setActiveTab(value);
                    if (value === "all") {
                      handleFilterChange("status", "");
                    } else {
                      handleFilterChange("status", value.toUpperCase());
                    }
                  }}
                  className="mt-2"
                >
                  <TabsList className="mb-4 bg-gray-100/80 p-1">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <span>Semua</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                          {tabCounts.all}
                        </span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="pending"
                      className="data-[state=active]:bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <span>Pending</span>
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                          {tabCounts.pending}
                        </span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="berangkat"
                      className="data-[state=active]:bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <span>Berangkat</span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {tabCounts.berangkat}
                        </span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="selesai"
                      className="data-[state=active]:bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <span>Selesai</span>
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          {tabCounts.selesai}
                        </span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="cancelled"
                      className="data-[state=active]:bg-white"
                    >
                      <div className="flex items-center gap-2">
                        <span>Dibatalkan</span>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          {tabCounts.cancelled}
                        </span>
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-4">
                    {loading ? (
                      <div className="rounded-md border bg-white p-4">
                        <div className="space-y-3">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-md border bg-white overflow-auto">
                        <div className="min-w-full">
                          <DataTable
                            columns={columns}
                            data={pickups}
                            pagination={{
                              pageCount: pagination.totalPages,
                              pageIndex: pagination.currentPage - 1,
                              pageSize: pagination.limit,
                              total: pagination.total,
                              onPageChange: handlePageChange,
                            }}
                            emptyMessage={
                              <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="rounded-full bg-gray-100 p-3">
                                  <Search className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">
                                  Tidak ada data
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {filters.search
                                    ? "Tidak ada data yang sesuai dengan pencarian"
                                    : `Tidak ada data pengambilan ${
                                        filters.status
                                          ? `dengan status ${filters.status}`
                                          : ""
                                      }`}
                                </p>
                                {Object.values(filters).some(
                                  (filter) => filter && filter !== "ALL"
                                ) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="mt-4"
                                  >
                                    Reset Filter
                                  </Button>
                                )}
                              </div>
                            }
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Status Change Dialog - Only shown if user has change_status permission */}
      {hasPermission("change_status") && (
        <Dialog open={statusDialog.isOpen} onOpenChange={closeStatusDialog}>
          <DialogContent className={`sm:max-w-md ${statusAttr.color}`}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-full ${
                    statusAttr.status === "CANCELLED"
                      ? "bg-red-100"
                      : statusAttr.status === "SELESAI"
                      ? "bg-green-100"
                      : statusAttr.status === "BERANGKAT"
                      ? "bg-blue-100"
                      : "bg-amber-100"
                  }`}
                >
                  {statusAttr.icon}
                </div>
                <span>{statusAttr.title}</span>
              </DialogTitle>
              <DialogDescription>{statusAttr.description}</DialogDescription>
            </DialogHeader>

            {statusDialog.status === "CANCELLED" && (
              <div className="py-4">
                <Label htmlFor="cancelNotes" className="mb-2 block">
                  Alasan Pembatalan
                </Label>
                <Input
                  id="cancelNotes"
                  value={statusDialog.notes}
                  onChange={(e) =>
                    setStatusDialog((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Masukkan alasan pembatalan"
                  className="w-full"
                  required={statusDialog.status === "CANCELLED"}
                />
              </div>
            )}

            <DialogFooter className="sm:justify-end">
              <Button type="button" variant="outline" onClick={closeStatusDialog}>
                Batal
              </Button>
              <Button
                type="button"
                className={statusAttr.button}
                onClick={handleStatusChange}
                disabled={
                  statusDialog.status === "CANCELLED" && !statusDialog.notes
                }
              >
                Konfirmasi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
