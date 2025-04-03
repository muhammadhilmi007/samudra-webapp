// app/keuangan/jurnal/tambah/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { createJournal, fetchAccounts, clearError, clearSuccess } from '@/lib/redux/slices/financeSlice';
import { fetchBranches } from '@/lib/redux/slices/cabangSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Loader2, CalendarIcon } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { DatePicker } from '@/components/shared/date-picker';
import Link from 'next/link';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';

export default function TambahJurnalPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { accounts, loading, error, success } = useSelector((state) => state.finance);
  const { branches } = useSelector((state) => state.cabang);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tanggal: new Date(),
    accountId: '',
    cabangId: '',
    keterangan: '',
    debet: '',
    kredit: '',
    tipe: 'Lokal', // Default value
    status: 'DRAFT', // Default value
    sttIds: [],
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data
  const user = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@example.com",
  };

  useEffect(() => {
    // Fetch necessary data
    dispatch(fetchAccounts());
    dispatch(fetchBranches());
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
        description: "Jurnal berhasil dibuat",
        variant: "success",
      });
      dispatch(clearSuccess());
      router.push("/keuangan/jurnal");
    }
  }, [error, success, toast, dispatch, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === 'debet' || name === 'kredit') {
      // Only allow numbers and decimal point
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === '' || regex.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      tanggal: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.tanggal) {
      toast({
        title: "Validasi Gagal",
        description: "Tanggal harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (!formData.accountId) {
      toast({
        title: "Validasi Gagal",
        description: "Akun harus dipilih",
        variant: "destructive",
      });
      return;
    }

    if (!formData.cabangId) {
      toast({
        title: "Validasi Gagal",
        description: "Cabang harus dipilih",
        variant: "destructive",
      });
      return;
    }

    if (!formData.keterangan) {
      toast({
        title: "Validasi Gagal",
        description: "Keterangan harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Either debet or kredit must be filled, but not both
    if ((!formData.debet && !formData.kredit) || (formData.debet && formData.kredit)) {
      toast({
        title: "Validasi Gagal",
        description: "Isi salah satu antara debet atau kredit",
        variant: "destructive",
      });
      return;
    }

    // Convert string amounts to numbers
    const journalData = {
      ...formData,
      debet: formData.debet ? parseFloat(formData.debet) : 0,
      kredit: formData.kredit ? parseFloat(formData.kredit) : 0,
    };

    try {
      await dispatch(createJournal(journalData)).unwrap();
    } catch (err) {
      console.error('Failed to create journal:', err);
    }
  };

  const handleLogout = () => {
    console.log("User logged out");
    // Implement actual logout logic
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuButtonClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center">
              <Link href="/keuangan/jurnal" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">
                Tambah Jurnal
              </h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Formulir Tambah Jurnal</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tanggal */}
                    <div className="space-y-2">
                      <Label htmlFor="tanggal">
                        Tanggal <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <DatePicker
                          date={formData.tanggal}
                          setDate={handleDateChange}
                        />
                      </div>
                    </div>

                    {/* Tipe */}
                    <div className="space-y-2">
                      <Label htmlFor="tipe">
                        Tipe <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.tipe}
                        onValueChange={(value) => handleSelectChange("tipe", value)}
                      >
                        <SelectTrigger id="tipe">
                          <SelectValue placeholder="Pilih tipe jurnal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lokal">Lokal</SelectItem>
                          <SelectItem value="Pusat">Pusat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Akun */}
                    <div className="space-y-2">
                      <Label htmlFor="accountId">
                        Akun <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.accountId}
                        onValueChange={(value) =>
                          handleSelectChange("accountId", value)
                        }
                      >
                        <SelectTrigger id="accountId">
                          <SelectValue placeholder="Pilih akun" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account._id} value={account._id}>
                              {account.kodeAccount} - {account.namaAccount}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Cabang */}
                    <div className="space-y-2">
                      <Label htmlFor="cabangId">
                        Cabang <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.cabangId}
                        onValueChange={(value) =>
                          handleSelectChange("cabangId", value)
                        }
                      >
                        <SelectTrigger id="cabangId">
                          <SelectValue placeholder="Pilih cabang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pusat">Kantor Pusat</SelectItem>
                          {branches.map((branch) => (
                            <SelectItem key={branch._id} value={branch._id}>
                              {branch.namaCabang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Debet */}
                    <div className="space-y-2">
                      <Label htmlFor="debet">Debet</Label>
                      <Input
                        id="debet"
                        name="debet"
                        placeholder="Masukkan jumlah debet"
                        value={formData.debet}
                        onChange={handleInputChange}
                      />
                      <p className="text-xs text-gray-500">
                        Isi salah satu: debet atau kredit
                      </p>
                    </div>

                    {/* Kredit */}
                    <div className="space-y-2">
                      <Label htmlFor="kredit">Kredit</Label>
                      <Input
                        id="kredit"
                        name="kredit"
                        placeholder="Masukkan jumlah kredit"
                        value={formData.kredit}
                        onChange={handleInputChange}
                      />
                      <p className="text-xs text-gray-500">
                        Isi salah satu: debet atau kredit
                      </p>
                    </div>

                    {/* Keterangan */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="keterangan">
                        Keterangan <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="keterangan"
                        name="keterangan"
                        placeholder="Masukkan keterangan jurnal"
                        rows={3}
                        value={formData.keterangan}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/keuangan/jurnal")}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}