"use client"

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  TruckIcon, 
  Package, 
  ShoppingBag, 
  CircleDollarSign,
  RotateCcw,
  Users,
  Building,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Example data - In a real app, this would come from API
const monthlyData = [
  { name: 'Jan', pendapatan: 12000000, biaya: 9000000 },
  { name: 'Feb', pendapatan: 15000000, biaya: 10000000 },
  { name: 'Mar', pendapatan: 18000000, biaya: 12000000 },
  { name: 'Apr', pendapatan: 16000000, biaya: 11000000 },
  { name: 'Mei', pendapatan: 19000000, biaya: 13000000 },
  { name: 'Jun', pendapatan: 20000000, biaya: 14000000 },
]

const statusData = [
  { name: 'Terkirim', value: 540, color: '#10b981' },
  { name: 'Transit', value: 320, color: '#3b82f6' },
  { name: 'Lansir', value: 210, color: '#8b5cf6' },
  { name: 'Retur', value: 30, color: '#ef4444' },
]

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444']

// Stat card component
const StatCard = ({ title, value, icon: Icon, change, changeType }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {change && (
              <div className="flex items-center mt-1">
                {changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm ${
                    changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-full bg-samudra-100">
            <Icon className="h-6 w-6 text-samudra-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Recent activity item component
const ActivityItem = ({ title, description, time, status }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'terkirim':
        return 'bg-green-100 text-green-800'
      case 'lansir':
        return 'bg-purple-100 text-purple-800'
      case 'transit':
        return 'bg-blue-100 text-blue-800'
      case 'retur':
        return 'bg-red-100 text-red-800'
      case 'muat':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-samudra-500" />
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-400">{time}</span>
          {status && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(status)}`}
            >
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setLoadingStats(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Selamat Datang, {user?.nama || 'User'}
        </h1>
        <p className="text-muted-foreground">
          Ini adalah dashboard utama Samudra ERP. Pantau metrik bisnis dan aktivitas terbaru.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total STT Bulan Ini"
          value="1,245"
          icon={Package}
          change="12% dari bulan lalu"
          changeType="increase"
        />
        <StatCard
          title="Pendapatan"
          value={formatCurrency(120000000)}
          icon={CircleDollarSign}
          change="8% dari bulan lalu"
          changeType="increase"
        />
        <StatCard
          title="Retur"
          value="24"
          icon={RotateCcw}
          change="5% dari bulan lalu"
          changeType="decrease"
        />
        <StatCard
          title="Pelanggan Aktif"
          value="324"
          icon={Users}
          change="3% dari bulan lalu"
          changeType="increase"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan & Biaya</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Bulan: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="pendapatan" name="Pendapatan" fill="#3b82f6" />
                  <Bar dataKey="biaya" name="Biaya" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                      index,
                    }) => {
                      const RADIAN = Math.PI / 180
                      const radius = 25 + innerRadius + (outerRadius - innerRadius)
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
                      const y = cy + radius * Math.sin(-midAngle * RADIAN)

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={statusData[index].color}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          className="text-xs"
                        >
                          {statusData[index].name} ({(percent * 100).toFixed(0)}%)
                        </text>
                      )
                    }}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} pengiriman`, 'Jumlah']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y">
              <ActivityItem
                title="STT-BDG-020425-0032 telah dibuat"
                description="Pengiriman dari PT. Maju Jaya ke Toko Abadi Sejahtera"
                time="2 menit yang lalu"
                status="Muat"
              />
              <ActivityItem
                title="STT-BDG-020425-0029 dalam transit"
                description="Pengiriman dari CV Sentosa ke PT Harapan Baru"
                time="35 menit yang lalu"
                status="Transit"
              />
              <ActivityItem
                title="STT-BDG-020425-0028 sedang dalam pengantaran"
                description="Pengiriman dari Toko Baru ke PT Global Indonesia"
                time="1 jam yang lalu"
                status="Lansir"
              />
              <ActivityItem
                title="STT-BDG-010425-0156 telah diterima"
                description="Diterima oleh: Ahmad Budiman"
                time="3 jam yang lalu"
                status="Terkirim"
              />
              <ActivityItem
                title="STT-BDG-010425-0123 dikembalikan"
                description="Alasan: Alamat tidak ditemukan"
                time="5 jam yang lalu"
                status="Retur"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cabang Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Kinerja Cabang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Bandung', value: 95, color: '#3b82f6' },
                { name: 'Jakarta', value: 87, color: '#10b981' },
                { name: 'Surabaya', value: 82, color: '#8b5cf6' },
                { name: 'Semarang', value: 78, color: '#f59e0b' },
                { name: 'Makassar', value: 72, color: '#ec4899' },
              ].map((branch) => (
                <div key={branch.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{branch.name}</span>
                    </div>
                    <span className="text-sm font-medium">{branch.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${branch.value}%`,
                        backgroundColor: branch.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}