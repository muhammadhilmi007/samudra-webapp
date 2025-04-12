// app/pengambilan/tambah/page.js - Improved version
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createPickup,
  fetchPickupRequestById,
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
  CardFooter,
} from "@/components/ui/card";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useToast } from "@/lib/hooks/use-toast";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { hasAccess } from "@/lib/auth";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { PickupForm } from "@/components/forms/pickup-form";

export default function AddPickupPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [fromRequest, setFromRequest] = useState(false);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get data from Redux store
  const { pickupRequest, currentUser } = useSelector((state) => state.auth);
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

  // Get authenticated user data from Redux store
  const { user, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // If user is logged in and has a branch ID, fetch required data
    if (currentUser?.cabangId) {
      dispatch(fetchCustomersByBranch(currentUser.cabangId));
      dispatch(fetchVehiclesByBranch(currentUser.cabangId));
      dispatch(fetchEmployeesByBranch(currentUser.cabangId));
    }

    // If requestId exists, fetch pickup request data
    if (requestId) {
      const loadRequestData = async () => {
        try {
          const response = await dispatch(fetchPickupRequestById(requestId)).unwrap();
          if (response) {
            setFromRequest(true);
          }
        } catch (err) {
          setError(err.message || "Gagal memuat data request pengambilan");
          toast({
            title: "Error",
            description: err.message || "Gagal memuat data request pengambilan",
            variant: "destructive",
          });
        }
      };
      
      loadRequestData();
    }
  }, [dispatch, currentUser, requestId, toast]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Add user and branch data if available
      if (currentUser) {
        data.userId = currentUser._id;
        data.cabangId = currentUser.cabangId;
      }

      // Add request ID if from a request
      if (requestId) {
        data.requestId = requestId;
      }

      // Ensure tanggal field exists
      if (!data.tanggal) {
        data.tanggal = new Date().toISOString();
      }

      const result = await dispatch(createPickup(data)).unwrap();

      toast({
        title: "Berhasil",
        description: `Pengambilan dengan nomor ${
          result.noPengambilan || ""
        } berhasil dibuat`,
      });
      
      router.push("/pengambilan");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat membuat pengambilan");
      toast({
        title: "Gagal",
        description: err.message || "Terjadi kesalahan saat membuat pengambilan",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pengambilan", href: "/pengambilan" },
    { label: "Tambah Pengambilan", href: "/pengambilan/tambah" },
  ];

  // Handle authentication loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuButtonClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-7xl flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-2 text-sm text-gray-600">Memuat data pengguna...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated && !authLoading) {
    // Use client-side redirect
    useEffect(() => {
      router.push('/login');
    }, [router]);
    
    // Return the same layout structure as other conditions to prevent hydration mismatch
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuButtonClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-7xl flex items-center justify-center h-full">
              <div className="text-center">
                <p className="mt-2 text-sm text-gray-600">Redirecting to login...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Check if user has permission to create pickups
  const canCreatePickup = hasAccess("pickups", "create");
  
  if (!canCreatePickup) {
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
                  Anda tidak memiliki izin untuk membuat pengambilan baru.
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
          <div className="mx-auto max-w-lxl space-y-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex justify-between items-center my-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/pengambilan">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold">
                  Tambah Pengambilan Barang
                </h1>
              </div>
            </div>

            {fromRequest && (
              <Alert variant="info" className="bg-blue-50 border-blue-200 text-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Data diisi otomatis dari request pengambilan.
                </AlertDescription>
              </Alert>
            )}

            <Card className="shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Form Pengambilan Barang</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <PickupForm
                  onSubmit={handleSubmit}
                  initialData={pickupRequest}
                  isLoading={submitting}
                  senders={senders}
                  vehicles={lansirVehicles}
                  drivers={drivers}
                  helpers={helpers}
                  fromRequest={fromRequest}
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

