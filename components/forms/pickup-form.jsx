// components/forms/pickup-form.jsx - Final version
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import {
  Save,
  Loader2,
  Truck,
  Calendar,
  AlertCircle,
  Clock,
  MapPin,
  Package,
  User,
  FileText
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

// Validation schema for pickup form
const pickupFormSchema = z.object({
  pengirimId: z.string({
    required_error: "Pengirim harus dipilih"
  }),
  alamatPengambilan: z.string({
    required_error: "Alamat pengambilan harus diisi"
  }).min(3, "Alamat pengambilan minimal 3 karakter"),
  tujuan: z.string({
    required_error: "Tujuan harus diisi"
  }).min(2, "Tujuan minimal 2 karakter"),
  jumlahColly: z.coerce.number({
    required_error: "Jumlah colly harus diisi",
    invalid_type_error: "Jumlah colly harus berupa angka"
  }).positive("Jumlah colly harus lebih dari 0"),
  supirId: z.string({
    required_error: "Supir harus dipilih"
  }),
  kenekId: z.string().optional(),
  kendaraanId: z.string({
    required_error: "Kendaraan harus dipilih"
  }),
  estimasiPengambilan: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["PENDING", "BERANGKAT", "SELESAI", "CANCELLED"]).default("PENDING"),
  requestId: z.string().optional()
});

export function PickupForm({
  onSubmit,
  initialData = null,
  isLoading = false,
  senders = [],
  vehicles = [],
  drivers = [],
  helpers = [],
  fromRequest = false,
  error = null
}) {
  const [isUsingKenek, setIsUsingKenek] = useState(
    initialData?.kenekId ? true : false
  );
  
  // Form with validation
  const form = useForm({
    resolver: zodResolver(pickupFormSchema),
    defaultValues: {
      pengirimId: initialData?.pengirimId || "",
      alamatPengambilan: initialData?.alamatPengambilan || "",
      tujuan: initialData?.tujuan || "",
      jumlahColly: initialData?.jumlahColly || "",
      supirId: initialData?.supirId || "",
      kenekId: initialData?.kenekId || "",
      kendaraanId: initialData?.kendaraanId || "",
      estimasiPengambilan: initialData?.estimasiPengambilan || "",
      notes: initialData?.notes || "",
      status: initialData?.status || "PENDING",
      requestId: initialData?.requestId || ""
    }
  });
  
  // Update form when initialData changes (e.g. in edit mode)
  useEffect(() => {
    if (initialData) {
      // Reset form with initialData
      const formData = {
        pengirimId: initialData.pengirimId || "",
        alamatPengambilan: initialData.alamatPengambilan || "",
        tujuan: initialData.tujuan || "",
        jumlahColly: initialData.jumlahColly || "",
        supirId: initialData.supirId || "",
        kenekId: initialData.kenekId || "",
        kendaraanId: initialData.kendaraanId || "",
        estimasiPengambilan: initialData.estimasiPengambilan || "",
        notes: initialData.notes || "",
        status: initialData.status || "PENDING"
      };
      
      // Update requestId if we're coming from a pickup request
      if (initialData.requestId) {
        formData.requestId = initialData.requestId;
      }
      
      // Set each field individually to avoid React Hook Form warnings
      Object.entries(formData).forEach(([key, value]) => {
        form.setValue(key, value);
      });
      
      // Update the kenek checkbox state
      setIsUsingKenek(initialData.kenekId ? true : false);
    }
  }, [initialData, form]);
  
  // Handle form submission
  const handleSubmit = async (data) => {
    // If not using kenek, set kenekId to null
    if (!isUsingKenek) {
      data.kenekId = null;
    }
    
    if (onSubmit) {
      await onSubmit(data);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Display error message if any */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Informative message for request-based pickup */}
        {fromRequest && (
          <Alert variant="info" className="bg-blue-50 border-blue-200 text-blue-700">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              Data diisi otomatis dari request pengambilan
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pengirim field */}
          <FormField
            control={form.control}
            name="pengirimId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <User className="h-4 w-4 text-gray-500" />
                  Pengirim
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pengirim" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {senders.length > 0 ? (
                      senders.map((sender) => (
                        <SelectItem key={sender._id} value={sender._id}>
                          {sender.nama}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-sender" disabled>
                        Tidak ada data pengirim
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
                    {/* Jumlah Colly field */}
                    <FormField
            control={form.control}
            name="jumlahColly"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-gray-500" />
                  Jumlah Colly
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Jumlah colly" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Alamat Pengambilan field */}
          <FormField
            control={form.control}
            name="alamatPengambilan"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Alamat Pengambilan
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Masukkan alamat lengkap pengambilan" 
                    {...field} 
                    disabled={isLoading}
                    className="resize-none min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Tujuan field */}
          <FormField
            control={form.control}
            name="tujuan"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Tujuan
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Masukkan tujuan pengiriman" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Kendaraan field */}
          <FormField
            control={form.control}
            name="kendaraanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <Truck className="h-4 w-4 text-gray-500" />
                  Kendaraan
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kendaraan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles.length > 0 ? (
                      vehicles.map((vehicle) => (
                        <SelectItem key={vehicle._id} value={vehicle._id}>
                          {vehicle.namaKendaraan} - {vehicle.noPolisi}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-vehicle" disabled>
                        Tidak ada data kendaraan
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Supir field */}
          <FormField
            control={form.control}
            name="supirId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <User className="h-4 w-4 text-gray-500" />
                  Supir
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih supir" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {drivers.length > 0 ? (
                      drivers.map((driver) => (
                        <SelectItem 
                          key={driver._id || `driver-${Math.random()}`} 
                          value={driver._id || ""}
                        >
                          {driver.nama || "Nama tidak tersedia"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-driver" disabled>
                        Tidak ada data supir
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Kenek toggle */}
          <div className="flex items-center gap-2 md:col-span-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="use-kenek" 
                checked={isUsingKenek}
                onCheckedChange={setIsUsingKenek}
                disabled={isLoading}
              />
              <label 
                htmlFor="use-kenek" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Gunakan Kenek
              </label>
            </div>
          </div>
          
          {/* Kenek field - only shown if using kenek */}
          {isUsingKenek && (
            <FormField
              control={form.control}
              name="kenekId"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="flex items-center gap-1">
                    <User className="h-4 w-4 text-gray-500" />
                    Kenek
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kenek" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {helpers.length > 0 ? (
                        helpers.map((helper) => (
                          <SelectItem key={helper._id} value={helper._id}>
                            {helper.nama}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-helper" disabled>
                          Tidak ada data kenek
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Estimasi Pengambilan field */}
          <FormField
            control={form.control}
            name="estimasiPengambilan"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  Estimasi Pengambilan
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="datetime-local"
                      className="pl-8"
                      placeholder="Pilih tanggal dan waktu"
                      {...field}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Notes field */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Catatan
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tambahkan catatan jika diperlukan"
                    {...field}
                    disabled={isLoading}
                    className="resize-none min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end gap-2">
          <Button 
            type="submit"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {initialData ? 'Perbarui Pengambilan' : 'Simpan Pengambilan'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

