'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/hooks/use-toast';
import { Loader2, Plus, Search, MoreHorizontal, FileEdit, Trash2, Eye } from 'lucide-react';
import ConfirmDialog from '@/components/shared/confirm-dialog';

export default function AsetPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Simulasi fetch data dari API
    setTimeout(() => {
      const dummyAssets = [
        {
          id: '1',
          namaAset: 'Truk Box Mitsubishi Canter',
          tipeAset: 'Kendaraan',
          tanggalPembelian: '2023-05-15',
          nilaiPembelian: 350000000,
          nilaiSekarang: 320000000,
          persentasePenyusutan: 10,
          statusAset: 'AKTIF',
          lokasiAset: 'Cabang Jakarta',
          cabangId: '1',
          cabangNama: 'Jakarta'
        },
        {
          id: '2',
          namaAset: 'Komputer Desktop Dell OptiPlex',
          tipeAset: 'Perangkat Elektronik',
          tanggalPembelian: '2024-01-10',
          nilaiPembelian: 12000000,
          nilaiSekarang: 11000000,
          persentasePenyusutan: 20,
          statusAset: 'AKTIF',
          lokasiAset: 'Kantor Pusat',
          cabangId: '5',
          cabangNama: 'Kantor Pusat'
        },
        {
          id: '3',
          namaAset: 'Printer Epson L3150',
          tipeAset: 'Perangkat Elektronik',
          tanggalPembelian: '2023-08-22',
          nilaiPembelian: 3500000,
          nilaiSekarang: 2800000,
          persentasePenyusutan: 20,
          statusAset: 'AKTIF',
          lokasiAset: 'Cabang Surabaya',
          cabangId: '2',
          cabangNama: 'Surabaya'
        },
        {
          id: '4',
          namaAset: 'Forklift Toyota',
          tipeAset: 'Alat Berat',
          tanggalPembelian: '2022-03-10',
          nilaiPembelian: 175000000,
          nilaiSekarang: 140000000,
          persentasePenyusutan: 15,
          statusAset: 'MAINTENANCE',
          lokasiAset: 'Cabang Jakarta',
          cabangId: '1',
          cabangNama: 'Jakarta'
        },
        {
          id: '5',
          namaAset: 'Pickup Suzuki Carry',
          tipeAset: 'Kendaraan',
          tanggalPembelian: '2020-11-05',
          nilaiPembelian: 160000000,
          nilaiSekarang: 95000000,
          persentasePenyusutan: 15,
          statusAset: 'DIJUAL',
          lokasiAset: 'Cabang Bandung',
          cabangId: '3',
          cabangNama: 'Bandung'
        }
      ];
      
      setAssets(dummyAssets);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAssets = assets.filter(asset => 
    asset.namaAset.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.tipeAset.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.lokasiAset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (asset) => {
    setSelectedAsset(asset);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    // Simulasi delete API call
    setTimeout(() => {
      setAssets(assets.filter(a => a.id !== selectedAsset.id));
      setShowDeleteConfirm(false);
      setSelectedAsset(null);
      
      toast({
        title: "Aset berhasil dihapus",
        description: `Aset ${selectedAsset.namaAset} telah dihapus dari sistem.`,
      });
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

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Aset</h1>
        <Link href="/aset/tambah" passHref legacyBehavior>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tambah Aset
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Aset</CardTitle>
          <CardDescription>
            Manajemen semua aset perusahaan seperti kendaraan, peralatan, dan properti lainnya.
          </CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
            <Input
              type="search"
              placeholder="Cari aset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Memuat data aset...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Aset</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Tanggal Pembelian</TableHead>
                    <TableHead className="text-right">Nilai Beli</TableHead>
                    <TableHead className="text-right">Nilai Sekarang</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
                        Tidak ada data aset yang ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.namaAset}</TableCell>
                        <TableCell>{asset.tipeAset}</TableCell>
                        <TableCell>{formatDate(asset.tanggalPembelian)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(asset.nilaiPembelian)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(asset.nilaiSekarang)}</TableCell>
                        <TableCell>{getStatusBadge(asset.statusAset)}</TableCell>
                        <TableCell>{asset.lokasiAset}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <Link href={`/aset/${asset.id}`} passHref legacyBehavior>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/aset/${asset.id}?mode=edit`} passHref legacyBehavior>
                                <DropdownMenuItem>
                                  <FileEdit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(asset)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ConfirmDialog 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Aset"
        description={`Apakah Anda yakin ingin menghapus aset "${selectedAsset?.namaAset}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        destructive
      />
    </div>
  );
}