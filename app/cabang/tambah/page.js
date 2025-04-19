"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  createBranch,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/cabangSlice";
import { fetchDivisions } from "@/lib/redux/slices/divisiSlice";
import { Button } from "@/components/ui/button";
import { logout, hasAccess } from "@/lib/auth";
import AuthGuard from "@/components/auth/auth-guard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/lib/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

// Rename the main component to be wrapped with AuthGuard later
function TambahCabangContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.cabang);
  const { divisions, loading: divisionsLoading } = useSelector(
    (state) => state.divisi
  );
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    namaCabang: "",
    divisiId: "",
    alamat: "",
    kelurahan: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    kontakPenanggungJawab: {
      nama: "",
      telepon: "",
      email: "",
    },
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchDivisions());
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
        description: "Cabang berhasil dibuat",
        variant: "success",
      });
      dispatch(clearSuccess());
      router.push("/cabang");
    }
  }, [error, success, toast, dispatch, router]);

  const validateForm = () => {
    const errors = {};

    if (!formData.namaCabang.trim()) {
      errors.namaCabang = "Nama cabang harus diisi";
    }

    if (!formData.divisiId) {
      errors.divisiId = "Divisi harus dipilih";
    }

    if (!formData.kota.trim()) {
      errors.kota = "Kota harus diisi";
    }

    if (!formData.provinsi.trim()) {
      errors.provinsi = "Provinsi harus diisi";
    }

    if (!formData.kontakPenanggungJawab.nama.trim()) {
      errors["kontakPenanggungJawab.nama"] =
        "Nama penanggung jawab harus diisi";
    }

    if (!formData.kontakPenanggungJawab.telepon.trim()) {
      errors["kontakPenanggungJawab.telepon"] =
        "Telepon penanggung jawab harus diisi";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("kontakPenanggungJawab")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        kontakPenanggungJawab: {
          ...formData.kontakPenanggungJawab,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleDivisionChange = (value) => {
    setFormData({
      ...formData,
      divisiId: value,
    });

    if (formErrors.divisiId) {
      setFormErrors({
        ...formErrors,
        divisiId: undefined,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }
    
    // Format data for API
    const formattedData = {
      ...formData,
      divisiId: formData.divisiId.toString(),
      // Ensure nested objects are properly formatted
      kontakPenanggungJawab: {
        nama: formData.kontakPenanggungJawab.nama || '',
        telepon: formData.kontakPenanggungJawab.telepon || '',
        email: formData.kontakPenanggungJawab.email || ''
      }
    };
    
    console.log("Submitting branch data:", formattedData);
    await dispatch(createBranch(formattedData));
  };

  // Actual logout function using the auth system
  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
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
          <div className="mx-auto max-w-1xl space-y-6">
            <div className="flex items-center">
              <Link href="/cabang" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">
                Tambah Cabang
              </h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Formulir Tambah Cabang</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama Cabang */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="namaCabang"
                        className={formErrors.namaCabang ? "text-red-500" : ""}
                      >
                        Nama Cabang <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="namaCabang"
                        name="namaCabang"
                        placeholder="Masukkan nama cabang"
                        value={formData.namaCabang}
                        onChange={handleInputChange}
                        className={
                          formErrors.namaCabang ? "border-red-500" : ""
                        }
                      />
                      {formErrors.namaCabang && (
                        <p className="text-sm text-red-500">
                          {formErrors.namaCabang}
                        </p>
                      )}
                    </div>

                    {/* Divisi */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="divisiId"
                        className={formErrors.divisiId ? "text-red-500" : ""}
                      >
                        Divisi <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.divisiId}
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            divisiId: value,
                          });
                          // Clear error when value is selected
                          if (formErrors.divisiId) {
                            setFormErrors({
                              ...formErrors,
                              divisiId: undefined,
                            });
                          }
                        }}
                      >
                        <SelectTrigger
                          id="divisiId"
                          className={formErrors.divisiId ? "border-red-500" : ""}
                        >
                          <SelectValue placeholder="Pilih Divisi" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions && divisions.length > 0 ? (
                            divisions.map((division) => (
                              <SelectItem 
                                key={division._id} 
                                value={division._id.toString()}
                              >
                                {division.namaDivisi}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              {divisionsLoading ? "Loading..." : "Tidak ada divisi"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {formErrors.divisiId && (
                        <p className="text-sm text-red-500">
                          {formErrors.divisiId}
                        </p>
                      )}
                    </div>

                    {/* Alamat */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="alamat">Alamat</Label>
                      <Input
                        id="alamat"
                        name="alamat"
                        placeholder="Masukkan alamat lengkap"
                        value={formData.alamat}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Kelurahan & Kecamatan */}
                    <div className="space-y-2">
                      <Label htmlFor="kelurahan">Kelurahan</Label>
                      <Input
                        id="kelurahan"
                        name="kelurahan"
                        placeholder="Masukkan kelurahan"
                        value={formData.kelurahan}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="kecamatan">Kecamatan</Label>
                      <Input
                        id="kecamatan"
                        name="kecamatan"
                        placeholder="Masukkan kecamatan"
                        value={formData.kecamatan}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Kota & Provinsi */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="kota"
                        className={formErrors.kota ? "text-red-500" : ""}
                      >
                        Kota <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="kota"
                        name="kota"
                        placeholder="Masukkan kota"
                        value={formData.kota}
                        onChange={handleInputChange}
                        className={formErrors.kota ? "border-red-500" : ""}
                      />
                      {formErrors.kota && (
                        <p className="text-sm text-red-500">
                          {formErrors.kota}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="provinsi"
                        className={formErrors.provinsi ? "text-red-500" : ""}
                      >
                        Provinsi <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="provinsi"
                        name="provinsi"
                        placeholder="Masukkan provinsi"
                        value={formData.provinsi}
                        onChange={handleInputChange}
                        className={formErrors.provinsi ? "border-red-500" : ""}
                      />
                      {formErrors.provinsi && (
                        <p className="text-sm text-red-500">
                          {formErrors.provinsi}
                        </p>
                      )}
                    </div>

                    {/* Penanggung Jawab */}
                    <div className="md:col-span-2">
                      <h3 className="font-medium mb-4">
                        Informasi Penanggung Jawab
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="kontakPenanggungJawab.nama"
                            className={
                              formErrors["kontakPenanggungJawab.nama"]
                                ? "text-red-500"
                                : ""
                            }
                          >
                            Nama <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="kontakPenanggungJawab.nama"
                            name="kontakPenanggungJawab.nama"
                            placeholder="Nama penanggung jawab"
                            value={formData.kontakPenanggungJawab.nama}
                            onChange={handleInputChange}
                            className={
                              formErrors["kontakPenanggungJawab.nama"]
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formErrors["kontakPenanggungJawab.nama"] && (
                            <p className="text-sm text-red-500">
                              {formErrors["kontakPenanggungJawab.nama"]}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="kontakPenanggungJawab.telepon"
                            className={
                              formErrors["kontakPenanggungJawab.telepon"]
                                ? "text-red-500"
                                : ""
                            }
                          >
                            Telepon <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="kontakPenanggungJawab.telepon"
                            name="kontakPenanggungJawab.telepon"
                            placeholder="Nomor telepon"
                            value={formData.kontakPenanggungJawab.telepon}
                            onChange={handleInputChange}
                            className={
                              formErrors["kontakPenanggungJawab.telepon"]
                                ? "border-red-500"
                                : ""
                            }
                          />
                          {formErrors["kontakPenanggungJawab.telepon"] && (
                            <p className="text-sm text-red-500">
                              {formErrors["kontakPenanggungJawab.telepon"]}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kontakPenanggungJawab.email">
                            Email
                          </Label>
                          <Input
                            type="email"
                            id="kontakPenanggungJawab.email"
                            name="kontakPenanggungJawab.email"
                            placeholder="Email (opsional)"
                            value={formData.kontakPenanggungJawab.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="/cabang">
                    <Button variant="outline" type="button">
                      Batal
                    </Button>
                  </Link>
                  <Button type="submit" disabled={loading || divisionsLoading}>
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

// Export the component wrapped with AuthGuard to protect this route
export default function TambahCabangPage() {
  return (
    <AuthGuard
      requiredAccess={{ resource: 'branches', action: 'create' }}
      redirectTo="/unauthorized"
    >
      <TambahCabangContent />
    </AuthGuard>
  );
}
