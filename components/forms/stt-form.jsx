"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSTT,
  updateSTT,
  fetchSTTById,
  generateSTTPDF,
} from "@/lib/redux/slices/sttSlice";
import { fetchBranches } from "@/lib/redux/slices/cabangSlice";
import {
  fetchSenders,
  fetchRecipients,
} from "@/lib/redux/slices/customerSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatCurrency } from "@/lib/utils";
import {
  Loader2,
  Save,
  ArrowLeft,
  Package,
  FileText,
  Users,
  DollarSign,
  Printer,
  AlertTriangle,
} from "lucide-react";

// Skema validasi form
const sttSchema = z.object({
  cabangAsalId: z.string().min(1, { message: "Cabang asal harus dipilih" }),
  cabangTujuanId: z.string().min(1, { message: "Cabang tujuan harus dipilih" }),
  pengirimId: z.string().min(1, { message: "Pengirim harus dipilih" }),
  penerimaId: z.string().min(1, { message: "Penerima harus dipilih" }),
  namaBarang: z.string().min(1, { message: "Nama barang harus diisi" }),
  komoditi: z.string().min(1, { message: "Komoditi harus diisi" }),
  packing: z.string().min(1, { message: "Jenis packing harus dipilih" }),
  jumlahColly: z
    .number()
    .min(1, { message: "Jumlah colly harus lebih dari 0" }),
  berat: z.number().min(0.1, { message: "Berat harus lebih dari 0" }),
  hargaPerKilo: z
    .number()
    .min(1, { message: "Harga per kilo harus lebih dari 0" }),
  keterangan: z.string().optional(),
  kodePenerus: z.string().min(1, { message: "Kode penerus harus dipilih" }),
  penerusId: z.string().optional(),
  paymentType: z.string().min(1, { message: "Tipe pembayaran harus dipilih" }),
});

export default function STTForm({ sttId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const { currentSTT, loading, error, success, createdSTTId } = useSelector(
    (state) => state.stt
  );
  const { branches } = useSelector((state) => state.cabang);
  const { senders, recipients } = useSelector((state) => state.customer);

  const [isEditing, setIsEditing] = useState(!!sttId);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info-pengiriman");
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [totalHarga, setTotalHarga] = useState(0);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(sttSchema),
    defaultValues: {
      cabangAsalId: "",
      cabangTujuanId: "",
      pengirimId: "",
      penerimaId: "",
      namaBarang: "",
      komoditi: "",
      packing: "",
      jumlahColly: 1,
      berat: 0,
      hargaPerKilo: 0,
      keterangan: "",
      kodePenerus: "70", // Default 70 = TANPA FORWARDING
      penerusId: "",
      paymentType: "",
    },
  });

  // Watch values for total calculation
  const berat = useMemo(() => form.watch("berat") || 0, [form.watch("berat")]);
  const hargaPerKilo = useMemo(
    () => form.watch("hargaPerKilo") || 0,
    [form.watch("hargaPerKilo")]
  );

  // // Perhitungan total harga
  // useEffect(() => {
  //   setTotalHarga(berat * hargaPerKilo)
  // }, [berat, hargaPerKilo])

  // Fetch data if editing
  useEffect(() => {
    dispatch(fetchBranches());
    dispatch(fetchSenders());
    dispatch(fetchRecipients());

    if (isEditing && sttId) {
      dispatch(fetchSTTById(sttId));
    }
  }, [dispatch, isEditing, sttId]);

  // Calculate total price when berat or hargaPerKilo changes
  useEffect(() => {
    const calculatedTotal = parseFloat(berat) * parseFloat(hargaPerKilo);
    if (!isNaN(calculatedTotal) && calculatedTotal !== totalHarga) {
      setTotalHarga(calculatedTotal);
    }
  }, [berat, hargaPerKilo, totalHarga]);

  // Populate form when data is fetched
  useEffect(() => {
    if (isEditing && currentSTT && currentSTT._id) {
      const newValues = {
        cabangAsalId:
          currentSTT.cabangAsalId?._id || currentSTT.cabangAsalId || "",
        cabangTujuanId:
          currentSTT.cabangTujuanId?._id || currentSTT.cabangTujuanId || "",
        pengirimId: currentSTT.pengirimId?._id || currentSTT.pengirimId || "",
        penerimaId: currentSTT.penerimaId?._id || currentSTT.penerimaId || "",
        namaBarang: currentSTT.namaBarang || "",
        komoditi: currentSTT.komoditi || "",
        packing: currentSTT.packing || "",
        jumlahColly: currentSTT.jumlahColly || 1,
        berat: currentSTT.berat || 0,
        hargaPerKilo: currentSTT.hargaPerKilo || 0,
        keterangan: currentSTT.keterangan || "",
        kodePenerus: currentSTT.kodePenerus || "70",
        penerusId: currentSTT.penerusId?._id || currentSTT.penerusId || "",
        paymentType: currentSTT.paymentType || "",
      };

      form.reset(newValues);
    }
  }, [form, isEditing, currentSTT]);

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
        title: isEditing ? "STT berhasil diperbarui" : "STT berhasil dibuat",
        description: `Data STT telah berhasil ${
          isEditing ? "diperbarui" : "dibuat"
        }.`,
        variant: "success",
      });

      if (!isEditing && createdSTTId) {
        // Show print dialog after successful creation
        setPrintDialogOpen(true);
      } else if (isEditing) {
        // Redirect to list after successful update
        router.push("/stt");
      }
    }
  }, [error, success, toast, isEditing, router, createdSTTId]);

  // Handle form submission
  const onSubmit = async (data) => {
    // Add calculated total price to data
    const sttData = {
      ...data,
      harga: parseFloat(data.berat || 0) * parseFloat(data.hargaPerKilo || 0),
      // Convert string numbers to actual numbers
      jumlahColly: Number(data.jumlahColly) || 1,
      berat: Number(data.berat) || 0,
      hargaPerKilo: Number(data.hargaPerKilo) || 0,
      userId: "64f5b8d77a33ab1b242b3a1c", // Sample user ID
      cabangId: data.cabangAsalId, // Use the selected cabangAsalId as the cabangId
    };

    if (isEditing) {
      await dispatch(
        updateSTT({
          id: sttId,
          sttData,
        })
      );
    } else {
      await dispatch(createSTT(sttData));
    }
  };

  // Handle cancel dialog
  const handleCancel = () => {
    if (form.formState.isDirty) {
      setCancelDialogOpen(true);
    } else {
      router.push("/stt");
    }
  };

  // Handle print STT
  const handlePrintSTT = async () => {
    if (!createdSTTId) return;

    try {
      setIsPrinting(true);

      // Generate and download PDF
      await dispatch(generateSTTPDF(createdSTTId));

      toast({
        title: "STT dicetak",
        description: "Surat Tanda Terima berhasil dicetak dan diunduh.",
        variant: "success",
      });

      // Redirect to list after printing
      router.push("/stt");
    } catch (error) {
      toast({
        title: "Gagal mencetak STT",
        description:
          "Terjadi kesalahan saat mencetak STT. Silakan coba lagi nanti.",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
      setPrintDialogOpen(false);
    }
  };

  // Helper untuk mendapatkan nama cabang dari ID
  const getBranchName = (branchId) => {
    const branch = branches.find((branch) => branch._id === branchId);
    return branch ? branch.namaCabang : "";
  };

  // Helper untuk mendapatkan nama pengirim/penerima dari ID
  const getSenderName = (senderId) => {
    const sender = senders.find((sender) => sender._id === senderId);
    return sender ? sender.nama : "";
  };

  const getRecipientName = (recipientId) => {
    const recipient = recipients.find(
      (recipient) => recipient._id === recipientId
    );
    return recipient ? recipient.nama : "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit STT" : "Buat STT Baru"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Perbarui Surat Tanda Terima yang ada"
              : "Buat Surat Tanda Terima baru untuk pengiriman barang"}
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
                {isEditing ? "Simpan Perubahan" : "Buat STT"}
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
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="info-pengiriman">
                <Users className="w-4 h-4 mr-2" />
                Informasi Pengirim & Penerima
              </TabsTrigger>
              <TabsTrigger value="info-barang">
                <Package className="w-4 h-4 mr-2" />
                Informasi Barang
              </TabsTrigger>
              <TabsTrigger value="info-pembayaran">
                <DollarSign className="w-4 h-4 mr-2" />
                Informasi Pembayaran
              </TabsTrigger>
            </TabsList>

            {/* Tab Informasi Pengiriman */}
            <TabsContent value="info-pengiriman" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Informasi Pengirim & Penerima
                  </CardTitle>
                  <CardDescription>
                    Informasi cabang, pengirim, dan penerima
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cabang Asal & Tujuan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cabangAsalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cabang Asal *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih cabang asal" />
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

                    <FormField
                      control={form.control}
                      name="cabangTujuanId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cabang Tujuan *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih cabang tujuan" />
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

                  {/* Pengirim & Penerima */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pengirimId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pengirim *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih pengirim" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {senders.map((sender) => (
                                <SelectItem key={sender._id} value={sender._id}>
                                  {sender.nama}{" "}
                                  {sender.perusahaan
                                    ? `(${sender.perusahaan})`
                                    : ""}
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
                      name="penerimaId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Penerima *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih penerima" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {recipients.map((recipient) => (
                                <SelectItem
                                  key={recipient._id}
                                  value={recipient._id}
                                >
                                  {recipient.nama}{" "}
                                  {recipient.perusahaan
                                    ? `(${recipient.perusahaan})`
                                    : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Kode Penerus */}
                  <FormField
                    control={form.control}
                    name="kodePenerus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Forwarding *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kode forwarding" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="70">
                              70 - TANPA FORWARDING
                            </SelectItem>
                            <SelectItem value="71">
                              71 - FORWARDING DIBAYAR OLEH PENGIRIM
                            </SelectItem>
                            <SelectItem value="72">
                              72 - FORWARDING DIBAYAR OLEH PENERIMA
                            </SelectItem>
                            <SelectItem value="73">
                              73 - FORWARDING DIMAJUKAN OLEH CABANG PENERIMA
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Penerus (opsional berdasarkan kode) */}
                  {form.watch("kodePenerus") !== "70" && (
                    <FormField
                      control={form.control}
                      name="penerusId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Penerus</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih penerus" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* Data penerus (contoh) */}
                              <SelectItem value="penerus1">
                                Penerus 1
                              </SelectItem>
                              <SelectItem value="penerus2">
                                Penerus 2
                              </SelectItem>
                              <SelectItem value="penerus3">
                                Penerus 3
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Informasi Barang */}
            <TabsContent value="info-barang" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Informasi Barang
                  </CardTitle>
                  <CardDescription>
                    Detail barang yang akan dikirimkan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="namaBarang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Barang *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan nama barang"
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
                      name="komoditi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Komoditi *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis komoditi" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="umum">Barang Umum</SelectItem>
                              <SelectItem value="elektronik">
                                Elektronik
                              </SelectItem>
                              <SelectItem value="tekstil">Tekstil</SelectItem>
                              <SelectItem value="sparepart">
                                Sparepart
                              </SelectItem>
                              <SelectItem value="dokumen">Dokumen</SelectItem>
                              <SelectItem value="makanan">Makanan</SelectItem>
                              <SelectItem value="minuman">Minuman</SelectItem>
                              <SelectItem value="lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="packing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Packing *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis packing" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kardus">Kardus</SelectItem>
                              <SelectItem value="palet">Palet</SelectItem>
                              <SelectItem value="karung">Karung</SelectItem>
                              <SelectItem value="plastik">
                                Plastik/Shrink Wrap
                              </SelectItem>
                              <SelectItem value="kayu">Peti Kayu</SelectItem>
                              <SelectItem value="drum">Drum</SelectItem>
                              <SelectItem value="tanpaPacking">
                                Tanpa Packing
                              </SelectItem>
                              <SelectItem value="lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="jumlahColly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Colly *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Masukkan jumlah colly"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="berat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Berat (kg) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0.1"
                              step="0.1"
                              placeholder="Masukkan berat dalam kg"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hargaPerKilo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga per Kilo *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Masukkan harga per kilo"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <div className="font-semibold text-lg">Total Harga</div>
                    <div className="text-xl font-bold">
                      {formatCurrency(
                        parseFloat(berat || 0) * parseFloat(hargaPerKilo || 0)
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {berat || 0} kg × Rp{" "}
                      {(hargaPerKilo || 0).toLocaleString()}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keterangan Tambahan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan keterangan tambahan (opsional)"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Informasi Pembayaran */}
            <TabsContent value="info-pembayaran" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Informasi Pembayaran
                  </CardTitle>
                  <CardDescription>
                    Metode pembayaran pengiriman
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipe Pembayaran *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe pembayaran" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">
                              CASH (Dibayar di Muka)
                            </SelectItem>
                            <SelectItem value="COD">
                              COD (Cash On Delivery / Bayar di Tempat)
                            </SelectItem>
                            <SelectItem value="CAD">
                              CAD (Cash After Delivery / Bayar Setelah
                              Pengiriman)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Informasi Tambahan berdasarkan tipe pembayaran */}
                  {form.watch("paymentType") === "CASH" && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <h3 className="font-medium text-green-700 mb-2">
                        Pembayaran CASH
                      </h3>
                      <p className="text-green-700 text-sm">
                        Pembayaran dilakukan di muka sebelum barang dikirim.
                        Pengiriman akan diproses setelah pembayaran diterima.
                      </p>
                    </div>
                  )}

                  {form.watch("paymentType") === "COD" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h3 className="font-medium text-blue-700 mb-2">
                        Pembayaran COD (Cash On Delivery)
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Pembayaran dilakukan oleh penerima saat barang diterima.
                        Supir lansir akan menerima pembayaran dari penerima.
                      </p>
                    </div>
                  )}

                  {form.watch("paymentType") === "CAD" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <h3 className="font-medium text-yellow-700 mb-2">
                        Pembayaran CAD (Cash After Delivery)
                      </h3>
                      <p className="text-yellow-700 text-sm">
                        Pembayaran dilakukan setelah barang dikirim. Barang akan
                        ditagihkan sesuai dengan jadwal penagihan.
                      </p>
                    </div>
                  )}

                  <div className="bg-muted p-4 rounded-md">
                    <div className="font-semibold text-lg">Informasi Harga</div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Berat:</span>
                      <span>{form.watch("berat")} kg</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Harga per Kilo:</span>
                      <span>
                        Rp {form.watch("hargaPerKilo").toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Jumlah Colly:</span>
                      <span>{form.watch("jumlahColly")}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Harga:</span>
                      <span>
                        {formatCurrency(
                          parseFloat(berat || 0) * parseFloat(hargaPerKilo || 0)
                        )}
                      </span>
                    </div>
                  </div>

                  {form.watch("paymentType") === "CASH" && (
                    <div className="p-4 rounded-md bg-green-50 border border-green-200">
                      <div className="font-medium text-green-700 mb-2">
                        Catatan Pembayaran CASH
                      </div>
                      <div className="text-sm text-green-700">
                        Pastikan untuk meminta pembayaran sebesar{" "}
                        {formatCurrency(
                          parseFloat(berat || 0) * parseFloat(hargaPerKilo || 0)
                        )}{" "}
                        sebelum memproses pengiriman.
                      </div>
                    </div>
                  )}
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
                  {isEditing ? "Simpan Perubahan" : "Buat STT"}
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
              ingin keluar tanpa menyimpan perubahan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tidak, Lanjutkan Edit</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/stt")}
              className="bg-destructive hover:bg-destructive/90"
            >
              Ya, Batalkan Perubahan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Dialog */}
      <AlertDialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Printer className="h-5 w-5 mr-2" />
              Cetak STT
            </AlertDialogTitle>
            <AlertDialogDescription>
              STT berhasil dibuat. Apakah Anda ingin mencetak STT sekarang?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push("/stt")}>
              Nanti Saja
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePrintSTT}
              disabled={isPrinting}
              className="bg-primary hover:bg-primary/90"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mencetak...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak Sekarang
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
