'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Download, FileText, FileSpreadsheet, FileImage } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function EksporLaporanPage() {
  const [jenis, setJenis] = useState('keuangan');
  const [periode, setPeriode] = useState('');
  const [format, setFormat] = useState('pdf');
  const [cabang, setCabang] = useState('');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const jenisLaporan = [
    { id: 'keuangan', nama: 'Laporan Keuangan', icon: <FileText className="h-5 w-5" /> },
    { id: 'penjualan', nama: 'Laporan Penjualan', icon: <FileSpreadsheet className="h-5 w-5" /> },
    { id: 'operasional', nama: 'Laporan Operasional', icon: <FileImage className="h-5 w-5" /> },
  ];
  
  const formatLaporan = [
    { id: 'pdf', nama: 'PDF Document (.pdf)', icon: <FileText className="h-5 w-5 text-red-500" /> },
    { id: 'excel', nama: 'Excel Spreadsheet (.xlsx)', icon: <FileSpreadsheet className="h-5 w-5 text-green-500" /> },
    { id: 'csv', nama: 'CSV File (.csv)', icon: <FileSpreadsheet className="h-5 w-5 text-blue-500" /> },
  ];
  
  const cabangList = [
    { id: 'all', nama: 'Semua Cabang' },
    { id: '1', nama: 'Jakarta' },
    { id: '2', nama: 'Surabaya' },
    { id: '3', nama: 'Bandung' },
    { id: '4', nama: 'Medan' },
  ];
  
  const periodeList = [
    { id: '2025-03', nama: 'Maret 2025' },
    { id: '2025-02', nama: 'Februari 2025' },
    { id: '2025-01', nama: 'Januari 2025' },
    { id: '2024-12', nama: 'Desember 2024' },
    { id: '2024-Q4', nama: 'Q4 2024' },
    { id: '2024-Q3', nama: 'Q3 2024' },
    { id: '2024', nama: 'Tahun 2024' },
  ];
  
  const handleDownload = () => {
    if (!periode) {
      toast({
        title: "Periode belum dipilih",
        description: "Silakan pilih periode laporan yang akan diunduh.",
        variant: "destructive"
      });
      return;
    }
    
    if (!cabang) {
      toast({
        title: "Cabang belum dipilih",
        description: "Silakan pilih cabang untuk laporan yang akan diunduh.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulasi proses download
    setTimeout(() => {
      setLoading(false);
      
      toast({
        title: "Laporan berhasil diunduh",
        description: `Laporan ${jenisLaporan.find(j => j.id === jenis).nama} periode ${periodeList.find(p => p.id === periode).nama} telah diunduh dalam format ${format.toUpperCase()}.`,
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/laporan">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Ekspor Laporan</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Ekspor Laporan</CardTitle>
          <CardDescription>
            Pilih jenis, periode, dan format laporan yang ingin diunduh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Jenis Laporan</Label>
            <RadioGroup 
              value={jenis} 
              onValueChange={setJenis}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {jenisLaporan.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.id} id={`jenis-${item.id}`} />
                  <Label htmlFor={`jenis-${item.id}`} className="flex items-center cursor-pointer">
                    <span className="mr-2">{item.icon}</span>
                    {item.nama}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="periode">Periode Laporan</Label>
              <Select value={periode} onValueChange={setPeriode}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  {periodeList.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="cabang">Cabang</Label>
              <Select value={cabang} onValueChange={setCabang}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang" />
                </SelectTrigger>
                <SelectContent>
                  {cabangList.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Format File</Label>
            <RadioGroup 
              value={format} 
              onValueChange={setFormat}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {formatLaporan.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.id} id={`format-${item.id}`} />
                  <Label htmlFor={`format-${item.id}`} className="flex items-center cursor-pointer">
                    <span className="mr-2">{item.icon}</span>
                    {item.nama}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label>Opsi Tambahan</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-details" 
                  checked={includeDetails}
                  onCheckedChange={setIncludeDetails}
                />
                <Label htmlFor="include-details" className="cursor-pointer">
                  Sertakan detail transaksi
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-charts" 
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                />
                <Label htmlFor="include-charts" className="cursor-pointer">
                  Sertakan grafik dan visualisasi
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/laporan">Batal</Link>
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Memproses...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Unduh Laporan
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}