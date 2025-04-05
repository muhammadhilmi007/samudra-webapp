"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  BarChart,
  PieChart,
  Download,
  Calendar,
  ArrowRight,
  TrendingUp,
  DollarSign,
  TruckIcon,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function LaporanPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Simulasi loading data
    setTimeout(() => {
      setReportData({
        metrics: {
          pendapatan: {
            bulanan: 1120000000,
            perubahan: "+6.7%",
          },
          pengiriman: {
            bulanan: 980,
            perubahan: "+15.3%",
          },
          armada: {
            aktif: 35,
            total: 42,
          },
          ketepatan: {
            persentase: 75.7,
            perubahan: "+1.7%",
          },
        },
        laporanTerbaru: [
          {
            id: "1",
            nama: "Laporan Keuangan Bulanan - Maret 2025",
            tanggal: "31/03/2025",
            tipe: "Keuangan",
            format: "PDF",
          },
          {
            id: "2",
            nama: "Laporan Pengiriman Q1 2025",
            tanggal: "31/03/2025",
            tipe: "Operasional",
            format: "Excel",
          },
          {
            id: "3",
            nama: "Laporan Penjualan per Cabang - Maret 2025",
            tanggal: "31/03/2025",
            tipe: "Penjualan",
            format: "PDF",
          },
          {
            id: "4",
            nama: "Laporan Piutang Outstanding",
            tanggal: "31/03/2025",
            tipe: "Keuangan",
            format: "Excel",
          },
          {
            id: "5",
            nama: "Laporan Penjualan Top Customer - Q1 2025",
            tanggal: "31/03/2025",
            tipe: "Penjualan",
            format: "PDF",
          },
        ],
        jadwalLaporan: [
          {
            id: "1",
            nama: "Laporan Keuangan Bulanan - April 2025",
            tanggal: "30/04/2025",
            tipe: "Keuangan",
            status: "Dijadwalkan",
          },
          {
            id: "2",
            nama: "Laporan Pajak PPh 21",
            tanggal: "10/04/2025",
            tipe: "Keuangan",
            status: "Dijadwalkan",
          },
          {
            id: "3",
            nama: "Laporan Penjualan Mingguan",
            tanggal: "07/04/2025",
            tipe: "Penjualan",
            status: "Dijadwalkan",
          },
          {
            id: "4",
            nama: "Laporan Performa Cabang",
            tanggal: "15/04/2025",
            tipe: "Operasional",
            status: "Dijadwalkan",
          },
        ],
      });
      setLoading(false);
    }, 800);
  }, []);

  const laporanKategori = [
    {
      title: "Laporan Keuangan",
      description:
        "Laporan pendapatan, pengeluaran, laba rugi, dan neraca keuangan.",
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      links: [
        { name: "Laporan Laba Rugi", path: "/laporan/laba-rugi" },
        { name: "Laporan Neraca", path: "/laporan/neraca" },
        { name: "Laporan Arus Kas", path: "/laporan/keuangan/arus-kas" },
        { name: "Laporan Piutang", path: "/laporan/keuangan/piutang" },
      ],
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Laporan Operasional",
      description:
        "Laporan pengiriman, armada, dan ketepatan waktu pengiriman.",
      icon: <BarChart className="h-8 w-8 text-green-500" />,
      links: [
        { name: "Statistik Pengiriman", path: "/laporan/operasional" },
        { name: "Performa Armada", path: "/laporan/operasional/armada" },
        {
          name: "Ketepatan Pengiriman",
          path: "/laporan/operasional/ketepatan",
        },
      ],
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Laporan Penjualan",
      description:
        "Laporan penjualan berdasarkan cabang, pelanggan, dan periode.",
      icon: <PieChart className="h-8 w-8 text-purple-500" />,
      links: [
        { name: "Penjualan per Cabang", path: "/laporan/penjualan" },
        {
          name: "Penjualan per Pelanggan",
          path: "/laporan/penjualan/pelanggan",
        },
        { name: "Trend Penjualan", path: "/laporan/penjualan/trend" },
      ],
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Ekspor Data",
      description:
        "Ekspor data dalam format Excel, PDF, atau CSV untuk analisis lebih lanjut.",
      icon: <Download className="h-8 w-8 text-orange-500" />,
      links: [{ name: "Ekspor Laporan", path: "/laporan/ekspor" }],
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  ];

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat dashboard laporan...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Laporan</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pendapatan Bulanan
                </p>
                <p className="text-2xl font-bold">
                  {formatter.format(reportData.metrics.pendapatan.bulanan)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              {reportData.metrics.pendapatan.perubahan} dari bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pengiriman Bulanan
                </p>
                <p className="text-2xl font-bold">
                  {reportData.metrics.pengiriman.bulanan}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TruckIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              {reportData.metrics.pengiriman.perubahan} dari bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Armada Aktif</p>
                <p className="text-2xl font-bold">
                  {reportData.metrics.armada.aktif} /{" "}
                  {reportData.metrics.armada.total}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Utilisasi Armada:{" "}
              {Math.round(
                (reportData.metrics.armada.aktif /
                  reportData.metrics.armada.total) *
                  100
              )}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Ketepatan Pengiriman
                </p>
                <p className="text-2xl font-bold">
                  {reportData.metrics.ketepatan.persentase}%
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              {reportData.metrics.ketepatan.perubahan} dari bulan lalu
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Laporan Kategori */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {laporanKategori.map((kategori, index) => (
          <Card
            key={index}
            className={`overflow-hidden ${kategori.bgColor} border ${kategori.borderColor}`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                {kategori.icon}
                <div>
                  <CardTitle>{kategori.title}</CardTitle>
                </div>
              </div>
              <CardDescription>{kategori.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                {kategori.links.map((link, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start bg-white"
                    asChild
                  >
                    <Link href={link.path}>{link.name}</Link>
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full justify-center" asChild>
                <Link href={kategori.links[0].path}>
                  Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="terbaru" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="terbaru">Laporan Terbaru</TabsTrigger>
          <TabsTrigger value="jadwal">Jadwal Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="terbaru" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Terbaru</CardTitle>
              <CardDescription>
                Laporan yang baru dibuat atau diperbarui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">
                        Nama Laporan
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Tanggal
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Tipe</th>
                      <th className="py-3 px-4 text-left font-medium">
                        Format
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.laporanTerbaru.map((laporan) => (
                      <tr
                        key={laporan.id}
                        className="border-b hover:bg-muted/20"
                      >
                        <td className="py-3 px-4">{laporan.nama}</td>
                        <td className="py-3 px-4">{laporan.tanggal}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              laporan.tipe === "Keuangan"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : laporan.tipe === "Operasional"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                            }
                          >
                            {laporan.tipe}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{laporan.format}</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" /> Unduh
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jadwal" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Laporan</CardTitle>
              <CardDescription>
                Laporan yang dijadwalkan untuk dihasilkan secara otomatis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">
                        Nama Laporan
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Tanggal
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Tipe</th>
                      <th className="py-3 px-4 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.jadwalLaporan.map((laporan) => (
                      <tr
                        key={laporan.id}
                        className="border-b hover:bg-muted/20"
                      >
                        <td className="py-3 px-4">{laporan.nama}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            {laporan.tanggal}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              laporan.tipe === "Keuangan"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : laporan.tipe === "Operasional"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                            }
                          >
                            {laporan.tipe}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
                          >
                            {laporan.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline" className="ml-auto">
                <Calendar className="mr-2 h-4 w-4" /> Kelola Jadwal Laporan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-muted/20 p-6 rounded-lg border mt-6">
        <h2 className="text-xl font-semibold mb-2">Pusat Bantuan Laporan</h2>
        <p className="text-muted-foreground mb-4">
          Pelajari cara membuat, menjadwalkan, dan mengkustomisasi laporan untuk
          kebutuhan bisnis Anda.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-md border">
            <h3 className="font-medium mb-1">Membuat Laporan Kustom</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Buat laporan yang disesuaikan dengan kebutuhan spesifik bisnis
              Anda.
            </p>
            <Button variant="ghost" size="sm" className="mt-2">
              Pelajari Lebih Lanjut
            </Button>
          </div>
          <div className="bg-white p-4 rounded-md border">
            <h3 className="font-medium mb-1">Menjadwalkan Laporan Rutin</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Atur jadwal otomatis untuk laporan yang sering digunakan.
            </p>
            <Button variant="ghost" size="sm" className="mt-2">
              Pelajari Lebih Lanjut
            </Button>
          </div>
          <div className="bg-white p-4 rounded-md border">
            <h3 className="font-medium mb-1">Berbagi dan Mengekspor</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Cara berbagi laporan dan mengekspornya dalam berbagai format.
            </p>
            <Button variant="ghost" size="sm" className="mt-2">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
