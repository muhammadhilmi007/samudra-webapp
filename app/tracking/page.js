"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { trackSTT, clearError } from "@/lib/redux/slices/sttSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Package,
  Truck,
  ArrowRight,
  Building,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  Boxes,
} from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatDate } from "@/lib/utils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function TrackingPage() {
  const dispatch = useDispatch();
  const { trackedSTT, loading, error } = useSelector((state) => state.stt);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleTracking = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    
    try {
      await dispatch(trackSTT(trackingNumber.trim()));
      setHasSearched(true);
    } catch (error) {
      console.error("Tracking error:", error);
    }
  };

  const resetTracking = () => {
    setTrackingNumber("");
    setHasSearched(false);
    dispatch(clearError());
  };

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
      <Badge variant={statusInfo.variant} className="flex items-center gap-1 px-3 py-1 text-base">
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
  const TimelineStep = ({ title, description, status, step, currentStep, icon: Icon }) => {
    const isActive = step <= currentStep;
    const isCurrentStep = step === currentStep;
    
    return (
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isActive ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-400'
          } ${isCurrentStep ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
            <Icon className="h-4 w-4" />
          </div>
          {step < 5 && (
            <div className={`mt-1 h-12 w-0.5 ${
              isActive && step < currentStep ? 'bg-primary' : 'bg-gray-200'
            }`} />
          )}
        </div>
        <div className="pb-8">
          <p className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
            {title}
          </p>
          <p className={`text-sm ${isActive ? 'text-muted-foreground' : 'text-gray-400'}`}>
            {description}
          </p>
        </div>
      </div>
    );
  };

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
              <Button variant="outline" size="sm">Login Pelanggan</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Lacak Pengiriman Anda</h1>
            <p className="text-muted-foreground">
              Masukkan nomor STT (Surat Tanda Terima) untuk melacak status pengiriman Anda
            </p>
          </div>

          {/* Tracking form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleTracking} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="pl-9"
                    placeholder="Masukkan nomor STT (Contoh: JKT-010825-0001)"
                  />
                </div>
                <Button type="submit" disabled={loading || !trackingNumber.trim()}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Lacak
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tracking results */}
          {loading && (
            <div className="text-center py-12">
              <LoadingSpinner text="Mencari pengiriman..." />
            </div>
          )}

          {!loading && error && hasSearched && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Pencarian Gagal
                </CardTitle>
                <CardDescription>
                  Nomor STT tidak ditemukan atau terjadi kesalahan. Mohon periksa kembali nomor STT Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nomor STT yang Anda cari: <span className="font-medium">{trackingNumber}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Jika Anda yakin nomor STT sudah benar, silakan hubungi customer service kami.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={resetTracking}>
                  Coba Lagi
                </Button>
              </CardFooter>
            </Card>
          )}

          {!loading && trackedSTT && hasSearched && (
            <div className="space-y-6">
              {/* Tracking header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Informasi Pengiriman
                  </CardTitle>
                  <CardDescription>
                    Detail pengiriman untuk STT <span className="font-medium">{trackedSTT.noSTT}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Informasi STT</h3>
                      <p className="mb-2">
                        <span className="font-medium">No. STT:</span> {trackedSTT.noSTT}
                      </p>
                      <p className="mb-2">
                        <span className="font-medium">Tanggal Dibuat:</span> {formatDate(trackedSTT.createdAt)}
                      </p>
                      <p className="mb-4">
                        <span className="font-medium">Barang:</span> {trackedSTT.namaBarang}
                      </p>
                      <div className="mb-2 font-medium">Status:</div>
                      <div>{getStatusBadge(trackedSTT.status)}</div>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Rute Pengiriman</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{trackedSTT.cabangAsalId?.namaCabang || "Cabang Asal"}</p>
                          <p className="text-sm text-muted-foreground">Cabang Asal</p>
                        </div>
                      </div>
                      <div className="flex justify-center my-2">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{trackedSTT.cabangTujuanId?.namaCabang || "Cabang Tujuan"}</p>
                          <p className="text-sm text-muted-foreground">Cabang Tujuan</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Pengiriman</CardTitle>
                  <CardDescription>
                    Perjalanan pengiriman barang Anda
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
                          title="Barang Dalam Perjalanan"
                          description="Barang sedang dalam perjalanan menuju cabang tujuan"
                          status="TRANSIT"
                          step={3}
                          currentStep={getStepCompletion(trackedSTT.status)}
                          icon={Truck}
                        />
                        <TimelineStep
                          title="Barang Diantar ke Penerima"
                          description="Barang sedang dalam proses pengantaran ke alamat penerima"
                          status="LANSIR"
                          step={4}
                          currentStep={getStepCompletion(trackedSTT.status)}
                          icon={Truck}
                        />
                        <TimelineStep
                          title="Barang Diterima"
                          description="Barang telah diterima oleh penerima"
                          status="TERKIRIM"
                          step={5}
                          currentStep={getStepCompletion(trackedSTT.status)}
                          icon={CheckCircle}
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
                        />
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Terakhir diperbarui: {formatDate(trackedSTT.updatedAt || trackedSTT.createdAt)}
                  </p>
                </CardFooter>
              </Card>

              {/* Actions */}
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={resetTracking}>
                  Lacak Pengiriman Lain
                </Button>
                <Button variant="outline">
                  Lihat Detail
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!hasSearched && (
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Package className="mr-2 h-5 w-5" />
                    Cara Melacak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Masukkan nomor STT (Surat Tanda Terima) yang terdapat pada resi pengiriman Anda.
                    Nomor STT biasanya memiliki format seperti: JKT-010825-0001.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="mr-2 h-5 w-5" />
                    Informasi Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Anda akan dapat melihat status terkini dari pengiriman Anda,
                    mulai dari proses penerimaan hingga pengiriman sampai ke tujuan.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Bantuan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Jika Anda mengalami kesulitan melacak pengiriman atau memiliki
                    pertanyaan, silakan hubungi customer service kami di 021-555-7890.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
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
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                Tentang Kami
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Hubungi Kami
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Kebijakan Privasi
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}