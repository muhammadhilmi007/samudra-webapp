"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchBranches,
  deleteBranch,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/cabangSlice";
import { fetchDivisions } from "@/lib/redux/slices/divisiSlice";
import { Button } from "@/components/ui/button";
import { logout, hasAccess } from "@/lib/auth";
import AuthGuard from "@/components/auth/auth-guard";
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

// Rename the main component to be wrapped with AuthGuard later
function CabangContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { branches, loading, error, success } = useSelector(
    (state) => state.cabang
  );
  const { divisions } = useSelector((state) => state.divisi);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDivision, setFilterDivision] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [divisionsLoaded, setDivisionsLoaded] = useState(false);

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

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
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
    // Filter by search query
    const matchesSearch = 
      branch.namaCabang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.alamat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.kota?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.provinsi?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by division
    const matchesDivision = 
      filterDivision === "all" || 
      branch.divisiId === filterDivision ||
      branch.divisiId?._id === filterDivision ||
      branch.divisiId?.toString() === filterDivision;
    
    return matchesSearch && matchesDivision;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuButtonClick={() => setSidebarOpen(true)}
          user={user}
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
                        <TableHead>Nama Cabang</TableHead>
                        <TableHead>Divisi</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead>Kota</TableHead>
                        <TableHead>Provinsi</TableHead>
                        <TableHead>Penanggung Jawab</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBranches.length > 0 ? (
                        filteredBranches.map((branch) => (
                          <TableRow key={branch._id}>
                            <TableCell className="font-medium">{branch.namaCabang}</TableCell>
                            <TableCell>{getDivisionName(branch.divisiId)}</TableCell>
                            <TableCell>{branch.alamat}</TableCell>
                            <TableCell>{branch.kota}</TableCell>
                            <TableCell>{branch.provinsi}</TableCell>
                            <TableCell>{branch.kontakPenanggungJawab?.nama || "-"}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Link href={`/cabang/${branch._id}`}>
                                  <Button variant="outline" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeleteClick(branch)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            {loading ? (
                              <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Memuat data...</span>
                              </div>
                            ) : (
                              "Tidak ada data cabang"
                            )}
                          </TableCell>
                        </TableRow>
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

// Export the component wrapped with AuthGuard to protect this route
export default function CabangPage() {
  return (
    <AuthGuard
      requiredAccess={{ resource: 'branches', action: 'view' }}
      redirectTo="/unauthorized"
    >
      <CabangContent />
    </AuthGuard>
  );
}
