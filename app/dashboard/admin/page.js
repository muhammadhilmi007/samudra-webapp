'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Package, Users, Truck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulasi data fetch dari API
    setTimeout(() => {
      setDashboardData({
        // Metrics overview
        metrics: {
          totalRevenue: 1250000000,
          previousMonthRevenue: 1150000000,
          totalShipments: 1250,
          previousMonthShipments: 1150,
          activeUsers: 85,
          previousMonthUsers: 80,
          activeVehicles: 42,
          previousMonthVehicles: 40
        },
        // Revenue data - last 12 months
        revenueData: [
          { month: 'Apr 24', revenue: 125 },
          { month: 'Mar 24', revenue: 115 },
          { month: 'Feb 24', revenue: 112 },
          { month: 'Jan 24', revenue: 118 },
          { month: 'Dec 23', revenue: 132 },
          { month: 'Nov 23', revenue: 114 },
          { month: 'Oct 23', revenue: 105 },
          { month: 'Sep 23', revenue: 100 },
          { month: 'Aug 23', revenue: 95 },
          { month: 'Jul 23', revenue: 90 },
          { month: 'Jun 23', revenue: 88 },
          { month: 'May 23', revenue: 85 }
        ],
        // Shipment data by branch
        branchData: [
          { name: 'Jakarta', shipments: 450, revenue: 450000000 },
          { name: 'Surabaya', shipments: 320, revenue: 320000000 },
          { name: 'Bandung', shipments: 280, revenue: 280000000 },
          { name: 'Medan', shipments: 150, revenue: 150000000 },
          { name: 'Makassar', shipments: 120, revenue: 120000000 }
        ],
        // Shipment status distribution
        shipmentStatus: [
          { name: 'Baru', value: 250 },
          { name: 'Muat', value: 180 },
          { name: 'Transit', value: 320 },
          { name: 'Lansir', value: 240 },
          { name: 'Terkirim', value: 350 },
          { name: 'Retur', value: 30 }
        ],
        // Payment methods distribution
        paymentMethods: [
          { name: 'CASH', value: 450 },
          { name: 'COD', value: 350 },
          { name: 'CAD', value: 450 }
        ]
      });
      setLoading(false);
    }, 1200);
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data dashboard admin...</span>
      </div>
    );
  }
  
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  const revenueChange = (dashboardData.metrics.totalRevenue - dashboardData.metrics.previousMonthRevenue) / dashboardData.metrics.previousMonthRevenue * 100;
  const shipmentsChange = (dashboardData.metrics.totalShipments - dashboardData.metrics.previousMonthShipments) / dashboardData.metrics.previousMonthShipments * 100;
  const usersChange = (dashboardData.metrics.activeUsers - dashboardData.metrics.previousMonthUsers) / dashboardData.metrics.previousMonthUsers * 100;
  const vehiclesChange = (dashboardData.metrics.activeVehicles - dashboardData.metrics.previousMonthVehicles) / dashboardData.metrics.previousMonthVehicles * 100;
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#e91e63'];
  const PAYMENT_COLORS = ['#2196f3', '#4caf50', '#ff9800'];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold">{formatter.format(dashboardData.metrics.totalRevenue)}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {revenueChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={revenueChange > 0 ? "text-green-500" : "text-red-500"}>
                {revenueChange.toFixed(1)}% dari bulan lalu
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengiriman</p>
                <p className="text-2xl font-bold">{dashboardData.metrics.totalShipments}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {shipmentsChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={shipmentsChange > 0 ? "text-green-500" : "text-red-500"}>
                {shipmentsChange.toFixed(1)}% dari bulan lalu
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pengguna Aktif</p>
                <p className="text-2xl font-bold">{dashboardData.metrics.activeUsers}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {usersChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={usersChange > 0 ? "text-green-500" : "text-red-500"}>
                {usersChange.toFixed(1)}% dari bulan lalu
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kendaraan Aktif</p>
                <p className="text-2xl font-bold">{dashboardData.metrics.activeVehicles}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Truck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {vehiclesChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={vehiclesChange > 0 ? "text-green-500" : "text-red-500"}>
                {vehiclesChange.toFixed(1)}% dari bulan lalu
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
          <TabsTrigger value="shipments">Pengiriman</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Trend Pendapatan (12 Bulan Terakhir)</CardTitle>
                <CardDescription>Dalam miliar rupiah</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dashboardData.revenueData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} M`, 'Pendapatan']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pengiriman Berdasarkan Cabang</CardTitle>
                <CardDescription>Total pengiriman per cabang</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboardData.branchData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="shipments" fill="#8884d8" name="Jumlah Pengiriman" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Status Pengiriman</CardTitle>
                <CardDescription>Distribusi status pengiriman saat ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.shipmentStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData.shipmentStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Metode Pembayaran</CardTitle>
                <CardDescription>Distribusi metode pembayaran pengiriman</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.paymentMethods}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData.paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan per Cabang</CardTitle>
              <CardDescription>Distribusi pendapatan berdasarkan cabang</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.branchData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                    <Tooltip formatter={(value) => [formatter.format(value), 'Pendapatan']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Pendapatan" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analisis Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Pendapatan vs Target</h3>
                    <div className="flex items-center justify-between">
                      <span>Pendapatan Bulan Ini</span>
                      <span className="font-semibold">{formatter.format(dashboardData.metrics.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Target Bulanan</span>
                      <span className="font-semibold">{formatter.format(dashboardData.metrics.totalRevenue * 1.2)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Persentase Pencapaian</span>
                      <span className="font-semibold">83.3%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Pertumbuhan Pendapatan</h3>
                    <div className="flex items-center justify-between">
                      <span>Bulan Lalu</span>
                      <span className="font-semibold">{formatter.format(dashboardData.metrics.previousMonthRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Bulan Ini</span>
                      <span className="font-semibold">{formatter.format(dashboardData.metrics.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span>Perubahan</span>
                      <span className={`font-semibold ${revenueChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {revenueChange > 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Analisis Metode Pembayaran</h3>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Metode</th>
                        <th className="text-right py-2">Jumlah Transaksi</th>
                        <th className="text-right py-2">Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.paymentMethods.map((item, index) => {
                        const totalTransactions = dashboardData.paymentMethods.reduce((sum, item) => sum + item.value, 0);
                        const percentage = (item.value / totalTransactions * 100).toFixed(1);
                        
                        return (
                          <tr key={index} className="border-b">
                            <td className="py-2">{item.name}</td>
                            <td className="text-right py-2">{item.value}</td>
                            <td className="text-right py-2">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shipments" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengiriman per Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.shipmentStatus}
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
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Jumlah Pengiriman">
                      {dashboardData.shipmentStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Ringkasan Status Pengiriman</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Status</th>
                      <th className="text-right py-2">Jumlah</th>
                      <th className="text-right py-2">Persentase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.shipmentStatus.map((item, index) => {
                      const totalShipments = dashboardData.shipmentStatus.reduce((sum, item) => sum + item.value, 0);
                      const percentage = (item.value / totalShipments * 100).toFixed(1);
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="text-right py-2">{item.value}</td>
                          <td className="text-right py-2">{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performa Pengiriman per Cabang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.branchData.map((branch, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{branch.name}</h3>
                      <span className="text-sm text-muted-foreground">{branch.shipments} pengiriman</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${(branch.shipments / Math.max(...dashboardData.branchData.map(item => item.shipments))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Rata-rata nilai per pengiriman: {formatter.format(branch.revenue / branch.shipments)}
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