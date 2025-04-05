// app/keuangan/jurnal/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchJournalById, 
  updateJournalStatus 
} from '@/lib/redux/slices/financeSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useToast } from '@/lib/hooks/use-toast';
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils/format';
import { ArrowLeft, FileText, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function JournalDetailPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();
  const { journal, loading, error } = useSelector(state => state.finance);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchJournalById(id));
    }
  }, [dispatch, id]);

  const handleStatusChange = async (status) => {
    try {
      await dispatch(updateJournalStatus({ id, status })).unwrap();
      toast({
        title: "Status berhasil diubah",
        description: `Status jurnal berhasil diubah menjadi ${status}`,
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
    { label: "Keuangan", href: "/keuangan" },
    { label: "Jurnal Umum", href: "/keuangan/jurnal" },
    { label: "Detail Jurnal", href: `/keuangan/jurnal/${id}` },
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

  if (!journal) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center">
              Jurnal tidak ditemukan
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
            <Link href="/keuangan/jurnal">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detail Jurnal</h1>
        </div>
        <div className="flex gap-2">
          {journal.status === "DRAFT" && (
            <Button 
              variant="default" 
              onClick={() => handleStatusChange("FINAL")}
            >
              <Check className="mr-2 h-4 w-4" />
              Finalisasi Jurnal
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/keuangan/jurnal/tambah">
              <FileText className="mr-2 h-4 w-4" />
              Tambah Jurnal Baru
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Jurnal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-medium">{formatDate(journal.tanggal)}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Akun</p>
                  <p className="font-medium">{journal.account?.namaAccount || '-'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Kode Akun</p>
                  <p className="font-medium">{journal.account?.kodeAccount || '-'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tipe Akun</p>
                  <p className="font-medium">{journal.account?.tipeAccount || '-'}</p>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Cabang</p>
                  <p className="font-medium">{journal.cabang?.namaCabang || '-'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tipe Jurnal</p>
                  <p className="font-medium">{journal.tipe}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge 
                    variant={journal.status === 'DRAFT' ? 'outline' : 'default'}
                  >
                    {journal.status}
                  </Badge>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Dibuat Oleh</p>
                  <p className="font-medium">{journal.user?.nama || '-'}</p>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Keterangan</p>
                  <p className="font-medium">{journal.keterangan}</p>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Debet</p>
                    <p className="font-medium text-green-600">{formatCurrency(journal.debet)}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Kredit</p>
                    <p className="font-medium text-red-600">{formatCurrency(journal.kredit)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Terkait STT</CardTitle>
          </CardHeader>
          <CardContent>
            {journal.sttIds && journal.sttIds.length > 0 ? (
              <div className="space-y-2">
                {journal.sttIds.map(stt => (
                  <div key={stt._id} className="p-2 border rounded-md hover:bg-gray-50">
                    <Link href={`/stt/${stt._id}`} className="font-medium text-blue-600 hover:underline">
                      {stt.noSTT}
                    </Link>
                    <p className="text-sm text-gray-500">{formatDate(stt.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-gray-500">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Tidak ada STT terkait</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {journal.status === 'DRAFT' && (
        <Card className="mt-4 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-700">Jurnal ini masih berstatus DRAFT</p>
                <p className="text-yellow-600">Jurnal ini masih dapat diubah. Setelah difinalisasi, jurnal tidak dapat diubah lagi.</p>
                <Button 
                  variant="default" 
                  className="mt-2 bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => handleStatusChange("FINAL")}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Finalisasi Jurnal
                </Button>
              </div>
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
                <p className="font-medium">Jurnal dibuat</p>
                <p className="text-sm text-gray-500">{formatDateTime(journal.createdAt)}</p>
              </div>
            </div>
            {journal.updatedAt !== journal.createdAt && (
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="font-medium">Jurnal diupdate</p>
                  <p className="text-sm text-gray-500">{formatDateTime(journal.updatedAt)}</p>
                </div>
              </div>
            )}
            {journal.status === 'FINAL' && (
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="font-medium">Jurnal difinalisasi</p>
                  <p className="text-sm text-gray-500">{formatDateTime(journal.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}