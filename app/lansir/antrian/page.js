"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVehicleQueues,
  updateVehicleQueueStatus,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/vehicleQueueSlice";
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

export default function VehicleQueuePage() {
  const dispatch = useDispatch();
  const { vehicleQueues, loading, error, success } = useSelector((state) => state.vehicleQueue);
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // Mock user data
  const user = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Lansir", link: "/lansir" },
    { title: "Antrian Kendaraan", link: "/lansir/antrian", active: true },
  ];

  useEffect(() => {
    dispatch(fetchVehicleQueues());
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
        description: "Operasi antrian kendaraan berhasil dilakukan",
        variant: "success",
      });
      dispatch(clearSuccess());
    }
  }, [error, success, toast, dispatch]);

  const handleChangeStatus = (vehicle, status) => {
    setSelectedVehicle(vehicle);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const confirmChangeStatus = () => {
    if (selectedVehicle && newStatus) {
      dispatch(updateVehicleQueueStatus({
        id: selectedVehicle._id,
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
      "LANSIR": { label: "Dalam Pengiriman", variant: "warning", icon: Loader2 },
      "KEMBALI": { label: "Kembali", variant: "success", icon: CheckCircle },
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

  // Filter vehicle queues by status
  const getQueuesByStatus = (status) => {
    return vehicleQueues.filter(queue => queue.status === status);
  };

  // Render vehicle queue card
  const renderVehicleCard = (queue) => {
    const vehicle = queue.kendaraanId;
    const supir = queue.supirId;

    return (
      <Card key={queue._id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{vehicle?.noPolisi || "No. Polisi"}</CardTitle>
              <CardDescription>{vehicle?.namaKendaraan || "Nama Kendaraan"}</CardDescription>
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
                onClick={() => handleChangeStatus(queue, "LANSIR")}
              >
                Mulai Lansir
              </Button>
            )}
            
            {queue.status === "LANSIR" && (
              <Button 
                className="flex-1" 
                onClick={() => handleChangeStatus(queue, "KEMBALI")}
              >
                Selesai
              </Button>
            )}
            
            {queue.status === "KEMBALI" && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = `/lansir/tambah?vehicleId=${queue._id}`}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Lihat Lansir
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
                  Antrian Kendaraan Lansir
                </h1>
                <p className="text-muted-foreground">
                  Kelola antrian kendaraan untuk pengiriman barang ke penerima
                </p>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kendaraan
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
                <p>Gagal memuat data antrian kendaraan: {error}</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && vehicleQueues.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <Truck className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium">Belum ada antrian kendaraan</h3>
                <p className="mt-2 text-muted-foreground">
                  Tambahkan kendaraan ke dalam antrian untuk memulai proses lansir.
                </p>
                <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kendaraan
                </Button>
              </div>
            )}

            {/* Vehicle queues */}
            {!loading && !error && vehicleQueues.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Waiting vehicles */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Menunggu</h2>
                  {getQueuesByStatus("MENUNGGU").map(renderVehicleCard)}
                  {getQueuesByStatus("MENUNGGU").length === 0 && (
                    <p className="text-muted-foreground text-center p-4 bg-white rounded-lg border">
                      Tidak ada kendaraan yang menunggu
                    </p>
                  )}
                </div>

                {/* Lansir vehicles */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Dalam Pengiriman</h2>
                  {getQueuesByStatus("LANSIR").map(renderVehicleCard)}
                  {getQueuesByStatus("LANSIR").length === 0 && (
                    <p className="text-muted-foreground text-center p-4 bg-white rounded-lg border">
                      Tidak ada kendaraan dalam proses lansir
                    </p>
                  )}
                </div>

                {/* Returned vehicles */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Kembali</h2>
                  {getQueuesByStatus("KEMBALI").map(renderVehicleCard)}
                  {getQueuesByStatus("KEMBALI").length === 0 && (
                    <p className="text-muted-foreground text-center p-4 bg-white rounded-lg border">
                      Tidak ada kendaraan yang sudah kembali
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kendaraan ke Antrian</DialogTitle>
            <DialogDescription>
              Tambahkan kendaraan baru ke dalam antrian lansir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="vehicle" className="text-right text-sm font-medium">
                Kendaraan
              </label>
              <Select className="col-span-3">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kendaraan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vehicle1">B 1234 ABC - Mobil Box</SelectItem>
                  <SelectItem value="vehicle2">B 5678 XYZ - Pick Up</SelectItem>
                  <SelectItem value="vehicle3">B 9101 DEF - Van</SelectItem>
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
                  <SelectItem value="driver1">Rudi Santoso</SelectItem>
                  <SelectItem value="driver2">Dani Fauzi</SelectItem>
                  <SelectItem value="driver3">Irwan Setiawan</SelectItem>
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
                  <SelectItem value="assistant1">Adi Hermawan</SelectItem>
                  <SelectItem value="assistant2">Yoga Pratama</SelectItem>
                  <SelectItem value="assistant3">Bima Susilo</SelectItem>
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
              {newStatus === "LANSIR" 
                ? "Apakah Anda yakin ingin memulai proses lansir?" 
                : "Apakah kendaraan sudah kembali ke gudang?"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedVehicle && (
              <div className="rounded-md border p-4">
                <div className="font-medium">{selectedVehicle.kendaraanId?.noPolisi || "No. Polisi"}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedVehicle.kendaraanId?.namaKendaraan || "Kendaraan"}
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">Supir:</span> {selectedVehicle.supirId?.nama || "Nama Supir"}
                </div>
                <div className="mt-1 text-sm">
                  Status: {getStatusBadge(selectedVehicle.status)} → {getStatusBadge(newStatus)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={confirmChangeStatus}>
              {newStatus === "LANSIR" ? "Mulai Lansir" : "Konfirmasi Kembali"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}