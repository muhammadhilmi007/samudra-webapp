// app/pengambilan/edit/[id]/page.js - Edit page for pickup items
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import {
  fetchPickupById,
  updatePickup,
} from "@/lib/redux/slices/pickupSlice";
import { fetchCustomersByBranch } from "@/lib/redux/slices/customerSlice";
import { fetchVehiclesByBranch } from "@/lib/redux/slices/vehicleSlice";
import { fetchEmployeesByBranch } from "@/lib/redux/slices/pegawaiSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useToast } from "@/lib/hooks/use-toast";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { PickupForm } from "@/components/forms/pickup-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditPickupPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get data from Redux store
  const { currentUser } = useSelector((state) => state.auth);
  const { pickup, loading } = useSelector((state) => state.pickup);
  const { customers } = useSelector((state) => state.customer);
  const { vehicles } = useSelector((state) => state.vehicle);
  const { employeesByBranch, loading: loadingEmployees } = useSelector((state) => state.pegawai);
  
  // Prepare data for the form
  const senders = customers.filter(
    (customer) => customer.tipe === "pengirim" || customer.tipe === "keduanya"
  );
  
  const lansirVehicles = vehicles.filter(
    (vehicle) => vehicle.tipe === "lansir"
  );
  
  const employees = currentUser?.cabangId
    ? employeesByBranch[currentUser.cabangId] || []
    : [];
    
  const drivers = employees.filter((employee) => {
    if (!employee) return false;
    const isAdmin = ["admin", "administrator"].includes((employee.role || employee.jabatan || "").toLowerCase());
    const isDriver = (employee.jabatan || "").toLowerCase().includes("supir") || 
                    (employee.jabatan || "").toLowerCase().includes("driver") ||
                    (employee.role || "").toLowerCase().includes("driver") ||
                    (employee.role || "").toLowerCase().includes("supir") ||
                    (employee.tipe || "").toLowerCase().includes("supir");
    return isAdmin || isDriver;
  });

  const helpers = employees.filter(
    (employee) =>
      (employee?.jabatan || "").toLowerCase().includes("kenek") ||
      (employee?.role || "").toLowerCase().includes("helper")
  );

  // Mock user data (replace with actual auth logic in production)
  const user = useSelector((state) => state.auth.currentUser) || {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com",
  };

  // Load pickup data and reference data
  useEffect(() => {
    if (id) {
      dispatch(fetchPickupById(id));
    }
    
    // If user is logged in and has a branch ID, fetch required data
    if (currentUser?.cabangId) {
      dispatch(fetchCustomersByBranch(currentUser.cabangId));
      dispatch(fetchVehiclesByBranch(currentUser.cabangId));
      dispatch(fetchEmployeesByBranch(currentUser.cabangId));
    }
  }, [dispatch, id, currentUser]);

  // Handle form submission
  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Add user data if available
      if (currentUser) {
        data.userId = currentUser._id;
      }

      await dispatch(updatePickup({ id, data })).unwrap();

      toast({
        title: "Berhasil",
        description: "Pengambilan berhasil diperbarui",
      });
      
      router.push(`/pengambilan/${id}`);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memperbarui pengambilan");
      toast({
        title: "Gagal",
        description: err.message || "Terjadi kesalahan saat memperbarui pengambilan",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
    { label: "Detail Pengambilan", href: `/pengambilan/${id}` },
    { label: "Edit Pengambilan", href: `/pengambilan/edit/${id}` },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuButtonClick={() => setSidebarOpen(true)} user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Breadcrumbs items={breadcrumbItems} />
              <div className="flex items-center gap-2 my-4">
                <Button variant="outline" size="icon" asChild disabled>
                  <span><ArrowLeft className="h-4 w-4" /></span>
                </Button>
                <Skeleton className="h-8 w-48" />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle><Skeleton className="h-6 w-36" /></CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state if pickup not found
  if (!pickup && !loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuButtonClick={() => setSidebarOpen(true)} user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Breadcrumbs items={breadcrumbItems} />
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pengambilan tidak ditemukan atau telah dihapus.
                </AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <Button asChild variant="outline">
                  <Link href="/pengambilan">Kembali ke Daftar Pengambilan</Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
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
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex justify-between items-center my-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/pengambilan/${id}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold">
                  Edit Pengambilan {pickup?.noPengambilan}
                </h1>
              </div>
            </div>

            {/* Form Display Restrictions */}
            {pickup?.status === "CANCELLED" && (
              <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  Pengambilan ini telah dibatalkan. Aktifkan kembali untuk mengubah data.
                </AlertDescription>
              </Alert>
            )}

            {pickup?.status === "SELESAI" && (
              <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  Pengambilan ini telah selesai. Perubahan terbatas pada catatan.
                </AlertDescription>
              </Alert>
            )}

            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Form Edit Pengambilan</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PickupForm
                  onSubmit={handleSubmit}
                  initialData={pickup}
                  isLoading={submitting}
                  senders={senders}
                  vehicles={lansirVehicles}
                  drivers={drivers}
                  helpers={helpers}
                  error={error}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}