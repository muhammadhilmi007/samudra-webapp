"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout, hasAccess } from "@/lib/auth";
import AuthGuard from "@/components/auth/auth-guard";
import {
  fetchEmployees,
  deleteEmployee,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/pegawaiSlice";
import { fetchBranches } from "@/lib/redux/slices/cabangSlice";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  X,
  FilterIcon,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { formatDate, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Sidebar from '@/components/layout/DynamicSidebar'

// Rename the main component to be wrapped with AuthGuard later
function PegawaiContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, loading, error, success } = useSelector(
    (state) => state.pegawai
  );
  const { branches } = useSelector((state) => state.cabang);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Fetch data with filters
    const fetchData = () => {
      const params = {};
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (filterBranch && filterBranch !== 'all') {
        params.cabangId = filterBranch;
      }
      
      if (filterStatus && filterStatus !== 'all') {
        params.aktif = filterStatus === 'aktif';
      }
      
      dispatch(fetchEmployees(params));
    };
    
    fetchData();
    dispatch(fetchBranches());
  }, [dispatch, searchQuery, filterBranch, filterStatus]);

  // Update the clear filters function
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterBranch("all");
    setFilterStatus("all");
  };

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
        description: "Operasi pegawai berhasil dilakukan",
        variant: "success",
      });
      dispatch(clearSuccess());
    }
  }, [error, success, toast, dispatch]);

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      setIsDeleting(true);
      try {
        await dispatch(deleteEmployee(employeeToDelete._id)).unwrap();
        toast({
          title: "Berhasil",
          description: `Pegawai ${employeeToDelete.nama} berhasil dihapus`,
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error || "Gagal menghapus pegawai",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setEmployeeToDelete(null);
      }
    }
  };

  // Find branch name by id
  const getBranchName = (branchId) => {
    if (!branchId) return "-";
    
    // Make sure branches is available and not empty
    if (!branches || !Array.isArray(branches)) return "-";
    
    // Try to find the branch with more flexible comparison
    const branch = branches.find(
      (branch) => String(branch._id) === String(branchId)
    );
    
    return branch ? branch.namaCabang : "-";
  };

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
          onLogout={async () => {
            await dispatch(logout());
            router.push('/login');
          }}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-lxl space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Pegawai</h1>
                <p className="text-muted-foreground">
                  Kelola data pegawai perusahaan
                </p>
              </div>
              <Link href="/pegawai/tambah">
                <Button className="gap-1">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Tambah Pegawai</span>
                  <span className="sm:hidden">Tambah</span>
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari pegawai..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-1 gap-2">
                <Select
                  value={filterBranch}
                  onValueChange={setFilterBranch}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Semua Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Cabang</SelectItem>
                    {branches && branches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.namaCabang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="nonaktif">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClearFilters}
                  title="Hapus filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Employees Table */}
            <div className="rounded-lg border bg-card">
              {loading ? (
                <div className="flex h-60 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : employees.length === 0 ? (
                <div className="flex h-60 flex-col items-center justify-center gap-2 p-4 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <UserPlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Tidak ada pegawai</h3>
                  <p className="text-sm text-muted-foreground">
                    Belum ada data pegawai yang tersedia.
                    {searchQuery || filterBranch || filterStatus ? (
                      " Coba ubah filter pencarian."
                    ) : (
                      " Tambahkan pegawai baru untuk memulai."
                    )}
                  </p>
                  {!searchQuery && !filterBranch && !filterStatus && (
                    <Link href="/pegawai/tambah">
                      <Button className="mt-2 gap-1">
                        <UserPlus className="h-4 w-4" />
                        Tambah Pegawai
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Jabatan</TableHead>
                        <TableHead>Cabang</TableHead>
                        <TableHead>Kontak</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {employee.fotoProfil && employee.fotoProfil !== 'default.jpg' ? (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${employee.fotoProfil}`}
                                    alt={employee.nama}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span>{getInitials(employee.nama)}</span>
                                )}
                              </div>
                              <div>
                                <div>{employee.nama}</div>
                                <div className="text-xs text-muted-foreground">
                                  {employee.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.jabatan}</TableCell>
                          <TableCell>{getBranchName(employee.cabangId)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {employee.email && (
                                <div className="text-xs">{employee.email}</div>
                              )}
                              <div className="text-xs">{employee.telepon}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={employee.aktif ? "success" : "destructive"}
                              className="capitalize"
                            >
                              {employee.aktif ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/pegawai/${employee._id}`}>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="icon"
                                title="Hapus"
                                onClick={() => handleDeleteClick(employee)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Pegawai</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pegawai{" "}
              <span className="font-semibold">
                {employeeToDelete?.nama}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Export the component wrapped with AuthGuard to protect this route
export default function PegawaiPage() {
  return (
    <AuthGuard
      requiredAccess={{ resource: 'employees', action: 'view' }}
      redirectTo="/unauthorized"
    >
      <PegawaiContent />
    </AuthGuard>
  );
}
