// components/forms/vehicle-queue-form.jsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createVehicleQueue,
  updateVehicleQueue,
  fetchVehicleQueueById,
} from "@/lib/redux/slices/vehicleQueueSlice";
import { fetchBranches } from "@/lib/redux/slices/cabangSlice";
import { fetchDeliveryVehicles } from "@/lib/redux/slices/vehicleSlice";
import { fetchEmployees } from "@/lib/redux/slices/pegawaiSlice";
import { Button } from "@/components/ui/button";
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
  List,
} from "lucide-react";

// Validation schema
const vehicleQueueSchema = z.object({
  kendaraanId: z.string().min(1, { message: "Kendaraan harus dipilih" }),
  supirId: z.string().min(1, { message: "Supir harus dipilih" }),
  kenekId: z.string().optional(),
  cabangId: z.string().min(1, { message: "Cabang harus dipilih" }),
  status: z.string().min(1, { message: "Status harus dipilih" }),
});

export default function VehicleQueueForm({ queueId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const { currentVehicleQueue, loading, error, success } = useSelector(
    (state) => state.vehicleQueue
  );
  const { branches } = useSelector((state) => state.cabang);
  const { deliveryVehicles } = useSelector((state) => state.vehicle);
  const { employees } = useSelector((state) => state.pegawai);

  const [isEditing, setIsEditing] = useState(!!queueId);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [prevSuccess, setPrevSuccess] = useState(false);
  const [prevError, setPrevError] = useState(null);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(vehicleQueueSchema),
    defaultValues: {
      kendaraanId: "",
      supirId: "",
      kenekId: "",
      cabangId: "",
      status: "MENUNGGU", // Default status is 'MENUNGGU'
    },
  });

  // Fetch data
  useEffect(() => {
    dispatch(fetchBranches());
    dispatch(fetchDeliveryVehicles());
    dispatch(fetchEmployees());

    if (isEditing && queueId) {
      dispatch(fetchVehicleQueueById(queueId));
    }
  }, [dispatch, isEditing, queueId]);

  // Populate form when data is fetched
  useEffect(() => {
    if (isEditing && currentVehicleQueue) {
      form.reset({
        kendaraanId:
          currentVehicleQueue.kendaraanId?._id ||
          currentVehicleQueue.kendaraanId ||
          "",
        supirId:
          currentVehicleQueue.supirId?._id || currentVehicleQueue.supirId || "",
        kenekId:
          currentVehicleQueue.kenekId?._id || currentVehicleQueue.kenekId || "",
        cabangId:
          currentVehicleQueue.cabangId?._id ||
          currentVehicleQueue.cabangId ||
          "",
        status: currentVehicleQueue.status || "MENUNGGU",
      });
    }
  }, [form, isEditing, currentVehicleQueue]);

  // Handle error and success states
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }

    if (success && !prevSuccess) {
      toast({
        title: isEditing
          ? "Antrian kendaraan berhasil diperbarui"
          : "Antrian kendaraan berhasil ditambahkan",
        description: `Data antrian kendaraan telah berhasil ${
          isEditing ? "diperbarui" : "disimpan"
        }.`,
        variant: "success",
      });

      // Redirect to list after successful submission
      router.push("/antrian-kendaraan");
    }

    // Update previous success state
    setPrevSuccess(success);
  }, [error, success, prevError, prevSuccess, toast, isEditing, router]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await dispatch(updateVehicleQueue({ id: queueId, queueData: data }));
      } else {
        await dispatch(createVehicleQueue(data));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Handle cancel dialog
  const handleCancel = () => {
    if (form.formState.isDirty) {
      setCancelDialogOpen(true);
    } else {
      router.push("/antrian-kendaraan");
    }
  };

  // Filter drivers - only get employees with 'supir'/'driver' in their job title
  const filteredDrivers =
    employees?.filter(
      (employee) =>
        employee.jabatan?.toLowerCase().includes("supir") ||
        employee.jabatan?.toLowerCase().includes("driver")
    ) || [];

  // Filter helpers - only get employees with 'kenek'/'helper'/'assistant' in their job title
  const filteredHelpers =
    employees?.filter(
      (employee) =>
        employee.jabatan?.toLowerCase().includes("kenek") ||
        employee.jabatan?.toLowerCase().includes("helper") ||
        employee.jabatan?.toLowerCase().includes("assistant")
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing
              ? "Edit Antrian Kendaraan"
              : "Tambah Antrian Kendaraan Baru"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Perbarui informasi antrian kendaraan yang ada"
              : "Formulir untuk menambahkan antrian kendaraan baru ke sistem"}
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
                {isEditing ? "Simpan Perubahan" : "Simpan Antrian"}
              </>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <List className="h-5 w-5 mr-2" />
                Informasi Antrian Kendaraan
              </CardTitle>
              <CardDescription>
                Informasi tentang kendaraan, supir, dan status antrian
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kendaraanId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kendaraan *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kendaraan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {deliveryVehicles.map((vehicle) => (
                            <SelectItem key={vehicle._id} value={vehicle._id}>
                              {vehicle.noPolisi} - {vehicle.namaKendaraan}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectItem value="none">Tidak Ada</SelectItem>
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
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MENUNGGU">Menunggu</SelectItem>
                        <SelectItem value="LANSIR">Lansir</SelectItem>
                        <SelectItem value="KEMBALI">Kembali</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
                  {isEditing ? "Simpan Perubahan" : "Simpan Antrian"}
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
              onClick={() => router.push("/antrian-kendaraan")}
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
