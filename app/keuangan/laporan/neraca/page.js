'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Download, Printer, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function NeracaPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [periodeFilter, setPeriodeFilter] = useState('2025-03');
  const [expandedCategories, setExpandedCategories] = useState({});
  
  useEffect(() => {
    // Simulasi fetch data dari API
    setTimeout(() => {
      setData({
        periodeLabel: 'Per 31 Maret 2025',
        tanggal: '31 Maret 2025',
        aset: {
          total: 5200000000,
          kategori: [
            {
              nama: 'Aset Lancar',
              jumlah: 1290000000,
              subKategori: [
                { nama: 'Kas & Setara Kas', jumlah: 420000000 },
                { nama: 'Kas di Bank', jumlah: 400000000 },
                { nama: 'Piutang Usaha', jumlah: 350000000 },
                { nama: 'Persediaan', jumlah: 80000000 },
                { nama: 'Biaya Dibayar di Muka', jumlah: 40000000 }
              ]
            },
            {
              nama: 'Aset Tetap',
              jumlah: 3910000000,
              subKategori: [
                { nama: 'Tanah', jumlah: 1200000000 },
                { nama: 'Bangunan', jumlah: 1500000000 },
                { nama: 'Kendaraan', jumlah: 2050000000 },
                { nama: 'Peralatan Kantor', jumlah: 250000000 },
                { nama: 'Akumulasi Penyusutan', jumlah: -1090000000 }
              ]
            }
          ]
        },
        kewajiban: {
          total: 2800000000,
          kategori: [
            {
              nama: 'Kewajiban Lancar',
              jumlah: 750000000,
              subKategori: [
                { nama: 'Utang Usaha', jumlah: 250000000 },
                { nama: 'Utang Pajak', jumlah: 150000000 },
                { nama: 'Utang Gaji', jumlah: 200000000 },
                { nama: 'Bagian Lancar Utang Bank', jumlah: 150000000 }
              ]
            },
            {
              nama: 'Kewajiban Jangka Panjang',
              jumlah: 2050000000,
              subKategori: [
                { nama: 'Utang Bank', jumlah: 1700000000 },
                { nama: 'Utang Leasing', jumlah: 350000000 }
              ]
            }
          ]
        },
        ekuitas: {
          total: 2400000000,
          kategori: [
            { nama: 'Modal Disetor', jumlah: 1500000000 },
            { nama: 'Laba Ditahan', jumlah: 757500000 },
            { nama: 'Laba Tahun Berjalan', jumlah: 142500000 }
          ]
        },
        perbandingan: {
          bulanLalu: {
            aset: 5100000000,
            kewajiban: 2800000000,
            ekuitas: 2300000000
          }
        }
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
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e91e63'];
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat neraca keuangan...</span>
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
          <h1 className="text-2xl font-bold">Neraca Keuangan</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodeFilter} onValueChange={setPeriodeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-03">Per 31 Maret 2025</SelectItem>
              <SelectItem value="2025-02">Per 28 Februari 2025</SelectItem>
              <SelectItem value="2025-01">Per 31 Januari 2025</SelectItem>
              <SelectItem value="2024-12">Per 31 Desember 2024</SelectItem>
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
      
      <Tabs defaultValue="neraca" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="neraca">Neraca</TabsTrigger>
          <TabsTrigger value="grafik">Grafik</TabsTrigger>
        </TabsList>
        
        <TabsContent value="neraca" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Neraca Keuangan - {data.periodeLabel}</CardTitle>
              <CardDescription>Posisi keuangan per tanggal {data.tanggal}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead colSpan={2} className="text-center font-bold">NERACA KEUANGAN</TableHead>
                    </TableRow>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-center" colSpan={2}>Per {data.tanggal}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Aset */}
                    <TableRow className="font-medium bg-muted/40">
                      <TableCell colSpan={2}>ASET</TableCell>
                    </TableRow>
                    
                    {data.aset.kategori.map((kategori, idx) => (
                      <React.Fragment key={`aset-${idx}`}>
                        <TableRow className="font-medium">
                          <TableCell className="pl-6">
                            <button 
                              onClick={() => toggleCategory(`aset-${idx}`)}
                              className="flex items-center text-left w-full"
                            >
                              {expandedCategories[`aset-${idx}`] ? (
                                <ChevronDown className="h-4 w-4 mr-1" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-1" />
                              )}
                              {kategori.nama}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">{formatter.format(kategori.jumlah)}</TableCell>
                          </TableRow>
                        
                        {expandedCategories[`aset-${idx}`] && kategori.subKategori.map((sub, subIdx) => (
                          <TableRow key={`aset-${idx}-${subIdx}`} className="bg-muted/20">
                            <TableCell className="pl-12 text-sm">{sub.nama}</TableCell>
                            <TableCell className="text-right text-sm">{formatter.format(sub.jumlah)}</TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                    
                    <TableRow className="font-bold">
                      <TableCell>Total Aset</TableCell>
                      <TableCell className="text-right">{formatter.format(data.aset.total)}</TableCell>
                    </TableRow>
                    
                    {/* Kewajiban */}
                    <TableRow className="font-medium bg-muted/40">
                      <TableCell colSpan={2}>KEWAJIBAN</TableCell>
                    </TableRow>
                    
                    {data.kewajiban.kategori.map((kategori, idx) => (
                      <React.Fragment key={`kewajiban-${idx}`}>
                        <TableRow className="font-medium">
                          <TableCell className="pl-6">
                            <button 
                              onClick={() => toggleCategory(`kewajiban-${idx}`)}
                              className="flex items-center text-left w-full"
                            >
                              {expandedCategories[`kewajiban-${idx}`] ? (
                                <ChevronDown className="h-4 w-4 mr-1" />
                              ) : (
                                <ChevronRight className="h-4 w-4 mr-1" />
                              )}
                              {kategori.nama}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">{formatter.format(kategori.jumlah)}</TableCell>
                        </TableRow>
                        
                        {expandedCategories[`kewajiban-${idx}`] && kategori.subKategori.map((sub, subIdx) => (
                          <TableRow key={`kewajiban-${idx}-${subIdx}`} className="bg-muted/20">
                            <TableCell className="pl-12 text-sm">{sub.nama}</TableCell>
                            <TableCell className="text-right text-sm">{formatter.format(sub.jumlah)}</TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                    
                    <TableRow className="font-semibold">
                      <TableCell>Total Kewajiban</TableCell>
                      <TableCell className="text-right">{formatter.format(data.kewajiban.total)}</TableCell>
                    </TableRow>
                    
                    {/* Ekuitas */}
                    <TableRow className="font-medium bg-muted/40">
                      <TableCell colSpan={2}>EKUITAS</TableCell>
                    </TableRow>
                    
                    {data.ekuitas.kategori.map((item, idx) => (
                      <TableRow key={`ekuitas-${idx}`}>
                        <TableCell className="pl-6">{item.nama}</TableCell>
                        <TableCell className="text-right">{formatter.format(item.jumlah)}</TableCell>
                      </TableRow>
                    ))}
                    
                    <TableRow className="font-semibold">
                      <TableCell>Total Ekuitas</TableCell>
                      <TableCell className="text-right">{formatter.format(data.ekuitas.total)}</TableCell>
                    </TableRow>
                    
                    {/* Total Kewajiban dan Ekuitas */}
                    <TableRow className="font-bold bg-muted/30">
                      <TableCell>Total Kewajiban dan Ekuitas</TableCell>
                      <TableCell className="text-right">{formatter.format(data.kewajiban.total + data.ekuitas.total)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 p-4 border rounded-md">
                <h3 className="font-semibold mb-2">Analisis Perbandingan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-muted-foreground">Total Aset</p>
                    <p className="text-lg font-semibold">{formatter.format(data.aset.total)}</p>
                    <p className={`text-sm ${data.aset.total > data.perbandingan.bulanLalu.aset ? 'text-green-600' : 'text-red-600'}`}>
                      {data.aset.total > data.perbandingan.bulanLalu.aset ? '+' : ''}
                      {((data.aset.total - data.perbandingan.bulanLalu.aset) / data.perbandingan.bulanLalu.aset * 100).toFixed(1)}% dari bulan lalu
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-muted-foreground">Total Kewajiban</p>
                    <p className="text-lg font-semibold">{formatter.format(data.kewajiban.total)}</p>
                    <p className={`text-sm ${data.kewajiban.total > data.perbandingan.bulanLalu.kewajiban ? 'text-red-600' : 'text-green-600'}`}>
                      {data.kewajiban.total > data.perbandingan.bulanLalu.kewajiban ? '+' : ''}
                      {((data.kewajiban.total - data.perbandingan.bulanLalu.kewajiban) / data.perbandingan.bulanLalu.kewajiban * 100).toFixed(1)}% dari bulan lalu
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-muted-foreground">Total Ekuitas</p>
                    <p className="text-lg font-semibold">{formatter.format(data.ekuitas.total)}</p>
                    <p className={`text-sm ${data.ekuitas.total > data.perbandingan.bulanLalu.ekuitas ? 'text-green-600' : 'text-red-600'}`}>
                      {data.ekuitas.total > data.perbandingan.bulanLalu.ekuitas ? '+' : ''}
                      {((data.ekuitas.total - data.perbandingan.bulanLalu.ekuitas) / data.perbandingan.bulanLalu.ekuitas * 100).toFixed(1)}% dari bulan lalu
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="grafik" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Komposisi Aset</CardTitle>
                <CardDescription>Proporsi aset perusahaan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.aset.kategori.flatMap(kategori => 
                          kategori.subKategori.filter(sub => sub.jumlah > 0).map(sub => ({
                            name: sub.nama,
                            value: sub.jumlah
                          }))
                        )}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.aset.kategori.flatMap(kategori => 
                          kategori.subKategori.filter(sub => sub.jumlah > 0)
                        ).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatter.format(value), 'Nilai']} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Komposisi Kewajiban & Ekuitas</CardTitle>
                <CardDescription>Proporsi kewajiban dan ekuitas perusahaan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          ...data.kewajiban.kategori,
                          { nama: 'Ekuitas', jumlah: data.ekuitas.total }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="jumlah"
                        nameKey="nama"
                      >
                        {[
                          ...data.kewajiban.kategori,
                          { nama: 'Ekuitas', jumlah: data.ekuitas.total }
                        ].map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [formatter.format(value), 'Nilai']} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Perbandingan Aset, Kewajiban, dan Ekuitas</CardTitle>
              <CardDescription>Perbandingan nilai (dalam miliar rupiah)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Bulan Lalu',
                        aset: data.perbandingan.bulanLalu.aset / 1000000000,
                        kewajiban: data.perbandingan.bulanLalu.kewajiban / 1000000000,
                        ekuitas: data.perbandingan.bulanLalu.ekuitas / 1000000000
                      },
                      {
                        name: 'Bulan Ini',
                        aset: data.aset.total / 1000000000,
                        kewajiban: data.kewajiban.total / 1000000000,
                        ekuitas: data.ekuitas.total / 1000000000
                      }
                    ]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} Miliar`, '']} />
                    <Legend />
                    <Bar dataKey="aset" name="Aset" fill="#8884d8" />
                    <Bar dataKey="kewajiban" name="Kewajiban" fill="#82ca9d" />
                    <Bar dataKey="ekuitas" name="Ekuitas" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analisis Rasio Keuangan</CardTitle>
              <CardDescription>Rasio keuangan utama</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md">
                  <h3 className="font-semibold mb-1">Rasio Lancar</h3>
                  <p className="text-2xl font-bold">
                    {(data.aset.kategori[0].jumlah / data.kewajiban.kategori[0].jumlah).toFixed(2)}x
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kemampuan memenuhi kewajiban jangka pendek
                  </p>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-semibold mb-1">Rasio Utang terhadap Aset</h3>
                  <p className="text-2xl font-bold">
                    {((data.kewajiban.total / data.aset.total) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Persentase aset yang dibiayai oleh utang
                  </p>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-semibold mb-1">Rasio Utang terhadap Ekuitas</h3>
                  <p className="text-2xl font-bold">
                    {(data.kewajiban.total / data.ekuitas.total).toFixed(2)}x
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Perbandingan kewajiban dengan ekuitas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}