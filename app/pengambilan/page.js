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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/hooks/use-toast";
import StatusBadge from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle, FileDown } from "lucide-react";
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

export default function PickupsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { pickups = [], loading, error } = useSelector((state) => state.pickup);
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  // Enhance the filter handling
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Add reset filters function
  const resetFilters = () => {
    setFilters({
      status: "",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
    setActiveTab("all");
  };

  // useEffect(() => {
  //   const params = {
  //     ...(filters.status && { status: filters.status }),
  //     ...(filters.search && { search: filters.search }),
  //     ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
  //     ...(filters.dateTo && { dateTo: filters.dateTo }),
  //   };

  //   dispatch(fetchPickups(params));
  // }, [dispatch, filters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          ...(filters.status && { status: filters.status }),
          ...(filters.search && { search: filters.search }),
          ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
          ...(filters.dateTo && { dateTo: filters.dateTo }),
        };
        await dispatch(fetchPickups(params)).unwrap();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch pickups",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [dispatch, filters, toast]);

  // Add error handling UI
  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const filteredData = (pickups || []).filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab.toUpperCase();
  });

  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updatePickupStatus({ id, status })).unwrap();
      toast({
        title: "Status berhasil diubah",
        description: `Status pengambilan berhasil diubah menjadi ${status}`,
      });
    } catch (error) {
      toast({
        title: "Gagal mengubah status",
        description: error.message || "Terjadi kesalahan saat mengubah status",
        variant: "destructive",
      });
    }
  };

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
    },
    {
      accessorKey: "pengirim",
      header: "Pengirim",
      cell: ({ row }) => row.original.pengirimId?.nama || "-",
    },
    {
      accessorKey: "alamatPengambilan",
      header: "Alamat Pengambilan",
    },
    {
      accessorKey: "jumlahColly",
      header: "Jumlah Colly",
    },
    {
      accessorKey: "supir",
      header: "Supir",
      cell: ({ row }) => row.original.supirId?.nama || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} type="pickup" />
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/pengambilan/${row.original._id}`}>
            <Button variant="ghost" size="sm">
              Detail
            </Button>
          </Link>
          {row.original.status === "PENDING" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(row.original._id, "BERANGKAT")}
            >
              Berangkat
            </Button>
          )}
          {row.original.status === "BERANGKAT" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(row.original._id, "SELESAI")}
            >
              Selesai
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
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
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={mockUser}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuButtonClick={() => setSidebarOpen(true)}
          user={mockUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-lxl space-y-6">
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
                <CardTitle>Daftar Pengambilan</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filter section */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div>
                    <Label htmlFor="search">Cari</Label>
                    <Input
                      id="search"
                      placeholder="No. Pengambilan, Pengirim..."
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        handleFilterChange("status", value)
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Semua Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="BERANGKAT">Berangkat</SelectItem>
                        <SelectItem value="SELESAI">Selesai</SelectItem>
                        <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFrom">Dari Tanggal</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        handleFilterChange("dateFrom", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo">Sampai Tanggal</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        handleFilterChange("dateTo", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mb-4 flex justify-end">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                </div>
                <Tabs
                  defaultValue="all"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="mt-2"
                >
                  <TabsContent value={activeTab} className="p-0 mt-2">
                    <DataTable
                      columns={columns}
                      data={filteredData}
                      loading={loading}
                      searchPlaceholder="Cari pengambilan..."
                      searchColumn="noPengambilan"
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
