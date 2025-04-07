// components/forms/vehicle-form.jsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createVehicle,
  updateVehicle,
  fetchVehicleById,
  uploadVehiclePhoto,
  uploadVehicleDocument,
  clearError,
  clearSuccess
} from "@/lib/redux/slices/vehicleSlice";
import { fetchBranches } from "@/lib/redux/slices/cabangSlice";
import { fetchEmployees } from "@/lib/redux/slices/pegawaiSlice";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/lib/hooks/use-toast";
import {
  Loader2,
  Save,
  ArrowLeft,
  Truck,
  User,
  Users,
  Building,
  Upload,
  ImageIcon,
  FileText,
  UploadCloud,
  Image,
} from "lucide-react";
import FileUploader from "@/components/shared/file-uploader";

// Form validation schema
const vehicleSchema = z.object({
  noPolisi: z
    .string()
    .min(1, { message: "Nomor polisi harus diisi" })
    .regex(/^[A-Z0-9 ]+$/, { message: "Format nomor polisi tidak valid" }),
  namaKendaraan: z.string().min(1, { message: "Nama kendaraan harus diisi" }),
  supirId: z.string().min(1, { message: "Supir harus dipilih" }),
  noTeleponSupir: z
    .string()
    .min(1, { message: "Nomor telepon supir harus diisi" }),
  noKTPSupir: z
    .string()
    .min(16, { message: "Nomor KTP harus 16 digit" })
    .max(16, { message: "Nomor KTP harus 16 digit" })
    .regex(/^\d+$/, { message: "Nomor KTP hanya boleh berisi angka" }),
  alamatSupir: z.string().min(1, { message: "Alamat supir harus diisi" }),
  kenekId: z.string().optional(),
  noTeleponKenek: z.string().optional(),
  noKTPKenek: z
    .string()
    .optional()
    .refine((val) => !val || (val.length === 16 && /^\d+$/.test(val)), {
      message: "Nomor KTP harus 16 digit dan hanya boleh berisi angka",
    }),
  alamatKenek: z.string().optional(),
  cabangId: z.string().min(1, { message: "Cabang harus dipilih" }),
  tipe: z.string().min(1, { message: "Tipe kendaraan harus dipilih" }),
  grup: z.string().optional(),
});

export default function VehicleForm({ vehicleId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const { currentVehicle, loading, error, success, uploading, uploadSuccess, uploadError } = useSelector(
    (state) => state.vehicle
  );
  const { branches, loading: branchesLoading } = useSelector((state) => state.cabang);
  const { employees, loading: employeesLoading } = useSelector(
    (state) => state.pegawai
  );

  const [isEditing, setIsEditing] = useState(!!vehicleId);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info-kendaraan");

  const [driverPhotoFile, setDriverPhotoFile] = useState(null);
  const [driverPhotoPreview, setDriverPhotoPreview] = useState(null);
  const [driverIDCardFile, setDriverIDCardFile] = useState(null);
  const [driverIDCardPreview, setDriverIDCardPreview] = useState(null);
  const [helperPhotoFile, setHelperPhotoFile] = useState(null);
  const [helperPhotoPreview, setHelperPhotoPreview] = useState(null);
  const [helperIDCardFile, setHelperIDCardFile] = useState(null);
  const [helperIDCardPreview, setHelperIDCardPreview] = useState(null);

  const [isUploadingDriverPhoto, setIsUploadingDriverPhoto] = useState(false);
  const [isUploadingDriverIDCard, setIsUploadingDriverIDCard] = useState(false);
  const [isUploadingHelperPhoto, setIsUploadingHelperPhoto] = useState(false);
  const [isUploadingHelperIDCard, setIsUploadingHelperIDCard] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      noPolisi: "",
      namaKendaraan: "",
      supirId: "",
      noTeleponSupir: "",
      noKTPSupir: "",
      alamatSupir: "",
      kenekId: "",
      noTeleponKenek: "",
      noKTPKenek: "",
      alamatKenek: "",
      cabangId: "",
      tipe: "",
      grup: "",
    },
  });

  // Fetch data on initial load
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
    
    // Fetch branches and employees data if not already loaded
    if (!branches.length) dispatch(fetchBranches());
    if (!employees.length) dispatch(fetchEmployees());

    // Fetch vehicle data if in edit mode
    if (isEditing && vehicleId) {
      dispatch(fetchVehicleById(vehicleId));
    }
    
    // Cleanup function
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch, isEditing, vehicleId, branches.length, employees.length]);

  // Populate form with vehicle data when available
  useEffect(() => {
    if (isEditing && currentVehicle) {
      form.reset({
        noPolisi: currentVehicle.noPolisi || "",
        namaKendaraan: currentVehicle.namaKendaraan || "",
        supirId: currentVehicle.supirId?._id || currentVehicle.supirId || "",
        noTeleponSupir: currentVehicle.noTeleponSupir || "",
        noKTPSupir: currentVehicle.noKTPSupir || "",
        alamatSupir: currentVehicle.alamatSupir || "",
        kenekId: currentVehicle.kenekId?._id || currentVehicle.kenekId || "",
        noTeleponKenek: currentVehicle.noTeleponKenek || "",
        noKTPKenek: currentVehicle.noKTPKenek || "",
        alamatKenek: currentVehicle.alamatKenek || "",
        cabangId: currentVehicle.cabangId?._id || currentVehicle.cabangId || "",
        tipe: currentVehicle.tipe || "",
        grup: currentVehicle.grup || "",
      });

      // Set photo previews if available
      if (currentVehicle.fotoSupir) {
        setDriverPhotoPreview(currentVehicle.fotoSupir);
      }

      if (currentVehicle.fotoKTPSupir) {
        setDriverIDCardPreview(currentVehicle.fotoKTPSupir);
      }

      if (currentVehicle.fotoKenek) {
        setHelperPhotoPreview(currentVehicle.fotoKenek);
      }

      if (currentVehicle.fotoKTPKenek) {
        setHelperIDCardPreview(currentVehicle.fotoKTPKenek);
      }
    }
  }, [form, isEditing, currentVehicle]);

  // Handle error and success states
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }

    if (uploadError) {
      toast({
        title: "Error",
        description: uploadError,
        variant: "destructive",
      });
      dispatch(clearError());
    }

    if (success && formSubmitted) {
      toast({
        title: isEditing ? "Kendaraan berhasil diperbarui" : "Kendaraan berhasil ditambahkan",
        description: `Data kendaraan telah berhasil ${isEditing ? "diperbarui" : "disimpan"}.`,
        variant: "success",
      });

      if (!isEditing) {
        // Reset form after successful creation
        form.reset({
          noPolisi: "",
          namaKendaraan: "",
          supirId: "",
          noTeleponSupir: "",
          noKTPSupir: "",
          alamatSupir: "",
          kenekId: "",
          noTeleponKenek: "",
          noKTPKenek: "",
          alamatKenek: "",
          cabangId: "",
          tipe: "",
          grup: "",
        });

        // Reset photo files and previews
        setDriverPhotoFile(null);
        setDriverPhotoPreview(null);
        setDriverIDCardFile(null);
        setDriverIDCardPreview(null);
        setHelperPhotoFile(null);
        setHelperPhotoPreview(null);
        setHelperIDCardFile(null);
        setHelperIDCardPreview(null);
      } else {
        // Redirect to list after successful update
        setTimeout(() => {
          router.push("/kendaraan");
        }, 2000);
      }

      setFormSubmitted(false);
      dispatch(clearSuccess());
    }
  }, [error, uploadError, success, toast, form, isEditing, router, dispatch, formSubmitted]);

  // Handle driver photo upload
  const handleDriverPhotoChange = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setDriverPhotoFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setDriverPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setDriverPhotoFile(null);
      setDriverPhotoPreview(null);
    }
  };

  // Handle driver ID card upload
  const handleDriverIDCardChange = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setDriverIDCardFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setDriverIDCardPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setDriverIDCardFile(null);
      setDriverIDCardPreview(null);
    }
  };

  // Handle helper photo upload
  const handleHelperPhotoChange = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setHelperPhotoFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setHelperPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setHelperPhotoFile(null);
      setHelperPhotoPreview(null);
    }
  };

  // Handle helper ID card upload
  const handleHelperIDCardChange = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setHelperIDCardFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setHelperIDCardPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setHelperIDCardFile(null);
      setHelperIDCardPreview(null);
    }
  };

  // Upload files after vehicle creation/update
  const uploadFiles = async (vehicleId) => {
    const uploadTasks = [];
    const errors = [];

    // Upload driver photo if available
    if (driverPhotoFile) {
      uploadTasks.push(
        (async () => {
          setIsUploadingDriverPhoto(true);
          try {
            const formData = new FormData();
            formData.append("photo", driverPhotoFile);
            
            await dispatch(uploadVehiclePhoto({
              id: vehicleId,
              photoType: "driver",
              formData,
            })).unwrap();
          } catch (error) {
            errors.push(`Gagal mengunggah foto supir: ${error.message || "Unknown error"}`);
          } finally {
            setIsUploadingDriverPhoto(false);
          }
        })()
      );
    }

    // Upload driver ID card if available
    if (driverIDCardFile) {
      uploadTasks.push(
        (async () => {
          setIsUploadingDriverIDCard(true);
          try {
            const formData = new FormData();
            formData.append("document", driverIDCardFile);
            
            await dispatch(uploadVehicleDocument({
              id: vehicleId,
              documentType: "driverIDCard",
              formData,
            })).unwrap();
          } catch (error) {
            errors.push(`Gagal mengunggah KTP supir: ${error.message || "Unknown error"}`);
          } finally {
            setIsUploadingDriverIDCard(false);
          }
        })()
      );
    }

    // Upload helper photo if available
    if (helperPhotoFile) {
      uploadTasks.push(
        (async () => {
          setIsUploadingHelperPhoto(true);
          try {
            const formData = new FormData();
            formData.append("photo", helperPhotoFile);
            
            await dispatch(uploadVehiclePhoto({
              id: vehicleId,
              photoType: "helper",
              formData,
            })).unwrap();
          } catch (error) {
            errors.push(`Gagal mengunggah foto kenek: ${error.message || "Unknown error"}`);
          } finally {
            setIsUploadingHelperPhoto(false);
          }
        })()
      );
    }

    // Upload helper ID card if available
    if (helperIDCardFile) {
      uploadTasks.push(
        (async () => {
          setIsUploadingHelperIDCard(true);
          try {
            const formData = new FormData();
            formData.append("document", helperIDCardFile);
            
            await dispatch(uploadVehicleDocument({
              id: vehicleId,
              documentType: "helperIDCard",
              formData,
            })).unwrap();
          } catch (error) {
            errors.push(`Gagal mengunggah KTP kenek: ${error.message || "Unknown error"}`);
          } finally {
            setIsUploadingHelperIDCard(false);
          }
        })()
      );
    }

    // Wait for all uploads to complete
    await Promise.allSettled(uploadTasks);

    // If there were any upload errors, show them
    if (errors.length > 0) {
      toast({
        title: "Beberapa file gagal diunggah",
        description: errors.join("\n"),
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setFormSubmitted(true);
      
      // Clear any existing errors
      dispatch(clearError());
      dispatch(clearSuccess());

      let vehicleId;
      
      if (isEditing) {
        // Update vehicle using the vehicleId prop
        const result = await dispatch(updateVehicle({
          id: vehicleId, // The component prop
          vehicleData: data,
        })).unwrap();
        
        // Use the existing vehicleId for file uploads
        if (driverPhotoFile || driverIDCardFile || helperPhotoFile || helperIDCardFile) {
          const uploadSuccess = await uploadFiles(vehicleId); // The component prop
          if (!uploadSuccess) {
            throw new Error("Failed to upload one or more files");
          }
        }
      } else {
        // Create vehicle
        const result = await dispatch(createVehicle(data)).unwrap();
        
        vehicleId = result.data._id;
      }

      // If we have files to upload, do it now
      if (driverPhotoFile || driverIDCardFile || helperPhotoFile || helperIDCardFile) {
        await uploadFiles(vehicleId);
      }
      
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Enhanced error handling with more detailed messages
      let errorMessage;
      
      if (error.response?.data?.message) {
        // API error with message
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Sesi telah berakhir. Silakan login kembali.";
      } else if (error.response?.status === 403) {
        errorMessage = "Anda tidak memiliki akses untuk melakukan operasi ini.";
      } else if (error.response?.status === 404) {
        errorMessage = "Data kendaraan tidak ditemukan.";
      } else if (error.response?.status === 422) {
        errorMessage = "Data yang dimasukkan tidak valid. Silakan periksa kembali.";
      } else if (error.message) {
        // Custom error message
        errorMessage = error.message;
      } else {
        // Generic error message
        errorMessage = isEditing
          ? "Gagal mengupdate kendaraan. Silakan coba lagi."
          : "Gagal membuat kendaraan baru. Silakan coba lagi.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setFormSubmitted(false);
    }
  };

  // Handle cancel dialog
  const handleCancel = () => {
    if (form.formState.isDirty || 
        driverPhotoFile || 
        driverIDCardFile || 
        helperPhotoFile || 
        helperIDCardFile) {
      setCancelDialogOpen(true);
    } else {
      router.push("/kendaraan");
    }
  };
  
  // Filter drivers from employees
  const drivers = Array.isArray(employees)
    ? employees.filter(employee => {
        if (!employee) return false;
        const jobTitle = employee.jabatan || '';
        return jobTitle.toLowerCase().includes('supir') || 
               jobTitle.toLowerCase().includes('driver');
      })
    : [];
    
  // Filter helpers from employees
  const helpers = Array.isArray(employees)
    ? employees.filter(employee => {
        if (!employee) return false;
        const jobTitle = employee.jabatan || '';
        return jobTitle.toLowerCase().includes('kenek') || 
               jobTitle.toLowerCase().includes('helper') || 
               jobTitle.toLowerCase().includes('assistant');
      })
    : [];
  
  const isUploading = isUploadingDriverPhoto || 
                      isUploadingDriverIDCard || 
                      isUploadingHelperPhoto || 
                      isUploadingHelperIDCard;
  
  const isLoading = loading || branchesLoading || employeesLoading || uploading || isUploading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Perbarui informasi kendaraan yang ada"
              : "Formulir untuk menambahkan kendaraan baru ke sistem"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Menyimpan..." : "Membuat..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Simpan Perubahan" : "Simpan Kendaraan"}
              </>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-1 md:grid-cols-3">
              <TabsTrigger value="info-kendaraan">
                <Truck className="w-4 h-4 mr-2" />
                Informasi Kendaraan
              </TabsTrigger>
              <TabsTrigger value="info-supir">
                <User className="w-4 h-4 mr-2" />
                Informasi Supir
              </TabsTrigger>
              <TabsTrigger value="info-kenek">
                <Users className="w-4 h-4 mr-2" />
                Informasi Kenek
              </TabsTrigger>
            </TabsList>

            {/* Tab Informasi Kendaraan */}
            <TabsContent value="info-kendaraan" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Informasi Kendaraan
                  </CardTitle>
                  <CardDescription>
                    Informasi dasar tentang kendaraan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="noPolisi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Polisi *</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: B 1234 CD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="namaKendaraan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Kendaraan *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Contoh: Truk Mitsubishi Fuso"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipe Kendaraan *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe kendaraan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="lansir">
                                Lansir (Pengiriman Lokal)
                              </SelectItem>
                              <SelectItem value="antar_cabang">
                                Antar Cabang
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cabangId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cabang *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih cabang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {branches.map((branch) => (
                                <SelectItem key={branch._id} value={branch._id}>
                                  {branch.namaCabang}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="grup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grup Kendaraan (Opsional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih grup kendaraan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">Grup A</SelectItem>
                            <SelectItem value="B">Grup B</SelectItem>
                            <SelectItem value="C">Grup C</SelectItem>
                            <SelectItem value="D">Grup D</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Informasi Supir */}
            <TabsContent value="info-supir" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informasi Supir
                  </CardTitle>
                  <CardDescription>
                    Detail informasi supir kendaraan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="supirId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supir *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih supir" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {drivers.map((driver) => (
                              <SelectItem key={driver._id} value={driver._id}>
                                {driver.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="noTeleponSupir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon Supir *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Contoh: 08123456789"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="noKTPSupir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor KTP Supir *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan 16 digit nomor KTP"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="alamatSupir"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Supir *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan alamat lengkap supir"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <Label>Foto Supir</Label>
                      <div className="mt-2">
                        <FileUploader
                          accept="image/*"
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024} // 5MB
                          onDrop={handleDriverPhotoChange}
                          preview={driverPhotoPreview}
                          loading={isUploadingDriverPhoto}
                          label="Upload Foto Supir"
                          icon={<Image className="h-4 w-4 mr-2" />}
                          description="Format: JPG, PNG, JPEG. Maks. 5MB."
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Foto KTP Supir</Label>
                      <div className="mt-2">
                        <FileUploader
                          accept="image/*"
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024} // 5MB
                          onDrop={handleDriverIDCardChange}
                          preview={driverIDCardPreview}
                          loading={isUploadingDriverIDCard}
                          label="Upload Foto KTP Supir"
                          icon={<FileText className="h-4 w-4 mr-2" />}
                          description="Format: JPG, PNG, JPEG. Maks. 5MB."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Informasi Kenek */}
            <TabsContent value="info-kenek" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Informasi Kenek
                  </CardTitle>
                  <CardDescription>
                    Detail informasi kenek kendaraan (opsional)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="kenekId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kenek (Opsional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kenek" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">Tidak Ada</SelectItem>
                            {helpers.map((helper) => (
                              <SelectItem key={helper._id} value={helper._id}>
                                {helper.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="noTeleponKenek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon Kenek</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Contoh: 08123456789"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="noKTPKenek"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor KTP Kenek</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan 16 digit nomor KTP"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="alamatKenek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Kenek</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan alamat lengkap kenek"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <Label>Foto Kenek</Label>
                      <div className="mt-2">
                        <FileUploader
                          accept="image/*"
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024} // 5MB
                          onDrop={handleHelperPhotoChange}
                          preview={helperPhotoPreview}
                          loading={isUploadingHelperPhoto}
                          label="Upload Foto Kenek"
                          icon={<Image className="h-4 w-4 mr-2" />}
                          description="Format: JPG, PNG, JPEG. Maks. 5MB."
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Foto KTP Kenek</Label>
                      <div className="mt-2">
                        <FileUploader
                          accept="image/*"
                          maxFiles={1}
                          maxSize={5 * 1024 * 1024} // 5MB
                          onDrop={handleHelperIDCardChange}
                          preview={helperIDCardPreview}
                          loading={isUploadingHelperIDCard}
                          label="Upload Foto KTP Kenek"
                          icon={<FileText className="h-4 w-4 mr-2" />}
                          description="Format: JPG, PNG, JPEG. Maks. 5MB."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Menyimpan..." : "Membuat..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Simpan Perubahan" : "Simpan Kendaraan"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan perubahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin
              ingin kembali tanpa menyimpan perubahan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tidak, Lanjutkan Edit</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/kendaraan")}
              className="bg-destructive hover:bg-destructive/90"
            >
              Ya, Batalkan Perubahan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}