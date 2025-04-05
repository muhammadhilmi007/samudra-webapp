'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, BarChart, PieChart, Download, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function LaporanPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Simulasi loading data
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);
  
  const laporanKategori = [
    {
      title: 'Laporan Keuangan',
      description: 'Laporan pendapatan, pengeluaran, laba rugi, dan neraca keuangan.',
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      links: [
        { name: 'Laporan Laba Rugi', path: '/laporan/keuangan/laba-rugi' },
        { name: 'Laporan Neraca', path: '/laporan/keuangan/neraca' },
        { name: 'Laporan Arus Kas', path: '/laporan/keuangan/arus-kas' },
        { name: 'Laporan Piutang', path: '/laporan/keuangan/piutang' },
      ]
    },
    {
      title: 'Laporan Operasional',
      description: 'Laporan pengiriman, armada, dan ketepatan waktu pengiriman.',
      icon: <BarChart className="h-8 w-8 text-green-500" />,
      links: [
        { name: 'Statistik Pengiriman', path: '/laporan/operasional' },
        { name: 'Performa Armada', path: '/laporan/operasional/armada' },
        { name: 'Ketepatan Pengiriman', path: '/laporan/operasional/ketepatan' },
      ]
    },
    {
      title: 'Laporan Penjualan',
      description: 'Laporan penjualan berdasarkan cabang, pelanggan, dan periode.',
      icon: <PieChart className="h-8 w-8 text-purple-500" />,
      links: [
        { name: 'Penjualan per Cabang', path: '/laporan/penjualan' },
        { name: 'Penjualan per Pelanggan', path: '/laporan/penjualan/pelanggan' },
        { name: 'Trend Penjualan', path: '/laporan/penjualan/trend' },
      ]
    },
    {
      title: 'Ekspor Data',
      description: 'Ekspor data dalam format Excel, PDF, atau CSV untuk analisis lebih lanjut.',
      icon: <Download className="h-8 w-8 text-orange-500" />,
      links: [
        { name: 'Ekspor Laporan', path: '/laporan/ekspor' },
      ]
    },
  ];
  
  const laporanTerbaru = [
    { id: '1', nama: 'Laporan Keuangan Bulanan - Maret 2025', tanggal: '31/03/2025', tipe: 'Keuangan', format: 'PDF' },
    { id: '2', nama: 'Laporan Pengiriman Q1 2025', tanggal: '31/03/2025', tipe: 'Operasional', format: 'Excel' },
    { id: '3', nama: 'Laporan Penjualan per Cabang - Maret 2025', tanggal: '31/03/2025', tipe: 'Penjualan', format: 'PDF' },
    { id: '4', nama: 'Laporan Piutang Outstanding', tanggal: '31/03/2025', tipe: 'Keuangan', format: 'Excel' },
    { id: '5', nama: 'Laporan Penjualan Top Customer - Q1 2025', tanggal: '31/03/2025', tipe: 'Penjualan', format: 'PDF' },
  ];
  
  const jadwalLaporan = [
    { id: '1', nama: 'Laporan Keuangan Bulanan - April 2025', tanggal: '30/04/2025', tipe: 'Keuangan', status: 'Dijadwalkan' },
    { id: '2', nama: 'Laporan Pajak PPh 21', tanggal: '10/04/2025', tipe: 'Keuangan', status: 'Dijadwalkan' },
    { id: '3', nama: 'Laporan Penjualan Mingguan', tanggal: '07/04/2025', tipe: 'Penjualan', status: 'Dijadwalkan' },
    { id: '4', nama: 'Laporan Performa Cabang', tanggal: '15/04/2025', tipe: 'Operasional', status: 'Dijadwalkan' },
  ];

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {laporanKategori.map((kategori, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-4">
                {kategori.icon}
                <div>
                  <CardTitle>{kategori.title}</CardTitle>
                </div>
              </div>
              <CardDescription>{kategori.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kategori.links.map((link, i) => (
                  <Button key={i} variant="outline" className="w-full justify-start" asChild>
                    <Link href={link.path}>
                      {link.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
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
              <CardDescription>Laporan yang baru dibuat atau diperbarui.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Nama Laporan</th>
                      <th className="py-3 px-4 text-left font-medium">Tanggal</th>
                      <th className="py-3 px-4 text-left font-medium">Tipe</th>
                      <th className="py-3 px-4 text-left font-medium">Format</th>
                      <th className="py-3 px-4 text-left font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporanTerbaru.map((laporan) => (
                      <tr key={laporan.id} className="border-b">
                        <td className="py-3 px-4">{laporan.nama}</td>
                        <td className="py-3 px-4">{laporan.tanggal}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            laporan.tipe === 'Keuangan' ? 'bg-blue-100 text-blue-800' :
                            laporan.tipe === 'Operasional' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {laporan.tipe}
                          </span>
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
              <CardDescription>Laporan yang dijadwalkan untuk dihasilkan secara otomatis.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Nama Laporan</th>
                      <th className="py-3 px-4 text-left font-medium">Tanggal</th>
                      <th className="py-3 px-4 text-left font-medium">Tipe</th>
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwalLaporan.map((laporan) => (
                      <tr key={laporan.id} className="border-b">
                        <td className="py-3 px-4">{laporan.nama}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            {laporan.tanggal}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            laporan.tipe === 'Keuangan' ? 'bg-blue-100 text-blue-800' :
                            laporan.tipe === 'Operasional' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {laporan.tipe}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            {laporan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}