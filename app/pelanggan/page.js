"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  fetchCustomers,
  deleteCustomer,
  clearError,
  clearSuccess,
} from "@/lib/redux/slices/customerSlice";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  X,
  UserPlus,
  Building,
  Phone,
  Mail,
  MapPin,
  Filter,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function PelangganPage() {
  const dispatch = useDispatch();
  const { customers, loading, error, success } = useSelector(
    (state) => state.customer
  );
  const { branches } = useSelector((state) => state.cabang);
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  // Add this effect to refresh data when the component is mounted
  useEffect(() => {
    // Fetch data on initial load
    dispatch(fetchCustomers());
    dispatch(fetchBranches());
    
    // Set up an interval to refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      dispatch(fetchCustomers());
      dispatch(fetchBranches());
    }, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, [dispatch]);
  
  // Add this effect to refresh data when success changes
  useEffect(() => {
    if (success) {
      dispatch(fetchCustomers());
      dispatch(clearSuccess());
    }
  }, [dispatch, success]);

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
        description: "Operasi pelanggan berhasil dilakukan",
        variant: "success",
      });
      dispatch(clearSuccess());
    }
  }, [error, success, toast, dispatch]);

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      await dispatch(deleteCustomer(customerToDelete._id));
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterBranch("");
    setFilterType("");
  };

  // Function to get branch name by id
  const getBranchName = (branchId) => {
    if (!branchId) return "-";
    
    // Make sure branches is available and not empty
    if (!branches || !Array.isArray(branches)) return "-";
    
    // Handle case where branchId is an object
    const searchId = typeof branchId === 'object' && branchId?._id 
      ? branchId._id.toString() 
      : branchId?.toString();
    
    console.log("Looking for branch with ID:", searchId);
    console.log("Available branches:", branches.map(b => ({ id: b._id, name: b.namaCabang })));
    
    // Try to find the branch with more flexible comparison
    const branch = branches.find(
      (branch) => String(branch._id) === searchId
    );
    
    return branch ? branch.namaCabang : "-";
  };

  // Get customer type badge
  const getCustomerTypeBadge = (type) => {
    let variant, icon;

    switch (type) {
      case "pengirim":
        variant = "success";
        icon = <Plus className="h-3 w-3 mr-1" />;
        break;
      case "penerima":
        variant = "info";
        icon = <MapPin className="h-3 w-3 mr-1" />;
        break;
      case "keduanya":
        variant = "warning";
        icon = <Plus className="h-3 w-3 mr-1" />;
        break;
      default:
        variant = "secondary";
        icon = null;
    }

    const labels = {
      pengirim: "Pengirim",
      penerima: "Penerima",
      keduanya: "Pengirim & Penerima",
    };

    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {labels[type] || type}
      </Badge>
    );
  };

  // Filter customers based on search query, branch filter, and type filter
  // Filter customers based on search query, branch filter, and type filter
  const filteredCustomers = (customers || []).filter((customer) => {
    const matchesSearch =
      customer.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.telepon?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.perusahaan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.alamat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.kota?.toLowerCase().includes(searchQuery.toLowerCase());
  
    // Handle branch ID comparison more flexibly
    const matchesBranch = filterBranch === "" || filterBranch === "all"
      ? true
      : String(customer.cabangId) === String(filterBranch) || 
        (typeof customer.cabangId === 'object' && 
         String(customer.cabangId?._id) === String(filterBranch));
      
    const matchesType = filterType === "" || filterType === "all" 
      ? true 
      : customer.tipe === filterType;
  
    return matchesSearch && matchesBranch && matchesType;
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
                  Manajemen Pelanggan
                </h1>
                <p className="text-muted-foreground">
                  Kelola data pelanggan pengirim dan penerima
                </p>
              </div>
              <Link href="/pelanggan/tambah">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Tambah Pelanggan
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Cari nama, telepon, email, perusahaan, alamat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="w-full md:w-64">
                  <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter cabang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Cabang</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.namaCabang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-48">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      <SelectItem value="pengirim">Pengirim</SelectItem>
                      <SelectItem value="penerima">Penerima</SelectItem>
                      <SelectItem value="keduanya">
                        Pengirim & Penerima
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchQuery || filterBranch || filterType) && (
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
                        <TableHead>Nama</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Perusahaan</TableHead>
                        <TableHead>Kontak</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead>Cabang</TableHead>
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
                      ) : filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            {searchQuery || filterBranch || filterType ? (
                              <div>
                                Tidak ada pelanggan yang cocok dengan filter
                                yang dipilih
                              </div>
                            ) : (
                              <div>Belum ada data pelanggan</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <TableRow key={customer._id}>
                            <TableCell>
                              <div className="font-medium">{customer.nama}</div>
                            </TableCell>
                            <TableCell>
                              {getCustomerTypeBadge(customer.tipe)}
                            </TableCell>
                            <TableCell>
                              {customer.perusahaan ? (
                                <div className="flex items-center">
                                  <Building className="h-4 w-4 text-gray-500 mr-1" />
                                  <span>{customer.perusahaan}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {customer.telepon && (
                                  <div className="flex items-center text-sm">
                                    <Phone className="h-3 w-3 text-gray-500 mr-1" />
                                    <span>{customer.telepon}</span>
                                  </div>
                                )}
                                {customer.email && (
                                  <div className="flex items-center text-sm">
                                    <Mail className="h-3 w-3 text-gray-500 mr-1" />
                                    <span>{customer.email}</span>
                                  </div>
                                )}
                                {!customer.telepon && !customer.email && (
                                  <span className="text-gray-500">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-500 mr-1 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <div className="line-clamp-1">
                                    {customer.alamat || "-"}
                                  </div>
                                  <div className="text-gray-500">
                                    {[customer.kota, customer.provinsi]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getBranchName(customer.cabangId)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/pelanggan/${customer._id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(customer)}
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
              Tindakan ini akan menghapus pelanggan &quot;
              {customerToDelete?.nama}&quot; dan tidak dapat dibatalkan.
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
