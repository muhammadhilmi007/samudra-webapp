// app/penagihan/tambah/page.js
"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  createCollection
} from '@/lib/redux/slices/collectionSlice';
import { fetchCustomersByCabang } from '@/lib/redux/slices/customerSlice';
import { fetchSTTsByPaymentType } from '@/lib/redux/slices/sttSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { useToast } from '@/lib/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate, formatCurrency } from '@/lib/utils/format';

// Validation schema
const formSchema = z.object({
  pelangganId: z.string().min(1, 'Pelanggan harus dipilih'),
  tipePelanggan: z.enum(['Pengirim', 'Penerima'], {
    required_error: "Tipe pelanggan harus dipilih",
  }),
  sttIds: z.array(z.string()).min(1, 'Minimal satu STT harus dipilih'),
});

export default function AddCollectionPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [selectedSTTs, setSelectedSTTs] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [customerType, setCustomerType] = useState('');
  
  const { customers } = useSelector(state => state.customer);
  const { stts } = useSelector(state => state.stt);
  const { currentUser } = useSelector(state => state.auth);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pelangganId: '',
      tipePelanggan: undefined,
      sttIds: [],
    },
  });
  
  useEffect(() => {
    // Fetch customers jika user sudah login
    if (currentUser?.cabangId) {
      dispatch(fetchCustomersByCabang(currentUser.cabangId));
    }
  }, [dispatch, currentUser]);
  
  // Ketika tipe pelanggan dipilih, fetch STT yang sesuai
  useEffect(() => {
    if (customerType && form.getValues('pelangganId')) {
      const customerId = form.getValues('pelangganId');
      let type = '';
      
      if (customerType === 'Pengirim') {
        type = 'pengirim';
      } else if (customerType === 'Penerima') {
        type = 'penerima';
      }
      
      if (type && customerId) {
        // Fetch STT yang pembayarannya CAD dan terkait dengan pelanggan tsb
        dispatch(fetchSTTsByPaymentType({ 
          paymentType: 'CAD',
          [type + 'Id']: customerId 
        }));
      }
    }
  }, [customerType, form, dispatch]);
  
  // Calculate total amount whenever selected STTs change
  useEffect(() => {
    if (selectedSTTs.length > 0) {
      const total = stts
        .filter(stt => selectedSTTs.includes(stt._id))
        .reduce((sum, stt) => sum + stt.harga, 0);
      
      setTotalAmount(total);
    } else {
      setTotalAmount(0);
    }
  }, [selectedSTTs, stts]);
  
  const handleCustomerTypeChange = (value) => {
    setCustomerType(value);
    form.setValue('tipePelanggan', value);
  };
  
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
      // Add total amount and cabang info
      data.totalTagihan = totalAmount;
      
      if (currentUser) {
        data.createdBy = currentUser.id;
        data.cabangId = currentUser.cabangId;
      }
      
      await dispatch(createCollection(data)).unwrap();
      toast({
        title: "Berhasil",
        description: "Penagihan berhasil dibuat",
      });
      router.push('/penagihan');
    } catch (error) {
      toast({
        title: "Gagal",
        description: error.message || 'Terjadi kesalahan saat membuat penagihan',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Penagihan", href: "/penagihan" },
    { label: "Tambah Penagihan", href: "/penagihan/tambah" },
  ];

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
          <h1 className="text-2xl font-bold">Tambah Penagihan</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Form Tambah Penagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pelangganId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pelanggan</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pelanggan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer._id} value={customer._id}>
                              {customer.nama}
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
                  name="tipePelanggan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Pelanggan</FormLabel>
                      <Select 
                        onValueChange={(value) => handleCustomerTypeChange(value)} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe pelanggan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pengirim">Pengirim</SelectItem>
                          <SelectItem value="Penerima">Penerima</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="sttIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih STT untuk Penagihan</FormLabel>
                    <FormControl>
                      <div className="border rounded-md p-2 overflow-y-auto max-h-64">
                        {!customerType ? (
                          <div className="text-center py-4">Pilih tipe pelanggan terlebih dahulu</div>
                        ) : stts.length === 0 ? (
                          <div className="text-center py-4">Tidak ada STT yang tersedia untuk penagihan</div>
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
                                      {stt.namaBarang} - {formatCurrency(stt.harga)}
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
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between font-medium">
                  <span>Total Tagihan:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  type="button"
                  onClick={() => router.push('/penagihan')}
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