// app/retur/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReturns, updateReturnStatus } from '@/lib/redux/slices/returnSlice';
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

export default function ReturnsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { returns, loading, error } = useSelector(state => state.retur);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    dispatch(fetchReturns());
  }, [dispatch]);
  
  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateReturnStatus({ id, status })).unwrap();
      toast({
        title: "Status berhasil diubah",
        description: `Status retur berhasil diubah menjadi ${status}`,
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
      accessorKey: "idRetur",
      header: "ID Retur",
      cell: ({ row }) => (
        <Link href={`/retur/${row.original._id}`} className="font-medium hover:underline">
          {row.original.idRetur}
        </Link>
      ),
    },
    {
      accessorKey: "tanggalKirim",
      header: "Tanggal Kirim",
      cell: ({ row }) => row.original.tanggalKirim ? formatDate(row.original.tanggalKirim) : '-',
    },
    {
      accessorKey: "sttCount",
      header: "Jumlah STT",
      cell: ({ row }) => row.original.sttIds?.length || 0,
    },
    {
      accessorKey: "cabang",
      header: "Cabang",
      cell: ({ row }) => row.original.cabang?.namaCabang || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} type="return" />,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/retur/${row.original._id}`}>
            <Button variant="ghost" size="sm">Detail</Button>
          </Link>
          {row.original.status === "PROSES" && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusChange(row.original._id, "SAMPAI")}
            >
              Sampai
            </Button>
          )}
        </div>
      ),
    },
  ];
  
  // Filter data berdasarkan tab aktif
  const filteredData = returns.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'proses') return item.status === 'PROSES';
    if (activeTab === 'sampai') return item.status === 'SAMPAI';
    return true;
  });
  
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Retur", href: "/retur" },
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
        <h1 className="text-2xl font-bold">Retur Barang</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/retur/tambah">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Retur
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
          <CardTitle>Daftar Retur</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="proses">
                Proses
                <Badge variant="secondary" className="ml-2">
                  {returns.filter(item => item.status === 'PROSES').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="sampai">Sampai</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="p-0 mt-2">
              <DataTable
                columns={columns}
                data={filteredData}
                loading={loading}
                searchPlaceholder="Cari retur..."
                searchColumn="idRetur"
              />
            </TabsContent>
            <TabsContent value="proses" className="p-0 mt-2">
              <DataTable
                columns={columns}
                data={filteredData}
                loading={loading}
                searchPlaceholder="Cari retur..."
                searchColumn="idRetur"
              />
            </TabsContent>
            <TabsContent value="sampai" className="p-0 mt-2">
              <DataTable
                columns={columns}
                data={filteredData}
                loading={loading}
                searchPlaceholder="Cari retur..."
                searchColumn="idRetur"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}