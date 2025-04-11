// components/forms/pickup-form.jsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Save, Loader2 } from "lucide-react";

// Improved validation schema with better error messages
const pickupFormSchema = z.object({
  pengirimId: z.string().min(1, "Pengirim harus dipilih"),
  alamatPengambilan: z
    .string()
    .min(10, "Alamat pengambilan minimal 10 karakter")
    .max(500, "Alamat pengambilan maksimal 500 karakter"),
  tujuan: z
    .string()
    .min(3, "Tujuan minimal 3 karakter")
    .max(200, "Tujuan maksimal 200 karakter"),
  jumlahColly: z.coerce
    .number()
    .positive("Jumlah colly harus lebih dari 0")
    .max(1000, "Jumlah colly maksimal 1000")
    .int("Jumlah colly harus berupa angka bulat"),
  supirId: z.string().min(1, "Supir harus dipilih"),
  kenekId: z.string().optional().nullable(),
  kendaraanId: z.string().min(1, "Kendaraan harus dipilih"),
  estimasiPengambilan: z
    .string()
    .min(1, "Estimasi pengambilan harus diisi")
    .refine((date) => new Date(date) > new Date(), {
      message: "Estimasi pengambilan harus lebih dari waktu sekarang",
    }),
  notes: z
    .string()
    .max(1000, "Catatan maksimal 1000 karakter")
    .optional()
    .nullable(),
  status: z
    .enum(["PENDING", "BERANGKAT", "SELESAI", "CANCELLED"], {
      invalid_type_error: "Status tidak valid",
    })
    .default("PENDING"),
});

export function PickupForm({
  onSubmit,
  initialData,
  isLoading,
  senders = [],
  vehicles = [],
  drivers = [],
  helpers = [],
}) {
  const form = useForm({
    resolver: zodResolver(pickupFormSchema),
    defaultValues: initialData || {
      pengirimId: "",
      alamatPengambilan: "",
      tujuan: "",
      jumlahColly: "",
      supirId: "",
      kenekId: "none",
      kendaraanId: "",
      estimasiPengambilan: "",
      notes: "",
      status: "PENDING",
    },
  });

  // Update form when initialData changes (e.g., edit mode)
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        form.setValue(key, initialData[key]);
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pengirim" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {senders.map((sender) => (
                      <SelectItem key={sender._id} value={sender._id}>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kendaraan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle._id} value={vehicle._id}>
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
                  disabled={isLoading}
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

          <FormField
            control={form.control}
            name="kenekId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kenek (Opsional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kenek" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada kenek</SelectItem>
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

          <FormField
            control={form.control}
            name="estimasiPengambilan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimasi Pengambilan</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    placeholder="Pilih tanggal dan waktu"
                    {...field}
                    disabled={isLoading}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tambahkan catatan jika diperlukan"
                  {...field}
                  value={field.value || ""}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
