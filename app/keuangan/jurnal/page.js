// app/keuangan/jurnal/page.js
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  fetchJournals,
  deleteJournal,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/financeSlice";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, Search, X, Calendar } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { DatePicker } from "@/components/shared/date-picker";

export default function JurnalPage() {
  const dispatch = useDispatch();
  const { journals, loading, error, success } = useSelector(
    (state) => state.finance
  );
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  useEffect(() => {
    dispatch(fetchJournals());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }

    if (success) {
      toast({
        title: "Berhasil",
        description: "Operasi jurnal berhasil dilakukan",
        variant: "success",
      });
      dispatch(clearSuccess());
    }
  }, [error, success, toast, dispatch]);

  const handleDeleteClick = (journal) => {
    setJournalToDelete(journal);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (journalToDelete) {
      await dispatch(deleteJournal(journalToDelete._id));
      setDeleteDialogOpen(false);
      setJournalToDelete(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterAccount("");
    setFilterStatus("");
    setStartDate(null);
    setEndDate(null);
  };

  // Filter journals based on search query, account filter, status filter, and date range
  const filteredJournals = journals.filter((journal) => {
    const matchesSearch =
      journal.keterangan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journal.accountId?.namaAccount
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesAccount = filterAccount
      ? journal.accountId?._id === filterAccount
      : true;

    const matchesStatus =
      filterStatus === "" ? true : journal.status === filterStatus;

    const matchesDateRange =
      (!startDate || new Date(journal.tanggal) >= startDate) &&
      (!endDate || new Date(journal.tanggal) <= endDate);

    return matchesSearch && matchesAccount && matchesStatus && matchesDateRange;
  });

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Jurnal Umum
                </h1>
                <p className="text-muted-foreground">
                  Kelola data jurnal umum perusahaan
                </p>
              </div>
              <Link href="/keuangan/jurnal/tambah">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Jurnal
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari keterangan atau akun..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="w-full md:w-64">
                  <Select
                    value={filterAccount}
                    onValueChange={setFilterAccount}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter akun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Akun</SelectItem>
                      {/* Map through accounts here */}
                      <SelectItem value="account1">Kas</SelectItem>
                      <SelectItem value="account2">Bank</SelectItem>
                      <SelectItem value="account3">Piutang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="FINAL">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-64">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Dari:</span>
                    <DatePicker
                      date={startDate}
                      setDate={setStartDate}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="w-full md:w-64">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Sampai:</span>
                    <DatePicker
                      date={endDate}
                      setDate={setEndDate}
                      className="w-full"
                    />
                  </div>
                </div>

                {(searchQuery ||
                  filterAccount ||
                  filterStatus ||
                  startDate ||
                  endDate) && (
                  <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    className="h-10 px-3 lg:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="bg-white rounded-md border shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Akun</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">Debet</TableHead>
                        <TableHead className="text-right">Kredit</TableHead>
                        <TableHead>Cabang</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                              <span className="ml-2">Memuat data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredJournals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            {searchQuery ||
                            filterAccount ||
                            filterStatus ||
                            startDate ||
                            endDate ? (
                              <div>
                                Tidak ada jurnal yang cocok dengan filter yang
                                dipilih
                              </div>
                            ) : (
                              <div>Belum ada data jurnal</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredJournals.map((journal) => (
                          <TableRow key={journal._id}>
                            <TableCell>{formatDate(journal.tanggal)}</TableCell>
                            <TableCell>
                              {journal.accountId?.namaAccount || "-"}
                            </TableCell>
                            <TableCell>{journal.keterangan}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(journal.debet)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(journal.kredit)}
                            </TableCell>
                            <TableCell>
                              {journal.cabangId?.namaCabang || "Pusat"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  journal.status === "FINAL"
                                    ? "success"
                                    : "secondary"
                                }
                                className={
                                  journal.status === "FINAL"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                }
                              >
                                {journal.status === "FINAL" ? "Final" : "Draft"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/keuangan/jurnal/${journal._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(journal)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  disabled={journal.status === "FINAL"}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus jurnal "{journalToDelete?.keterangan}"
              dan tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
