// app/keuangan/akun/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAccountById,
  updateAccount,
} from "@/lib/redux/slices/financeSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useToast } from "@/lib/hooks/use-toast";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { ArrowLeft, Edit, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
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
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

export default function AccountDetailPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { id } = useParams();
  const { account, loading, error } = useSelector((state) => state.finance);

  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    if (id) {
      dispatch(fetchAccountById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (account) {
      setFormData({
        kodeAccount: account.kodeAccount || "",
        namaAccount: account.namaAccount || "",
        tipeAccount: account.tipeAccount || "",
        deskripsi: account.deskripsi || "",
      });
    }
  }, [account]);

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
      await dispatch(updateAccount({ id, data: formData })).unwrap();
      toast({
        title: "Berhasil",
        description: "Akun berhasil diupdate",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat mengupdate akun",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out...");
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Keuangan", href: "/keuangan" },
    { label: "Akun", href: "/keuangan/akun" },
    { label: "Detail Akun", href: `/keuangan/akun/${id}` },
  ];

  if (loading) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">Loading...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center text-red-500">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!account) {
    return (
      <div>
        <Breadcrumbs items={breadcrumbItems} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center">Akun tidak ditemukan</div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold">
                  {isEditing ? "Edit Akun" : "Detail Akun"}
                </h1>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button variant="default" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Akun
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Batal
                  </Button>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? "Form Edit Akun" : "Informasi Akun"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="kodeAccount">Kode Akun</Label>
                        <Input
                          id="kodeAccount"
                          name="kodeAccount"
                          value={formData.kodeAccount}
                          onChange={handleChange}
                          placeholder="Masukkan kode akun"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="namaAccount">Nama Akun</Label>
                        <Input
                          id="namaAccount"
                          name="namaAccount"
                          value={formData.namaAccount}
                          onChange={handleChange}
                          placeholder="Masukkan nama akun"
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
                            <SelectItem value="Pendapatan">
                              Pendapatan
                            </SelectItem>
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
                          placeholder="Masukkan deskripsi akun"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Batal
                      </Button>
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Simpan
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Kode Akun</p>
                        <p className="font-medium">{account.kodeAccount}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Nama Akun</p>
                        <p className="font-medium">{account.namaAccount}</p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Tipe Akun</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            account.tipeAccount === "Pendapatan"
                              ? "bg-green-100 text-green-800"
                              : account.tipeAccount === "Biaya"
                              ? "bg-red-100 text-red-800"
                              : account.tipeAccount === "Aset"
                              ? "bg-blue-100 text-blue-800"
                              : account.tipeAccount === "Kewajiban"
                              ? "bg-orange-100 text-orange-800"
                              : account.tipeAccount === "Ekuitas"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {account.tipeAccount}
                        </span>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Dibuat Pada</p>
                        <p className="font-medium">
                          {formatDateTime(account.createdAt)}
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Diperbarui Pada</p>
                        <p className="font-medium">
                          {formatDateTime(account.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Deskripsi</p>
                        <p>{account.deskripsi || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Transaksi Terkait</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  <p>Belum ada transaksi yang terkait dengan akun ini.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
