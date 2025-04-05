'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Download, Printer, FileText } from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

export default function LaporanOperasionalPage() {
  const [loading, setLoading] = useState(true);
  const [laporanData, setLaporanData] = useState(null);
  const [periodeFilter, setPeriodeFilter] = useState('2025-03');
  
  useEffect(() => {
    // Simulasi fetch data dari API
    setTimeout(() => {
      setLaporanData({
        ketepatanPengiriman: {
          tepatWaktu: 742,
          terlambat: 238,
          persentase: 75.7,
          trendBulanan: [
            { bulan: 'Jan', persentase: 72 },
            { bulan: 'Feb', persentase: 74 },
            { bulan: 'Mar', persentase: 75.7 }
          ],
          perCabang: [
            { cabang: 'Jakarta', tepatWaktu: 260, terlambat: 60, total: 320 },
            { cabang: 'Surabaya', tepatWaktu: 190, terlambat: 40, total: 230 },
            { cabang: 'Bandung', tepatWaktu: 150, terlambat: 30, total: 180 },
            { cabang: 'Medan', tepatWaktu: 82, terlambat: 68, total: 150 },
          ]
        },
        statusPengiriman: [
          { status: 'Baru', jumlah: 120 },
          { status: 'Muat', jumlah: 85 },
          { status: 'Transit', jumlah: 150 },
          { status: 'Lansir', jumlah: 75 },
          { status: 'Terkirim', jumlah: 520 },
          { status: 'Retur', jumlah: 30 }
        ],
        kendaraan: {
          performa: [
            { jenisKendaraan: 'Box', aktif: 18, maintenance: 2, nonaktif: 0, total: 20 },
            { jenisKendaraan: 'Pickup', aktif: 10, maintenance: 1, nonaktif: 1, total: 12 },
            { jenisKendaraan: 'Tronton', aktif: 7, maintenance: 1, nonaktif: 0, total: 8 },
            { jenisKendaraan: 'Trailer', aktif: 3, maintenance: 0, nonaktif: 1, total: 4 }
          ],
          utilisasi: [
            { tanggal: '01/03', persentase: 82 },
            { tanggal: '08/03', persentase: 85 },
            { tanggal: '15/03', persentase: 80 },
            { tanggal: '22/03', persentase: 88 },
            { tanggal: '29/03', persentase: 84 }
          ]
        },
        topSupir: [
          { nama: 'Budi Santoso', pengiriman: 42, tepatWaktu: 39, persentase: 92.9 },
          { nama: 'Ahmad Fauzi', pengiriman: 38, tepatWaktu: 35, persentase: 92.1 },
          { nama: 'Irwan Setiawan', pengiriman: 36, tepatWaktu: 35, persentase: 97.2 },
          { nama: 'Dedi Cahyono', pengiriman: 35, tepatWaktu: 32, persentase: 91.4 },
          { nama: 'Eko Purnomo', pengiriman: 32, tepatWaktu: 28, persentase: 87.5 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [periodeFilter]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e91e63'];
  const STATUS_COLORS = {
    'Baru': '#0088FE',
    'Muat': '#00C49F',
    'Transit': '#FFBB28',
    'Lansir': '#FF8042',
    'Terkirim': '#8884d8',
    'Retur': '#e91e63'
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat laporan operasional...</span>
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
          <h1 className="text-2xl font-bold">Laporan Operasional</h1>
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
      
      <Tabs defaultValue="ketepatan" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="ketepatan">Ketepatan</TabsTrigger>
          <TabsTrigger value="status">Status Pengiriman</TabsTrigger>
          <TabsTrigger value="kendaraan">Kendaraan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ketepatan" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Ketepatan Pengiriman</CardTitle>
                <CardDescription>
                  Persentase ketepatan waktu pengiriman: {laporanData.ketepatanPengiriman.persentase}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Tepat Waktu', value: laporanData.ketepatanPengiriman.tepatWaktu },
                          { name: 'Terlambat', value: laporanData.ketepatanPengiriman.terlambat }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#4ade80" />
                        <Cell fill="#f87171" />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} pengiriman`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Trend Ketepatan Pengiriman</CardTitle>
                <CardDescription>
                  Persentase ketepatan per bulan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={laporanData.ketepatanPengiriman.trendBulanan}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bulan" />
                      <YAxis domain={[60, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Ketepatan']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="persentase" 
                        stroke="#8884d8" 
                        name="Persentase Ketepatan"
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Ketepatan per Cabang</CardTitle>
              <CardDescription>Perbandingan ketepatan pengiriman antar cabang</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={laporanData.ketepatanPengiriman.perCabang}
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
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tepatWaktu" name="Tepat Waktu" stackId="a" fill="#4ade80" />
                    <Bar dataKey="terlambat" name="Terlambat" stackId="a" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Persentase Ketepatan per Cabang</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cabang</TableHead>
                        <TableHead>Total Pengiriman</TableHead>
                        <TableHead>Tepat Waktu</TableHead>
                        <TableHead>Terlambat</TableHead>
                        <TableHead>Persentase</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {laporanData.ketepatanPengiriman.perCabang.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.cabang}</TableCell>
                          <TableCell>{item.total}</TableCell>
                          <TableCell>{item.tepatWaktu}</TableCell>
                          <TableCell>{item.terlambat}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              (item.tepatWaktu / item.total) * 100 >= 80 ? 'bg-green-100 text-green-800' :
                              (item.tepatWaktu / item.total) * 100 >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {((item.tepatWaktu / item.total) * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Performa Supir</CardTitle>
              <CardDescription>Supir dengan performa pengiriman terbaik</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Supir</TableHead>
                      <TableHead className="text-center">Total Pengiriman</TableHead>
                      <TableHead className="text-center">Tepat Waktu</TableHead>
                      <TableHead className="text-center">Persentase</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laporanData.topSupir.map((supir, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{supir.nama}</TableCell>
                        <TableCell className="text-center">{supir.pengiriman}</TableCell>
                        <TableCell className="text-center">{supir.tepatWaktu}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            supir.persentase >= 90 ? 'bg-green-100 text-green-800' :
                            supir.persentase >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {supir.persentase}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < Math.round(supir.persentase / 20) ? "text-yellow-500" : "text-gray-300"}>
                                ★
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Pengiriman</CardTitle>
              <CardDescription>Distribusi pengiriman berdasarkan status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={laporanData.statusPengiriman}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="jumlah"
                        nameKey="status"
                      >
                        {laporanData.statusPengiriman.map((entry) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} pengiriman`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Detail Status Pengiriman</h3>
                  <div className="space-y-2">
                    {laporanData.statusPengiriman.map((status) => (
                      <div key={status.status} className="p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2" 
                              style={{ backgroundColor: STATUS_COLORS[status.status] }}
                            ></div>
                            <span className="font-medium">{status.status}</span>
                          </div>
                          <span className="font-semibold">{status.jumlah} pengiriman</span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{ 
                                width: `${(status.jumlah / laporanData.statusPengiriman.reduce((sum, s) => sum + s.jumlah, 0)) * 100}%`,
                                backgroundColor: STATUS_COLORS[status.status]
                              }}
                            ></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {((status.jumlah / laporanData.statusPengiriman.reduce((sum, s) => sum + s.jumlah, 0)) * 100).toFixed(1)}% dari total pengiriman
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dokumen Laporan</CardTitle>
              <CardDescription>Laporan status pengiriman yang tersedia untuk diunduh</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 mr-4 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">Laporan Status Pengiriman - Maret 2025</h3>
                      <p className="text-sm text-muted-foreground">PDF - 1.8 MB</p>
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
                      <h3 className="font-semibold">Detail Pengiriman per Status - Maret 2025</h3>
                      <p className="text-sm text-muted-foreground">Excel - 2.3 MB</p>
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
        
        <TabsContent value="kendaraan" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilisasi Armada</CardTitle>
              <CardDescription>Persentase utilisasi armada per minggu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={laporanData.kendaraan.utilisasi}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tanggal" />
                    <YAxis domain={[60, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Utilisasi']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="persentase" 
                      stroke="#8884d8" 
                      name="Persentase Utilisasi"
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Rata-rata utilisasi: 83.8%</h3>
                <p className="text-sm text-muted-foreground">
                  Utilisasi dihitung dari jumlah kendaraan aktif dibandingkan dengan total kendaraan yang tersedia.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status Kendaraan</CardTitle>
              <CardDescription>Distribusi kendaraan berdasarkan jenis dan status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={laporanData.kendaraan.performa}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="jenisKendaraan" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="aktif" name="Aktif" stackId="a" fill="#4ade80" />
                    <Bar dataKey="maintenance" name="Maintenance" stackId="a" fill="#facc15" />
                    <Bar dataKey="nonaktif" name="Nonaktif" stackId="a" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Detail Status Kendaraan</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Jenis Kendaraan</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Aktif</TableHead>
                        <TableHead className="text-center">Maintenance</TableHead>
                        <TableHead className="text-center">Nonaktif</TableHead>
                        <TableHead className="text-right">% Aktif</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {laporanData.kendaraan.performa.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.jenisKendaraan}</TableCell>
                          <TableCell className="text-center">{item.total}</TableCell>
                          <TableCell className="text-center">{item.aktif}</TableCell>
                          <TableCell className="text-center">{item.maintenance}</TableCell>
                          <TableCell className="text-center">{item.nonaktif}</TableCell>
                          <TableCell className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              (item.aktif / item.total) * 100 >= 90 ? 'bg-green-100 text-green-800' :
                              (item.aktif / item.total) * 100 >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {((item.aktif / item.total) * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}