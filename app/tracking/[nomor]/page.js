"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { trackSTT, clearError } from "@/lib/redux/slices/sttSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Truck,
  ArrowRight,
  Building,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Users,
  MapPin,
  Calendar,
  Package2,
  DollarSign,
  FileText,
  Clock,
  Boxes,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function TrackingDetailPage() {
  const { sttNumber } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { trackedSTT, loading, error } = useSelector((state) => state.stt);

  useEffect(() => {
    if (sttNumber) {
      dispatch(trackSTT(sttNumber));
    }
  }, [dispatch, sttNumber]);

  // Function to display status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Menunggu", variant: "secondary", icon: Clock },
      MUAT: { label: "Dalam Pemuatan", variant: "warning", icon: Boxes },
      TRANSIT: { label: "Dalam Pengiriman", variant: "info", icon: Truck },
      LANSIR: { label: "Lansir ke Penerima", variant: "warning", icon: Truck },
      TERKIRIM: { label: "Terkirim", variant: "success", icon: CheckCircle },
      RETURN: { label: "Retur", variant: "destructive", icon: AlertCircle },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "secondary",
      icon: Package,
    };

    const Icon = statusInfo.icon;

    return (
      <Badge
        variant={statusInfo.variant}
        className="flex items-center gap-1 px-3 py-1 text-base"
      >
        <Icon className="h-4 w-4 mr-1" />
        <span>{statusInfo.label}</span>
      </Badge>
    );
  };

  // Get step completion based on status
  const getStepCompletion = (status) => {
    const steps = {
      PENDING: 1,
      MUAT: 2,
      TRANSIT: 3,
      LANSIR: 4,
      TERKIRIM: 5,
      RETURN: 3, // For return, we'll show a special step
    };

    return steps[status] || 0;
  };

  // Timeline step component
  const TimelineStep = ({
    title,
    description,
    status,
    step,
    currentStep,
    icon: Icon,
    timestamp,
  }) => {
    const isActive = step <= currentStep;
    const isCurrentStep = step === currentStep;

    return (
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-gray-200 text-gray-400"
            } ${isCurrentStep ? "ring-2 ring-primary ring-offset-2" : ""}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          {step < 5 && (
            <div
              className={`mt-1 h-12 w-0.5 ${
                isActive && step < currentStep ? "bg-primary" : "bg-gray-200"
              }`}
            />
          )}
        </div>
        <div className="pb-8">
          <p
            className={`font-medium ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-sm ${
              isActive ? "text-muted-foreground" : "text-gray-400"
            }`}
          >
            {description}
          </p>
          {timestamp && isActive && (
            <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <LoadingSpinner text="Memuat data pengiriman..." />
      </div>
    );
  }

  if (error || !trackedSTT) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                Pengiriman Tidak Ditemukan
              </CardTitle>
              <CardDescription>
                Nomor STT tidak ditemukan atau terjadi kesalahan. Mohon periksa
                kembali nomor STT Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nomor STT yang Anda cari:{" "}
                <span className="font-medium">{sttNumber}</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Jika Anda yakin nomor STT sudah benar, silakan hubungi customer
                service kami.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => router.push("/tracking")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Pencarian
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Simple header */}
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tighter text-primary">
                SAMUDRA
              </span>
              <span className="text-sm font-medium">Tracking</span>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login Pelanggan
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/tracking")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Pencarian
            </Button>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Detail Pengiriman
            </h1>
            <p className="text-muted-foreground">
              Informasi lengkap pengiriman untuk STT{" "}
              <span className="font-medium">{trackedSTT.noSTT}</span>
            </p>
          </div>

          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Status Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="mb-2 text-sm text-muted-foreground">
                      Status:
                    </div>
                    <div>{getStatusBadge(trackedSTT.status)}</div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm text-muted-foreground">
                      Terakhir diperbarui:
                    </div>
                    <div className="font-medium">
                      {formatDate(trackedSTT.updatedAt || trackedSTT.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm text-muted-foreground">
                      No. STT:
                    </div>
                    <div className="font-medium">{trackedSTT.noSTT}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipment Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sender & Recipient */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Pengirim & Penerima
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Pengirim</h3>
                      <p className="text-sm">
                        {trackedSTT.pengirimId?.nama || "-"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trackedSTT.pengirimId?.alamat || "-"},{" "}
                        {trackedSTT.pengirimId?.kota || "-"}
                      </p>
                    </div>
                    <div className="flex justify-center my-2">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Penerima</h3>
                      <p className="text-sm">
                        {trackedSTT.penerimaId?.nama || "-"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trackedSTT.penerimaId?.alamat || "-"},{" "}
                        {trackedSTT.penerimaId?.kota || "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Package Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Package2 className="mr-2 h-5 w-5" />
                    Detail Barang
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Nama Barang:
                      </span>
                      <span className="font-medium">
                        {trackedSTT.namaBarang}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Komoditi:</span>
                      <span>{trackedSTT.komoditi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Packing:</span>
                      <span>{trackedSTT.packing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Jumlah Colly:
                      </span>
                      <span>{trackedSTT.jumlahColly}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Berat:</span>
                      <span>{trackedSTT.berat} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tipe Pembayaran:
                      </span>
                      <Badge variant="outline">{trackedSTT.paymentType}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Riwayat Status Pengiriman
                </CardTitle>
                <CardDescription>
                  Timeline perjalanan pengiriman barang Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="ml-2">
                  {trackedSTT.status !== "RETURN" ? (
                    <>
                      <TimelineStep
                        title="Barang Diterima"
                        description="Barang sudah diterima di cabang asal dan sedang diproses"
                        status="PENDING"
                        step={1}
                        currentStep={getStepCompletion(trackedSTT.status)}
                        icon={Package}
                        timestamp={formatDate(trackedSTT.createdAt)}
                      />
                      <TimelineStep
                        title="Barang Dimuat"
                        description="Barang telah dimuat di kendaraan untuk pengiriman antar cabang"
                        status="MUAT"
                        step={2}
                        currentStep={getStepCompletion(trackedSTT.status)}
                        icon={Boxes}
                        timestamp={
                          trackedSTT.status === "MUAT"
                            ? formatDate(trackedSTT.updatedAt)
                            : null
                        }
                      />
                      <TimelineStep
                        title="Barang Dalam Perjalanan"
                        description="Barang sedang dalam perjalanan menuju cabang tujuan"
                        status="TRANSIT"
                        step={3}
                        currentStep={getStepCompletion(trackedSTT.status)}
                        icon={Truck}
                        timestamp={
                          trackedSTT.status === "TRANSIT"
                            ? formatDate(trackedSTT.updatedAt)
                            : null
                        }
                      />
                      <TimelineStep
                        title="Barang Diantar ke Penerima"
                        description="Barang sedang dalam proses pengantaran ke alamat penerima"
                        status="LANSIR"
                        step={4}
                        currentStep={getStepCompletion(trackedSTT.status)}
                        icon={Truck}
                        timestamp={
                          trackedSTT.status === "LANSIR"
                            ? formatDate(trackedSTT.updatedAt)
                            : null
                        }
                      />
                      <TimelineStep
                        title="Barang Diterima"
                        description="Barang telah diterima oleh penerima"
                        status="TERKIRIM"
                        step={5}
                        currentStep={getStepCompletion(trackedSTT.status)}
                        icon={CheckCircle}
                        timestamp={
                          trackedSTT.status === "TERKIRIM"
                            ? formatDate(trackedSTT.updatedAt)
                            : null
                        }
                      />
                    </>
                  ) : (
                    <>
                      <TimelineStep
                        title="Barang Diterima"
                        description="Barang sudah diterima di cabang asal dan sedang diproses"
                        status="PENDING"
                        step={1}
                        currentStep={getStepCompletion(trackedSTT.status)}
                        icon={Package}
                        timestamp={formatDate(trackedSTT.createdAt)}
                      />
                      <TimelineStep
                        title="Barang Dimuat"
                        description="Barang telah dimuat di kendaraan untuk pengiriman antar cabang"
                        status="MUAT"
                        step={2}
                        currentStep={getStepCompletion(trackedSTT.status)}
                        icon={Boxes}
                      />
                      <TimelineStep
                        title="Barang Dikembalikan (Retur)"
                        description="Barang diretur dan sedang dalam proses pengembalian ke pengirim"
                        status="RETURN"
                        step={3}
                        currentStep={getStepCompletion(trackedSTT.status)}
                        icon={AlertCircle}
                        timestamp={formatDate(trackedSTT.updatedAt)}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Route Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Informasi Rute
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-muted p-4 rounded-md w-full max-w-md">
                    <div className="flex items-center gap-2 mb-4">
                      <Building className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {trackedSTT.cabangAsalId?.namaCabang || "Cabang Asal"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cabang Pengiriman
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center my-4">
                      <div className="h-12 border-l-2 border-dashed border-muted-foreground"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {trackedSTT.cabangTujuanId?.namaCabang ||
                            "Cabang Tujuan"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cabang Penerima
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Need Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Butuh Bantuan?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Jika Anda memiliki pertanyaan tentang pengiriman ini atau
                  mengalami masalah, silakan hubungi customer service kami.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1">
                    Live Chat
                  </Button>
                  <Button className="flex-1">Hubungi Kami</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t mt-auto">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-muted-foreground text-sm">
                &copy; 2025 PT Samudra Logistik Indonesia. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Tentang Kami
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Hubungi Kami
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Kebijakan Privasi
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
