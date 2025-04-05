'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Loader2, Package, Truck, Clock, Calendar } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import StatusBadge from '@/components/shared/status-badge';
import { useToast } from '@/components/ui/use-toast';

export default function OperasionalDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulasi data fetch dari API
    setTimeout(() => {
      setDashboardData({
        pengiriman: {
          hari_ini: 45,
          minggu_ini: 245,
          bulan_ini: 980,
          status: {
            baru: 120,
            muat: 85,
            transit: 150,
            lansir: 75,
            terkirim: 520,
            retur: 30
          }
        },
        armada: {
          total: 42,
          aktif: 35,
          maintenance: 5,
          nonaktif: 2,
          jenis: {
            box: 18,
            pickup: 12,
            tronton: 8,
            trailer: 4
          },
          penggunaan: [
            { tanggal: '01/04', aktif: 32 },
            { tanggal: '02/04', aktif: 34 },
            { tanggal: '03/04', aktif: 35 },
            { tanggal: '04/04', aktif: 33 },
            { tanggal: '05/04', aktif: 31 },
            { tanggal: '06/04', aktif: 28 },
            { tanggal: '07/04', aktif: 32 }
          ]
        },
        ketepatan: {
          tepat_waktu: 740,
          terlambat: 240,
          retur: 30,
          performa: [
            { bulan: 'Jan', persentase: 72 },
            { bulan: 'Feb', persentase: 75 },
            { bulan: 'Mar', persentase: 78 },
            { bulan: 'Apr', persentase: 76 }
          ]
        },
        cabang: [
          { nama: 'Jakarta', pengiriman: 320, tepat_waktu: 260, terlambat: 60 },
          { nama: 'Surabaya', pengiriman: 240, tepat_waktu: 180, terlambat: 60 },
          { nama: 'Bandung', pengiriman: 180, tepat_waktu: 120, terlambat: 60 },
          { nama: 'Medan', pengiriman: 150, tepat_waktu: 110, terlambat: 40 },
          { nama: 'Makassar', pengiriman: 120, tepat_waktu: 90, terlambat: 30 }
        ],
        sopir_teratas: [
          { nama: 'Budi Santoso', pengiriman: 42, rating: 4.8 },
          { nama: 'Ahmad Fauzi', pengiriman: 38, rating: 4.7 },
          { nama: 'Irwan Setiawan', pengiriman: 36, rating: 4.9 },
          { nama: 'Dedi Cahyono', pengiriman: 35, rating: 4.6 },
          { nama: 'Eko Purnomo', pengiriman: 32, rating: 4.5 }
        ]
      });
      setLoading(false);
    }, 1200);
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data dashboard operasional...</span>
      </div>
    );
  }
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e91e63'];
  const ARMADA_COLORS = ['#4CAF50', '#FFC107', '#F44336'];
  
  // Data untuk pie chart status pengiriman
  const statusPieData = [
    { name: 'Baru', value: dashboardData.pengiriman.status.baru },
    { name: 'Muat', value: dashboardData.pengiriman.status.muat },
    { name: 'Transit', value: dashboardData.pengiriman.status.transit },
    { name: 'Lansir', value: dashboardData.pengiriman.status.lansir },
    { name: 'Terkirim', value: dashboardData.pengiriman.status.terkirim },
    { name: 'Retur', value: dashboardData.pengiriman.status.retur }
  ];
  
  // Data untuk pie chart status armada
  const armadaPieData = [
    { name: 'Aktif', value: dashboardData.armada.aktif },
    { name: 'Maintenance', value: dashboardData.armada.maintenance },
    { name: 'Nonaktif', value: dashboardData.armada.nonaktif }
  ];
  
  // Data untuk ketepatan
  const kepatuhanPieData = [
    { name: 'Tepat Waktu', value: dashboardData.ketepatan.tepat_waktu },
    { name: 'Terlambat', value: dashboardData.ketepatan.terlambat },
    { name: 'Retur', value: dashboardData.ketepatan.retur }
  ];
  
  // Menghitung persentase ketepatan pengiriman
  const persentaseKetepatan = Math.round(
    (dashboardData.ketepatan.tepat_waktu / 
    (dashboardData.ketepatan.tepat_waktu + dashboardData.ketepatan.terlambat + dashboardData.ketepatan.retur)) * 100
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Operasional</h1>
      
      {/* Key Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pengiriman Hari Ini</p>
                <p className="text-2xl font-bold">{dashboardData.pengiriman.hari_ini}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Total pengiriman bulan ini: {dashboardData.pengiriman.bulan_ini}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Armada Aktif</p>
                <p className="text-2xl font-bold">{dashboardData.armada.aktif} / {dashboardData.armada.total}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Truck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Utilitas armada: {Math.round((dashboardData.armada.aktif / dashboardData.armada.total) * 100)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ketepatan Pengiriman</p>
                <p className="text-2xl font-bold">{persentaseKetepatan}%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Total tepat waktu: {dashboardData.ketepatan.tepat_waktu} pengiriman
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pengiriman Bulan Ini</p>
                <p className="text-2xl font-bold">{dashboardData.pengiriman.bulan_ini}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Pengiriman minggu ini: {dashboardData.pengiriman.minggu_ini}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pengiriman">Pengiriman</TabsTrigger>
          <TabsTrigger value="armada">Armada</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Status Pengiriman</CardTitle>
                <CardDescription>Distribusi pengiriman berdasarkan status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, 'Jumlah']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status Armada</CardTitle>
                <CardDescription>Distribusi armada berdasarkan status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={armadaPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#4CAF50" /> {/* Aktif */}
                        <Cell fill="#FFC107" /> {/* Maintenance */}
                        <Cell fill="#F44336" /> {/* Nonaktif */}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, 'Jumlah']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performa Cabang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dashboardData.cabang.map((cabang, index) => {
                  const persentaseKetepatan = Math.round((cabang.tepat_waktu / cabang.pengiriman) * 100);
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{cabang.nama}</h3>
                        <span className="text-sm text-muted-foreground">
                          {cabang.pengiriman} pengiriman
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={persentaseKetepatan} className="h-2" />
                        <span className="text-sm font-medium">{persentaseKetepatan}%</span>
                      </div>
                      <div className="flex text-sm text-muted-foreground">
                        <span className="flex-1">Tepat Waktu: {cabang.tepat_waktu}</span>
                        <span>Terlambat: {cabang.terlambat}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pengiriman" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Ketepatan Pengiriman</CardTitle>
              <CardDescription>Persentase pengiriman tepat waktu per bulan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardData.ketepatan.performa}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
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
          
          <Card>
            <CardHeader>
              <CardTitle>Status Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Baru</h3>
                    <StatusBadge status="new">{dashboardData.pengiriman.status.baru}</StatusBadge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${(dashboardData.pengiriman.status.baru / dashboardData.pengiriman.bulan_ini) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Muat</h3>
                    <StatusBadge status="loading">{dashboardData.pengiriman.status.muat}</StatusBadge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-purple-500 h-2.5 rounded-full" 
                      style={{ width: `${(dashboardData.pengiriman.status.muat / dashboardData.pengiriman.bulan_ini) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Transit</h3>
                    <StatusBadge status="transit">{dashboardData.pengiriman.status.transit}</StatusBadge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-orange-500 h-2.5 rounded-full" 
                      style={{ width: `${(dashboardData.pengiriman.status.transit / dashboardData.pengiriman.bulan_ini) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Lansir</h3>
                    <StatusBadge status="delivery">{dashboardData.pengiriman.status.lansir}</StatusBadge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full" 
                      style={{ width: `${(dashboardData.pengiriman.status.lansir / dashboardData.pengiriman.bulan_ini) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Terkirim</h3>
                    <StatusBadge status="delivered">{dashboardData.pengiriman.status.terkirim}</StatusBadge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${(dashboardData.pengiriman.status.terkirim / dashboardData.pengiriman.bulan_ini) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Retur</h3>
                    <StatusBadge status="returned">{dashboardData.pengiriman.status.retur}</StatusBadge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-red-500 h-2.5 rounded-full" 
                      style={{ width: `${(dashboardData.pengiriman.status.retur / dashboardData.pengiriman.bulan_ini) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Sopir</CardTitle>
              <CardDescription>Berdasarkan jumlah pengiriman bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Nama</th>
                    <th className="text-center py-2">Pengiriman</th>
                    <th className="text-center py-2">Rating</th>
                    <th className="text-right py-2">Performa</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.sopir_teratas.map((sopir, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{sopir.nama}</td>
                      <td className="text-center py-2">{sopir.pengiriman}</td>
                      <td className="text-center py-2">{sopir.rating}/5.0</td>
                      <td className="text-right py-2">
                        <div className="flex items-center justify-end gap-1">
                          {Array.from({ length: Math.floor(sopir.rating) }).map((_, i) => (
                            <span key={i} className="text-yellow-500">★</span>
                          ))}
                          {sopir.rating % 1 > 0 && (
                            <span className="text-yellow-500">★</span>
                          )}
                          {Array.from({ length: 5 - Math.ceil(sopir.rating) }).map((_, i) => (
                            <span key={i} className="text-gray-300">★</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="armada" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Penggunaan Armada (7 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardData.armada.penggunaan}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tanggal" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kendaraan`, 'Jumlah']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="aktif" 
                      stroke="#8884d8" 
                      name="Armada Aktif"
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Jenis Kendaraan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Box', jumlah: dashboardData.armada.jenis.box },
                        { name: 'Pickup', jumlah: dashboardData.armada.jenis.pickup },
                        { name: 'Tronton', jumlah: dashboardData.armada.jenis.tronton },
                        { name: 'Trailer', jumlah: dashboardData.armada.jenis.trailer }
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
                      <Tooltip formatter={(value) => [`${value} kendaraan`, 'Jumlah']} />
                      <Legend />
                      <Bar dataKey="jumlah" fill="#8884d8" name="Jumlah Kendaraan" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status Kendaraan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Kendaraan Aktif</h3>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {dashboardData.armada.aktif} kendaraan
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${(dashboardData.armada.aktif / dashboardData.armada.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Persentase: {Math.round((dashboardData.armada.aktif / dashboardData.armada.total) * 100)}%
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Kendaraan Maintenance</h3>
                      <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {dashboardData.armada.maintenance} kendaraan
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 h-2.5 rounded-full" 
                        style={{ width: `${(dashboardData.armada.maintenance / dashboardData.armada.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Persentase: {Math.round((dashboardData.armada.maintenance / dashboardData.armada.total) * 100)}%
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Kendaraan Nonaktif</h3>
                      <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        {dashboardData.armada.nonaktif} kendaraan
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-red-500 h-2.5 rounded-full" 
                        style={{ width: `${(dashboardData.armada.nonaktif / dashboardData.armada.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Persentase: {Math.round((dashboardData.armada.nonaktif / dashboardData.armada.total) * 100)}%
                    </div>
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