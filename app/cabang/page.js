"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  fetchBranches,
  deleteBranch,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/cabangSlice";
import { fetchDivisions } from "@/lib/redux/slices/divisiSlice";
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
import { Plus, Edit, Trash2, Loader2, Search, X } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function CabangPage() {
  const dispatch = useDispatch();
  const { branches, loading, error, success } = useSelector(
    (state) => state.cabang
  );
  const { divisions } = useSelector((state) => state.divisi);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDivision, setFilterDivision] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [divisionsLoaded, setDivisionsLoaded] = useState(false);

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  useEffect(() => {
    const loadData = async () => {
      console.log("Fetching divisions...");
      await dispatch(fetchDivisions());
      console.log("Fetching branches...");
      await dispatch(fetchBranches());
    };

    loadData();
  }, [dispatch]);

  // Add this effect to debug divisions data
  useEffect(() => {
    console.log("Current divisions:", divisions);
  }, [divisions]);

  useEffect(() => {
    if (divisions && divisions.length > 0) {
      setDivisionsLoaded(true);
      console.log("Divisions loaded:", divisions);
    }
  }, [divisions]);

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
        description: "Operasi cabang berhasil dilakukan",
        variant: "success",
      });
      dispatch(clearSuccess());
    }
  }, [error, success, toast, dispatch]);

  const handleDeleteClick = (branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (branchToDelete) {
      await dispatch(deleteBranch(branchToDelete._id));
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
    }
  };

  const handleLogout = () => {
    // Implement logout functionality
    console.log("Logging out...");
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterDivision("all");
  };

  const getDivisionName = (divisionId) => {
    if (!divisionId) return "-";
    if (!divisions || !Array.isArray(divisions)) return "-";

    // Handle case where divisionId is an object
    const searchId = divisionId?._id || divisionId?.toString() || divisionId;

    const division = divisions.find(div => 
      div._id === searchId || div._id?.toString() === searchId?.toString()
    );

    return division?.namaDivisi || "-";
  };

  // Filter branches based on search query and division filter
  const filteredBranches = branches.filter((branch) => {
    const matchesSearch = branch.namaCabang
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    // Fix the division filter comparison
    const matchesDivision = 
      filterDivision === "all" 
        ? true 
        : String(branch.divisiId) === String(filterDivision);
    
    return matchesSearch && matchesDivision;
  });

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
                  Manajemen Cabang
                </h1>
                <p className="text-muted-foreground">
                  Kelola data cabang perusahaan
                </p>
              </div>
              <Link href="/cabang/tambah">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Cabang
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari cabang..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="w-full md:w-72">
                  <Select
                    value={filterDivision}
                    onValueChange={setFilterDivision}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter berdasarkan divisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Divisi</SelectItem>
                      {divisions?.map((division) => (
                        <SelectItem
                          key={division._id}
                          value={division._id?.toString()}
                        >
                          {division.namaDivisi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(searchQuery || filterDivision) && (
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
                        <TableHead className="w-[50px]">No.</TableHead>
                        <TableHead>Nama Cabang</TableHead>
                        <TableHead>Divisi</TableHead>
                        <TableHead>Kota</TableHead>
                        <TableHead>Provinsi</TableHead>
                        <TableHead>Tanggal Dibuat</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                              <span className="ml-2">Memuat data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredBranches.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            {searchQuery || filterDivision ? (
                              <div>
                                Tidak ada cabang yang cocok dengan filter yang
                                dipilih
                              </div>
                            ) : (
                              <div>Belum ada data cabang</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBranches.map((branch, index) => (
                          <TableRow key={branch._id}>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell>{branch.namaCabang}</TableCell>
                            <TableCell>
                              {!divisionsLoaded ? (
                                <span className="text-gray-400">
                                  Loading...
                                </span>
                              ) : (
                                getDivisionName(branch.divisiId)
                              )}
                            </TableCell>
                            <TableCell>{branch.kota || "-"}</TableCell>
                            <TableCell>{branch.provinsi || "-"}</TableCell>
                            <TableCell>
                              {formatDate(branch.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/cabang/${branch._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(branch)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
              Tindakan ini akan menghapus cabang &quot;
              {branchToDelete?.namaCabang}&quot; dan tidak dapat dibatalkan.
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
