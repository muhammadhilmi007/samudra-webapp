"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  createEmployee,
  fetchRoles,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/pegawaiSlice";
import { fetchBranches } from "@/lib/redux/slices/cabangSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/hooks/use-toast";
import { ArrowLeft, Loader2, Upload, User } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function TambahPegawaiPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.pegawai);
  const { roles, loading: rolesLoading } = useSelector(
    (state) => state.pegawai
  );
  const { branches, loading: branchesLoading } = useSelector(
    (state) => state.cabang
  );
  const { toast } = useToast();

  const fileInputRef = useRef(null);
  const ktpFileInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data - in a real app, this would come from your auth system
  const user = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@example.com",
  };

  const [formData, setFormData] = useState({
    nama: "",
    jabatan: "",
    roleId: "",
    email: "",
    telepon: "",
    alamat: "",
    username: "",
    password: "",
    cabangId: "",
    aktif: true,
  });

  const [formFiles, setFormFiles] = useState({
    fotoProfil: null,
    ktpFile: null,
  });

  const [preview, setPreview] = useState({
    fotoProfil: null,
    ktpFile: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("info-dasar");
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this line to define the missing state

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchBranches());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      // Ensure error is a string
      const errorMessage = typeof error === 'object' ? 
        (error.message || "Terjadi kesalahan") : 
        String(error);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      dispatch(clearError());
    }

    if (success) {
      toast({
        title: "Berhasil",
        description: "Pegawai berhasil dibuat",
        variant: "success",
      });
      dispatch(clearSuccess());
      router.push("/pegawai");
    }
  }, [error, success, toast, dispatch, router]);

  const validateBasicInfo = () => {
    const errors = {};

    if (!formData.nama.trim()) {
      errors.nama = "Nama harus diisi";
    }

    if (!formData.jabatan.trim()) {
      errors.jabatan = "Jabatan harus diisi";
    }

    if (!formData.roleId) {
      errors.roleId = "Role harus dipilih";
    }

    if (!formData.telepon.trim()) {
      errors.telepon = "Telepon harus diisi";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }

    return errors;
  };

  const validateLoginInfo = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Username harus diisi";
    } else if (formData.username.length < 3) {
      errors.username = "Username minimal 3 karakter";
    }

    if (!formData.password.trim()) {
      errors.password = "Password harus diisi";
    } else if (formData.password.length < 6) {
      errors.password = "Password minimal 6 karakter";
    }

    if (!formData.cabangId) {
      errors.cabangId = "Cabang harus dipilih";
    }

    return errors;
  };

  const validateStep = (step) => {
    let errors = {};

    if (step === "info-dasar") {
      errors = validateBasicInfo();
    } else if (step === "login") {
      errors = validateLoginInfo();
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextTab = () => {
    if (activeTab === "info-dasar" && validateStep("info-dasar")) {
      setActiveTab("login");
    } else if (activeTab === "login" && validateStep("login")) {
      setActiveTab("dokumen");
    }
  };

  const handlePrevTab = () => {
    if (activeTab === "login") {
      setActiveTab("info-dasar");
    } else if (activeTab === "dokumen") {
      setActiveTab("login");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Update form files
    setFormFiles({
      ...formFiles,
      [type]: file,
    });

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview({
        ...preview,
        [type]: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = (ref) => {
    if (ref && ref.current) {
      ref.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all steps
    const basicInfoErrors = validateBasicInfo();
    const loginInfoErrors = validateLoginInfo();

    if (Object.keys(basicInfoErrors).length > 0) {
      setFormErrors(basicInfoErrors);
      setActiveTab("info-dasar");
      return;
    }

    if (Object.keys(loginInfoErrors).length > 0) {
      setFormErrors(loginInfoErrors);
      setActiveTab("login");
      return;
    }

    // Create form data to send
    const formDataToSend = { ...formData };
    
    // Ensure all required fields are properly formatted
    if (!formDataToSend.roleId) delete formDataToSend.roleId;
    if (!formDataToSend.cabangId) delete formDataToSend.cabangId;
    
    // Convert boolean to proper format if needed
    formDataToSend.aktif = Boolean(formDataToSend.aktif);

    try {
      setIsSubmitting(true);
      await dispatch(createEmployee(formDataToSend)).unwrap();
      // Success will be handled by the useEffect watching for success state
    } catch (error) {
      // If there are validation errors from the server, display them
      if (error.validationErrors) {
        const serverErrors = {};
        
        // Map server validation errors to form fields
        Object.entries(error.validationErrors).forEach(([key, value]) => {
          serverErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        
        setFormErrors(serverErrors);
        
        // Navigate to the appropriate tab based on the error
        const firstErrorField = Object.keys(serverErrors)[0];
        if (['nama', 'jabatan', 'roleId', 'email', 'telepon', 'alamat'].includes(firstErrorField)) {
          setActiveTab('info-dasar');
        } else if (['username', 'password', 'cabangId'].includes(firstErrorField)) {
          setActiveTab('login');
        }
      }
      
      // Make sure we're passing a string to the toast description
      const errorMessage = typeof error === 'object' ? 
        (error.message || "Gagal menambahkan pegawai") : 
        String(error);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock logout function
  const handleLogout = () => {
    console.log("User logged out");
    // Implement actual logout logic here
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
              <Link href="/pegawai" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">
                Tambah Pegawai
              </h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Formulir Tambah Pegawai</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="px-6">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info-dasar">
                        Informasi Dasar
                      </TabsTrigger>
                      <TabsTrigger value="login">Login & Akses</TabsTrigger>
                      <TabsTrigger value="dokumen">Foto & Dokumen</TabsTrigger>
                    </TabsList>
                  </div>

                  <CardContent className="p-6">
                    <TabsContent value="info-dasar" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nama */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="nama"
                            className={formErrors.nama ? "text-red-500" : ""}
                          >
                            Nama <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="nama"
                            name="nama"
                            placeholder="Masukkan nama pegawai"
                            value={formData.nama}
                            onChange={handleInputChange}
                            className={formErrors.nama ? "border-red-500" : ""}
                          />
                          {formErrors.nama && (
                            <p className="text-sm text-red-500">
                              {formErrors.nama}
                            </p>
                          )}
                        </div>

                        {/* Jabatan */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="jabatan"
                            className={formErrors.jabatan ? "text-red-500" : ""}
                          >
                            Jabatan <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="jabatan"
                            name="jabatan"
                            placeholder="Masukkan jabatan"
                            value={formData.jabatan}
                            onChange={handleInputChange}
                            className={
                              formErrors.jabatan ? "border-red-500" : ""
                            }
                          />
                          {formErrors.jabatan && (
                            <p className="text-sm text-red-500">
                              {formErrors.jabatan}
                            </p>
                          )}
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="roleId"
                            className={formErrors.roleId ? "text-red-500" : ""}
                          >
                            Role <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.roleId}
                            onValueChange={(value) =>
                              handleSelectChange("roleId", value)
                            }
                          >
                            <SelectTrigger
                              id="roleId"
                              className={
                                formErrors.roleId ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                              {rolesLoading ? (
                                <div className="flex items-center justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span>Memuat role...</span>
                                </div>
                              ) : roles.length === 0 ? (
                                <div className="p-2 text-center text-sm">
                                  Tidak ada data role
                                </div>
                              ) : (
                                roles.map((role) => (
                                  <SelectItem key={role._id} value={role._id}>
                                    {role.namaRole}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {formErrors.roleId && (
                            <p className="text-sm text-red-500">
                              {formErrors.roleId}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className={formErrors.email ? "text-red-500" : ""}
                          >
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Masukkan email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={formErrors.email ? "border-red-500" : ""}
                          />
                          {formErrors.email && (
                            <p className="text-sm text-red-500">
                              {formErrors.email}
                            </p>
                          )}
                        </div>

                        {/* Telepon */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="telepon"
                            className={formErrors.telepon ? "text-red-500" : ""}
                          >
                            Telepon <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="telepon"
                            name="telepon"
                            placeholder="Masukkan nomor telepon"
                            value={formData.telepon}
                            onChange={handleInputChange}
                            className={
                              formErrors.telepon ? "border-red-500" : ""
                            }
                          />
                          {formErrors.telepon && (
                            <p className="text-sm text-red-500">
                              {formErrors.telepon}
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
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button type="button" onClick={handleNextTab}>
                          Selanjutnya
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="login" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="username"
                            className={
                              formErrors.username ? "text-red-500" : ""
                            }
                          >
                            Username <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="username"
                            name="username"
                            placeholder="Masukkan username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={
                              formErrors.username ? "border-red-500" : ""
                            }
                          />
                          {formErrors.username && (
                            <p className="text-sm text-red-500">
                              {formErrors.username}
                            </p>
                          )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="password"
                            className={
                              formErrors.password ? "text-red-500" : ""
                            }
                          >
                            Password <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Masukkan password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={
                              formErrors.password ? "border-red-500" : ""
                            }
                          />
                          {formErrors.password && (
                            <p className="text-sm text-red-500">
                              {formErrors.password}
                            </p>
                          )}
                        </div>

                        {/* Cabang */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="cabangId"
                            className={
                              formErrors.cabangId ? "text-red-500" : ""
                            }
                          >
                            Cabang <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.cabangId}
                            onValueChange={(value) =>
                              handleSelectChange("cabangId", value)
                            }
                          >
                            <SelectTrigger
                              id="cabangId"
                              className={
                                formErrors.cabangId ? "border-red-500" : ""
                              }
                            >
                              <SelectValue placeholder="Pilih cabang" />
                            </SelectTrigger>
                            <SelectContent>
                              {branchesLoading ? (
                                <div className="flex items-center justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span>Memuat cabang...</span>
                                </div>
                              ) : branches.length === 0 ? (
                                <div className="p-2 text-center text-sm">
                                  Tidak ada data cabang
                                </div>
                              ) : (
                                branches.map((branch) => (
                                  <SelectItem
                                    key={branch._id}
                                    value={branch._id}
                                  >
                                    {branch.namaCabang}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {formErrors.cabangId && (
                            <p className="text-sm text-red-500">
                              {formErrors.cabangId}
                            </p>
                          )}
                        </div>

                        {/* Status Aktif */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="aktif"
                              checked={formData.aktif}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange("aktif", checked)
                              }
                            />
                            <Label htmlFor="aktif">Pegawai Aktif</Label>
                          </div>
                          <p className="text-sm text-gray-500">
                            Centang jika pegawai dalam status aktif
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevTab}
                        >
                          Sebelumnya
                        </Button>
                        <Button type="button" onClick={handleNextTab}>
                          Selanjutnya
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="dokumen" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Foto Profil */}
                        <div className="space-y-4">
                          <Label>Foto Profil</Label>
                          <div
                            className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => triggerFileInput(fileInputRef)}
                          >
                            {preview.fotoProfil ? (
                              <div className="flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full overflow-hidden mb-2">
                                  <img
                                    src={preview.fotoProfil}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                >
                                  Ganti Foto
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                  <User className="h-16 w-16 text-gray-400" />
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  Klik untuk unggah foto
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Pilih Foto
                                </Button>
                              </div>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileChange(e, "fotoProfil")
                              }
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Format: JPG, PNG, GIF. Ukuran maks: 2MB
                          </p>
                        </div>

                        {/* KTP */}
                        <div className="space-y-4">
                          <Label>Foto KTP</Label>
                          <div
                            className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => triggerFileInput(ktpFileInputRef)}
                          >
                            {preview.ktpFile ? (
                              <div className="flex flex-col items-center">
                                <div className="w-full max-h-44 overflow-hidden mb-2 rounded">
                                  <img
                                    src={preview.ktpFile}
                                    alt="Preview KTP"
                                    className="w-full object-contain"
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                >
                                  Ganti Foto KTP
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center p-6">
                                <div className="w-64 h-32 bg-gray-100 flex items-center justify-center mb-4 rounded">
                                  <Upload className="h-10 w-10 text-gray-400" />
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  Klik untuk unggah foto KTP
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Pilih Foto KTP
                                </Button>
                              </div>
                            )}
                            <input
                              ref={ktpFileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, "ktpFile")}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Format: JPG, PNG, PDF. Ukuran maks: 5MB
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevTab}
                        >
                          Sebelumnya
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
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
