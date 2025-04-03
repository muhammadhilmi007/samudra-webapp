// app/retur/tambah/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  createReturn
} from '@/lib/redux/slices/returnSlice';
import { fetchSTTsByStatus } from '@/lib/redux/slices/sttSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useToast } from '@/lib/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';

// Validation schema
const formSchema = z.object({
  sttIds: z.array(z.string()).min(1, 'Minimal satu STT harus dipilih'),
  tanggalKirim: z.date().optional(),
  tanggalSampai: z.date().optional(),
  tandaTerima: z.string().optional(),
});

export default function AddReturnPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [selectedSTTs, setSelectedSTTs] = useState([]);
  
  const { stts, loading: loadingSTTs } = useSelector(state => state.stt);
  const { currentUser } = useSelector(state => state.auth);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sttIds: [],
      tanggalKirim: undefined,
      tanggalSampai: undefined,
      tandaTerima: '',
    },
  });
  
  useEffect(() => {
    // Fetch STTs yang sudah diterima
    dispatch(fetchSTTsByStatus('TERKIRIM'));
  }, [dispatch]);
  
  const handleSTTSelect = (sttId, isChecked) => {
    if (isChecked) {
      const updatedSTTs = [...selectedSTTs, sttId];
      setSelectedSTTs(updatedSTTs);
      form.setValue('sttIds', updatedSTTs);
    } else {
      const updatedSTTs = selectedSTTs.filter(id => id !== sttId);
      setSelectedSTTs(updatedSTTs);
      form.setValue('sttIds', updatedSTTs);
    }
  };
  
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Jika user sudah login dan memiliki ID, tambahkan data yang dibutuhkan
      if (currentUser) {
        data.createdBy = currentUser.id;
        data.cabangId = currentUser.cabangId;
      }
      
      await dispatch(createReturn(data)).unwrap();
      toast({
        title: "Berhasil",
        description: "Retur berhasil dibuat",
      });
      router.push('/retur');
    } catch (error) {
      toast({
        title: "Gagal",
        description: error.message || 'Terjadi kesalahan saat membuat retur',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Retur", href: "/retur" },
    { label: "Tambah Retur", href: "/retur/tambah" },
  ];

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
          <h1 className="text-2xl font-bold">Tambah Retur</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Form Tambah Retur</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="sttIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih STT untuk Retur</FormLabel>
                    <FormControl>
                      <div className="border rounded-md p-2 overflow-y-auto max-h-64">
                        {loadingSTTs ? (
                          <div className="text-center py-4">Loading STT...</div>
                        ) : stts.length === 0 ? (
                          <div className="text-center py-4">Tidak ada STT yang tersedia untuk retur</div>
                        ) : (
                          <div className="space-y-2">
                            {stts.map(stt => (
                              <div 
                                key={stt._id} 
                               className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
                             >
                               <Checkbox 
                                 id={`stt-${stt._id}`}
                                 checked={selectedSTTs.includes(stt._id)}
                                 onCheckedChange={(checked) => handleSTTSelect(stt._id, checked)}
                               />
                               <div className="flex-1 flex justify-between items-center">
                                 <div>
                                   <Label htmlFor={`stt-${stt._id}`} className="font-medium cursor-pointer">
                                     {stt.noSTT}
                                   </Label>
                                   <p className="text-sm text-gray-500">
                                     {stt.namaBarang} - {stt.jumlahColly} colly
                                   </p>
                                 </div>
                                 <StatusBadge status={stt.status} type="stt" />
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                 control={form.control}
                 name="tanggalKirim"
                 render={({ field }) => (
                   <FormItem className="flex flex-col">
                     <FormLabel>Tanggal Kirim</FormLabel>
                     <Popover>
                       <PopoverTrigger asChild>
                         <FormControl>
                           <Button
                             variant={"outline"}
                             className={cn(
                               "w-full pl-3 text-left font-normal",
                               !field.value && "text-muted-foreground"
                             )}
                           >
                             {field.value ? (
                               format(field.value, "PPP")
                             ) : (
                               <span>Pilih tanggal</span>
                             )}
                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                           </Button>
                         </FormControl>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={field.value}
                           onSelect={field.onChange}
                           initialFocus
                         />
                       </PopoverContent>
                     </Popover>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               
               <FormField
                 control={form.control}
                 name="tanggalSampai"
                 render={({ field }) => (
                   <FormItem className="flex flex-col">
                     <FormLabel>Tanggal Sampai</FormLabel>
                     <Popover>
                       <PopoverTrigger asChild>
                         <FormControl>
                           <Button
                             variant={"outline"}
                             className={cn(
                               "w-full pl-3 text-left font-normal",
                               !field.value && "text-muted-foreground"
                             )}
                           >
                             {field.value ? (
                               format(field.value, "PPP")
                             ) : (
                               <span>Pilih tanggal</span>
                             )}
                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                           </Button>
                         </FormControl>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={field.value}
                           onSelect={field.onChange}
                           initialFocus
                         />
                       </PopoverContent>
                     </Popover>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               
               <FormField
                 control={form.control}
                 name="tandaTerima"
                 render={({ field }) => (
                   <FormItem className="md:col-span-2">
                     <FormLabel>Tanda Terima</FormLabel>
                     <FormControl>
                       <Input placeholder="Masukkan tanda terima (opsional)" {...field} />
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
                 onClick={() => router.push('/retur')}
               >
                 Batal
               </Button>
               <Button 
                 type="submit"
                 disabled={submitting || selectedSTTs.length === 0}
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