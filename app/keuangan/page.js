"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  fetchAccounts,
  fetchJournals,
  fetchBranchCashTransactions,
  fetchHQCashTransactions,
  fetchBankStatements,
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
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Icons
import {
  BarChart4,
  PlusCircle,
  CreditCard,
  Wallet,
  Building,
  FileText,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
} from "lucide-react";

// Dashboard Statistics
import FinancialSummaryCard from "@/components/keuangan/FinancialSummaryCard";
import DashboardStats from "@/components/shared/DashboardStats";

const KeuanganPage = () => {
  const dispatch = useDispatch();
  const { 
    accounts, 
    journals, 
    branchCashTransactions, 
    hqCashTransactions, 
    bankStatements,
    loading, 
    error 
  } = useSelector((state) => state.finance);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch finance data when component mounts
    dispatch(fetchAccounts());
    dispatch(fetchJournals());
    dispatch(fetchBranchCashTransactions());
    dispatch(fetchHQCashTransactions());
    dispatch(fetchBankStatements());
  }, [dispatch]);

  // Filter data based on search term
  const filteredAccounts = accounts?.filter(
    (account) => 
      account.kodeAccount?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      account.namaAccount?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredJournals = journals?.filter(
    (journal) =>
      journal.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.accountId?.namaAccount?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  // Calculate dashboard stats
  const totalIncome = journals
    ?.filter((journal) => journal.kredit > 0)
    .reduce((acc, journal) => acc + journal.kredit, 0) || 0;

  const totalExpense = journals
    ?.filter((journal) => journal.debet > 0)
    .reduce((acc, journal) => acc + journal.debet, 0) || 0;

  const branchCashBalance = branchCashTransactions?.length > 0
    ? branchCashTransactions[branchCashTransactions.length - 1].saldo
    : 0;

  const hqCashBalance = hqCashTransactions?.length > 0
    ? hqCashTransactions[hqCashTransactions.length - 1].saldo
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari data keuangan..."
              className="w-[250px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="dashboard"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Rekening</span>
          </TabsTrigger>
          <TabsTrigger value="journals" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Jurnal</span>
          </TabsTrigger>
          <TabsTrigger value="cash" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>Kas</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Bank</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab Content */}
        <TabsContent value="dashboard" className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinancialSummaryCard
              title="Pendapatan"
              value={totalIncome}
              icon={<ArrowUpCircle className="h-5 w-5 text-green-500" />}
              description="Total pendapatan"
              trend={{ value: 12, label: "dari bulan lalu" }}
              loading={loading}
            />
            <FinancialSummaryCard
              title="Pengeluaran"
              value={totalExpense}
              icon={<ArrowDownCircle className="h-5 w-5 text-red-500" />}
              description="Total pengeluaran"
              trend={{ value: -5, label: "dari bulan lalu" }}
              loading={loading}
            />
            <FinancialSummaryCard
              title="Kas Cabang"
              value={branchCashBalance}
              icon={<Wallet className="h-5 w-5 text-blue-500" />}
              description="Saldo kas cabang"
              trend={{ value: 8, label: "dari bulan lalu" }}
              loading={loading}
            />
            <FinancialSummaryCard
              title="Kas Pusat"
              value={hqCashBalance}
              icon={<Building className="h-5 w-5 text-purple-500" />}
              description="Saldo kas pusat"
              trend={{ value: 3, label: "dari bulan lalu" }}
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaksi Terbaru</CardTitle>
                <CardDescription>
                  Transaksi jurnal terbaru yang telah dibuat
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-12" />
                    ))}
                  </div>
                ) : journals?.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="text-right">Debet</TableHead>
                          <TableHead className="text-right">Kredit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {journals.slice(0, 10).map((journal) => (
                          <TableRow key={journal._id}>
                            <TableCell>
                              {formatDate(journal.tanggal)}
                            </TableCell>
                            <TableCell>{journal.keterangan}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(journal.debet)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(journal.kredit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    Tidak ada data jurnal tersedia
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("journals")}
                >
                  Lihat Semua
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kas Terbaru</CardTitle>
                <CardDescription>
                  Transaksi kas terbaru yang telah dibuat
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-12" />
                    ))}
                  </div>
                ) : branchCashTransactions?.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {branchCashTransactions.slice(0, 10).map((cash) => (
                          <TableRow key={cash._id}>
                            <TableCell>{formatDate(cash.tanggal)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{cash.tipeKas}</Badge>
                            </TableCell>
                            <TableCell>{cash.keterangan}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(cash.saldo)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    Tidak ada data kas tersedia
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("cash")}
                >
                  Lihat Semua
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Accounts Tab Content */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Daftar Akun</h2>
            <Link href="/keuangan/accounts/baru">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Akun
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-12" />
                  ))}
                </div>
              ) : filteredAccounts?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Akun</TableHead>
                      <TableHead>Nama Akun</TableHead>
                      <TableHead>Tipe Akun</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account._id}>
                        <TableCell className="font-medium">
                          {account.kodeAccount}
                        </TableCell>
                        <TableCell>{account.namaAccount}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {account.tipeAccount}
                          </Badge>
                        </TableCell>
                        <TableCell>{account.deskripsi}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/keuangan/accounts/${account._id}`}>
                            <Button variant="outline" size="sm">
                              Detail
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Tidak ada data akun tersedia
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journals Tab Content */}
        <TabsContent value="journals" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Jurnal Umum</h2>
            <Link href="/keuangan/journals/baru">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Jurnal
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-12" />
                  ))}
                </div>
              ) : filteredJournals?.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Akun</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">Debet</TableHead>
                        <TableHead className="text-right">Kredit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJournals.map((journal) => (
                        <TableRow key={journal._id}>
                          <TableCell>{formatDate(journal.tanggal)}</TableCell>
                          <TableCell>
                            {journal.accountId?.namaAccount || "—"}
                          </TableCell>
                          <TableCell>{journal.keterangan}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(journal.debet)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(journal.kredit)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                journal.status === "FINAL"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {journal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/keuangan/journals/${journal._id}`}>
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
                <p className="text-center py-4 text-muted-foreground">
                  Tidak ada data jurnal tersedia
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Tab Content */}
        <TabsContent value="cash" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Manajemen Kas</h2>
            <div className="space-x-2">
              <Link href="/keuangan/kas/cabang">
                <Button variant="outline">
                  Kas Cabang
                </Button>
              </Link>
              <Link href="/keuangan/kas/pusat">
                <Button variant="outline">
                  Kas Pusat
                </Button>
              </Link>
              <Link href="/keuangan/kas/baru">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Transaksi
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Kas</CardTitle>
              <CardDescription>Saldo kas cabang dan pusat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Kas Cabang</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {loading ? (
                        <Skeleton className="h-9 w-32" />
                      ) : (
                        formatCurrency(branchCashBalance)
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Saldo kas dari semua cabang
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Kas Pusat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {loading ? (
                        <Skeleton className="h-9 w-32" />
                      ) : (
                        formatCurrency(hqCashBalance)
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Saldo kas kantor pusat
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaksi Kas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-12" />
                  ))}
                </div>
              ) : branchCashTransactions?.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">Debet</TableHead>
                        <TableHead className="text-right">Kredit</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {branchCashTransactions.slice(0, 10).map((cash) => (
                        <TableRow key={cash._id}>
                          <TableCell>{formatDate(cash.tanggal)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{cash.tipeKas}</Badge>
                          </TableCell>
                          <TableCell>{cash.keterangan}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(cash.debet)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(cash.kredit)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(cash.saldo)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Tidak ada data kas tersedia
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Link href="/keuangan/kas">
                <Button variant="outline">Lihat Semua Transaksi</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Bank Tab Content */}
        <TabsContent value="bank" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-semibold">Mutasi Rekening</h2>
            <Link href="/keuangan/bank/baru">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Mutasi
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-12" />
                  ))}
                </div>
              ) : bankStatements?.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>No Rekening</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">Debet</TableHead>
                        <TableHead className="text-right">Kredit</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankStatements.map((statement) => (
                        <TableRow key={statement._id}>
                          <TableCell>
                            {formatDate(statement.tanggal)}
                          </TableCell>
                          <TableCell>{statement.bank}</TableCell>
                          <TableCell>{statement.noRekening}</TableCell>
                          <TableCell>{statement.keterangan}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(statement.debet)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(statement.kredit)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(statement.saldo)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                statement.status === "VALIDATED"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {statement.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/keuangan/bank/${statement._id}`}>
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
                <p className="text-center py-4 text-muted-foreground">
                  Tidak ada data mutasi bank tersedia
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KeuanganPage;