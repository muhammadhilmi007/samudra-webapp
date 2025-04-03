// app/retur/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchReturnById, 
  updateReturnStatus 
} from '@/lib/redux/slices/returnSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { StatusBadge } from '@/components/shared/status-badge';
import { useToast } from '@/lib/hooks/use-toast';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import { ArrowLeft, Check, FileText, Package } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function ReturnDetailPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();
  const { currentReturn, loading, error } = useSelector(state => state.retur);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchReturnById(id));
    }
  }, [dispatch, id]);

  const handleStatusChange = async (status) => {
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

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Retur", href: "/retur" },
    { label: "Detail Retur", href: `/retur/${id}` },
  ];

  if (loading) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  if (!currentReturn) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center">
              Retur tidak ditemukan
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="flex justify-between items-center my-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/retur">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detail Retur</h1>
        </div>
        <div className="flex gap-2">
          {currentReturn.status === "PROSES" && (
            <Button
              variant="default"
              onClick={() => handleStatusChange("SAMPAI")}
            >
              <Check className="mr-2 h-4 w-4" />
              Tandai Sampai
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Retur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">ID Retur</p>
                  <p className="font-medium">{currentReturn.idRetur}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tanggal Pengiriman</p>
                  <p className="font-medium">{currentReturn.tanggalKirim ? formatDate(currentReturn.tanggalKirim) : '-'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tanggal Sampai</p>
                  <p className="font-medium">{currentReturn.tanggalSampai ? formatDate(currentReturn.tanggalSampai) : '-'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={currentReturn.status} type="return" />
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Cabang</p>
                  <p className="font-medium">{currentReturn.cabang?.namaCabang || "-"}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tanda Terima</p>
                  <p className="font-medium">{currentReturn.tandaTerima || "-"}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Dibuat Oleh</p>
                  <p className="font-medium">{currentReturn.createdBy?.nama || "-"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status Retur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentReturn.status !== "PROSES" ? "bg-gray-200" : "bg-blue-500 text-white"}`}>
                  <Package className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Proses</p>
                  <p className="text-sm text-gray-500">Retur dalam proses pengiriman</p>
                </div>
                {currentReturn.status === "PROSES" && (
                  <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentReturn.status !== "SAMPAI" ? "bg-gray-200" : "bg-green-500 text-white"}`}>
                  <Check className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Sampai</p>
                  <p className="text-sm text-gray-500">Retur telah sampai di tujuan</p>
                </div>
                {currentReturn.status === "SAMPAI" && (
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {currentReturn.sttIds && currentReturn.sttIds.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Daftar STT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentReturn.sttIds.map((stt, index) => (
                <Link href={`/stt/${stt._id}`} key={stt._id}>
                  <Card className="hover:border-blue-400 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{stt.noSTT}</p>
                          <p className="text-sm text-gray-500">{formatDate(stt.createdAt)}</p>
                        </div>
                        <StatusBadge status={stt.status} type="stt" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Histori Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p className="font-medium">Retur dibuat</p>
                <p className="text-sm text-gray-500">{formatDateTime(currentReturn.createdAt)}</p>
              </div>
            </div>
            {currentReturn.tanggalKirim && (
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2"></div>
                <div>
                  <p className="font-medium">Retur dikirim</p>
                  <p className="text-sm text-gray-500">{formatDateTime(currentReturn.tanggalKirim)}</p>
                </div>
              </div>
            )}
            {currentReturn.tanggalSampai && (
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="font-medium">Retur sampai</p>
                  <p className="text-sm text-gray-500">{formatDateTime(currentReturn.tanggalSampai)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}