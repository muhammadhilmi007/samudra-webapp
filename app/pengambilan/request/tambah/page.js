// app/pengambilan/request/tambah/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  createPickupRequest
} from '@/lib/redux/slices/pickupSlice';
import { fetchCustomersByBranch } from '@/lib/redux/slices/customerSlice';
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

// Validation schema
const formSchema = z.object({
  pengirimId: z.string().min(1, 'Pengirim harus dipilih'),
  alamatPengambilan: z.string().min(1, 'Alamat pengambilan harus diisi'),
  tujuan: z.string().min(1, 'Tujuan harus diisi'),
  jumlahColly: z.coerce.number().positive('Jumlah colly harus lebih dari 0'),
  estimasiPengambilan: z.string().optional(),
  notes: z.string().optional(),
});

export default function AddPickupRequestPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  const { customers } = useSelector(state => state.customer);
  const { currentUser } = useSelector(state => state.auth);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pengirimId: '',
      alamatPengambilan: '',
      tujuan: '',
      jumlahColly: '',
      estimasiPengambilan: '',
      notes: '',
    },
  });
  
  useEffect(() => {
    // Jika user sudah login dan memiliki cabangId, fetch customers berdasarkan cabang tersebut
    if (currentUser?.cabangId) {
      dispatch(fetchCustomersByBranch(currentUser.cabangId));
    }
  }, [dispatch, currentUser]);
  
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Jika user sudah login dan memiliki ID, tambahkan userId dan cabangId ke data
      if (currentUser) {
        data.userId = currentUser.id;
        data.cabangId = currentUser.cabangId;
      }
      
      await dispatch(createPickupRequest(data)).unwrap();
      toast({
        title: "Berhasil",
        description: "Request pengambilan berhasil dibuat",
      });
      router.push('/pengambilan/request');
    } catch (error) {
      toast({
        title: "Gagal",
        description: error.message || 'Terjadi kesalahan saat membuat request pengambilan',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
    { label: "Request Pengambilan", href: "/pengambilan/request" },
    { label: "Tambah Request", href: "/pengambilan/request/tambah" },
  ];
  
  // Filter customers to get only senders
  const senders = customers.filter(customer => 
    customer.tipe === 'pengirim' || customer.tipe === 'keduanya'
  );

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
          <h1 className="text-2xl font-bold">Tambah Request Pengambilan</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Form Request Pengambilan</CardTitle>
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
                
                <div></div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Catatan</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Catatan tambahan (opsional)" {...field} />
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
                  onClick={() => router.push('/pengambilan/request')}
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