// app/pengambilan/page.js
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
  X,
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
import { vehicleAPI, pegawaiAPI, cabangAPI } from "@/lib/api";

export default function PickupsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const {
    pickups = [],
    loading,
    error,
    pagination,
  } = useSelector((state) => state.pickup);
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Improved filters state
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
          pegawaiAPI.getAll({ role: "DRIVER" }),
          vehicleAPI.getAll(),
          cabangAPI.getAll(),
        ]);

        // Log the branch response to see what's coming back
        console.log("Branches response:", branchesRes);

        setDrivers(driversRes.data.data || []);
        setVehicles(vehiclesRes.data.data || []);
        // Ensure we're setting the branches data correctly
        // If data structure is different than expected, adjust accordingly
        const branchesData = branchesRes.data.data || [];
        console.log("Branches data to be set:", branchesData);
        setBranches(branchesData);
      } catch (error) {
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

      // Reset page when filters change
      if (key !== "page") {
        newFilters.page = 1;
      }

      // Validate date range
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

        // Validate date range
        if (filters.dateFrom && filters.dateTo) {
          const startDate = new Date(filters.dateFrom);
          const endDate = new Date(filters.dateTo);

          if (startDate > endDate) {
            throw new Error(
              "Tanggal awal tidak boleh lebih besar dari tanggal akhir"
            );
          }
        }

        await dispatch(fetchPickups(params)).unwrap();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Gagal mengambil data pengambilan",
          variant: "destructive",
        });
      }
    };

    // Add debounce for search
    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [dispatch, filters, toast]);

  // Handle status changes with notes
  const handleStatusChange = async (id, status) => {
    try {
      let notes;
      
      // Request notes for CANCELLED status
      if (status === "CANCELLED") {
        const result = await new Promise((resolve) => {
          const dialog = document.createElement("dialog");
          dialog.innerHTML = `
            <form method="dialog" class="p-4">
              <h3 class="text-lg font-semibold mb-4">Alasan Pembatalan</h3>
              <textarea
                id="cancelNotes"
                class="w-full p-2 border rounded mb-4"
                placeholder="Masukkan alasan pembatalan"
                required
              ></textarea>
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="px-4 py-2 border rounded"
                  onclick="this.closest('dialog').close(null)"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Konfirmasi
                </button>
              </div>
            </form>
          `;
          
          dialog.addEventListener("close", () => {
            const notes = dialog.querySelector("#cancelNotes")?.value;
            resolve(notes);
            dialog.remove();
          });
          
          document.body.appendChild(dialog);
          dialog.showModal();
        });
        
        if (!result) return; // User cancelled
        notes = result;
      }

      // Add confirmation for SELESAI status
      if (status === "SELESAI") {
        const confirmed = await new Promise((resolve) => {
          const dialog = document.createElement("dialog");
          dialog.innerHTML = `
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Konfirmasi Penyelesaian</h3>
              <p class="mb-4">Pastikan barang telah diambil dengan lengkap.</p>
              <div class="flex justify-end gap-2">
                <button
                  class="px-4 py-2 border rounded"
                  onclick="this.closest('dialog').close(false)"
                >
                  Batal
                </button>
                <button
                  class="px-4 py-2 bg-green-600 text-white rounded"
                  onclick="this.closest('dialog').close(true)"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          `;
          
          dialog.addEventListener("close", () => {
            resolve(dialog.returnValue === "true");
            dialog.remove();
          });
          
          document.body.appendChild(dialog);
          dialog.showModal();
        });
        
        if (!confirmed) return;
      }

      await dispatch(updatePickupStatus({ id, status, notes })).unwrap();
      
      const statusMessages = {
        BERANGKAT: "Pengambilan sedang dalam perjalanan",
        SELESAI: "Pengambilan telah selesai dilakukan",
        CANCELLED: "Pengambilan telah dibatalkan",
      };

      toast({
        title: "Status berhasil diubah",
        description: statusMessages[status] || `Status diubah menjadi ${status}`,
        variant: status === "CANCELLED" ? "destructive" : "default",
      });

      // Refresh data
      dispatch(
        fetchPickups({
          ...filters,
          page: pagination.page,
        })
      );
    } catch (error) {
      toast({
        title: "Gagal mengubah status",
        description: error.message || "Terjadi kesalahan saat mengubah status",
        variant: "destructive",
      });
    }
  };

  // Table columns configuration
  const columns = [
    {
      accessorKey: "noPengambilan",
      header: "No Pengambilan",
      cell: ({ row }) => (
        <Link
          href={`/pengambilan/${row.original._id}`}
          className="font-medium hover:underline"
        >
          {row.original.noPengambilan}
        </Link>
      ),
    },
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => formatDate(row.original.tanggal),
      sortable: true,
    },
    {
      accessorKey: "pengirim",
      header: "Pengirim",
      cell: ({ row }) => (
        <Link
          href={`/pelanggan/${row.original.pengirimId?._id}`}
          className="hover:underline"
        >
          {row.original.pengirimId?.nama || "-"}
        </Link>
      ),
      sortable: true,
    },
    {
      accessorKey: "alamatPengambilan",
      header: "Alamat Pengambilan",
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate"
          title={row.original.alamatPengambilan}
        >
          {row.original.alamatPengambilan}
        </div>
      ),
    },
    {
      accessorKey: "tujuan",
      header: "Tujuan",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.tujuan}>
          {row.original.tujuan}
        </div>
      ),
    },
    {
      accessorKey: "jumlahColly",
      header: "Jumlah Colly",
      sortable: true,
    },
    {
      accessorKey: "supir",
      header: "Supir",
      cell: ({ row }) => (
        <Link
          href={`/pegawai/${row.original.supirId?._id}`}
          className="hover:underline"
        >
          {row.original.supirId?.nama || "-"}
        </Link>
      ),
    },
    {
      accessorKey: "kendaraan",
      header: "Kendaraan",
      cell: ({ row }) => (
        <Link
          href={`/kendaraan/${row.original.kendaraanId?._id}`}
          className="hover:underline"
        >
          {row.original.kendaraanId
            ? `${row.original.kendaraanId.namaKendaraan} - ${row.original.kendaraanId.noPolisi}`
            : "-"}
        </Link>
      ),
    },
    {
      accessorKey: "estimasiPengambilan",
      header: "Estimasi",
      cell: ({ row }) => formatDate(row.original.estimasiPengambilan, true),
      sortable: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} type="pickup" />
      ),
      sortable: true,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/pengambilan/${row.original._id}`}>Detail</Link>
            </DropdownMenuItem>

            {row.original.status === "PENDING" && (
              <DropdownMenuItem
                onClick={() =>
                  handleStatusChange(row.original._id, "BERANGKAT")
                }
              >
                Berangkat
              </DropdownMenuItem>
            )}

            {row.original.status === "BERANGKAT" && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(row.original._id, "SELESAI")}
              >
                Selesai
              </DropdownMenuItem>
            )}

            {["PENDING", "BERANGKAT"].includes(row.original.status) && (
              <DropdownMenuItem
                onClick={() =>
                  handleStatusChange(row.original._id, "CANCELLED")
                }
                className="text-red-600"
              >
                Batalkan
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Handle pagination
  const handlePageChange = (page) => {
    handleFilterChange("page", page);
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
  ];

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
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-red-100 p-3 text-red-600">
                      <X className="h-6 w-6" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium">Error</h3>
                    <p className="mt-1 text-sm text-gray-500">{error}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuButtonClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex justify-between items-center mb-4 mt-4">
              <h1 className="text-2xl font-bold">Pengambilan Barang</h1>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/pengambilan/tambah">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Pengambilan
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
                <div className="flex justify-between items-center">
                  <CardTitle>Daftar Pengambilan</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiltersVisible(!filtersVisible)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {filtersVisible ? "Sembunyikan Filter" : "Tampilkan Filter"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Enhanced Filter section */}
                {filtersVisible && (
                  <div className="mb-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="relative">
                        <Label htmlFor="search">Cari</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="search"
                            placeholder="No. Pengambilan, Pengirim..."
                            value={filters.search}
                            onChange={(e) =>
                              handleFilterChange("search", e.target.value)
                            }
                            className="pl-8"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={filters.status || "ALL"}
                          onValueChange={(value) =>
                            handleFilterChange("status", value)
                          }
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Semua Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Semua Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="BERANGKAT">Berangkat</SelectItem>
                            <SelectItem value="SELESAI">Selesai</SelectItem>
                            <SelectItem value="CANCELLED">
                              Dibatalkan
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="supirId">Supir</Label>
                        <Select
                          value={filters.supirId || "ALL"}
                          onValueChange={(value) =>
                            handleFilterChange("supirId", value)
                          }
                        >
                          <SelectTrigger id="supirId">
                            <SelectValue placeholder="Pilih Supir" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Semua Supir</SelectItem>
                            {drivers.map((driver) => (
                              <SelectItem key={driver._id} value={driver._id}>
                                {driver.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="kendaraanId">Kendaraan</Label>
                        <Select
                          value={filters.kendaraanId || "ALL"}
                          onValueChange={(value) =>
                            handleFilterChange("kendaraanId", value)
                          }
                        >
                          <SelectTrigger id="kendaraanId">
                            <SelectValue placeholder="Pilih Kendaraan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Semua Kendaraan</SelectItem>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle._id} value={vehicle._id}>
                                {vehicle.namaKendaraan} - {vehicle.noPolisi}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <Label htmlFor="dateFrom">Dari Tanggal</Label>
                        <div className="relative">
                          <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dateFrom"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) =>
                              handleFilterChange("dateFrom", e.target.value)
                            }
                            className="pl-8"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="dateTo">Sampai Tanggal</Label>
                        <div className="relative">
                          <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dateTo"
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) =>
                              handleFilterChange("dateTo", e.target.value)
                            }
                            className="pl-8"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cabangId">Cabang</Label>
                        <Select
                          value={filters.cabangId || "ALL"}
                          onValueChange={(value) =>
                            handleFilterChange("cabangId", value)
                          }
                        >
                          <SelectTrigger id="cabangId">
                            <SelectValue placeholder="Pilih Cabang" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Semua Cabang</SelectItem>
                            {branches && branches.length > 0 ? (
                              branches.map((branch) => (
                                <SelectItem key={branch._id} value={branch._id}>
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

                    <div className="flex justify-end">
                      <Button variant="outline" onClick={resetFilters}>
                        Reset Filter
                      </Button>
                    </div>
                  </div>
                )}

                <Tabs
                  defaultValue="all"
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
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">Semua</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="berangkat">Berangkat</TabsTrigger>
                    <TabsTrigger value="selesai">Selesai</TabsTrigger>
                    <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab}>
                    <DataTable
                      columns={columns}
                      data={pickups}
                      loading={loading}
                      pagination={{
                        pageCount: pagination.totalPages,
                        pageIndex: pagination.page - 1,
                        pageSize: pagination.limit,
                        total: pagination.total,
                        onPageChange: handlePageChange,
                      }}
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
