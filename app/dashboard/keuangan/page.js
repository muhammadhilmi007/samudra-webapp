'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Loader2, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function KeuanganDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulasi data fetch dari API
    setTimeout(() => {
      setDashboardData({
        cashflow: {
          pendapatan: 875000000,
          pengeluaran: 625000000,
          tanggal_update: "03 April 2025"
        },
        piutang: {
          total: 350000000,
          belum_jatuh_tempo: 200000000,
          jatuh_tempo: 150000000,
          overdue: 85000000
        },
        trendPendapatan: [
          { bulan: 'Jan', pendapatan: 780, pengeluaran: 540 },
          { bulan: 'Feb', pendapatan: 800, pengeluaran: 560 },
          { bulan: 'Mar', pendapatan: 840, pengeluaran: 590 },
          { bulan: 'Apr', pendapatan: 875, pengeluaran: 625 }
        ],
        pembayaran: [
          { metode: 'CASH', nilai: 375000000 },
          { metode: 'COD', nilai: 275000000 },
          { metode: 'CAD', nilai: 225000000 }
        ],
        pendapatanPerCabang: [
          { cabang: 'Jakarta', nilai: 320000000 },
          { cabang: 'Surabaya', nilai: 220000000 },
          { cabang: 'Bandung', nilai: 180000000 },
          { cabang: 'Medan', nilai: 120000000 },
          { cabang: 'Makassar', nilai: 90000000 }
        ],
        pengeluaranKategori: [
          { kategori: 'Gaji', nilai: 280000000 },
          { kategori: 'Operasional', nilai: 150000000 },
          { kategori: 'Kendaraan', nilai: 120000000 },
          { kategori: 'Bahan Bakar', nilai: 75000000 },
          { kategori: 'Lain-lain', nilai: 40000000 }
        ],
        labaRugi: {
          pendapatan: 875000000,
          biaya_operasional: 625000000,
          laba_kotor: 250000000,
          pajak: 50000000,
          laba_bersih: 200000000
        },
        kasCabang: [
          { cabang: 'Jakarta', saldo: 120000000 },
          { cabang: 'Surabaya', saldo: 85000000 },
          { cabang: 'Bandung', saldo: 65000000 },
          { cabang: 'Medan', saldo: 45000000 },
          { cabang: 'Makassar', saldo: 35000000 }
        ]
      });
      setLoading(false);
    }, 1200);
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data dashboard keuangan...</span>
      </div>
    );
  }
  
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e91e63'];
  const profitMargin = (dashboardData.labaRugi.laba_bersih / dashboardData.labaRugi.pendapatan * 100).toFixed(1);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Keuangan</h1>
      <p className="text-muted-foreground">
        Data keuangan per tanggal: {dashboardData.cashflow.tanggal_update}
      </p>
      
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold">{formatter.format(dashboardData.cashflow.pendapatan)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Bulan April 2025
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                <p className="text-2xl font-bold">{formatter.format(dashboardData.cashflow.pengeluaran)}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Bulan April 2025
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Laba Bersih</p>
                <p className="text-2xl font-bold">{formatter.format(dashboardData.labaRugi.laba_bersih)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Margin: {profitMargin}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Piutang</p>
                <p className="text-2xl font-bold">{formatter.format(dashboardData.piutang.total)}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <TrendingDown className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Overdue: {formatter.format(dashboardData.piutang.overdue)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pendapatan">Pendapatan</TabsTrigger>
          <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
          <TabsTrigger value="kasbank">Kas & Bank</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Trend Keuangan (4 Bulan Terakhir)</CardTitle>
                <CardDescription>Dalam juta rupiah</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dashboardData.trendPendapatan}
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
                <CardTitle>Metode Pembayaran</CardTitle>
                <CardDescription>Distribusi pendapatan berdasarkan metode pembayaran</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.pembayaran}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="nilai"
                        nameKey="metode"
                      >
                        {dashboardData.pembayaran.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatter.format(value), 'Nilai']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Laporan Laba Rugi</CardTitle>
              <CardDescription>Ringkasan laba rugi bulan berjalan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span>Total Pendapatan</span>
                  <span className="font-semibold">{formatter.format(dashboardData.labaRugi.pendapatan)}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span>Biaya Operasional</span>
                  <span className="font-semibold text-red-500">-{formatter.format(dashboardData.labaRugi.biaya_operasional)}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-semibold">Laba Kotor</span>
                  <span className="font-semibold">{formatter.format(dashboardData.labaRugi.laba_kotor)}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b">
                  <span>Pajak</span>
                  <span className="font-semibold text-red-500">-{formatter.format(dashboardData.labaRugi.pajak)}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold">Laba Bersih</span>
                  <span className="font-bold text-green-600">{formatter.format(dashboardData.labaRugi.laba_bersih)}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-muted-foreground">Profit Margin</span>
                  <span className="text-sm font-semibold text-green-600">{profitMargin}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pendapatan" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan per Cabang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.pendapatanPerCabang}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cabang" />
                    <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                    <Tooltip formatter={(value) => [formatter.format(value), 'Pendapatan']} />
                    <Legend />
                    <Bar dataKey="nilai" name="Pendapatan" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analisis Piutang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Status Piutang</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Total Piutang</span>
                        <span className="font-semibold">{formatter.format(dashboardData.piutang.total)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Belum Jatuh Tempo</span>
                        <span className="font-semibold">{formatter.format(dashboardData.piutang.belum_jatuh_tempo)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Jatuh Tempo</span>
                        <span className="font-semibold text-yellow-500">{formatter.format(dashboardData.piutang.jatuh_tempo)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Overdue (&gt;30 hari)</span>
                        <span className="font-semibold text-red-500">{formatter.format(dashboardData.piutang.overdue)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Metode Pembayaran</h3>
                    <div className="space-y-2">
                      {dashboardData.pembayaran.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{item.metode}</span>
                          <span className="font-semibold">{formatter.format(item.nilai)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Distribusi Piutang</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Belum Jatuh Tempo', value: dashboardData.piutang.belum_jatuh_tempo },
                            { name: 'Jatuh Tempo', value: dashboardData.piutang.jatuh_tempo - dashboardData.piutang.overdue },
                            { name: 'Overdue', value: dashboardData.piutang.overdue }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4ade80" />
                          <Cell fill="#facc15" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip formatter={(value) => [formatter.format(value), 'Nilai']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pengeluaran" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.pengeluaranKategori}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="nilai"
                      nameKey="kategori"
                    >
                      {dashboardData.pengeluaranKategori.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatter.format(value), 'Nilai']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detail Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Kategori</th>
                    <th className="text-right py-2">Nilai</th>
                    <th className="text-right py-2">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.pengeluaranKategori.map((item, index) => {
                    const totalPengeluaran = dashboardData.pengeluaranKategori.reduce((sum, item) => sum + item.nilai, 0);
                    const percentage = (item.nilai / totalPengeluaran * 100).toFixed(1);
                    
                    return (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.kategori}</td>
                        <td className="text-right py-2">{formatter.format(item.nilai)}</td>
                        <td className="text-right py-2">{percentage}%</td>
                      </tr>
                    );
                  })}
                  <tr className="border-b font-semibold">
                    <td className="py-2">Total</td>
                    <td className="text-right py-2">
                      {formatter.format(dashboardData.pengeluaranKategori.reduce((sum, item) => sum + item.nilai, 0))}
                    </td>
                    <td className="text-right py-2">100%</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="kasbank" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Saldo Kas per Cabang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.kasCabang}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cabang" />
                    <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                    <Tooltip formatter={(value) => [formatter.format(value), 'Saldo Kas']} />
                    <Legend />
                    <Bar dataKey="saldo" name="Saldo Kas" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Kas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span>Total Kas Cabang</span>
                    <span className="font-semibold">
                      {formatter.format(dashboardData.kasCabang.reduce((sum, item) => sum + item.saldo, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span>Kas Pusat</span>
                    <span className="font-semibold">
                      {formatter.format(350000000)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-bold">Total Saldo Kas</span>
                    <span className="font-bold">
                      {formatter.format(
                        dashboardData.kasCabang.reduce((sum, item) => sum + item.saldo, 0) + 350000000
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Rekening Bank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Bank BCA</h3>
                    <div className="flex items-center justify-between">
                      <span>Nomor Rekening</span>
                      <span className="font-semibold">123-456-789</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Saldo</span>
                      <span className="font-semibold">
                        {formatter.format(750000000)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Bank Mandiri</h3>
                    <div className="flex items-center justify-between">
                      <span>Nomor Rekening</span>
                      <span className="font-semibold">987-654-321</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Saldo</span>
                      <span className="font-semibold">
                        {formatter.format(520000000)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pb-2 pt-2 border-t">
                    <span className="font-bold">Total Saldo Bank</span>
                    <span className="font-bold">
                      {formatter.format(1270000000)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}