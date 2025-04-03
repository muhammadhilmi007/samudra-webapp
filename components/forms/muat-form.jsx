"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLoading,
  updateLoading,
  fetchLoadingById,
} from "@/lib/redux/slices/loadingSlice";
import { fetchSTTs } from "@/lib/redux/slices/sttSlice";
import { fetchVehicleQueues } from "@/lib/redux/slices/vehicleQueueSlice";
import { fetchBranches } from "@/lib/redux/slices/cabangSlice";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/lib/hooks/use-toast";
import {
  Loader2,
  Save,
  ArrowLeft,
  Package,
  Truck,
  User,
  Search,
  Plus,
  Trash,
  Calendar,
  Info,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Validation schema
const muatSchema = z.object({
  antrianTruckId: z.string().min(1, { message: "Truck harus dipilih" }),
  cabangMuatId: z.string().min(1, { message: "Cabang asal harus dipilih" }),
  cabangBongkarId: z.string().min(1, { message: "Cabang tujuan harus dipilih" }),
  checkerId: z.string().min(1, { message: "Checker harus dipilih" }),
  keterangan: z.string().optional(),
  sttIds: z
    .array(z.string())
    .min(1, { message: "Minimal 1 STT harus dipilih" }),
});

export default function MuatForm({ loadingId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!loadingId;

  const { loading: loadingMuat, currentLoading, error, success } = useSelector(
    (state) => state.loading
  );
  const { stts, loading: loadingSTT } = useSelector((state) => state.stt);
  const { vehicleQueues, loading: loadingTruck } = useSelector(
    (state) => state.vehicleQueue
  );
  const { branches, loading: loadingBranch } = useSelector(
    (state) => state.cabang
  );

  const [activeTab, setActiveTab] = useState("info-truck");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [searchSTT, setSearchSTT] = useState("");
  const [selectedSTTs, setSelectedSTTs] = useState([]);

  // Initialize form
 const form = useForm({
    resolver: zodResolver(muatSchema),
    defaultValues: {
      antrianTruckId: "",
      cabangMuatId: "",
      cabangBongkarId: "",
      checkerId: "",
      keterangan: "",
      sttIds: [],
    },
  });
 
  // Fetch data
  useEffect(() => {
    dispatch(fetchSTTs());
    dispatch(fetchVehicleQueues());
    dispatch(fetchBranches());
 
    if (isEditing && loadingId) {
      dispatch(fetchLoadingById(loadingId));
    }
  }, [dispatch, isEditing, loadingId]);
 
  // Populate form when data is fetched
  useEffect(() => {
    if (isEditing && currentLoading && currentLoading._id) {
      const loadingData = {
        antrianTruckId: currentLoading.antrianTruckId?._id || currentLoading.antrianTruckId || "",
        cabangMuatId: currentLoading.cabangMuatId?._id || currentLoading.cabangMuatId || "",
        cabangBongkarId: currentLoading.cabangBongkarId?._id || currentLoading.cabangBongkarId || "",
        checkerId: currentLoading.checkerId?._id || currentLoading.checkerId || "",
        keterangan: currentLoading.keterangan || "",
        sttIds: currentLoading.sttIds?.map(id => typeof id === 'object' ? id._id : id) || [],
      };
 
      form.reset(loadingData);
      
      if (loadingData.sttIds.length > 0) {
        // Find the corresponding STT objects for the IDs
        const selectedItems = stts.filter(stt => 
          loadingData.sttIds.includes(stt._id || stt.id)
        );
        setSelectedSTTs(selectedItems);
      }
    }
  }, [form, isEditing, currentLoading, stts]);
 
  // Handle form submission
  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await dispatch(
          updateLoading({
            id: loadingId,
            loadingData: data,
          })
        ).unwrap();
        toast({
          title: "Berhasil",
          description: "Data muatan berhasil diperbarui",
          variant: "success",
        });
      } else {
        await dispatch(createLoading(data)).unwrap();
        toast({
          title: "Berhasil",
          description: "Muatan baru berhasil dibuat",
          variant: "success",
        });
      }
      router.push("/muat");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    }
  };
 
  // Handle cancel button
  const handleCancel = () => {
    if (form.formState.isDirty) {
      setCancelDialogOpen(true);
    } else {
      router.push("/muat");
    }
  };
 
  // Handle STT selection
  const handleSTTSelection = (stt) => {
    const sttId = stt._id;
    const isSelected = selectedSTTs.some(item => item._id === sttId);
    
    let newSelectedSTTs;
    let newSttIds;
    
    if (isSelected) {
      // Remove from selection
      newSelectedSTTs = selectedSTTs.filter(item => item._id !== sttId);
      newSttIds = form.getValues("sttIds").filter(id => id !== sttId);
    } else {
      // Add to selection
      newSelectedSTTs = [...selectedSTTs, stt];
      newSttIds = [...form.getValues("sttIds"), sttId];
    }
    
    setSelectedSTTs(newSelectedSTTs);
    form.setValue("sttIds", newSttIds);
  };
 
  // Filter STTs based on search and ready status
  const filteredSTTs = stts.filter(stt => {
    // Only show STTs that are ready for loading (PENDING status)
    const isReady = stt.status === "PENDING";
    
    // Apply search filter if search term exists
    const matchesSearch = !searchSTT || 
      stt.noSTT?.toLowerCase().includes(searchSTT.toLowerCase()) ||
      stt.namaBarang?.toLowerCase().includes(searchSTT.toLowerCase());
    
    // Don't show STTs that are already selected
    const notAlreadySelected = !selectedSTTs.some(item => item._id === stt._id);
    
    return isReady && matchesSearch && notAlreadySelected;
  });
 
  // Get available trucks (in queue with status MUAT)
  const availableTrucks = vehicleQueues.filter(queue => queue.status === "MUAT");
 
  // Helper function to get branch name
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : "";
  };
 
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Muatan" : "Buat Muatan Baru"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Perbarui data muatan yang sudah ada"
              : "Buat data muatan baru untuk pengiriman antar cabang"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Batal
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={loadingMuat}>
            {loadingMuat ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Menyimpan..." : "Membuat..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Simpan Perubahan" : "Buat Muatan"}
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
              <TabsTrigger value="info-truck">
                <Truck className="w-4 h-4 mr-2" />
                Informasi Truck & Tujuan
              </TabsTrigger>
              <TabsTrigger value="info-stt">
                <Package className="w-4 h-4 mr-2" />
                Pilih STT untuk Dimuat
              </TabsTrigger>
            </TabsList>
 
            {/* Tab Informasi Truck */}
            <TabsContent value="info-truck" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Informasi Truck dan Tujuan
                  </CardTitle>
                  <CardDescription>
                    Pilih truck dan cabang tujuan pengiriman
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Truck Selection */}
                  <FormField
                    control={form.control}
                    name="antrianTruckId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Truck *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={loadingTruck}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih truck" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTrucks.map((queue) => (
                              <SelectItem key={queue._id} value={queue._id}>
                                {queue.truckId?.noPolisi || "Truck"} - {queue.truckId?.namaKendaraan || ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
 
                  {/* Branch Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cabangMuatId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cabang Asal (Muat) *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={loadingBranch}
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
                      name="cabangBongkarId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cabang Tujuan (Bongkar) *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={loadingBranch}
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
 
                  {/* Checker Selection */}
                  <FormField
                    control={form.control}
                    name="checkerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Checker *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih checker" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Mock data for checkers */}
                            <SelectItem value="checker1">Budi Santoso</SelectItem>
                            <SelectItem value="checker2">Ahmad Fauzi</SelectItem>
                            <SelectItem value="checker3">Deni Setiawan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
 
                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keterangan</FormLabel>
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
 
            {/* Tab STT Selection */}
            <TabsContent value="info-stt" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Pilih STT untuk Dimuat
                  </CardTitle>
                  <CardDescription>
                    Pilih STT-STT yang akan dimuat ke dalam truck
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected STTs */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">STT yang Dipilih</h3>
                    {selectedSTTs.length === 0 ? (
                      <div className="text-muted-foreground text-center p-4 border rounded-md">
                        Belum ada STT yang dipilih
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>No. STT</TableHead>
                              <TableHead>Tujuan</TableHead>
                              <TableHead>Barang</TableHead>
                              <TableHead>Berat</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedSTTs.map(stt => (
                              <TableRow key={stt._id}>
                                <TableCell className="font-medium">{stt.noSTT}</TableCell>
                                <TableCell>{getBranchName(stt.cabangTujuanId)}</TableCell>
                                <TableCell>{stt.namaBarang}</TableCell>
                                <TableCell>{stt.berat} kg</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSTTSelection(stt)}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
 
                  {/* Available STTs */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">STT yang Tersedia</h3>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari STT..."
                          className="pl-9 w-[250px]"
                          value={searchSTT}
                          onChange={(e) => setSearchSTT(e.target.value)}
                        />
                      </div>
                    </div>
 
                    {loadingSTT ? (
                      <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Memuat data STT...</span>
                      </div>
                    ) : filteredSTTs.length === 0 ? (
                      <div className="text-muted-foreground text-center p-4 border rounded-md">
                        Tidak ada STT yang tersedia
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>No. STT</TableHead>
                              <TableHead>Tujuan</TableHead>
                              <TableHead>Barang</TableHead>
                              <TableHead>Berat</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSTTs.map(stt => (
                              <TableRow key={stt._id} className="cursor-pointer hover:bg-muted/50">
                                <TableCell>
                                  <Checkbox
                                    checked={selectedSTTs.some(item => item._id === stt._id)}
                                    onCheckedChange={() => handleSTTSelection(stt)}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{stt.noSTT}</TableCell>
                                <TableCell>{getBranchName(stt.cabangTujuanId)}</TableCell>
                                <TableCell>{stt.namaBarang}</TableCell>
                                <TableCell>{stt.berat} kg</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
 
                  {/* Form validation error for STT selection */}
                  {form.formState.errors.sttIds && (
                    <div className="text-sm font-medium text-destructive">
                      {form.formState.errors.sttIds.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
 
          <div className="flex justify-end">
            <Button type="submit" disabled={loadingMuat}>
              {loadingMuat ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Menyimpan..." : "Membuat..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Simpan Perubahan" : "Buat Muatan"}
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
              onClick={() => router.push("/muat")}
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