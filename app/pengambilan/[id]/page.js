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
    } catch (error) {
      toast({
        title: "Gagal mengubah status",
        description: error.message,
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

            {pickup.sttIds && pickup.sttIds.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Daftar STT</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pickup.sttIds.map((stt, index) => (
                      <Link href={`/stt/${stt._id}`} key={stt._id}>
                        <Card className="hover:border-blue-400 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{stt.noSTT}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(stt.createdAt)}
                                </p>
                              </div>
                              <StatusBadge status={stt.status} type="stt" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/stt/tambah?pickupId=${pickup._id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      Buat STT Baru
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )}

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Histori Aktivitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Pengambilan dibuat</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(pickup.createdAt)}
                      </p>
                    </div>
                  </div>
                  {pickup.waktuBerangkat && (
                    <div className="flex items-center gap-2 mt-2">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span>
                        Berangkat: {formatDateTime(pickup.waktuBerangkat)}
                      </span>
                    </div>
                  )}
                  {pickup.waktuPulang && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Selesai: {formatDateTime(pickup.waktuPulang)}</span>
                    </div>
                  )}
                  {pickup.notes && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium">Catatan:</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {pickup.notes}
                      </p>
                    </div>
                  )}
                  {pickup.status === "SELESAI" && (
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <p className="font-medium">Pengambilan selesai</p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(pickup.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {pickup.status === "CANCELLED" && (
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-2"></div>
                      <div>
                        <p className="font-medium">Pengambilan dibatalkan</p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(pickup.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Render status actions */}
                  {renderStatusActions()}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
