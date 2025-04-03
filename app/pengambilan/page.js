// app/pengambilan/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPickups, updatePickupStatus } from '@/lib/redux/slices/pickupSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-tables/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/hooks/use-toast';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import { PlusCircle, FileDown, Filter } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

export default function PickupsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { pickups, loading, error } = useSelector(state => state.pickup);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    dispatch(fetchPickups());
  }, [dispatch]);
  
  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updatePickupStatus({ id, status })).unwrap();
      toast({
        title: "Status berhasil diubah",
        description: `Status pengambilan berhasil diubah menjadi ${status}`,
      });
    } catch (error) {
      toast({
        title: "Gagal mengubah status",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const columns = [
    {
      accessorKey: "noPengambilan",
      header: "No Pengambilan",
      cell: ({ row }) => (
        <Link href={`/pengambilan/${row.original._id}`} className="font-medium hover:underline">
          {row.original.noPengambilan}
        </Link>
      ),
    },
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => formatDate(row.original.tanggal),
    },
    {
      accessorKey: "pengirim",
      header: "Pengirim",
      cell: ({ row }) => row.original.pengirim?.nama || "-",
    },
    {
      accessorKey: "alamatPengambilan",
      header: "Alamat Pengambilan",
    },
    {
      accessorKey: "jumlahColly",
      header: "Jumlah Colly",
    },
    {
      accessorKey: "supir",
      header: "Supir",
      cell: ({ row }) => row.original.supir?.nama || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} type="pickup" />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/pengambilan/${row.original._id}`}>
            <Button variant="ghost" size="sm">Detail</Button>
          </Link>
          {row.original.status === "PENDING" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusChange(row.original._id, "BERANGKAT")}
            >
              Berangkat
            </Button>
          )}
          {row.original.status === "BERANGKAT" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusChange(row.original._id, "SELESAI")}
            >
              Selesai
            </Button>
          )}
        </div>
      ),
    },
  ];
  
  // Filter data berdasarkan tab aktif
  const filteredData = pickups.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return item.status === 'PENDING';
    if (activeTab === 'berangkat') return item.status === 'BERANGKAT';
    if (activeTab === 'selesai') return item.status === 'SELESAI';
    if (activeTab === 'cancelled') return item.status === 'CANCELLED';
    return true;
  });
  
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
  ];

  if (error) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
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
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="flex justify-between items-center mb-4 mt-4">
        <h1 className="text-2xl font-bold">Pengambilan Barang</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/pengambilan/tambah">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pengambilan
            </Link>
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-1">
          <CardTitle>Daftar Pengambilan</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="secondary" className="ml-2">
                  {pickups.filter(item => item.status === 'PENDING').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="berangkat">Berangkat</TabsTrigger>
              <TabsTrigger value="selesai">Selesai</TabsTrigger>
              <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="p-0 mt-2">
              <DataTable
                columns={columns}
                data={filteredData}
                loading={loading}
                searchPlaceholder="Cari pengambilan..."
                searchColumn="noPengambilan"
              />
            </TabsContent>
            <TabsContent value="pending" className="p-0 mt-2">
              <DataTable
                columns={columns}
                data={filteredData}
                loading={loading}
                searchPlaceholder="Cari pengambilan..."
                searchColumn="noPengambilan"
              />
            </TabsContent>
            <TabsContent value="berangkat" className="p-0 mt-2">
              <DataTable
                columns={columns}
                data={filteredData}
                loading={loading}
                searchPlaceholder="Cari pengambilan..."
                searchColumn="noPengambilan"
              />
            </TabsContent>
            <TabsContent value="selesai" className="p-0 mt-2">
              <DataTable
                columns={columns}
                data={filteredData}
                loading={loading}
                searchPlaceholder="Cari pengambilan..."
                searchColumn="noPengambilan"
              />
            </TabsContent>
            <TabsContent value="cancelled" className="p-0 mt-2">
              <DataTable
                columns={columns}
                data={filteredData}
                loading={loading}
                searchPlaceholder="Cari pengambilan..."
                searchColumn="noPengambilan"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}