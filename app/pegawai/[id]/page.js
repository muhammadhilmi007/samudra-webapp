"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { use } from "react"; // Add this import
import { logout, hasAccess } from "@/lib/auth";
import AuthGuard from "@/components/auth/auth-guard";
import {
  fetchEmployeeById,
  updateEmployee,
  fetchRoles,
  uploadProfilePicture,
  uploadDocument,
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
import { ArrowLeft, Loader2, Upload, User, FileText } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

// Rename the main component to be wrapped with AuthGuard later
function EditPegawaiContent({ params }) {
  const employeeId = use(params).id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentEmployee, loading, error, success } = useSelector(
    (state) => state.pegawai
  );
  const { roles, loading: rolesLoading } = useSelector(
    (state) => state.pegawai
  );
  const { branches, loading: branchesLoading } = useSelector(
    (state) => state.cabang
  );
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const fileInputRef = useRef(null);
  const ktpFileInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordField, setShowPasswordField] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchEmployeeById(employeeId)),
          dispatch(fetchRoles()),
          dispatch(fetchBranches()),
        ]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal memuat data pegawai",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch, employeeId, toast]);

  useEffect(() => {
    if (currentEmployee) {
      setFormData({
        nama: currentEmployee.nama || "",
        jabatan: currentEmployee.jabatan || "",
        roleId: currentEmployee.roleId || "",
        email: currentEmployee.email || "",
        telepon: currentEmployee.telepon || "",
        alamat: currentEmployee.alamat || "",
        username: currentEmployee.username || "",
        password: "", // Don't populate password
        cabangId: currentEmployee.cabangId || "",
        aktif:
          currentEmployee.aktif !== undefined ? currentEmployee.aktif : true,
      });

      // Set preview if profile photo exists
      if (currentEmployee.fotoProfil) {
        setPreview((prev) => ({
          ...prev,
          fotoProfil: currentEmployee.fotoProfil,
        }));
      }

      // Set preview if KTP document exists
      if (currentEmployee.dokumen && currentEmployee.dokumen.ktp) {
        setPreview((prev) => ({
          ...prev,
          ktpFile: currentEmployee.dokumen.ktp,
        }));
      }
    }
  }, [currentEmployee]);

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
        description: "Pegawai berhasil diperbarui",
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

    if (showPasswordField && !formData.password.trim()) {
      errors.password = "Password harus diisi";
    } else if (showPasswordField && formData.password.length < 6) {
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

  const handleFileChange = async (e, type) => {
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

    // Upload the file immediately
    const formData = new FormData();
    formData.append(type === "fotoProfil" ? "fotoProfil" : "dokumen.ktp", file);

    try {
      if (type === "fotoProfil") {
        await dispatch(uploadProfilePicture({ id: employeeId, formData }));
      } else if (type === "ktpFile") {
        await dispatch(
          uploadDocument({ id: employeeId, docType: "ktp", formData })
        );
      }

      toast({
        title: "Berhasil",
        description: `${
          type === "fotoProfil" ? "Foto profil" : "Dokumen KTP"
        } berhasil diunggah`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal mengunggah ${
          type === "fotoProfil" ? "foto profil" : "dokumen KTP"
        }`,
        variant: "destructive",
      });
    }
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

    // Only include password if it's changed
    if (!showPasswordField || !formData.password) {
      delete formDataToSend.password;
    }

    try {
      await dispatch(
        updateEmployee({ id: employeeId, formData: formDataToSend })
      );
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  if (isLoading || !currentEmployee) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }

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
              <Link href="/pegawai" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">
                Edit Pegawai
              </h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Formulir Edit Pegawai</CardTitle>
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

                        {/* Password Option */}
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="changePassword"
                              checked={showPasswordField}
                              onCheckedChange={(checked) =>
                                setShowPasswordField(checked)
                              }
                            />
                            <Label htmlFor="changePassword">
                              Ubah Password
                            </Label>
                          </div>
                          <p className="text-sm text-gray-500">
                            Centang jika ingin mengubah password pegawai
                          </p>
                        </div>

                        {/* Password Field (conditional) */}
                        {showPasswordField && (
                          <div className="space-y-2 md:col-span-2">
                            <Label
                              htmlFor="password"
                              className={
                                formErrors.password ? "text-red-500" : ""
                              }
                            >
                              Password Baru{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="password"
                              name="password"
                              type="password"
                              placeholder="Masukkan password baru"
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
                        )}

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
                                  <FileText className="h-10 w-10 text-gray-400" />
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

// Export the component wrapped with AuthGuard to protect this route
export default function EditPegawaiPage({ params }) {
  return (
    <AuthGuard
      requiredAccess={{ resource: 'employees', action: 'edit' }}
      redirectTo="/unauthorized"
    >
      <EditPegawaiContent params={params} />
    </AuthGuard>
  );
}
