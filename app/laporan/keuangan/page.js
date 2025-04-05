'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Download, FileText, Printer } from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

export default function LaporanKeuanganPage() {
  const [loading, setLoading] = useState(true);
  const [laporanData, setLaporanData] = useState(null);
  const [periodeFilter, setPeriodeFilter] = useState('2025-03');
  
  useEffect(() => {
    // Simulasi fetch data dari API
    setTimeout(() => {
      setLaporanData({
        pendapatanPerBulan: [
          { bulan: 'Jan', pendapatan: 980, pengeluaran: 850 },
          { bulan: 'Feb', pendapatan: 1050, pengeluaran: 900 },
          { bulan: 'Mar', pendapatan: 1120, pengeluaran: 930 },
        ],
        pendapatanPerCabang: [
          { cabang: 'Jakarta', nilai: 450 },
          { cabang: 'Surabaya', nilai: 320 },
          { cabang: 'Bandung', nilai: 230 },
          { cabang: 'Medan', nilai: 120 },
        ],
        pengeluaranKategori: [
          { kategori: 'Gaji & Tunjangan', nilai: 480 },
          { kategori: 'Operasional', nilai: 280 },
          { kategori: 'Perawatan Kendaraan', nilai: 130 },
          { kategori: 'Bahan Bakar', nilai: 130 },
          { kategori: 'Lain-lain', nilai: 40 }
        ],
        laporanKeuangan: {
          pendapatanBulanIni: 1120000000,
          pendapatanBulanLalu: 1050000000,
          pengeluaranBulanIni: 930000000,
          pengeluaranBulanLalu: 900000000,
          labaBulanIni: 190000000,
          labaBulanLalu: 150000000,
          asetTotal: 5200000000,
          kewajibanTotal: 2800000000,
          ekuitasTotal: 2400000000
        }
      });
      setLoading(false);
    }, 1000);
  }, [periodeFilter]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e91e63'];
  
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  });
  
  const formatNumber = new Intl.NumberFormat('id-ID');
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat laporan keuangan...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/laporan">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodeFilter} onValueChange={setPeriodeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">Januari 2025</SelectItem>
              <SelectItem value="2025-02">Februari 2025</SelectItem>
              <SelectItem value="2025-03">Maret 2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Cetak
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Ekspor
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {formatter.format(laporanData.laporanKeuangan.pendapatanBulanIni)}
              </p>
              <p className="text-sm">
                {laporanData.laporanKeuangan.pendapatanBulanIni > laporanData.laporanKeuangan.pendapatanBulanLalu ? (
                  <span className="text-green-600">
                    +{formatNumber.format(((laporanData.laporanKeuangan.pendapatanBulanIni - laporanData.laporanKeuangan.pendapatanBulanLalu) / laporanData.laporanKeuangan.pendapatanBulanLalu * 100).toFixed(1))}% dari bulan lalu
                  </span>
                ) : (
                  <span className="text-red-600">
                    {formatNumber.format(((laporanData.laporanKeuangan.pendapatanBulanIni - laporanData.laporanKeuangan.pendapatanBulanLalu) / laporanData.laporanKeuangan.pendapatanBulanLalu * 100).toFixed(1))}% dari bulan lalu
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {formatter.format(laporanData.laporanKeuangan.pengeluaranBulanIni)}
              </p>
              <p className="text-sm">
                {laporanData.laporanKeuangan.pengeluaranBulanIni > laporanData.laporanKeuangan.pengeluaranBulanLalu ? (
                  <span className="text-red-600">
                    +{formatNumber.format(((laporanData.laporanKeuangan.pengeluaranBulanIni - laporanData.laporanKeuangan.pengeluaranBulanLalu) / laporanData.laporanKeuangan.pengeluaranBulanLalu * 100).toFixed(1))}% dari bulan lalu
                  </span>
                ) : (
                  <span className="text-green-600">
                    {formatNumber.format(((laporanData.laporanKeuangan.pengeluaranBulanIni - laporanData.laporanKeuangan.pengeluaranBulanLalu) / laporanData.laporanKeuangan.pengeluaranBulanLalu * 100).toFixed(1))}% dari bulan lalu
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Laba Bersih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {formatter.format(laporanData.laporanKeuangan.labaBulanIni)}
              </p>
              <p className="text-sm">
                {laporanData.laporanKeuangan.labaBulanIni > laporanData.laporanKeuangan.labaBulanLalu ? (
                  <span className="text-green-600">
                    +{formatNumber.format(((laporanData.laporanKeuangan.labaBulanIni - laporanData.laporanKeuangan.labaBulanLalu) / laporanData.laporanKeuangan.labaBulanLalu * 100).toFixed(1))}% dari bulan lalu
                  </span>
                ) : (
                  <span className="text-red-600">
                    {formatNumber.format(((laporanData.laporanKeuangan.labaBulanIni - laporanData.laporanKeuangan.labaBulanLalu) / laporanData.laporanKeuangan.labaBulanLalu * 100).toFixed(1))}% dari bulan lalu
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="grafik" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="grafik">Grafik</TabsTrigger>
          <TabsTrigger value="neraca">Neraca</TabsTrigger>
          <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grafik" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Trend Keuangan (3 Bulan Terakhir)</CardTitle>
                <CardDescription>Pendapatan vs Pengeluaran dalam juta rupiah</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={laporanData.pendapatanPerBulan}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bulan" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} Juta`, '']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="pendapatan" 
                        stroke="#8884d8" 
                        name="Pendapatan"
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pengeluaran" 
                        stroke="#82ca9d" 
                        name="Pengeluaran" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pendapatan per Cabang</CardTitle>
                <CardDescription>Dalam juta rupiah</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={laporanData.pendapatanPerCabang}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cabang" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} Juta`, 'Pendapatan']} />
                      <Legend />
                      <Bar dataKey="nilai" name="Pendapatan" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Pengeluaran</CardTitle>
                <CardDescription>Berdasarkan kategori pengeluaran</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={laporanData.pengeluaranKategori}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="nilai"
                        nameKey="kategori"
                      >
                        {laporanData.pengeluaranKategori.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Juta`, 'Nilai']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="neraca" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Neraca Keuangan</CardTitle>
              <CardDescription>Posisi per 31 Maret 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Aset</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b">
                      <span>Kas & Setara Kas</span>
                      <span>{formatter.format(820000000)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Piutang Usaha</span>
                      <span>{formatter.format(350000000)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Persediaan</span>
                      <span>{formatter.format(120000000)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Aset Tetap</span>
                      <span>{formatter.format(3910000000)}</span>
                    </div>
                    <div className="flex justify-between py-1 font-semibold">
                      <span>Total Aset</span>
                      <span>{formatter.format(laporanData.laporanKeuangan.asetTotal)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Kewajiban</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b">
                      <span>Utang Usaha</span>
                      <span>{formatter.format(250000000)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Utang Bank</span>
                      <span>{formatter.format(1850000000)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Utang Pajak</span>
                      <span>{formatter.format(350000000)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Kewajiban Lainnya</span>
                      <span>{formatter.format(350000000)}</span>
                    </div>
                    <div className="flex justify-between py-1 font-semibold">
                      <span>Total Kewajiban</span>
                      <span>{formatter.format(laporanData.laporanKeuangan.kewajibanTotal)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ekuitas</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b">
                      <span>Modal Disetor</span>
                      <span>{formatter.format(1500000000)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span>Laba Ditahan</span>
                      <span>{formatter.format(900000000)}</span>
                    </div>
                    <div className="flex justify-between py-1 font-semibold">
                      <span>Total Ekuitas</span>
                      <span>{formatter.format(laporanData.laporanKeuangan.ekuitasTotal)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between py-1 font-bold text-lg">
                    <span>Total Kewajiban + Ekuitas</span>
                    <span>{formatter.format(laporanData.laporanKeuangan.kewajibanTotal + laporanData.laporanKeuangan.ekuitasTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dokumen" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Dokumen Laporan Keuangan</CardTitle>
              <CardDescription>Laporan keuangan yang tersedia untuk diunduh</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 mr-4 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">Laporan Keuangan Bulanan - Maret 2025</h3>
                      <p className="text-sm text-muted-foreground">PDF - 2.4 MB</p>
                    </div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" /> Unduh
                  </Button>
                </div>
                
                <div className="p-4 border rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 mr-4 text-green-500" />
                    <div>
                      <h3 className="font-semibold">Laporan Laba Rugi - Maret 2025</h3>
                      <p className="text-sm text-muted-foreground">Excel - 1.8 MB</p>
                    </div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" /> Unduh
                  </Button>
                </div>
                
                <div className="p-4 border rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 mr-4 text-red-500" />
                    <div>
                      <h3 className="font-semibold">Neraca Keuangan - Maret 2025</h3>
                      <p className="text-sm text-muted-foreground">PDF - 1.5 MB</p>
                    </div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" /> Unduh
                  </Button>
                </div>
                
                <div className="p-4 border rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 mr-4 text-orange-500" />
                    <div>
                      <h3 className="font-semibold">Laporan Arus Kas - Maret 2025</h3>
                      <p className="text-sm text-muted-foreground">PDF - 1.2 MB</p>
                    </div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" /> Unduh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}