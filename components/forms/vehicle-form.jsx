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

// Skema validasi form
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

  const { currentVehicle, loading, error, success } = useSelector(
    (state) => state.vehicle
  );
  const { branches } = useSelector((state) => state.cabang);
  const { drivers } = useSelector((state) => state.pegawai);

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

  // Fetch data if editing
  useEffect(() => {
    dispatch(fetchBranches());
    dispatch(fetchEmployees());
  
  if (isEditing && vehicleId) {
    dispatch(fetchVehicleById(vehicleId));
  }
}, [dispatch, isEditing, vehicleId]);

  // Populate form when data is fetched
  useEffect(() => {
    if (isEditing && currentVehicle) {
      form.reset({
        noPolisi: currentVehicle.noPolisi || "",
        namaKendaraan: currentVehicle.namaKendaraan || "",
        supirId: currentVehicle.supirId || "",
        noTeleponSupir: currentVehicle.noTeleponSupir || "",
        noKTPSupir: currentVehicle.noKTPSupir || "",
        alamatSupir: currentVehicle.alamatSupir || "",
        kenekId: currentVehicle.kenekId || "",
        noTeleponKenek: currentVehicle.noTeleponKenek || "",
        noKTPKenek: currentVehicle.noKTPKenek || "",
        alamatKenek: currentVehicle.alamatKenek || "",
        cabangId: currentVehicle.cabangId || "",
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
    }

    if (success) {
      toast({
        title: isEditing
          ? "Kendaraan berhasil diperbarui"
          : "Kendaraan berhasil ditambahkan",
        description: `Data kendaraan telah berhasil ${
          isEditing ? "diperbarui" : "disimpan"
        }.`,
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
        router.push("/kendaraan");
      }
    }
  }, [error, success, toast, form, isEditing, router]);

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
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      let vehicleData;

      if (isEditing) {
        // Update vehicle
        const response = await dispatch(
          updateVehicle({
            id: vehicleId,
            vehicleData: data,
          })
        ).unwrap();

        vehicleData = response.data;
      } else {
        // Create vehicle
        const response = await dispatch(createVehicle(data)).unwrap();
        vehicleData = response.data;
      }

      // Upload photos if available
      if (vehicleData && vehicleData._id) {
        const vehicleId = vehicleData._id;

        // Upload driver photo
        if (driverPhotoFile) {
          setIsUploadingDriverPhoto(true);
          const formData = new FormData();
          formData.append("photo", driverPhotoFile);
          await dispatch(
            uploadVehiclePhoto({
              id: vehicleId,
              photoType: "driver",
              formData,
            })
          );
          setIsUploadingDriverPhoto(false);
        }

        // Upload driver ID card
        if (driverIDCardFile) {
          setIsUploadingDriverIDCard(true);
          const formData = new FormData();
          formData.append("document", driverIDCardFile);
          await dispatch(
            uploadVehicleDocument({
              id: vehicleId,
              documentType: "driverIDCard",
              formData,
            })
          );
          setIsUploadingDriverIDCard(false);
        }

        // Upload helper photo
        if (helperPhotoFile) {
          setIsUploadingHelperPhoto(true);
          const formData = new FormData();
          formData.append("photo", helperPhotoFile);
          await dispatch(
            uploadVehiclePhoto({
              id: vehicleId,
              photoType: "helper",
              formData,
            })
          );
          setIsUploadingHelperPhoto(false);
        }

        // Upload helper ID card
        if (helperIDCardFile) {
          setIsUploadingHelperIDCard(true);
          const formData = new FormData();
          formData.append("document", helperIDCardFile);
          await dispatch(
            uploadVehicleDocument({
              id: vehicleId,
              documentType: "helperIDCard",
              formData,
            })
          );
          setIsUploadingHelperIDCard(false);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Handle cancel dialog
  const handleCancel = () => {
    if (
      form.formState.isDirty ||
      driverPhotoFile ||
      driverIDCardFile ||
      helperPhotoFile ||
      helperIDCardFile
    ) {
      setCancelDialogOpen(true);
    } else {
      router.push("/kendaraan");
    }
  };

  // Filter drivers
  const filteredDrivers =
    drivers?.filter(
      (driver) =>
        driver.jabatan?.toLowerCase().includes("supir") ||
        driver.jabatan?.toLowerCase().includes("driver")
    ) || [];

  // Filter helpers
  const filteredHelpers =
    drivers?.filter(
      (driver) =>
        driver.jabatan?.toLowerCase().includes("kenek") ||
        driver.jabatan?.toLowerCase().includes("helper") ||
        driver.jabatan?.toLowerCase().includes("assistant")
    ) || [];

  // components/forms/vehicle-form.jsx (continued)
  const isUploading =
    isUploadingDriverPhoto ||
    isUploadingDriverIDCard ||
    isUploadingHelperPhoto ||
    isUploadingHelperIDCard;

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
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Batal
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading || isUploading}
          >
            {loading || isUploading ? (
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
                            defaultValue={field.value}
                            value={field.value}
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
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih supir" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredDrivers.map((driver) => (
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
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kenek" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">Tidak Ada</SelectItem>
                            {filteredHelpers.map((helper) => (
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
            <Button type="submit" disabled={loading || isUploading}>
              {loading || isUploading ? (
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
