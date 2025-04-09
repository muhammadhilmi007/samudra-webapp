"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  fetchBranchCashTransactions,
  fetchHQCashTransactions,
  createBranchCashTransaction,
  createHQCashTransaction,
} from "@/lib/redux/slices/financeSlice";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Icons
import {
  PlusCircle,
  Search,
  Wallet,
  Building,
  CalendarIcon,
  FilterIcon,
  FileDown,
  FileUp,
} from "lucide-react";

// Custom hooks and utils
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Form schema for transaction
const cashTransactionSchema = z.object({
  tanggal: z.date({
    required_error: "Tanggal wajib diisi",
  }),
  tipeKas: z.string({
    required_error: "Tipe kas wajib diisi",
  }),
  cabangId: z.string().optional(),
  keterangan: z.string().min(3, {
    message: "Keterangan minimal 3 karakter",
  }),
  debet: z.coerce.number().min(0, {
    message: "Debet minimal 0",
  }),
  kredit: z.coerce.number().min(0, {
    message: "Kredit minimal 0",
  }),
  tipe: z.enum(["Cabang", "Pusat"], {
    required_error: "Pilih tipe kas",
  }),
});

const KasPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { branchCashTransactions, hqCashTransactions, loading, error, success } = useSelector(
    (state) => state.finance
  );
  const { cabang } = useSelector((state) => state.cabang);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("branch");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form setup
  const form = useForm({
    resolver: zodResolver(cashTransactionSchema),
    defaultValues: {
      tanggal: new Date(),
      tipeKas: "",
      cabangId: user?.cabangId || "",
      keterangan: "",
      debet: 0,
      kredit: 0,
      tipe: "Cabang", // Default to branch cash
    },
  });

  useEffect(() => {
    dispatch(fetchBranchCashTransactions());
    dispatch(fetchHQCashTransactions());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast({
        title: "Berhasil",
        description: "Transaksi kas berhasil disimpan",
        variant: "success",
      });
      setIsAddDialogOpen(false);
      form.reset();
    }
  }, [success, toast, form]);

  // Filter data based on search term and filter
  const filteredBranchCash = branchCashTransactions?.filter((cash) => {
    const matchesSearch = cash.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? cash.tipeKas === filterType : true;
    const matchesDate = filterDate
      ? new Date(cash.tanggal).toDateString() === filterDate.toDateString()
      : true;

    return matchesSearch && matchesType && matchesDate;
  });

  const filteredHQCash = hqCashTransactions?.filter((cash) => {
    const matchesSearch = cash.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? cash.tipeKas === filterType : true;
    const matchesDate = filterDate
      ? new Date(cash.tanggal).toDateString() === filterDate.toDateString()
      : true;

    return matchesSearch && matchesType && matchesDate;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Handle form submission
  const onSubmit = (data) => {
    if (data.tipe === "Cabang") {
      dispatch(createBranchCashTransaction(data));
    } else {
      dispatch(createHQCashTransaction(data));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Kas</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari transaksi kas..."
              className="w-[250px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterDate ? (
                          format(filterDate, "PPP", { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterDate}
                        onSelect={setFilterDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Kas</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Pilih tipe kas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Semua</SelectItem>
                      <SelectItem value="Awal">Kas Awal</SelectItem>
                      <SelectItem value="Akhir">Kas Akhir</SelectItem>
                      <SelectItem value="Kecil">Kas Kecil</SelectItem>
                      <SelectItem value="Rekening">Rekening</SelectItem>
                      <SelectItem value="Tangan">Di Tangan</SelectItem>
                      <SelectItem value="Bantuan">Bantuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterDate(null);
                      setFilterType("");
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={() => {
                      // Close popover on apply
                      document.body.click();
                    }}
                  >
                    Terapkan
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Transaksi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Tambah Transaksi Kas</DialogTitle>
                <DialogDescription>
                  Isi detail transaksi kas baru. Klik simpan jika sudah selesai.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tipe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Kas</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis kas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cabang">Kas Cabang</SelectItem>
                            <SelectItem value="Pusat">Kas Pusat</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tanggal"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: id })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("tipe") === "Cabang" && (
                    <FormField
                      control={form.control}
                      name="cabangId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cabang</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih cabang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cabang?.map((item) => (
                                <SelectItem key={item._id} value={item._id}>
                                  {item.namaCabang}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="tipeKas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipe Kas</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe kas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Awal">Kas Awal</SelectItem>
                            <SelectItem value="Akhir">Kas Akhir</SelectItem>
                            <SelectItem value="Kecil">Kas Kecil</SelectItem>
                            <SelectItem value="Rekening">Rekening</SelectItem>
                            <SelectItem value="Tangan">Di Tangan</SelectItem>
                            {form.watch("tipe") === "Pusat" && (
                              <SelectItem value="Bantuan">Bantuan</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keterangan</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan keterangan transaksi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="debet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Debet</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => {
                                field.onChange(Number(e.target.value));
                                // If debet is entered, reset kredit to 0
                                if (Number(e.target.value) > 0) {
                                  form.setValue("kredit", 0);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kredit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kredit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => {
                                field.onChange(Number(e.target.value));
                                // If kredit is entered, reset debet to 0
                                if (Number(e.target.value) > 0) {
                                  form.setValue("debet", 0);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="branch" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="branch" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>Kas Cabang</span>
          </TabsTrigger>
          <TabsTrigger value="hq" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Kas Pusat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kas Cabang</CardTitle>
              <CardDescription>
                Daftar transaksi kas cabang dalam sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-12" />
                  ))}
                </div>
              ) : filteredBranchCash?.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Tipe Kas</TableHead>
                        <TableHead>Cabang</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <FileDown className="h-4 w-4 text-green-500" />
                            <span>Debet</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <FileUp className="h-4 w-4 text-red-500" />
                            <span>Kredit</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBranchCash.map((cash) => (
                        <TableRow key={cash._id}>
                          <TableCell>{formatDate(cash.tanggal)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{cash.tipeKas}</Badge>
                          </TableCell>
                          <TableCell>
                            {cash.cabangId?.namaCabang || "Tidak tersedia"}
                          </TableCell>
                          <TableCell>{cash.keterangan}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {cash.debet > 0 ? formatCurrency(cash.debet) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            {cash.kredit > 0 ? formatCurrency(cash.kredit) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(cash.saldo)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/keuangan/kas/${cash._id}`}>
                              <Button variant="outline" size="sm">
                                Detail
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-10">
                  <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Tidak ada transaksi kas cabang yang ditemukan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kas Pusat</CardTitle>
              <CardDescription>
                Daftar transaksi kas pusat dalam sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-12" />
                  ))}
                </div>
              ) : filteredHQCash?.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Tipe Kas</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <FileDown className="h-4 w-4 text-green-500" />
                            <span>Debet</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <FileUp className="h-4 w-4 text-red-500" />
                            <span>Kredit</span>
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHQCash.map((cash) => (
                        <TableRow key={cash._id}>
                          <TableCell>{formatDate(cash.tanggal)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{cash.tipeKas}</Badge>
                          </TableCell>
                          <TableCell>{cash.keterangan}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {cash.debet > 0 ? formatCurrency(cash.debet) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            {cash.kredit > 0 ? formatCurrency(cash.kredit) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                cash.status === "MERGED" ? "success" : "secondary"
                              }
                            >
                              {cash.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(cash.saldo)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/keuangan/kas/${cash._id}`}>
                              <Button variant="outline" size="sm">
                                Detail
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-10">
                  <Building className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Tidak ada transaksi kas pusat yang ditemukan
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KasPage;