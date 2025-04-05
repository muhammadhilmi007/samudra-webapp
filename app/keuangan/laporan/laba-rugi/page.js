'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Download, Printer, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function LabaRugiPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [periodeFilter, setPeriodeFilter] = useState('2025-03');
  const [expandedCategories, setExpandedCategories] = useState({});
  
  useEffect(() => {
    // Simulasi fetch data dari API
    setTimeout(() => {
      setData({
        periodeLabel: 'Maret 2025',
        pendapatan: {
          total: 1120000000,
          perbandingan: 1050000000, // bulan sebelumnya
          kategori: [
            {
              nama: 'Pendapatan Operasional',
              jumlah: 1080000000,
              subKategori: [
                { nama: 'Pendapatan Pengiriman', jumlah: 920000000 },
                { nama: 'Pendapatan Jasa Pengemasan', jumlah: 80000000 },
                { nama: 'Pendapatan Jasa Asuransi', jumlah: 50000000 },
                { nama: 'Pendapatan Jasa Tracking', jumlah: 30000000 }
              ]
            },
            {
              nama: 'Pendapatan Non-Operasional',
              jumlah: 40000000,
              subKategori: [
                { nama: 'Pendapatan Bunga Bank', jumlah: 25000000 },
                { nama: 'Pendapatan Lain-lain', jumlah: 15000000 }
              ]
            }
          ]
        },
        beban: {
          total: 930000000,
          perbandingan: 900000000, // bulan sebelumnya
          kategori: [
            {
              nama: 'Beban Operasional',
              jumlah: 840000000,
              subKategori: [
                { nama: 'Beban Gaji Karyawan', jumlah: 450000000 },
                { nama: 'Beban Bahan Bakar', jumlah: 150000000 },
                { nama: 'Beban Perawatan Kendaraan', jumlah: 120000000 },
                { nama: 'Beban Penyusutan Kendaraan', jumlah: 80000000 },
                { nama: 'Beban Operasional Lainnya', jumlah: 40000000 }
              ]
            },
            {
              nama: 'Beban Administrasi & Umum',
              jumlah: 90000000,
              subKategori: [
                { nama: 'Beban Sewa Kantor', jumlah: 35000000 },
                { nama: 'Beban Utilitas', jumlah: 15000000 },
                { nama: 'Beban Telepon & Internet', jumlah: 12000000 },
                { nama: 'Beban ATK & Supplies', jumlah: 8000000 },
                { nama: 'Beban Administrasi Lainnya', jumlah: 20000000 }
              ]
            }
          ]
        },
        pajak: {
          jumlah: 47500000
        },
        labaBersih: {
          jumlah: 142500000,
          perbandingan: 125000000 // bulan sebelumnya
        },
        trendLabaRugi: [
          { bulan: 'Jan', pendapatan: 980, beban: 850, laba: 130 },
          { bulan: 'Feb', pendapatan: 1050, beban: 900, laba: 150 },
          { bulan: 'Mar', pendapatan: 1120, beban: 930, laba: 190 },
        ]
      });
      setLoading(false);
    }, 1000);
  }, [periodeFilter]);
  
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  });
  
  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat laporan laba rugi...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/laporan/keuangan">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Laporan Laba Rugi</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodeFilter} onValueChange={setPeriodeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-03">Maret 2025</SelectItem>
              <SelectItem value="2025-02">Februari 2025</SelectItem>
              <SelectItem value="2025-01">Januari 2025</SelectItem>
              <SelectItem value="2024-12">Desember 2024</SelectItem>
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
      
      <Tabs defaultValue="laporan" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
          <TabsTrigger value="grafik">Grafik</TabsTrigger>
        </TabsList>
        
        <TabsContent value="laporan" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Laba Rugi - {data.periodeLabel}</CardTitle>
              <CardDescription>Ringkasan laba rugi periode {data.periodeLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[60%]">Keterangan</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Pendapatan */}
                    <TableRow className="font-medium">
                      <TableCell>Pendapatan</TableCell>
                      <TableCell className="text-right">{formatter.format(data.pendapatan.total)}</TableCell>
                    </TableRow>
                    
                    {data.pendapatan.kategori.map((kategori, idx) => (
                      <React.Fragment key={`pendapatan-${idx}`}>
                        <TableRow>
                          <TableCell className="pl-6">
                            <button 
                              onClick={() => toggleCategory(`pendapatan-${idx}`)}
                              className="flex items-center text-left w-full"
                            >
                              {expandedCategories[`pendapatan-${idx}`] ? (
                                <ChevronDown className="h-4 w-4 mr-1" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-1" />
                              )}
                              {kategori.nama}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">{formatter.format(kategori.jumlah)}</TableCell>
                        </TableRow>
                        
                        {expandedCategories[`pendapatan-${idx}`] && kategori.subKategori.map((sub, subIdx) => (
                          <TableRow key={`pendapatan-${idx}-${subIdx}`} className="bg-muted/20">
                            <TableCell className="pl-12 text-sm">{sub.nama}</TableCell>
                            <TableCell className="text-right text-sm">{formatter.format(sub.jumlah)}</TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                    
                    {/* Beban */}
                    <TableRow className="font-medium bg-muted/40">
                      <TableCell>Beban</TableCell>
                      <TableCell className="text-right text-red-500">({formatter.format(data.beban.total)})</TableCell>
                    </TableRow>
                    
                    {data.beban.kategori.map((kategori, idx) => (
                      <React.Fragment key={`beban-${idx}`}>
                        <TableRow>
                          <TableCell className="pl-6">
                            <button 
                              onClick={() => toggleCategory(`beban-${idx}`)}
                              className="flex items-center text-left w-full"
                            >
                              {expandedCategories[`beban-${idx}`] ? (
                                <ChevronDown className="h-4 w-4 mr-1" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-1" />
                              )}
                              {kategori.nama}
                            </button>
                          </TableCell>
                          <TableCell className="text-right text-red-500">({formatter.format(kategori.jumlah)})</TableCell>
                        </TableRow>
                        
                        {expandedCategories[`beban-${idx}`] && kategori.subKategori.map((sub, subIdx) => (
                          <TableRow key={`beban-${idx}-${subIdx}`} className="bg-muted/20">
                            <TableCell className="pl-12 text-sm">{sub.nama}</TableCell>
                            <TableCell className="text-right text-sm text-red-500">({formatter.format(sub.jumlah)})</TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                    
                    {/* Laba Sebelum Pajak */}
                    <TableRow className="font-medium">
                      <TableCell>Laba Sebelum Pajak</TableCell>
                      <TableCell className="text-right">{formatter.format(data.pendapatan.total - data.beban.total)}</TableCell>
                    </TableRow>
                    
                    {/* Pajak */}
                    <TableRow>
                      <TableCell className="pl-6">Pajak Penghasilan</TableCell>
                      <TableCell className="text-right text-red-500">({formatter.format(data.pajak.jumlah)})</TableCell>
                    </TableRow>
                    
                    {/* Laba Bersih */}
                    <TableRow className="font-semibold text-lg bg-muted/30">
                      <TableCell>Laba Bersih</TableCell>
                      <TableCell className="text-right text-green-600">{formatter.format(data.labaBersih.jumlah)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 p-4 border rounded-md">
                <h3 className="font-semibold mb-2">Analisis Perbandingan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-muted-foreground">Pendapatan</p>
                    <p className="text-lg font-semibold">{formatter.format(data.pendapatan.total)}</p>
                    <p className={`text-sm ${data.pendapatan.total > data.pendapatan.perbandingan ? 'text-green-600' : 'text-red-600'}`}>
                      {data.pendapatan.total > data.pendapatan.perbandingan ? '+' : ''}
                      {((data.pendapatan.total - data.pendapatan.perbandingan) / data.pendapatan.perbandingan * 100).toFixed(1)}% dari bulan lalu
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-muted-foreground">Beban</p>
                    <p className="text-lg font-semibold">{formatter.format(data.beban.total)}</p>
                    <p className={`text-sm ${data.beban.total > data.beban.perbandingan ? 'text-red-600' : 'text-green-600'}`}>
                      {data.beban.total > data.beban.perbandingan ? '+' : ''}
                      {((data.beban.total - data.beban.perbandingan) / data.beban.perbandingan * 100).toFixed(1)}% dari bulan lalu
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-muted-foreground">Laba Bersih</p>
                    <p className="text-lg font-semibold">{formatter.format(data.labaBersih.jumlah)}</p>
                    <p className={`text-sm ${data.labaBersih.jumlah > data.labaBersih.perbandingan ? 'text-green-600' : 'text-red-600'}`}>
                      {data.labaBersih.jumlah > data.labaBersih.perbandingan ? '+' : ''}
                      {((data.labaBersih.jumlah - data.labaBersih.perbandingan) / data.labaBersih.perbandingan * 100).toFixed(1)}% dari bulan lalu
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="grafik" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Laba Rugi - 3 Bulan Terakhir</CardTitle>
              <CardDescription>Perbandingan pendapatan, beban, dan laba bersih (dalam juta rupiah)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.trendLabaRugi}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} Juta`, '']} />
                    <Legend />
                    <Bar dataKey="pendapatan" name="Pendapatan" fill="#8884d8" />
                    <Bar dataKey="beban" name="Beban" fill="#82ca9d" />
                    <Bar dataKey="laba" name="Laba Bersih" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Trend Laba Bersih</CardTitle>
              <CardDescription>Trend laba bersih 3 bulan terakhir (dalam juta rupiah)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.trendLabaRugi}
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
                      dataKey="laba" 
                      stroke="#ffc658" 
                      name="Laba Bersih"
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Pendapatan</CardTitle>
                <CardDescription>Proporsi komponen pendapatan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.pendapatan.kategori.flatMap(kategori => 
                        kategori.subKategori.map(sub => ({
                          name: sub.nama,
                          value: sub.jumlah / 1000000
                        }))
                      )}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => [`${value} Juta`, '']} />
                      <Bar dataKey="value" fill="#8884d8" name="Nilai (Juta)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Beban</CardTitle>
                <CardDescription>Proporsi komponen beban</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.beban.kategori.flatMap(kategori => 
                        kategori.subKategori.slice(0, 5).map(sub => ({
                          name: sub.nama.replace('Beban ', ''),
                          value: sub.jumlah / 1000000
                        }))
                      )}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => [`${value} Juta`, '']} />
                      <Bar dataKey="value" fill="#82ca9d" name="Nilai (Juta)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}