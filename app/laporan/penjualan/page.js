'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Download, Printer, Calendar } from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

export default function LaporanPenjualanPage() {
  const [loading, setLoading] = useState(true);
  const [laporanData, setLaporanData] = useState(null);
  const [periodeFilter, setPeriodeFilter] = useState('2025-03');
  
  useEffect(() => {
    // Simulasi fetch data dari API
    setTimeout(() => {
      setLaporanData({
        penjualanPerCabang: [
            { cabang: 'Jakarta', penjualan: 450, STT: 320 },
            { cabang: 'Surabaya', penjualan: 320, STT: 230 },
            { cabang: 'Bandung', penjualan: 230, STT: 180 },
            { cabang: 'Medan', penjualan: 120, STT: 90 },
          ],
          penjualanPerJenis: [
            { jenis: 'CASH', nilai: 420 },
            { jenis: 'COD', nilai: 350 },
            { jenis: 'CAD', nilai: 350 },
          ],
          penjualanTrend: [
            { bulan: 'Jan', penjualan: 980 },
            { bulan: 'Feb', penjualan: 1050 },
            { bulan: 'Mar', penjualan: 1120 },
          ],
          topPelanggan: [
            { nama: 'PT Maju Terus', penjualan: 120, persentase: 10.7 },
            { nama: 'CV Bersama Jaya', penjualan: 85, persentase: 7.6 },
            { nama: 'PT Global Indo', penjualan: 75, persentase: 6.7 },
            { nama: 'PT Karya Abadi', penjualan: 65, persentase: 5.8 },
            { nama: 'UD Sejahtera', penjualan: 50, persentase: 4.5 },
          ],
          detailPenjualan: [
            { tanggal: '2025-03-28', noSTT: 'JKT-280325-1001', pelanggan: 'PT Maju Terus', tujuan: 'Surabaya', nilai: 4500000, status: 'Terkirim' },
            { tanggal: '2025-03-28', noSTT: 'JKT-280325-1002', pelanggan: 'CV Bersama Jaya', tujuan: 'Bandung', nilai: 3200000, status: 'Terkirim' },
            { tanggal: '2025-03-27', noSTT: 'JKT-270325-0987', pelanggan: 'PT Global Indo', tujuan: 'Medan', nilai: 8500000, status: 'Transit' },
            { tanggal: '2025-03-27', noSTT: 'JKT-270325-0988', pelanggan: 'PT Karya Abadi', tujuan: 'Makassar', nilai: 7200000, status: 'Transit' },
            { tanggal: '2025-03-26', noSTT: 'JKT-260325-0965', pelanggan: 'UD Sejahtera', tujuan: 'Surabaya', nilai: 2800000, status: 'Terkirim' },
            { tanggal: '2025-03-26', noSTT: 'JKT-260325-0966', pelanggan: 'PT Maju Terus', tujuan: 'Yogyakarta', nilai: 3700000, status: 'Terkirim' },
            { tanggal: '2025-03-25', noSTT: 'JKT-250325-0954', pelanggan: 'CV Bersama Jaya', tujuan: 'Semarang', nilai: 4100000, status: 'Terkirim' },
            { tanggal: '2025-03-25', noSTT: 'JKT-250325-0955', pelanggan: 'PT Global Indo', tujuan: 'Bali', nilai: 9800000, status: 'Terkirim' },
          ]
        });
        setLoading(false);
      }, 1000);
    }, [periodeFilter]);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
    
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    });
    
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    };
    
    if (loading) {
      return (
        <div className="container mx-auto p-4 flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Memuat laporan penjualan...</span>
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
            <h1 className="text-2xl font-bold">Laporan Penjualan</h1>
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
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detail">Detail</TabsTrigger>
            <TabsTrigger value="pelanggan">Pelanggan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Penjualan per Cabang</CardTitle>
                  <CardDescription>Nilai penjualan dalam juta rupiah</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={laporanData.penjualanPerCabang}
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
                        <Tooltip formatter={(value) => [`${value} Juta`, '']} />
                        <Legend />
                        <Bar dataKey="penjualan" name="Nilai Penjualan" fill="#8884d8" />
                        <Bar dataKey="STT" name="Jumlah STT" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Trend Penjualan</CardTitle>
                  <CardDescription>Penjualan 3 bulan terakhir dalam juta rupiah</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={laporanData.penjualanTrend}
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
                        <Tooltip formatter={(value) => [`${value} Juta`, 'Penjualan']} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="penjualan" 
                          stroke="#8884d8" 
                          fill="#8884d8"
                          name="Penjualan"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Penjualan per Metode Pembayaran</CardTitle>
                  <CardDescription>Distribusi berdasarkan jenis pembayaran dalam juta rupiah</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={laporanData.penjualanPerJenis}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="jenis" />
                        <Tooltip formatter={(value) => [`${value} Juta`, 'Nilai']} />
                        <Legend />
                        <Bar dataKey="nilai" name="Nilai Penjualan" fill="#8884d8">
                          {laporanData.penjualanPerJenis.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Pelanggan</CardTitle>
                  <CardDescription>Pelanggan dengan nilai penjualan tertinggi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {laporanData.topPelanggan.map((pelanggan, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold">{index + 1}. {pelanggan.nama}</span>
                            <p className="text-sm text-muted-foreground">{pelanggan.penjualan} Juta ({pelanggan.persentase}%)</p>
                          </div>
                          <span className="font-medium">{formatter.format(pelanggan.penjualan * 1000000)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${(pelanggan.penjualan / laporanData.topPelanggan[0].penjualan) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="detail" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Detail Transaksi Penjualan</CardTitle>
                <CardDescription>Transaksi penjualan bulan Maret 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>No STT</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Tujuan</TableHead>
                        <TableHead className="text-right">Nilai</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {laporanData.detailPenjualan.map((transaksi, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(transaksi.tanggal)}</TableCell>
                          <TableCell>{transaksi.noSTT}</TableCell>
                          <TableCell>{transaksi.pelanggan}</TableCell>
                          <TableCell>{transaksi.tujuan}</TableCell>
                          <TableCell className="text-right">{formatter.format(transaksi.nilai)}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              transaksi.status === 'Terkirim' ? 'bg-green-100 text-green-800' :
                              transaksi.status === 'Transit' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {transaksi.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pelanggan" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Analisis Pelanggan</CardTitle>
                <CardDescription>Detail penjualan berdasarkan pelanggan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {laporanData.topPelanggan.map((pelanggan, index) => (
                    <div key={index} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">{pelanggan.nama}</h3>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Top #{index + 1}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-muted-foreground">Nilai Penjualan</p>
                          <p className="text-lg font-semibold">{formatter.format(pelanggan.penjualan * 1000000)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-muted-foreground">Kontribusi</p>
                          <p className="text-lg font-semibold">{pelanggan.persentase}% dari total</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-muted-foreground">Jumlah Transaksi</p>
                          <p className="text-lg font-semibold">{Math.floor(pelanggan.penjualan / 10)} transaksi</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="mr-2 h-4 w-4" /> Riwayat Transaksi
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" /> Ekspor Data
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }