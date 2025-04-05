'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function AssetForm({ initialData, onSubmit, onCancel, isSubmitting = false }) {
  const [cabangList] = useState([
    { id: '1', nama: 'Jakarta' },
    { id: '2', nama: 'Surabaya' },
    { id: '3', nama: 'Bandung' },
    { id: '4', nama: 'Medan' },
    { id: '5', nama: 'Kantor Pusat' }
  ]);
  
  const [tipeAsetList] = useState([
    'Kendaraan',
    'Perangkat Elektronik',
    'Alat Berat',
    'Perabotan Kantor',
    'Bangunan',
    'Lainnya'
  ]);
  
  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm({
    defaultValues: initialData || {
      namaAset: '',
      tipeAset: '',
      tanggalPembelian: new Date().toISOString().split('T')[0],
      nilaiPembelian: '',
      persentasePenyusutan: '',
      statusAset: 'AKTIF',
      lokasiAset: '',
      cabangId: '',
      deskripsi: '',
      nomorSeri: '',
      nomorPlat: ''
    }
  });
  
  const watchTipeAset = watch('tipeAset');
  
  const onFormSubmit = (data) => {
    // Memastikan nilai numerik diolah dengan benar
    const formattedData = {
      ...data,
      nilaiPembelian: Number(data.nilaiPembelian),
      persentasePenyusutan: Number(data.persentasePenyusutan),
      // Menghitung nilai sekarang berdasarkan penyusutan
      nilaiSekarang: calculateCurrentValue(
        Number(data.nilaiPembelian), 
        Number(data.persentasePenyusutan), 
        new Date(data.tanggalPembelian)
      ),
    };
    
    onSubmit(formattedData);
  };
  
  const calculateCurrentValue = (initialValue, depreciationRate, purchaseDate) => {
    const currentDate = new Date();
    const purchaseTime = new Date(purchaseDate).getTime();
    const yearsElapsed = (currentDate.getTime() - purchaseTime) / (1000 * 60 * 60 * 24 * 365);
    
    // Membatasi penyusutan maksimal hingga 80% dari nilai awal
    const maxDepreciation = initialValue * 0.8;
    const calculatedDepreciation = initialValue * (depreciationRate / 100) * yearsElapsed;
    
    return Math.max(initialValue - Math.min(calculatedDepreciation, maxDepreciation), initialValue * 0.2);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="namaAset">
                Nama Aset <span className="text-red-500">*</span>
              </Label>
              <Input
                id="namaAset"
                placeholder="Masukkan nama aset"
                {...register('namaAset', { required: 'Nama aset harus diisi' })}
              />
              {errors.namaAset && (
                <p className="text-sm text-red-500">{errors.namaAset.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipeAset">
                Tipe Aset <span className="text-red-500">*</span>
              </Label>
              <Select 
                defaultValue={initialData?.tipeAset || ''} 
                onValueChange={(value) => setValue('tipeAset', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe aset" />
                </SelectTrigger>
                <SelectContent>
                  {tipeAsetList.map((tipe) => (
                    <SelectItem key={tipe} value={tipe}>
                      {tipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipeAset && (
                <p className="text-sm text-red-500">{errors.tipeAset.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tanggalPembelian">
                Tanggal Pembelian <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggalPembelian"
                type="date"
                {...register('tanggalPembelian', { required: 'Tanggal pembelian harus diisi' })}
              />
              {errors.tanggalPembelian && (
                <p className="text-sm text-red-500">{errors.tanggalPembelian.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nilaiPembelian">
                Nilai Pembelian (Rp) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nilaiPembelian"
                type="number"
                placeholder="0"
                {...register('nilaiPembelian', { 
                  required: 'Nilai pembelian harus diisi',
                  min: { value: 1, message: 'Nilai pembelian harus lebih dari 0' }
                })}
              />
              {errors.nilaiPembelian && (
                <p className="text-sm text-red-500">{errors.nilaiPembelian.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="persentasePenyusutan">
                Persentase Penyusutan Tahunan (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="persentasePenyusutan"
                type="number"
                placeholder="0"
                {...register('persentasePenyusutan', { 
                  required: 'Persentase penyusutan harus diisi',
                  min: { value: 0, message: 'Persentase penyusutan tidak boleh negatif' },
                  max: { value: 100, message: 'Persentase penyusutan tidak boleh lebih dari 100%' }
                })}
              />
              {errors.persentasePenyusutan && (
                <p className="text-sm text-red-500">{errors.persentasePenyusutan.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cabangId">
                Cabang <span className="text-red-500">*</span>
              </Label>
              <Select 
                defaultValue={initialData?.cabangId || ''} 
                onValueChange={(value) => setValue('cabangId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang" />
                </SelectTrigger>
                <SelectContent>
                  {cabangList.map((cabang) => (
                    <SelectItem key={cabang.id} value={cabang.id}>
                      {cabang.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cabangId && (
                <p className="text-sm text-red-500">{errors.cabangId.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lokasiAset">
                Lokasi Aset <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lokasiAset"
                placeholder="Lokasi detail aset"
                {...register('lokasiAset', { required: 'Lokasi aset harus diisi' })}
              />
              {errors.lokasiAset && (
                <p className="text-sm text-red-500">{errors.lokasiAset.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nomorSeri">
                Nomor Seri
              </Label>
              <Input
                id="nomorSeri"
                placeholder="Nomor seri aset (jika ada)"
                {...register('nomorSeri')}
              />
            </div>
            
            {watchTipeAset === 'Kendaraan' && (
              <div className="space-y-2">
                <Label htmlFor="nomorPlat">
                  Nomor Plat
                </Label>
                <Input
                  id="nomorPlat"
                  placeholder="Nomor plat kendaraan"
                  {...register('nomorPlat')}
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deskripsi">
              Deskripsi
            </Label>
            <Textarea
              id="deskripsi"
              placeholder="Deskripsi atau informasi tambahan tentang aset"
              rows={4}
              {...register('deskripsi')}
            />
          </div>
          
          <div className="space-y-2">
            <Label>
              Status Aset <span className="text-red-500">*</span>
            </Label>
            <RadioGroup 
              defaultValue={initialData?.statusAset || 'AKTIF'} 
              onValueChange={(value) => setValue('statusAset', value)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AKTIF" id="status-aktif" />
                <Label htmlFor="status-aktif">Aktif</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MAINTENANCE" id="status-maintenance" />
                <Label htmlFor="status-maintenance">Maintenance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DIJUAL" id="status-dijual" />
                <Label htmlFor="status-dijual">Dijual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RUSAK" id="status-rusak" />
                <Label htmlFor="status-rusak">Rusak</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Perbarui Aset' : 'Simpan Aset'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}