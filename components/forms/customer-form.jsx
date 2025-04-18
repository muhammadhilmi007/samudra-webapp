"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCustomer,
  updateCustomer,
  fetchCustomerById,
  fetchCustomers,
  clearCustomerState,
} from "@/lib/redux/slices/customerSlice";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Skema validasi form
const customerSchema = z.object({
  nama: z.string().min(1, { message: "Nama pelanggan harus diisi" }),
  tipe: z.string().min(1, { message: "Tipe pelanggan harus dipilih" }),
  alamat: z.string().min(1, { message: "Alamat harus diisi" }),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  kota: z.string().min(1, { message: "Kota harus diisi" }),
  provinsi: z.string().min(1, { message: "Provinsi harus diisi" }),
  telepon: z.string().min(1, { message: "Nomor telepon harus diisi" }),
  email: z
    .string()
    .email({ message: "Format email tidak valid" })
    .optional()
    .or(z.literal("")),
  perusahaan: z.string().optional(),
  cabangId: z.string().min(1, { message: "Cabang harus dipilih" }),
});

export default function CustomerForm({ customerId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(!!customerId);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("informasi-dasar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const { currentCustomer, loading, error, success } = useSelector(
    (state) => state.customer
  );
  const { branches, loading: branchesLoading } = useSelector(
    (state) => state.cabang
  );

  // Initialize form
  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      nama: "",
      tipe: "",
      alamat: "",
      kelurahan: "",
      kecamatan: "",
      kota: "",
      provinsi: "",
      telepon: "",
      email: "",
      perusahaan: "",
      cabangId: "",
    },
  });

  // Fetch data if editing
  useEffect(() => {
    // Fetch branches with a console log to debug
    dispatch(fetchBranches());
    console.log("Fetching branches for customer form");

    // If editing (customerId exists), fetch customer data
    if (customerId) {
      dispatch(fetchCustomerById(customerId));
    }

    // Cleanup function
    return () => {
      if (!customerId) {
        dispatch(clearCustomerState());
      }
    };
  }, [dispatch, customerId]);


  // Populate form when data is fetched
  // Update the useEffect for form population
  useEffect(() => {
    if (currentCustomer && customerId) {
      // Reset form with current customer data
      const formData = {
        nama: currentCustomer.nama || "",
        tipe: currentCustomer.tipe || "",
        alamat: currentCustomer.alamat || "",
        kelurahan: currentCustomer.kelurahan || "",
        kecamatan: currentCustomer.kecamatan || "",
        kota: currentCustomer.kota || "",
        provinsi: currentCustomer.provinsi || "",
        telepon: currentCustomer.telepon || "",
        email: currentCustomer.email || "",
        perusahaan: currentCustomer.perusahaan || "",
        cabangId: currentCustomer.cabangId?._id || currentCustomer.cabangId || "",
      };
      
      console.log("Setting form data:", formData);
      form.reset(formData);
    }
  }, [currentCustomer, customerId, form]);
  
  // Update the onSubmit handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (customerId) {
        // Update existing customer
        const result = await dispatch(
          updateCustomer({
            id: customerId,
            customerData: {
              ...data,
              // Ensure cabangId is properly formatted
              cabangId: data.cabangId.toString(),
            },
          })
        ).unwrap();
  
        toast({
          title: "Sukses",
          description: "Data pelanggan berhasil diperbarui",
          variant: "success",
        });
  
        // Redirect after successful update
        setTimeout(() => {
          router.push("/pelanggan");
        }, 1500);
      } else {
        // Handle create...
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "Error",
        description: error?.message || "Gagal memperbarui data pelanggan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel dialog
  const handleCancel = () => {
    if (form.formState.isDirty) {
      setCancelDialogOpen(true);
    } else {
      router.push("/pelanggan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Perbarui informasi pelanggan yang ada"
              : "Formulir untuk menambahkan pelanggan baru ke sistem"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Batal
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Menyimpan..." : "Membuat..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Simpan Perubahan" : "Simpan Pelanggan"}
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
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="informasi-dasar">Informasi Dasar</TabsTrigger>
              <TabsTrigger value="alamat-kontak">Alamat & Kontak</TabsTrigger>
            </TabsList>

            {/* Tab Informasi Dasar */}
            <TabsContent value="informasi-dasar" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar Pelanggan</CardTitle>
                  <CardDescription>
                    Informasi identitas dan tipe pelanggan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nama"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Pelanggan *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan nama pelanggan"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tipe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipe Pelanggan *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe pelanggan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pengirim">Pengirim</SelectItem>
                              <SelectItem value="penerima">Penerima</SelectItem>
                              <SelectItem value="keduanya">
                                Pengirim & Penerima
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="perusahaan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Perusahaan</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan nama perusahaan (opsional)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Cabang */}
                    <FormField
                      control={form.control}
                      name="cabangId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cabang</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              console.log("Selected branch ID:", value);
                              field.onChange(value);
                            }}
                            value={field.value || undefined}
                            disabled={loading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih cabang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {branches && branches.length > 0 ? (
                                branches.map((branch) => (
                                  <SelectItem
                                    key={branch._id}
                                    value={branch._id.toString()}
                                  >
                                    {branch.namaCabang ||
                                      `Cabang ${branch._id.substring(0, 5)}`}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                  Tidak ada data cabang
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Alamat & Kontak */}
            <TabsContent value="alamat-kontak" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alamat & Kontak</CardTitle>
                  <CardDescription>
                    Detail alamat dan informasi kontak pelanggan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="alamat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat Lengkap *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan alamat lengkap"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="kelurahan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kelurahan</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan kelurahan"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kecamatan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kecamatan</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan kecamatan"
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
                      name="kota"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kota/Kabupaten *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan kota/kabupaten"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="provinsi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provinsi *</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan provinsi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="telepon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan nomor telepon"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan email (opsional)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Menyimpan..." : "Membuat..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Simpan Perubahan" : "Simpan Pelanggan"}
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
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/pelanggan")}>
              Ya, batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
