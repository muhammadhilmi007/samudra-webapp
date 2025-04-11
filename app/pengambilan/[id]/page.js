// app/pengambilan/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPickupById,
  updatePickupStatus,
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
import { StatusBadge } from "@/components/shared/status-badge";
import { useToast } from "@/lib/hooks/use-toast";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import {
  ArrowLeft,
  Check,
  Truck,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function PickupDetailPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pickup, loading, error } = useSelector((state) => state.pickup);
  const [statusNotes, setStatusNotes] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchPickupById(id));
    }
  }, [dispatch, id]);

  const handleStatusChange = async (status) => {
    try {
      await dispatch(
        updatePickupStatus({
          id,
          status,
          notes: statusNotes, // Include notes when updating status
        })
      ).unwrap();

      // Reset notes after successful update
      setStatusNotes("");

      toast({
        title: "Status berhasil diubah",
        description: `Status pengambilan berhasil diubah menjadi ${status}`,
      });
      
      // Refresh data setelah update status
      dispatch(fetchPickupById(id));
    } catch (error) {
      toast({
        title: "Gagal mengubah status",
        description: error.message || "Terjadi kesalahan saat mengubah status",
        variant: "destructive",
      });
    }
  };

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out...");
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
    { label: "Detail Pengambilan", href: `/pengambilan/${id}` },
  ];

  if (loading) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  if (!pickup) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center">Pengambilan tidak ditemukan</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add textarea for notes when changing status
  const renderStatusActions = () => {
    // Hanya tampilkan input catatan jika status sedang dalam proses perubahan
    if (pickup.status === "PENDING" || pickup.status === "BERANGKAT") {
      return (
        <div className="mt-4">
          <h3 className="text-sm font-medium">Tambahkan Catatan (Opsional):</h3>
          <Textarea
            placeholder="Tambahkan catatan untuk perubahan status"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            className="mt-2"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen">
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

            <div className="flex justify-between items-center my-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/pengambilan">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold">Detail Pengambilan</h1>
              </div>
              <div className="flex gap-2">
                {pickup.status === "PENDING" && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleStatusChange("BERANGKAT")}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Berangkat
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleStatusChange("CANCELLED")}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Batalkan
                    </Button>
                  </>
                )}
                {pickup.status === "BERANGKAT" && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleStatusChange("SELESAI")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Selesai
                    </Button>
                  </>
                )}
                {pickup.status === "CANCELLED" && (
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleStatusChange("PENDING")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aktifkan Kembali
                  </Button>
                )}
                <Button variant="secondary" asChild>
                  <Link href={`/stt/tambah?pickupId=${pickup._id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Buat STT
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Informasi Pengambilan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">No Pengambilan</p>
                        <p className="font-medium">{pickup.noPengambilan}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          Tanggal Pengambilan
                        </p>
                        <p className="font-medium">
                          {formatDate(pickup.tanggal)}
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Status</p>
                        <StatusBadge status={pickup.status} type="pickup" />
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Jumlah Colly</p>
                        <p className="font-medium">{pickup.jumlahColly}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          Estimasi Pengambilan
                        </p>
                        <p className="font-medium">
                          {pickup.estimasiPengambilan || "-"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Pengirim</p>
                        <p className="font-medium">
                          {pickup.pengirim?.nama || "-"}
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          Alamat Pengambilan
                        </p>
                        <p className="font-medium">
                          {pickup.alamatPengambilan}
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Tujuan</p>
                        <p className="font-medium">{pickup.tujuan}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Cabang</p>
                        <p className="font-medium">
                          {pickup.cabang?.namaCabang || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kendaraan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Kendaraan</p>
                    <p className="font-medium">
                      {pickup.kendaraan?.namaKendaraan || "-"}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Nomor Polisi</p>
                    <p className="font-medium">
                      {pickup.kendaraan?.noPolisi || "-"}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Supir</p>
                    <p className="font-medium">{pickup.supir?.nama || "-"}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Kenek</p>
                    <p className="font-medium">{pickup.kenek?.nama || "-"}</p>
                  </div>

                  <Separator className="my-4" />

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Waktu Berangkat</p>
                    <p className="font-medium">
                      {pickup.waktuBerangkat
                        ? formatDateTime(pickup.waktuBerangkat)
                        : "-"}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Waktu Kembali</p>
                    <p className="font-medium">
                      {pickup.waktuPulang
                        ? formatDateTime(pickup.waktuPulang)
                        : "-"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daftar STT</CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">
                    Total STT: {pickup.sttIds?.length || 0}
                  </p>
                  {pickup.status !== "CANCELLED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Validate if pickup is in valid state for STT creation
                        if (pickup.status === "PENDING") {
                          toast({
                            title: "Tidak dapat membuat STT",
                            description: "Pengambilan harus dalam status BERANGKAT untuk membuat STT",
                            variant: "destructive",
                          });
                          return;
                        }
                        if (pickup.status === "SELESAI" && (!pickup.sttIds || pickup.sttIds.length === 0)) {
                          toast({
                            title: "Peringatan",
                            description: "Pengambilan akan selesai tanpa STT. Pastikan ini benar.",
                            variant: "warning",
                          });
                        }
                        router.push(`/stt/tambah?pickupId=${pickup._id}`);
                      }}
                      disabled={pickup.status === "CANCELLED"}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Buat STT Baru
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {pickup.sttIds && pickup.sttIds.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pickup.sttIds.map((stt) => (
                      <Link href={`/stt/${stt._id}`} key={stt._id}>
                        <Card className="hover:border-blue-400 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{stt.noSTT}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(stt.createdAt)}
                                  </p>
                                </div>
                                <StatusBadge status={stt.status} type="stt" />
                              </div>
                              <div className="text-sm">
                                <p className="text-gray-600">
                                  Tujuan: {stt.tujuan || "-"}
                                </p>
                                <p className="text-gray-600">
                                  Colly: {stt.jumlahColly || 0}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                    <p>Belum ada STT yang dibuat</p>
                    {pickup.status === "BERANGKAT" && (
                      <p className="mt-2 text-sm">
                        Klik tombol "Buat STT Baru" untuk membuat STT
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Histori Aktivitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6 relative">
                    {/* Created */}
                    <div className="flex items-start gap-4 ml-6">
                      <div className="absolute -left-2 p-1 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <p className="font-medium">Pengambilan dibuat</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDateTime(pickup.createdAt)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Dibuat oleh: {pickup.createdBy?.nama || "System"}
                        </p>
                      </div>
                    </div>

                    {/* Departed */}
                    {pickup.waktuBerangkat && (
                      <div className="flex items-start gap-4 ml-6">
                        <div className="absolute -left-2 p-1 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-yellow-500" />
                            <p className="font-medium">Berangkat mengambil barang</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDateTime(pickup.waktuBerangkat)}
                          </p>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Supir: {pickup.supir?.nama || "-"}</p>
                            <p>Kendaraan: {pickup.kendaraan?.namaKendaraan || "-"} ({pickup.kendaraan?.noPolisi || "-"})</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STT Creation Events */}
                    {pickup.sttIds?.map((stt) => (
                      <div key={stt._id} className="flex items-start gap-4 ml-6">
                        <div className="absolute -left-2 p-1 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-purple-500" />
                            <p className="font-medium">STT dibuat</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDateTime(stt.createdAt)}
                          </p>
                          <div className="mt-2 text-sm">
                            <p>Nomor STT: {stt.noSTT}</p>
                            <p>Status: <StatusBadge status={stt.status} type="stt" /></p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Completed */}
                    {pickup.waktuPulang && (
                      <div className="flex items-start gap-4 ml-6">
                        <div className="absolute -left-2 p-1 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <p className="font-medium">Pengambilan selesai</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDateTime(pickup.waktuPulang)}
                          </p>
                          {pickup.notes && (
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                              Catatan: {pickup.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cancelled */}
                    {pickup.status === "CANCELLED" && (
                      <div className="flex items-start gap-4 ml-6">
                        <div className="absolute -left-2 p-1 bg-red-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <p className="font-medium">Pengambilan dibatalkan</p>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDateTime(pickup.updatedAt)}
                          </p>
                          {pickup.notes && (
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                              Alasan pembatalan: {pickup.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status action notes */}
                {renderStatusActions()}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
