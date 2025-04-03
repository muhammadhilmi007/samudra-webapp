"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTruckQueues,
  updateTruckQueueStatus,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/truckQueueSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Truck,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function TruckQueuePage() {
  const dispatch = useDispatch();
  const { truckQueues, loading, error, success } = useSelector((state) => state.truckQueue);
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Mock user data
  const user = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Muatan", link: "/muat" },
    { title: "Antrian Truck", link: "/muat/antrian", active: true },
  ];

  useEffect(() => {
    dispatch(fetchTruckQueues());
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
        description: "Operasi antrian truck berhasil dilakukan",
        variant: "success",
      });
      dispatch(clearSuccess());
    }
  }, [error, success, toast, dispatch]);

  const handleChangeStatus = (truck, status) => {
    setSelectedTruck(truck);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const confirmChangeStatus = () => {
    if (selectedTruck && newStatus) {
      dispatch(updateTruckQueueStatus({
        id: selectedTruck._id,
        status: newStatus
      }));
      setStatusDialogOpen(false);
    }
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out...");
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      "MENUNGGU": { label: "Menunggu", variant: "secondary", icon: Clock },
      "MUAT": { label: "Dalam Pemuatan", variant: "warning", icon: Loader2 },
      "BERANGKAT": { label: "Berangkat", variant: "success", icon: CheckCircle },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "secondary",
      icon: AlertCircle,
    };

    const Icon = statusInfo.icon;

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        <span>{statusInfo.label}</span>
      </Badge>
    );
  };

  // Filter truck queues by status
  const getQueuesByStatus = (status) => {
    return truckQueues.filter(queue => queue.status === status);
  };

  // Render truck queue card
  const renderTruckCard = (queue) => {
    const truck = queue.truckId;
    const supir = queue.supirId;

    return (
      <Card key={queue._id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{truck?.noPolisi || "No. Polisi"}</CardTitle>
              <CardDescription>{truck?.namaKendaraan || "Nama Kendaraan"}</CardDescription>
            </div>
            {getStatusBadge(queue.status)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Supir:</span> {supir?.nama || "Nama Supir"}
            </div>
            <div>
              <span className="font-medium">No. Telp:</span> {queue.noTelp || "-"}
            </div>
            <div>
              <span className="font-medium">Urutan:</span> {queue.urutan || "-"}
            </div>
            <div>
              <span className="font-medium">Tanggal:</span> {formatDate(queue.createdAt)}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex gap-2 w-full">
            {queue.status === "MENUNGGU" && (
              <Button 
                className="flex-1" 
                onClick={() => handleChangeStatus(queue, "MUAT")}
              >
                Mulai Muat
              </Button>
            )}
            
            {queue.status === "MUAT" && (
              <Button 
                className="flex-1" 
                onClick={() => handleChangeStatus(queue, "BERANGKAT")}
              >
                Berangkat
              </Button>
            )}
            
            {queue.status === "BERANGKAT" && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = `/muat/tambah?truckId=${queue._id}`}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Lihat Muatan
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              className="flex-1"
              onClick={() => console.log("View details", queue)}
            >
              Detail
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
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
                  Antrian Truck
                </h1>
                <p className="text-muted-foreground">
                  Kelola antrian truck untuk pemuatan barang
                </p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Truck
              </Button>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="mb-2 h-5 w-5" />
                <p>Gagal memuat data antrian truck: {error}</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && truckQueues.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <Truck className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">Belum ada antrian truck</h3>
                <p className="mt-2 text-muted-foreground">
                  Tambahkan truck ke dalam antrian untuk memulai proses pemuatan.
                </p>
                <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Truck
                </Button>
              </div>
            )}

            {/* Truck queues */}
            {!loading && !error && truckQueues.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Waiting trucks */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Menunggu</h2>
                  {getQueuesByStatus("MENUNGGU").map(renderTruckCard)}
                  {getQueuesByStatus("MENUNGGU").length === 0 && (
                    <p className="text-muted-foreground text-center p-4 bg-white rounded-lg border">
                      Tidak ada truck yang menunggu
                    </p>
                  )}
                </div>

                {/* Loading trucks */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Dalam Pemuatan</h2>
                  {getQueuesByStatus("MUAT").map(renderTruckCard)}
                  {getQueuesByStatus("MUAT").length === 0 && (
                    <p className="text-muted-foreground text-center p-4 bg-white rounded-lg border">
                      Tidak ada truck dalam proses pemuatan
                    </p>
                  )}
                </div>

                {/* Departed trucks */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Berangkat</h2>
                  {getQueuesByStatus("BERANGKAT").map(renderTruckCard)}
                  {getQueuesByStatus("BERANGKAT").length === 0 && (
                    <p className="text-muted-foreground text-center p-4 bg-white rounded-lg border">
                      Tidak ada truck yang berangkat
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Truck Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Truck ke Antrian</DialogTitle>
            <DialogDescription>
              Tambahkan truck baru ke dalam antrian pemuatan barang.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="truck" className="text-right text-sm font-medium">
                Truck
              </label>
              <Select className="col-span-3">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih truck" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck1">B 1234 ABC - Fuso</SelectItem>
                  <SelectItem value="truck2">B 5678 XYZ - Hino</SelectItem>
                  <SelectItem value="truck3">B 9101 DEF - Isuzu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="supir" className="text-right text-sm font-medium">
                Supir
              </label>
              <Select className="col-span-3">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih supir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver1">Budi Santoso</SelectItem>
                  <SelectItem value="driver2">Ahmad Fauzi</SelectItem>
                  <SelectItem value="driver3">Dani Setiawan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="kenek" className="text-right text-sm font-medium">
                Kenek
              </label>
              <Select className="col-span-3">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kenek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assistant1">Rudi Hermawan</SelectItem>
                  <SelectItem value="assistant2">Agus Pratama</SelectItem>
                  <SelectItem value="assistant3">Joko Susilo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="urutan" className="text-right text-sm font-medium">
                Urutan
              </label>
              <Input
                id="urutan"
                type="number"
                min="1"
                defaultValue="1"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="noTelp" className="text-right text-sm font-medium">
                No. Telp
              </label>
              <Input
                id="noTelp"
                placeholder="No. Telepon Supir"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setShowAddDialog(false)}>
              Tambah ke Antrian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Antrian</DialogTitle>
            <DialogDescription>
              {newStatus === "MUAT" 
                ? "Apakah Anda yakin ingin memulai proses pemuatan?" 
                : "Apakah Anda yakin truck sudah siap berangkat?"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedTruck && (
              <div className="rounded-md border p-4">
                <div className="font-medium">{selectedTruck.truckId?.noPolisi || "No. Polisi"}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedTruck.truckId?.namaKendaraan || "Kendaraan"}
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Supir:</span> {selectedTruck.supirId?.nama || "Nama Supir"}
                </div>
                <div className="mt-1 text-sm">
                  Status: {getStatusBadge(selectedTruck.status)} → {getStatusBadge(newStatus)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={confirmChangeStatus}>
              {newStatus === "MUAT" ? "Mulai Pemuatan" : "Konfirmasi Berangkat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}