// app/keuangan/akun/tambah/page.js
"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { createAccount } from "@/lib/redux/slices/financeSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useToast } from "@/lib/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

export default function AddAccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const { loading } = useSelector((state) => state.finance);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    kodeAccount: "",
    namaAccount: "",
    tipeAccount: "",
    deskripsi: "",
  });

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(createAccount(formData)).unwrap();
      toast({
        title: "Berhasil",
        description: "Akun berhasil dibuat",
      });
      router.push("/keuangan/akun");
    } catch (error) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat membuat akun",
        variant: "destructive",
      });
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Keuangan", href: "/keuangan" },
    { label: "Akun", href: "/keuangan/akun" },
    { label: "Tambah Akun", href: "/keuangan/akun/tambah" },
  ];

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out...");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={mockUser}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuButtonClick={() => setSidebarOpen(true)}
          user={mockUser}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-1xl space-y-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex justify-between items-center my-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/keuangan/akun">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold">Tambah Akun</h1>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Form Tambah Akun</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="kodeAccount">Kode Akun</Label>
                      <Input
                        id="kodeAccount"
                        name="kodeAccount"
                        value={formData.kodeAccount}
                        onChange={handleChange}
                        placeholder="Contoh: 1-1000"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Format: 1-xxxx untuk Aset, 2-xxxx untuk Kewajiban, dll.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="namaAccount">Nama Akun</Label>
                      <Input
                        id="namaAccount"
                        name="namaAccount"
                        value={formData.namaAccount}
                        onChange={handleChange}
                        placeholder="Contoh: Kas Operasional"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipeAccount">Tipe Akun</Label>
                      <Select
                        value={formData.tipeAccount}
                        onValueChange={(value) =>
                          handleSelectChange("tipeAccount", value)
                        }
                        required
                      >
                        <SelectTrigger id="tipeAccount">
                          <SelectValue placeholder="Pilih tipe akun" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendapatan">Pendapatan</SelectItem>
                          <SelectItem value="Biaya">Biaya</SelectItem>
                          <SelectItem value="Aset">Aset</SelectItem>
                          <SelectItem value="Kewajiban">Kewajiban</SelectItem>
                          <SelectItem value="Ekuitas">Ekuitas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="deskripsi">Deskripsi</Label>
                      <Textarea
                        id="deskripsi"
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleChange}
                        placeholder="Deskripsi penggunaan akun ini"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/keuangan/akun")}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        "Menyimpan..."
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Simpan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-4 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-blue-700 space-y-2">
                  <h3 className="font-medium">Petunjuk Pembuatan Akun</h3>
                  <p className="text-sm">
                    Berikut adalah format standar kode akun:
                  </p>
                  <ul className="text-sm list-disc list-inside">
                    <li>1-xxxx: Akun Aset (contoh: 1-1000 Kas)</li>
                    <li>
                      2-xxxx: Akun Kewajiban (contoh: 2-1000 Hutang Usaha)
                    </li>
                    <li>3-xxxx: Akun Ekuitas (contoh: 3-1000 Modal)</li>
                    <li>
                      4-xxxx: Akun Pendapatan (contoh: 4-1000 Pendapatan Jasa)
                    </li>
                    <li>
                      5-xxxx: Akun Biaya (contoh: 5-1000 Biaya Operasional)
                    </li>
                  </ul>
                  <p className="text-sm">
                    Pastikan untuk memilih tipe akun yang sesuai dengan kode
                    akun.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
