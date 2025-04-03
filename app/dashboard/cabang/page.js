// app/dashboard/cabang/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranchDashboardStats } from '@/lib/redux/slices/dashboardSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  TruckIcon, 
  PackageIcon, 
  UserIcon, 
  DollarSignIcon
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BranchDashboardPage() {
  const dispatch = useDispatch();
  const { branchStats, loading, error } = useSelector(state => state.dashboard);
  const { branches } = useSelector(state => state.branch);
  const { currentUser } = useSelector(state => state.auth);
  
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  useEffect(() => {
    // Set the user's branch as default if available
    if (currentUser?.cabangId && !selectedBranchId) {
      setSelectedBranchId(currentUser.cabangId);
    }
  }, [currentUser, selectedBranchId]);
  
  useEffect(() => {
    if (selectedBranchId) {
      dispatch(fetchBranchDashboardStats(selectedBranchId));
    }
  }, [dispatch, selectedBranchId]);
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Helper for showing trends
  const TrendIndicator = ({ value, suffix = '%' }) => {
    if (value > 0) {
      return <div className="text-green-600 flex items-center"><ArrowUpIcon className="h-4 w-4 mr-1" />{value}{suffix}</div>;
    } else if (value < 0) {
      return <div className="text-red-600 flex items-center"><ArrowDownIcon className="h-4 w-4 mr-1" />{Math.abs(value)}{suffix}</div>;
    }
    return <div className="text-gray-500">0{suffix}</div>;
  };
  
  // Transform data for charts
  const revenueData = branchStats?.monthlyRevenue?.map(item => ({
    name: item.month,
    pendapatan: item.amount,
  })) || [];
  
  const shipmentData = branchStats?.shipmentStatus?.map(item => ({
    name: item.status,
    value: item.count,
  })) || [];
  
  const topDestinations = branchStats?.topDestinations?.map(dest => ({
    name: dest.destination,
    jumlah: dest.count,
  })) || [];
  
  const paymentTypes = branchStats?.paymentTypes?.map(type => ({
    name: type.type,
    value: type.count,
  })) || [];
  
  if (loading) {
    return (
      <div className="p-4">
        <div className="h-96 flex items-center justify-center">
          <div>Loading dashboard data...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              Error: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Cabang</h1>
        <div className="w-64">
          <Select
            value={selectedBranchId}
            onValueChange={setSelectedBranchId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Cabang" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(branch => (
                <SelectItem key={branch._id} value={branch._id}>
                  {branch.namaCabang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {!branchStats ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-gray-500">
              Pilih cabang untuk melihat statistik
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendapatan Cabang</CardTitle>
                <DollarSignIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(branchStats.revenue || 0)}</div>
                <p className="text-xs text-muted-foreground pt-1 flex justify-between">
                  <span>vs bulan lalu</span>
                  <TrendIndicator value={branchStats.revenueGrowth || 0} />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pengiriman</CardTitle>
                <PackageIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(branchStats.totalShipments || 0)}</div>
                <p className="text-xs text-muted-foreground pt-1 flex justify-between">
                  <span>vs bulan lalu</span>
                  <TrendIndicator value={branchStats.shipmentsGrowth || 0} />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pelanggan</CardTitle>
                <UserIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(branchStats.customers || 0)}</div>
                <p className="text-xs text-muted-foreground pt-1 flex justify-between">
                  <span>Total</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
                <TruckIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branchStats.onTimeDelivery || 0}%</div>
                <p className="text-xs text-muted-foreground pt-1 flex justify-between">
                  <span>vs target 95%</span>
                  <TrendIndicator value={(branchStats.onTimeDelivery || 0) - 95} />
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
              <TabsTrigger value="operations">Operasional</TabsTrigger>
              <TabsTrigger value="analytics">Analitik</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pendapatan Bulanan</CardTitle>
                  <CardDescription>Pendapatan cabang selama 6 bulan terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={revenueData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="pendapatan" stroke="#8884d8" name="Pendapatan" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tipe Pembayaran</CardTitle>
                    <CardDescription>Distribusi metode pembayaran</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentTypes}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {paymentTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Jumlah']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Piutang Cabang</CardTitle>
                    <CardDescription>Status piutang cabang</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Piutang:</span>
                        <span>{formatCurrency(branchStats.receivables?.total || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Belum Lunas:</span>
                        <span>{formatCurrency(branchStats.receivables?.unpaid || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Jatuh Tempo:</span>
                        <span className="text-red-600">{formatCurrency(branchStats.receivables?.overdue || 0)}</span>
                      </div>
                      <div className="pt-4">
                        <div className="text-sm font-medium">Persentase Lunas</div>
                        <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ 
                              width: `${branchStats.receivables?.paidPercentage || 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>0%</span>
                          <span>{branchStats.receivables?.paidPercentage || 0}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="operations" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Status Pengiriman</CardTitle>
                    <CardDescription>Distribusi status pengiriman saat ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={shipmentData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {shipmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Jumlah']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Destinasi Teratas</CardTitle>
                    <CardDescription>Tujuan pengiriman paling sering</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={topDestinations}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value) => [value, 'Jumlah']} />
                          <Legend />
                          <Bar dataKey="jumlah" fill="#82ca9d" name="Jumlah Pengiriman" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Armada Cabang</CardTitle>
                  <CardDescription>Status armada di cabang</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-lg font-medium text-blue-600">{branchStats.fleet?.total || 0}</div>
                      <div className="text-sm text-gray-500">Total Kendaraan</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-lg font-medium text-green-600">{branchStats.fleet?.active || 0}</div>
                      <div className="text-sm text-gray-500">Kendaraan Aktif</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-lg font-medium text-orange-600">{branchStats.fleet?.inTransit || 0}</div>
                      <div className="text-sm text-gray-500">Dalam Perjalanan</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-lg font-medium text-red-600">{branchStats.fleet?.maintenance || 0}</div>
                      <div className="text-sm text-gray-500">Dalam Perawatan</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Kinerja Pengiriman</CardTitle>
                  <CardDescription>Metrik kinerja pengiriman</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">On-Time Delivery</span>
                        <span className="font-medium">{branchStats.onTimeDelivery || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${branchStats.onTimeDelivery >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${branchStats.onTimeDelivery || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Returns Rate</span>
                        <span className="font-medium">{branchStats.returnsRate || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${branchStats.returnsRate <= 5 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${branchStats.returnsRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Customer Satisfaction</span>
                        <span className="font-medium">{branchStats.customerSatisfaction || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${branchStats.customerSatisfaction >= 90 ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${branchStats.customerSatisfaction || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Customers</CardTitle>
                    <CardDescription>Pelanggan dengan pengiriman terbanyak</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {branchStats.topCustomers?.map((customer, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-500">{customer.count} pengiriman</p>
                            </div>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(customer.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Trend kinerja selama 3 bulan terakhir</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Pengiriman</span>
                          <TrendIndicator value={branchStats.trends?.shipments || 0} />
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${branchStats.trends?.shipments >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(Math.abs(branchStats.trends?.shipments || 0) * 5, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Pendapatan</span>
                          <TrendIndicator value={branchStats.trends?.revenue || 0} />
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${branchStats.trends?.revenue >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(Math.abs(branchStats.trends?.revenue || 0) * 5, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">On-Time Delivery</span>
                          <TrendIndicator value={branchStats.trends?.onTimeDelivery || 0} />
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${branchStats.trends?.onTimeDelivery >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(Math.abs(branchStats.trends?.onTimeDelivery || 0) * 5, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}