'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, FileEdit, Trash2, Calendar, Landmark, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import AssetForm from '@/components/forms/asset-form';

export default function AssetDetailPage({ params }) {
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulasi fetch detail aset dari API
    setTimeout(() => {
      const dummyAsset = {
        id: params.id,
        namaAset: 'Truk Box Mitsubishi Canter',
        tipeAset: 'Kendaraan',
        tanggalPembelian: '2023-05-15',
        nilaiPembelian: 350000000,
        nilaiSekarang: 320000000,
        persentasePenyusutan: 10,
        statusAset: 'AKTIF',
        lokasiAset: 'Cabang Jakarta',
        cabangId: '1',
        cabangNama: 'Jakarta',
        deskripsi: 'Truk box untuk pengiriman barang dengan kapasitas 4 ton. Kondisi mesin baik dan terawat dengan rutin.',
        nomorSeri: 'MSB-CT-2023-001',
        nomorPlat: 'B 1234 CD',
        riwayatPemeliharaan: [
          { tanggal: '2023-08-15', jenis: 'Service Rutin', biaya: 1500000, deskripsi: 'Ganti oli, filter, dan tune up' },
          { tanggal: '2023-11-20', jenis: 'Perbaikan Rem', biaya: 2500000, deskripsi: 'Penggantian kampas rem dan sistem hidrolik' },
          { tanggal: '2024-02-10', jenis: 'Service Rutin', biaya: 1800000, deskripsi: 'Ganti oli, filter, dan cek kelistrikan' }
        ],
        dokumen: [
          { nama: 'STNK', url: '#', tanggal: '2023-05-15', expired: '2028-05-15' },
          { nama: 'BPKB', url: '#', tanggal: '2023-05-15', expired: null },
          { nama: 'Asuransi', url: '#', tanggal: '2023-05-15', expired: '2024-05-15' },
          { nama: 'Bukti Pembelian', url: '#', tanggal: '2023-05-15', expired: null }
        ]
      };
      
      setAsset(dummyAsset);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    // Simulasi delete API call
    setTimeout(() => {
      setShowDeleteConfirm(false);
      
      toast({
        title: "Aset berhasil dihapus",
        description: `Aset ${asset.namaAset} telah dihapus dari sistem.`,
      });
      
      router.push('/aset');
    }, 500);
  };

  const handleUpdate = (updatedData) => {
    // Simulasi update API call
    setTimeout(() => {
      setAsset({...asset, ...updatedData});
      
      toast({
        title: "Aset berhasil diperbarui",
        description: `Perubahan pada aset ${asset.namaAset} telah disimpan.`,
      });
      
      router.push(`/aset/${params.id}`);
    }, 500);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AKTIF':
        return <Badge className="bg-green-500">{status}</Badge>;
      case 'MAINTENANCE':
        return <Badge className="bg-yellow-500">{status}</Badge>;
      case 'DIJUAL':
        return <Badge className="bg-blue-500">{status}</Badge>;
      case 'RUSAK':
        return <Badge className="bg-red-500">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data aset...</span>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/aset/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Aset</h1>
        </div>
        
        <AssetForm 
          initialData={asset} 
          onSubmit={handleUpdate} 
          onCancel={() => router.push(`/aset/${params.id}`)} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/aset">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detail Aset</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/aset/${params.id}?mode=edit`}>
              <FileEdit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Informasi Aset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{asset.namaAset}</h2>
              {getStatusBadge(asset.statusAset)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag size={16} />
                <span>Tipe: {asset.tipeAset}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={16} />
                <span>Tanggal Pembelian: {formatDate(asset.tanggalPembelian)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} />
                <span>Lokasi: {asset.lokasiAset}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Landmark size={16} />
                <span>Cabang: {asset.cabangNama}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Informasi Keuangan</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nilai Pembelian</span>
                  <span className="font-medium">{formatCurrency(asset.nilaiPembelian)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nilai Sekarang</span>
                  <span className="font-medium">{formatCurrency(asset.nilaiSekarang)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Persentase Penyusutan</span>
                  <span className="font-medium">{asset.persentasePenyusutan}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Penyusutan</span>
                  <span className="font-medium">{formatCurrency(asset.nilaiPembelian - asset.nilaiSekarang)}</span>
                </div>
              </div>
            </div>
            
            {asset.nomorSeri && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Informasi Tambahan</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nomor Seri</span>
                    <span className="font-medium">{asset.nomorSeri}</span>
                  </div>
                  {asset.nomorPlat && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nomor Plat</span>
                      <span className="font-medium">{asset.nomorPlat}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Detail Aset</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deskripsi">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deskripsi">Deskripsi</TabsTrigger>
                <TabsTrigger value="pemeliharaan">Pemeliharaan</TabsTrigger>
                <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
              </TabsList>
              
              <TabsContent value="deskripsi" className="mt-4">
                <div className="p-4 border rounded-md">
                  <p className="text-sm leading-6">{asset.deskripsi}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="pemeliharaan" className="mt-4">
                {asset.riwayatPemeliharaan && asset.riwayatPemeliharaan.length > 0 ? (
                  <div className="space-y-4">
                    {asset.riwayatPemeliharaan.map((item, index) => (
                      <div key={index} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{item.jenis}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(item.tanggal)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{formatCurrency(item.biaya)}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{item.deskripsi}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border rounded-md text-center text-muted-foreground">
                    Belum ada riwayat pemeliharaan.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="dokumen" className="mt-4">
                {asset.dokumen && asset.dokumen.length > 0 ? (
                  <div className="space-y-2">
                    {asset.dokumen.map((doc, index) => (
                      <div key={index} className="p-4 border rounded-md flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{doc.nama}</h4>
                          <p className="text-sm text-muted-foreground">
                            Tanggal: {formatDate(doc.tanggal)}
                            {doc.expired && ` • Expired: ${formatDate(doc.expired)}`}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={doc.url} target="_blank">Lihat</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border rounded-md text-center text-muted-foreground">
                    Belum ada dokumen yang diunggah.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <ConfirmDialog 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Aset"
        description={`Apakah Anda yakin ingin menghapus aset "${asset.namaAset}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
      />
    </div>
  );
}