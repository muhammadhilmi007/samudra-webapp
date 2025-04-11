// app/pengambilan/tambah/page.js
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createPickup,
  fetchPickupRequestById,
} from "@/lib/redux/slices/pickupSlice";
import { fetchCustomersByBranch } from "@/lib/redux/slices/customerSlice";
import { fetchVehiclesByBranch } from "@/lib/redux/slices/vehicleSlice";
import { fetchEmployeesByBranch } from "@/lib/redux/slices/pegawaiSlice";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

// Update the validation schema to include notes field and handle empty kenekId properly
const formSchema = z.object({
  pengirimId: z.string().min(1, "Pengirim harus dipilih"),
  alamatPengambilan: z.string().min(1, "Alamat pengambilan harus diisi"),
  tujuan: z.string().min(1, "Tujuan harus diisi"),
  jumlahColly: z.coerce.number().positive("Jumlah colly harus lebih dari 0"),
  supirId: z.string().min(1, "Supir harus dipilih"),
  kenekId: z.string().optional().nullable(),
  kendaraanId: z.string().min(1, "Kendaraan harus dipilih"),
  estimasiPengambilan: z.string().optional(),
  notes: z.string().optional(),
});

export default function AddPickupPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [fromRequest, setFromRequest] = useState(false);

  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { pickupRequest, currentUser } = useSelector((state) => state.auth);
  const { customers } = useSelector((state) => state.customer);
  const { vehicles } = useSelector((state) => state.vehicle);
  const { employeesByBranch } = useSelector((state) => state.pegawai);
  const employees = currentUser?.cabangId
    ? employeesByBranch[currentUser.cabangId] || []
    : [];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pengirimId: "",
      alamatPengambilan: "",
      tujuan: "",
      jumlahColly: "",
      supirId: "",
      kenekId: "",
      kendaraanId: "",
      estimasiPengambilan: "",
      notes: "",
    },
  });

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  useEffect(() => {
    // Jika user sudah login dan memiliki cabangId, fetch data yang dibutuhkan
    if (currentUser?.cabangId) {
      dispatch(fetchCustomersByBranch(currentUser.cabangId));
      dispatch(fetchVehiclesByBranch(currentUser.cabangId));
      dispatch(fetchEmployeesByBranch(currentUser.cabangId));
    }

    // Jika ada requestId, fetch data request pengambilan
    if (requestId) {
      dispatch(fetchPickupRequestById(requestId)).then((response) => {
        const request = response.payload;
        if (request) {
          setFromRequest(true);
          form.setValue("pengirimId", request.pengirimId);
          form.setValue("alamatPengambilan", request.alamatPengambilan);
          form.setValue("tujuan", request.tujuan);
          form.setValue("jumlahColly", request.jumlahColly);
          form.setValue(
            "estimasiPengambilan",
            request.estimasiPengambilan || ""
          );
        }
      });
    }
  }, [dispatch, currentUser, requestId, form]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Handle empty kenekId - convert "all" to null or empty string
      if (data.kenekId === "all") {
        data.kenekId = null;
      }

      // Add status field for new pickup
      data.status = "PENDING";

      // Jika user sudah login dan memiliki ID, tambahkan userId dan cabangId ke data
      if (currentUser) {
        data.userId = currentUser._id; // Fix: use _id instead of id
        data.cabangId = currentUser.cabangId;
      }

      if (requestId) {
        data.requestId = requestId;
      }

      // Add current date if not provided
      if (!data.tanggal) {
        data.tanggal = new Date().toISOString();
      }

      const result = await dispatch(createPickup(data)).unwrap();

      toast({
        title: "Berhasil",
        description: `Pengambilan dengan nomor ${
          result.noPengambilan || ""
        } berhasil dibuat`,
      });
      router.push("/pengambilan");
    } catch (error) {
      console.error("Error creating pickup:", error);
      toast({
        title: "Gagal",
        description:
          error.message || "Terjadi kesalahan saat membuat pengambilan",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
    { label: "Tambah Pengambilan", href: "/pengambilan/tambah" },
  ];

  // Filter customers yang berjenis pengirim
  const senders = customers.filter(
    (customer) => customer.tipe === "pengirim" || customer.tipe === "keduanya"
  );

  // Filter kendaraan lansir
  const lansirVehicles = vehicles.filter(
    (vehicle) => vehicle.tipe === "lansir"
  );

  // Debugging employees data
  useEffect(() => {
    console.log("All employees:", employees);
    console.log("Filtered drivers:", drivers);
  }, [employees]);

  // Improved filter for drivers to include admin roles as well
  const drivers = employees.filter((employee) => {
    // First ensure employee object exists
    if (!employee) return false;

    // Check if the employee is an admin/administrator (should always have access)
    const isAdmin =
      (employee.role &&
        ["admin", "administrator"].includes(employee.role.toLowerCase())) ||
      (employee.jabatan &&
        ["admin", "administrator"].includes(employee.jabatan.toLowerCase()));

    // Check if employee is a driver
    const isDriver =
      (employee.jabatan && employee.jabatan.toLowerCase().includes("supir")) ||
      (employee.jabatan && employee.jabatan.toLowerCase().includes("driver")) ||
      (employee.role && employee.role.toLowerCase().includes("driver")) ||
      (employee.role && employee.role.toLowerCase().includes("supir")) ||
      (employee.tipe && employee.tipe.toLowerCase().includes("supir"));

    // Return true if employee is either an admin or a driver
    return isAdmin || isDriver;
  });

  const helpers = employees.filter(
    (employee) =>
      (employee?.jabatan && employee.jabatan.toLowerCase().includes("kenek")) ||
      (employee?.role && employee.role.toLowerCase().includes("helper"))
  );

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
                  <Link href="/pengambilan">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold">
                  Tambah Pengambilan Barang
                </h1>
              </div>
            </div>

            {fromRequest && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-4">
                Data diisi otomatis dari request pengambilan.
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Form Pengambilan Barang</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pengirimId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pengirim</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih pengirim" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {senders.map((sender) => (
                                  <SelectItem
                                    key={sender._id}
                                    value={sender._id}
                                  >
                                    {sender.nama}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="jumlahColly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jumlah Colly</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Jumlah colly"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="alamatPengambilan"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Alamat Pengambilan</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Masukkan alamat lengkap pengambilan"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tujuan"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Tujuan</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan tujuan pengiriman"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="kendaraanId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kendaraan</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih kendaraan" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {lansirVehicles.map((vehicle) => (
                                  <SelectItem
                                    key={vehicle._id}
                                    value={vehicle._id}
                                  >
                                    {vehicle.namaKendaraan} - {vehicle.noPolisi}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="supirId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supir</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih supir" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {drivers.length > 0 ? (
                                  drivers.map((driver) => (
                                    <SelectItem
                                      key={
                                        driver._id ||
                                        `driver-${driver._id || Math.random()}`
                                      }
                                      value={driver._id || driver.id || ""}
                                    >
                                      {driver.nama || "Nama tidak tersedia"}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-drivers" disabled>
                                    Tidak ada data supir tersedia
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="kenekId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kenek (Opsional)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih kenek" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">
                                  Tidak ada kenek
                                </SelectItem>
                                {helpers.map((helper) => (
                                  <SelectItem
                                    key={helper._id}
                                    value={helper._id}
                                  >
                                    {helper.nama}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimasiPengambilan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimasi Pengambilan</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Tanggal atau waktu estimasi"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Add notes field */}
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Catatan</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Catatan tambahan (opsional)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => router.push("/pengambilan")}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Menyimpan..." : "Simpan"}
                        <Save className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
