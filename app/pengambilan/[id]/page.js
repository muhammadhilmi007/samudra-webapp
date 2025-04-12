// app/pengambilan/[id]/page.js - Detail view for pickup items
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import {
  fetchPickupById,
  updatePickupStatus,
  deletePickup,
} from "@/lib/redux/slices/pickupSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useToast } from "@/lib/hooks/use-toast";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Truck,
  Calendar,
  User,
  Building,
  MapPin,
  Package,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import StatusBadge from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PickupDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    status: null,
    notes: "",
  });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get data from Redux store
  const { pickup, loading, error } = useSelector((state) => state.pickup);

  // Mock user data (replace with actual auth logic in production)
  const user = useSelector((state) => state.auth.currentUser) || {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  // Load pickup data
  useEffect(() => {
    if (id) {
      dispatch(fetchPickupById(id));
    }
  }, [dispatch, id]);

  // Open status change dialog
  const openStatusDialog = (status) => {
    // Ensure status is a valid string
    if (!status) {
      console.error("Invalid status provided to openStatusDialog");
      return;
    }
    
    setStatusDialog({
      isOpen: true,
      status,
      notes: "",
    });
  };

  // Close status change dialog
  const closeStatusDialog = () => {
    setStatusDialog({
      isOpen: false,
      status: null,
      notes: "",
    });
  };

  // Handle status changes
  const handleStatusChange = async () => {
    const { status, notes } = statusDialog;

    try {
      // Show loading toast
      toast({
        title: "Mengubah status...",
        description: "Mohon tunggu sebentar",
      });

      // Ensure status is not null before dispatching
      if (!status) {
        throw new Error("Status tidak boleh kosong");
      }

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
      dispatch(fetchPickupById(id));
    } catch (error) {
      toast({
        title: "Gagal mengubah status",
        description: error.message || "Terjadi kesalahan saat mengubah status",
        variant: "destructive",
      });
      closeStatusDialog();
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deletePickup(id)).unwrap();
      
      toast({
        title: "Berhasil",
        description: "Pengambilan berhasil dihapus",
      });
      
      router.push("/pengambilan");
    } catch (error) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat menghapus pengambilan",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialog(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
    { label: "Detail Pengambilan", href: `/pengambilan/${id}` },
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

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuButtonClick={() => setSidebarOpen(true)} user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Breadcrumbs items={breadcrumbItems} />
              <div className="flex items-center gap-2 my-4">
                <Button variant="outline" size="icon" asChild disabled>
                  <span><ArrowLeft className="h-4 w-4" /></span>
                </Button>
                <Skeleton className="h-8 w-48" />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle><Skeleton className="h-6 w-36" /></CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state if pickup not found
  if (!pickup && !loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuButtonClick={() => setSidebarOpen(true)} user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Breadcrumbs items={breadcrumbItems} />
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pengambilan tidak ditemukan atau telah dihapus.
                </AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <Button asChild variant="outline">
                  <Link href="/pengambilan">Kembali ke Daftar Pengambilan</Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
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
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex justify-between items-center my-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/pengambilan">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold">
                  Detail Pengambilan {pickup?.noPengambilan}
                </h1>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Ubah Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    {pickup?.status === "PENDING" && (
                      <DropdownMenuItem
                        onClick={() => openStatusDialog("BERANGKAT")}
                        className="text-blue-600"
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        <span>Berangkat</span>
                      </DropdownMenuItem>
                    )}

                    {pickup?.status === "BERANGKAT" && (
                      <DropdownMenuItem
                        onClick={() => openStatusDialog("SELESAI")}
                        className="text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span>Selesai</span>
                      </DropdownMenuItem>
                    )}

                    {["PENDING", "BERANGKAT"].includes(pickup?.status) && (
                      <DropdownMenuItem
                        onClick={() => openStatusDialog("CANCELLED")}
                        className="text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        <span>Batalkan</span>
                      </DropdownMenuItem>
                    )}

                    {pickup?.status === "CANCELLED" && (
                      <DropdownMenuItem
                        onClick={() => openStatusDialog("PENDING")}
                        className="text-amber-600"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Aktifkan Kembali</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" asChild>
                  <Link href={`/pengambilan/edit/${id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialog(true)}
                  data-testid="delete-button"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <StatusBadge status={pickup?.status} type="pickup" />
              {pickup?.status === "CANCELLED" && pickup?.notes && (
                <span className="text-sm text-gray-500">
                  ({pickup.notes})
                </span>
              )}
            </div>

            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Informasi Pengambilan</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nomor Pengambilan</h3>
                      <p className="mt-1 text-base font-medium">{pickup?.noPengambilan || "-"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        Tanggal
                      </h3>
                      <p className="mt-1">{formatDate(pickup?.tanggal) || "-"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <User className="h-4 w-4 text-gray-400" />
                        Pengirim
                      </h3>
                      <p className="mt-1">
                        {pickup?.pengirimId && typeof pickup.pengirimId === "object"
                          ? pickup.pengirimId.nama
                          : pickup?.namaPengirim || "-"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        Jumlah Colly
                      </h3>
                      <p className="mt-1 font-medium">{pickup?.jumlahColly || "0"}</p>
                    </div>
                  </div>
                  
                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Truck className="h-4 w-4 text-gray-400" />
                        Kendaraan
                      </h3>
                      <p className="mt-1">
                        {pickup?.kendaraanId && typeof pickup.kendaraanId === "object"
                          ? `${pickup.kendaraanId.namaKendaraan || ""} ${
                              pickup.kendaraanId.noPolisi
                                ? `- ${pickup.kendaraanId.noPolisi}`
                                : ""
                            }`
                          : pickup?.namaKendaraan || "-"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <User className="h-4 w-4 text-gray-400" />
                        Supir
                      </h3>
                      <p className="mt-1">
                        {pickup?.supirId && typeof pickup.supirId === "object"
                          ? pickup.supirId.nama
                          : pickup?.namaSupir || "-"}
                      </p>
                    </div>
                    
                    {pickup?.kenekId && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                          <User className="h-4 w-4 text-gray-400" />
                          Kenek
                        </h3>
                        <p className="mt-1">
                          {typeof pickup.kenekId === "object"
                            ? pickup.kenekId.nama
                            : pickup?.namaKenek || "-"}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        Estimasi Pengambilan
                      </h3>
                      <p className="mt-1">
                        {pickup?.estimasiPengambilan
                          ? formatDate(pickup.estimasiPengambilan, true)
                          : "-"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Address Information - Full Width */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Building className="h-4 w-4 text-gray-400" />
                        Alamat Pengambilan
                      </h3>
                      <p className="mt-1 text-gray-700 whitespace-pre-line">
                        {pickup?.alamatPengambilan || "-"}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        Tujuan
                      </h3>
                      <p className="mt-1 text-gray-700">
                        {pickup?.tujuan || "-"}
                      </p>
                    </div>
                    
                    {pickup?.notes && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 flex items-center gap-1">
                          <FileText className="h-4 w-4 text-gray-400" />
                          Catatan
                        </h3>
                        <p className="mt-1 text-gray-700 whitespace-pre-line">
                          {pickup.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-between">
                <div className="text-sm text-gray-500">
                  {pickup?.createdAt && (
                    <span>Dibuat: {formatDate(pickup.createdAt, true)}</span>
                  )}
                  {pickup?.updatedAt && pickup?.createdAt !== pickup?.updatedAt && (
                    <span className="ml-4">Diperbarui: {formatDate(pickup.updatedAt, true)}</span>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={statusDialog.isOpen} onOpenChange={closeStatusDialog}>
        <DialogContent className={`sm:max-w-md ${statusAttr.color}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className={`p-2 rounded-full ${
                  statusDialog.status === "CANCELLED"
                    ? "bg-red-100"
                    : statusDialog.status === "SELESAI"
                    ? "bg-green-100"
                    : statusDialog.status === "BERANGKAT"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <span>Konfirmasi Penghapusan</span>
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengambilan {pickup?.noPengambilan}? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={isDeleting}
              data-testid="cancel-delete-button"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              data-testid="confirm-delete-button"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
