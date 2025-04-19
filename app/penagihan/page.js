// app/penagihan/page.js
"use client";

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { fetchCollections, deleteCollection, clearError, clearSuccess } from '@/lib/redux/slices/collectionSlice';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  X,
  Calendar,
  FileText,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/DynamicSidebar';
import { DatePicker } from '@/components/shared/date-picker';

export default function PenagihanPage() {
  const dispatch = useDispatch();
  const { collections, loading, error, success } = useSelector((state) => state.collection);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }

    if (success) {
      toast({
        title: "Berhasil",
        description: "Operasi penagihan berhasil dilakukan",
        variant: "success",
      });
      dispatch(clearSuccess());
    }
  }, [error, success, toast, dispatch]);

  const handleDeleteClick = (collection) => {
    setCollectionToDelete(collection);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (collectionToDelete) {
      await dispatch(deleteCollection(collectionToDelete._id));
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setFilterCustomer('');
    setStartDate(null);
    setEndDate(null);
  };

  const handleGenerateInvoice = async (id) => {
    try {
      // Implementation for generating invoice
      toast({
        title: "Generating Invoice",
        description: "Invoice is being generated...",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      });
    }
  };

  // Filter collections based on search query, status filter, customer filter, and date range
  const filteredCollections = collections.filter((collection) => {
    const matchesSearch =
      collection.noPenagihan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.pelangganId?.nama?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === ""
        ? true
        : collection.status === filterStatus;
        
    const matchesCustomer = 
      filterCustomer === ""
        ? true
        : collection.pelangganId?._id === filterCustomer;
        
    const matchesDateRange =
      (!startDate || new Date(collection.createdAt) >= startDate) &&
      (!endDate || new Date(collection.createdAt) <= endDate);

    return matchesSearch && matchesStatus && matchesCustomer && matchesDateRange;
  });

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out...");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={mockUser}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuButtonClick={() => setSidebarOpen(true)}
          user={mockUser}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-1xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Penagihan
                </h1>
                <p className="text-muted-foreground">
                  Kelola penagihan dan piutang pelanggan
                </p>
              </div>
              <Link href="/penagihan/tambah">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Penagihan
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari no penagihan atau nama pelanggan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="w-full md:w-64">
                  <Select value={filterCustomer} onValueChange={setFilterCustomer}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter pelanggan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pelanggan</SelectItem>
                      {/* Map through customers here */}
                      <SelectItem value="customer1">PT. Maju Jaya</SelectItem>
                      <SelectItem value="customer2">CV. Abadi Sentosa</SelectItem>
                      <SelectItem value="customer3">UD. Sejahtera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="LUNAS">Lunas</SelectItem>
                      <SelectItem value="BELUM LUNAS">Belum Lunas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-64">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Dari:</span>
                    <DatePicker
                      date={startDate}
                      setDate={setStartDate}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="w-full md:w-64">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Sampai:</span>
                    <DatePicker
                      date={endDate}
                      setDate={setEndDate}
                      className="w-full"
                    />
                  </div>
                </div>

                {(searchQuery || filterStatus || filterCustomer || startDate || endDate) && (
                  <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    className="h-10 px-3 lg:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="bg-white rounded-md border shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No Penagihan</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Jumlah STT</TableHead>
                        <TableHead className="text-right">Total Tagihan</TableHead>
                        <TableHead>Tanggal Bayar</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                              <span className="ml-2">Memuat data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredCollections.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            {searchQuery || filterStatus || filterCustomer || startDate || endDate ? (
                              <div>
                                Tidak ada penagihan yang cocok dengan filter yang
                                dipilih
                              </div>
                            ) : (
                              <div>Belum ada data penagihan</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCollections.map((collection) => (
                          <TableRow key={collection._id}>
                            <TableCell>{collection.noPenagihan}</TableCell>
                            <TableCell>{collection.pelangganId?.nama || '-'}</TableCell>
                            <TableCell>{collection.tipePelanggan}</TableCell>
                            <TableCell>{collection.sttIds?.length || 0}</TableCell>
                            <TableCell className="text-right">{formatCurrency(collection.totalTagihan)}</TableCell>
                            <TableCell>{collection.tanggalBayar ? formatDate(collection.tanggalBayar) : '-'}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  collection.status === 'LUNAS' ? "success" : "secondary"
                                }
                                className={
                                  collection.status === 'LUNAS'
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                }
                              >
                                {collection.status === 'LUNAS' ? 'Lunas' : 'Belum Lunas'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleGenerateInvoice(collection._id)}
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">Invoice</span>
                                </Button>
                                <Link href={`/penagihan/${collection._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(collection)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  disabled={collection.status === 'LUNAS'}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus penagihan "{collectionToDelete?.noPenagihan}" 
              dan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}