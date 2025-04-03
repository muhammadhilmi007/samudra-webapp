// app/penagihan/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCollectionById, 
  addPayment, 
  updateCollectionStatus 
} from '@/lib/redux/slices/collectionSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { StatusBadge } from '@/components/shared/status-badge';
import { useToast } from '@/lib/hooks/use-toast';
import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils/format';
import { 
  ArrowLeft, FileText, DollarSign, Check, Info, Calendar, CreditCard,
  CheckCircle, XCircle, AlertCircle, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const paymentSchema = z.object({
  jumlah: z.coerce.number()
    .positive('Jumlah harus lebih dari 0')
    .refine(val => val > 0, {
      message: 'Jumlah harus lebih dari 0',
    }),
});

export default function CollectionDetailPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();
  const { collection, loading, error } = useSelector(state => state.collection);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      jumlah: '',
    },
  });
  
  useEffect(() => {
    if (id) {
      dispatch(fetchCollectionById(id));
    }
  }, [dispatch, id]);
  
  const handleAddPayment = async (data) => {
    try {
      await dispatch(addPayment({ 
        id, 
        jumlah: data.jumlah 
      })).unwrap();
      
      toast({
        title: "Pembayaran berhasil ditambahkan",
        description: `Pembayaran sebesar ${formatCurrency(data.jumlah)} berhasil dicatat`,
      });
      
      form.reset();
      setIsPaymentDialogOpen(false);
    } catch (error) {
      toast({
        title: "Gagal menambahkan pembayaran",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateStatus = async (status) => {
    try {
      await dispatch(updateCollectionStatus({ id, status })).unwrap();
      toast({
        title: "Status berhasil diubah",
        description: `Status penagihan berhasil diubah menjadi ${status}`,
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
    { label: "Penagihan", href: "/penagihan" },
    { label: "Detail Penagihan", href: `/penagihan/${id}` },
  ];
  
  const calculateTotalPaid = () => {
    if (!collection?.jumlahBayarTermin || collection.jumlahBayarTermin.length === 0) {
      return 0;
    }
    
    return collection.jumlahBayarTermin.reduce((total, termin) => total + termin.jumlah, 0);
  };
  
  const calculateRemainingAmount = () => {
    const totalPaid = calculateTotalPaid();
    return collection?.totalTagihan ? collection.totalTagihan - totalPaid : 0;
  };

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

  if (!collection) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center">
              Penagihan tidak ditemukan
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const totalPaid = calculateTotalPaid();
  const remainingAmount = calculateRemainingAmount();
  const paymentProgress = collection.totalTagihan > 0 
    ? (totalPaid / collection.totalTagihan) * 100 
    : 0;

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="flex justify-between items-center my-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/penagihan">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detail Penagihan</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/penagihan/${id}/cetak`}>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Cetak Invoice
            </Button>
          </Link>
          
          {collection.status === 'BELUM LUNAS' && (
            <>
              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Tambah Pembayaran
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Tambah Pembayaran</DialogTitle>
                    <DialogDescription>
                      Masukkan jumlah pembayaran untuk penagihan ini.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddPayment)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="jumlah"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jumlah Pembayaran</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Masukkan jumlah" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4 flex justify-between">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setIsPaymentDialogOpen(false)}
                        >
                          Batal
                        </Button>
                        <Button type="submit">
                          <Check className="mr-2 h-4 w-4" />
                          Simpan Pembayaran
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              {remainingAmount <= 0 && (
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleUpdateStatus('LUNAS')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Tandai Lunas
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Penagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">No Penagihan</p>
                  <p className="font-medium">{collection.noPenagihan}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Pelanggan</p>
                  <p className="font-medium">{collection.pelanggan?.nama || "-"}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tipe Pelanggan</p>
                  <p className="font-medium">{collection.tipePelanggan}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={collection.status} type="collection" />
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Jumlah STT</p>
                  <p className="font-medium">{collection.sttIds?.length || 0}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Total Tagihan</p>
                  <p className="font-medium">{formatCurrency(collection.totalTagihan)}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="font-medium">{collection.overdue ? 'Ya' : 'Tidak'}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Tanggal Bayar</p>
                  <p className="font-medium">{collection.tanggalBayar ? formatDate(collection.tanggalBayar) : '-'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Total Dibayar:</span>
                <span className="font-medium">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sisa Pembayaran:</span>
                <span className="font-medium">{formatCurrency(remainingAmount)}</span>
              </div>
              
              <div className="mt-2 mb-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress:</span>
                  <span>{paymentProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${paymentProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {collection.status === 'BELUM LUNAS' && remainingAmount > 0 && (
              <Button
                className="w-full mt-4"
                onClick={() => setIsPaymentDialogOpen(true)}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Tambah Pembayaran
              </Button>
            )}
            
            {collection.status === 'BELUM LUNAS' && remainingAmount <= 0 && (
              <Button
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => handleUpdateStatus('LUNAS')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Tandai Lunas
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      {collection.jumlahBayarTermin && collection.jumlahBayarTermin.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Riwayat Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collection.jumlahBayarTermin.map((termin, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Termin {termin.termin}</p>
                      <p className="text-sm text-gray-500">
                        {termin.tanggal ? formatDate(termin.tanggal) : '-'}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">{formatCurrency(termin.jumlah)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {collection.sttIds && collection.sttIds.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Daftar STT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border px-4 py-2 text-left">No STT</th>
                    <th className="border px-4 py-2 text-left">Nama Barang</th>
                    <th className="border px-4 py-2 text-right">Berat</th>
                    <th className="border px-4 py-2 text-right">Jumlah Colly</th>
                    <th className="border px-4 py-2 text-right">Harga</th>
                    <th className="border px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {collection.sttIds.map((stt, index) => (
                    <tr key={stt._id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">
                        <Link href={`/stt/${stt._id}`} className="text-blue-600 hover:underline">
                          {stt.noSTT}
                        </Link>
                      </td>
                      <td className="border px-4 py-2">{stt.namaBarang}</td>
                      <td className="border px-4 py-2 text-right">{stt.berat} kg</td>
                     <td className="border px-4 py-2 text-right">{stt.jumlahColly}</td>
                     <td className="border px-4 py-2 text-right">{formatCurrency(stt.harga)}</td>
                     <td className="border px-4 py-2 text-center">
                       <StatusBadge status={stt.status} type="stt" />
                     </td>
                   </tr>
                 ))}
               </tbody>
               <tfoot>
                 <tr className="bg-gray-50 font-medium">
                   <td colSpan={4} className="border px-4 py-2 text-right">Total:</td>
                   <td className="border px-4 py-2 text-right">{formatCurrency(collection.totalTagihan)}</td>
                   <td className="border px-4 py-2"></td>
                 </tr>
               </tfoot>
             </table>
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
               <p className="font-medium">Penagihan dibuat</p>
               <p className="text-sm text-gray-500">{formatDateTime(collection.createdAt)}</p>
             </div>
           </div>
           
           {collection.jumlahBayarTermin && collection.jumlahBayarTermin.map((termin, index) => (
             <div key={index} className="flex items-start gap-2">
               <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
               <div>
                 <p className="font-medium">Pembayaran termin {termin.termin}</p>
                 <p className="text-sm text-gray-500">
                   {termin.tanggal ? formatDateTime(termin.tanggal) : '-'} - {formatCurrency(termin.jumlah)}
                 </p>
               </div>
             </div>
           ))}
           
           {collection.tanggalBayar && (
             <div className="flex items-start gap-2">
               <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
               <div>
                 <p className="font-medium">Penagihan lunas</p>
                 <p className="text-sm text-gray-500">{formatDateTime(collection.tanggalBayar)}</p>
               </div>
             </div>
           )}
         </div>
       </CardContent>
     </Card>
   </div>
 );
}