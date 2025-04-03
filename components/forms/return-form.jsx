// components/forms/return-form.jsx
"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';

// Validation schema
const returnFormSchema = z.object({
  sttIds: z.array(z.string()).min(1, 'Minimal satu STT harus dipilih'),
  tanggalKirim: z.date().optional().nullable(),
  tanggalSampai: z.date().optional().nullable(),
  tandaTerima: z.string().optional(),
});

export function ReturnForm({ 
  onSubmit, 
  initialData, 
  isLoading, 
  availableSTTs = []
}) {
  const [selectedSTTs, setSelectedSTTs] = useState([]);
  
  const form = useForm({
    resolver: zodResolver(returnFormSchema),
    defaultValues: initialData || {
      sttIds: [],
      tanggalKirim: null,
      tanggalSampai: null,
      tandaTerima: '',
    },
  });
  
  // Update form when initialData changes (e.g., edit mode)
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        if (key === 'sttIds' && Array.isArray(initialData[key])) {
          setSelectedSTTs(initialData[key]);
        }
        form.setValue(key, initialData[key]);
      });
    }
  }, [initialData, form]);
  
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
  
  const handleSubmit = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="sttIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pilih STT untuk Retur</FormLabel>
              <FormControl>
                <div className="border rounded-md p-2 overflow-y-auto max-h-64">
                  {availableSTTs.length === 0 ? (
                    <div className="text-center py-4">Tidak ada STT yang tersedia untuk retur</div>
                  ) : (
                    <div className="space-y-2">
                      {availableSTTs.map(stt => (
                        <div 
                          key={stt._id} 
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
                        >
                          <Checkbox 
                            id={`stt-${stt._id}`}
                            checked={selectedSTTs.includes(stt._id)}
                            onCheckedChange={(checked) => handleSTTSelect(stt._id, checked)}
                            disabled={isLoading}
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
                        disabled={isLoading}
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
                      disabled={isLoading}
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
                        disabled={isLoading}
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
                      disabled={isLoading}
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
                  <Input 
                    placeholder="Masukkan tanda terima (opsional)" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="submit"
            disabled={isLoading || selectedSTTs.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
 }