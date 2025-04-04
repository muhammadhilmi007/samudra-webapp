// app/pengambilan/tambah/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createPickup,
  fetchPickupRequestById
} from '@/lib/redux/slices/pickupSlice';
import { fetchCustomersByBranch } from '@/lib/redux/slices/customerSlice';
import { fetchVehiclesByBranch } from '@/lib/redux/slices/vehicleSlice';
import { fetchEmployeesByBranch } from '@/lib/redux/slices/pegawaiSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useToast } from '@/lib/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

// Validation schema
const formSchema = z.object({
  pengirimId: z.string().min(1, 'Pengirim harus dipilih'),
  alamatPengambilan: z.string().min(1, 'Alamat pengambilan harus diisi'),
  tujuan: z.string().min(1, 'Tujuan harus diisi'),
  jumlahColly: z.coerce.number().positive('Jumlah colly harus lebih dari 0'),
  supirId: z.string().min(1, 'Supir harus dipilih'),
  kenekId: z.string().optional(),
  kendaraanId: z.string().min(1, 'Kendaraan harus dipilih'),
  estimasiPengambilan: z.string().optional(),
});

export default function AddPickupPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [fromRequest, setFromRequest] = useState(false);
  
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  
  const { pickupRequest, currentUser } = useSelector(state => state.auth);
  const { customers } = useSelector(state => state.customer);
  const { vehicles } = useSelector(state => state.vehicle);
  const { employeesByBranch } = useSelector(state => state.pegawai);
  const employees = currentUser?.cabangId ? (employeesByBranch[currentUser.cabangId] || []) : [];
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pengirimId: '',
      alamatPengambilan: '',
      tujuan: '',
      jumlahColly: '',
      supirId: '',
      kenekId: '',
      kendaraanId: '',
      estimasiPengambilan: '',
    },
  });
  
  useEffect(() => {
    // Jika user sudah login dan memiliki cabangId, fetch data yang dibutuhkan
    if (currentUser?.cabangId) {
      dispatch(fetchCustomersByBranch(currentUser.cabangId));
      dispatch(fetchVehiclesByBranch(currentUser.cabangId));
      dispatch(fetchEmployeesByBranch(currentUser.cabangId));
    }
    
    // Jika ada requestId, fetch data request pengambilan
    if (requestId) {
      dispatch(fetchPickupRequestById(requestId))
        .then(response => {
          const request = response.payload;
          if (request) {
            setFromRequest(true);
            form.setValue('pengirimId', request.pengirimId);
            form.setValue('alamatPengambilan', request.alamatPengambilan);
            form.setValue('tujuan', request.tujuan);
            form.setValue('jumlahColly', request.jumlahColly);
            form.setValue('estimasiPengambilan', request.estimasiPengambilan || '');
          }
        });
    }
  }, [dispatch, currentUser, requestId, form]);
  
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Jika user sudah login dan memiliki ID, tambahkan userId dan cabangId ke data
      if (currentUser) {
        data.userId = currentUser.id;
        data.cabangId = currentUser.cabangId;
      }
      
      if (requestId) {
        data.requestId = requestId;
      }
      
      await dispatch(createPickup(data)).unwrap();
      toast({
        title: "Berhasil",
        description: "Pengambilan berhasil dibuat",
      });
      router.push('/pengambilan');
    } catch (error) {
      toast({
        title: "Gagal",
        description: error.message || 'Terjadi kesalahan saat membuat pengambilan',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
    { label: "Tambah Pengambilan", href: "/pengambilan/tambah" },
  ];
  
  // Filter customers yang berjenis pengirim
  const senders = customers.filter(customer => 
    customer.tipe === 'pengirim' || customer.tipe === 'keduanya'
  );
  
  // Filter kendaraan lansir
  const lansirVehicles = vehicles.filter(vehicle => vehicle.tipe === 'lansir');
  
  // Filter pegawai berdasarkan role
  const drivers = employees.filter(employee => employee.jabatan.toLowerCase().includes('supir'));
  const helpers = employees.filter(employee => employee.jabatan.toLowerCase().includes('kenek'));

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="flex justify-between items-center my-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/pengambilan">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Tambah Pengambilan Barang</h1>
        </div>
      </div>
      
      {fromRequest && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-4">
          Data diisi otomatis dari request pengambilan.
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Form Pengambilan Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                 name="pengirimId"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Pengirim</FormLabel>
                     <Select 
                       onValueChange={field.onChange} 
                       defaultValue={field.value}
                     >
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Pilih pengirim" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {senders.map((sender) => (
                           <SelectItem key={sender._id} value={sender._id}>
                             {sender.nama}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               
               <FormField
                 control={form.control}
                 name="jumlahColly"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Jumlah Colly</FormLabel>
                     <FormControl>
                       <Input type="number" placeholder="Jumlah colly" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               
               <FormField
                 control={form.control}
                 name="alamatPengambilan"
                 render={({ field }) => (
                   <FormItem className="md:col-span-2">
                     <FormLabel>Alamat Pengambilan</FormLabel>
                     <FormControl>
                       <Textarea placeholder="Masukkan alamat lengkap pengambilan" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               
               <FormField
                 control={form.control}
                 name="tujuan"
                 render={({ field }) => (
                   <FormItem className="md:col-span-2">
                     <FormLabel>Tujuan</FormLabel>
                     <FormControl>
                       <Input placeholder="Masukkan tujuan pengiriman" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               
               <FormField
                 control={form.control}
                 name="kendaraanId"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Kendaraan</FormLabel>
                     <Select 
                       onValueChange={field.onChange} 
                       defaultValue={field.value}
                     >
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Pilih kendaraan" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {lansirVehicles.map((vehicle) => (
                           <SelectItem key={vehicle._id} value={vehicle._id}>
                             {vehicle.namaKendaraan} - {vehicle.noPolisi}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               
               <FormField
                 control={form.control}
                 name="supirId"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Supir</FormLabel>
                     <Select 
                       onValueChange={field.onChange} 
                       defaultValue={field.value}
                     >
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Pilih supir" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {drivers.map((driver) => (
                           <SelectItem key={driver._id} value={driver._id}>
                             {driver.nama}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               
               <FormField
                 control={form.control}
                 name="kenekId"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Kenek (Opsional)</FormLabel>
                     <Select 
                       onValueChange={field.onChange} 
                       defaultValue={field.value}
                     >
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Pilih kenek" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         <SelectItem value="all">Tidak ada kenek</SelectItem>
                         {helpers.map((helper) => (
                           <SelectItem key={helper._id} value={helper._id}>
                             {helper.nama}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               
               <FormField
                 control={form.control}
                 name="estimasiPengambilan"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Estimasi Pengambilan</FormLabel>
                     <FormControl>
                       <Input placeholder="Tanggal atau waktu estimasi" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
             </div>
             
             <div className="flex justify-end gap-2">
               <Button 
                 variant="outline"
                 type="button"
                 onClick={() => router.push('/pengambilan')}
               >
                 Batal
               </Button>
               <Button 
                 type="submit"
                 disabled={submitting}
               >
                 {submitting ? "Menyimpan..." : "Simpan"}
                 <Save className="ml-2 h-4 w-4" />
               </Button>
             </div>
           </form>
         </Form>
       </CardContent>
     </Card>
   </div>
 );
}