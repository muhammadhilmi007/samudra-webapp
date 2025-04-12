// app/pengambilan/request/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPickupRequestById, 
  updatePickupRequestStatus,
  linkPickupRequestToPickup
} from '@/lib/redux/slices/pickupSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import StatusBadge from '@/components/shared/status-badge';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/lib/hooks/use-toast';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import { ArrowLeft, Truck, CheckCircle, XCircle, LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function PickupRequestDetailPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();
  const { pickupRequest, loading, error } = useSelector(state => state.pickup);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchPickupRequestById(id));
    }
  }, [dispatch, id]);

  const handleStatusChange = async (status) => {
    try {
      await dispatch(updatePickupRequestStatus({ id, status })).unwrap();
      toast({
        title: "Status berhasil diubah",
        description: `Status request pengambilan berhasil diubah menjadi ${status}`,
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
    { label: "Pengambilan", href: "/pengambilan" },
    { label: "Request Pengambilan", href: "/pengambilan/request" },
    { label: "Detail Request", href: `/pengambilan/request/${id}` },
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

  if (!pickupRequest) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center">
              Request pengambilan tidak ditemukan
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
            <Link href="/pengambilan/request">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detail Request Pengambilan</h1>
        </div>
        <div className="flex gap-2">
          {pickupRequest.status === "PENDING" && (
            <>
              <Button
                variant="default"
                onClick={() => router.push(`/pengambilan/tambah?requestId=${pickupRequest._id}`)}
              >
                <Truck className="mr-2 h-4 w-4" />
                Buat Pengambilan
              </Button>
              <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => handleStatusChange("FINISH")}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Selesai
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => handleStatusChange("CANCELLED")}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Batalkan
              </Button>
            </>
          )}
          {pickupRequest.status === "CANCELLED" && (
            <Button
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => handleStatusChange("PENDING")}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Aktifkan Kembali
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">No Request</p>
                  <p className="font-medium">{pickupRequest.noRequest}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tanggal Request</p>
                  <p className="font-medium">{formatDateTime(pickupRequest.tanggal)}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={pickupRequest.status} type="pickupRequest" />
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Jumlah Colly</p>
                  <p className="font-medium">{pickupRequest.jumlahColly}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Estimasi Pengambilan</p>
                  <p className="font-medium">{pickupRequest.estimasiPengambilan || "-"}</p>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Pengirim</p>
                  <p className="font-medium">{pickupRequest.pengirim?.nama || "-"}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Alamat Pengambilan</p>
                  <p className="font-medium">{pickupRequest.alamatPengambilan}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tujuan</p>
                  <p className="font-medium">{pickupRequest.tujuan}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Cabang</p>
                  <p className="font-medium">{pickupRequest.cabang?.namaCabang || "-"}</p>
                </div>
              </div>
            </div>
            
            {pickupRequest.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Catatan</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p>{pickupRequest.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status Pengambilan</CardTitle>
          </CardHeader>
          <CardContent>
            {pickupRequest.pickup ? (
              <div>
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-3 mb-4 flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  <span>Terhubung dengan pengambilan</span>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">No Pengambilan</p>
                  <Link href={`/pengambilan/${pickupRequest.pickup._id}`} className="font-medium text-blue-600 hover:underline">
                    {pickupRequest.pickup.noPengambilan}
                  </Link>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tanggal Pengambilan</p>
                  <p className="font-medium">{formatDate(pickupRequest.pickup.tanggal)}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={pickupRequest.pickup.status} type="pickup" />
                </div>
                <Button className="w-full mt-2" asChild>
                  <Link href={`/pengambilan/${pickupRequest.pickup._id}`}>
                    Lihat Detail Pengambilan
                  </Link>
                </Button>
              </div>
            ) : (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md p-3 mb-4">
                  Request pengambilan ini belum terhubung dengan pengambilan
                </div>
                {pickupRequest.status === "PENDING" && (
                  <Button 
                    className="w-full" 
                    onClick={() => router.push(`/pengambilan/tambah?requestId=${pickupRequest._id}`)}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Buat Pengambilan
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Histori Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p className="font-medium">Request pengambilan dibuat</p>
                <p className="text-sm text-gray-500">{formatDateTime(pickupRequest.createdAt)}</p>
              </div>
            </div>
            {pickupRequest.updatedAt !== pickupRequest.createdAt && (
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="font-medium">Request pengambilan diupdate</p>
                  <p className="text-sm text-gray-500">{formatDateTime(pickupRequest.updatedAt)}</p>
                </div>
              </div>
            )}
            {pickupRequest.status === "FINISH" && (
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="font-medium">Request pengambilan selesai</p>
                  <p className="text-sm text-gray-500">{formatDateTime(pickupRequest.updatedAt)}</p>
                </div>
              </div>
            )}
            {pickupRequest.status === "CANCELLED" && (
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 mt-2"></div>
                <div>
                  <p className="font-medium">Request pengambilan dibatalkan</p>
                  <p className="text-sm text-gray-500">{formatDateTime(pickupRequest.updatedAt)}</p>
                </div>
              </div>
            )}
            {pickupRequest.pickup && (
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-2"></div>
                <div>
                  <p className="font-medium">Terhubung dengan pengambilan</p>
                  <p className="text-sm text-gray-500">{formatDateTime(pickupRequest.pickup.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}