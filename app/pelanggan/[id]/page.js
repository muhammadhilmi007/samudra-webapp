"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerById,
  fetchCustomerSTTs,
  fetchCustomerPickups,
  clearCustomerState,
} from "@/lib/redux/slices/customerSlice";
import { fetchBranches } from "@/lib/redux/slices/cabangSlice";
import CustomerForm from "@/components/forms/customer-form";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  Loader2,
  Package,
  Truck,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function PelangganDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("detail");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data - in a real app, this would come from your auth system
  const user = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@example.com",
  };

  const { currentCustomer, loading, customerSTTs, customerPickups } =
    useSelector((state) => state.customer);
  const { branches } = useSelector((state) => state.cabang);

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id));
      dispatch(fetchBranches());
      dispatch(fetchCustomerSTTs(id));
      dispatch(fetchCustomerPickups(id));
    }
    dispatch(clearCustomerState())
  }, [dispatch, id]);

  const breadcrumbItems = [
    { title: "Dashboard", link: "/dashboard" },
    { title: "Pelanggan", link: "/pelanggan" },
    {
      title: currentCustomer?.nama || "Detail Pelanggan",
      link: `/pelanggan/${id}`,
      active: true,
    },
  ];

  // Function to get branch name by id
  const getBranchName = (branchId) => {
    if (!branchId) return "-";
    
    // Make sure branches is available and not empty
    if (!branches || !Array.isArray(branches)) return "-";
    
    // Handle case where branchId is an object
    const searchId = typeof branchId === 'object' && branchId?._id 
      ? branchId._id.toString() 
      : branchId?.toString();
    
    // Try to find the branch with more flexible comparison
    const branch = branches.find(
      (branch) => String(branch._id) === searchId
    );
    
    return branch ? branch.namaCabang : "-";
  };

  // Mock logout function
  const handleLogout = () => {
    console.log("User logged out");
    // Implement actual logout logic here
  };

  // Function to get customer type display name
  const getCustomerType = (type) => {
    const types = {
      pengirim: "Pengirim",
      penerima: "Penerima",
      keduanya: "Pengirim & Penerima",
    };
    return types[type] || type;
  };

  // Function to get STT status badge
  const getSTTStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Pending", variant: "warning" },
      MUAT: { label: "Dimuat", variant: "info" },
      TRANSIT: { label: "Transit", variant: "info" },
      LANSIR: { label: "Lansir", variant: "warning" },
      TERKIRIM: { label: "Terkirim", variant: "success" },
      RETURN: { label: "Retur", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "secondary",
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Function to get pickup status badge
  const getPickupStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: "Pending", variant: "warning" },
      FINISH: { label: "Selesai", variant: "success" },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      variant: "secondary",
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading && !currentCustomer) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentCustomer) {
    return (
      <div className="rounded-lg border border-destructive/50 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Pelanggan tidak ditemukan
        </h2>
        <p className="text-muted-foreground mb-6">
          Data pelanggan dengan ID tersebut tidak ditemukan atau telah dihapus.
        </p>
        <Button onClick={() => router.push("/pelanggan")}>
          Kembali ke Daftar Pelanggan
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuButtonClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="mx-auto max-w-1xl space-y-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex flex-col lg:flex-row justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {currentCustomer.nama}
                </h1>
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="mr-2">
                    {getCustomerType(currentCustomer.tipe)}
                  </Badge>
                  <span className="text-muted-foreground">
                    Cabang: {getBranchName(currentCustomer.cabangId)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/pelanggan")}
                >
                  Kembali
                </Button>
                <Button onClick={() => setActiveTab("edit")}>
                  Edit Pelanggan
                </Button>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="detail">Detail Pelanggan</TabsTrigger>
                <TabsTrigger value="transaksi">Riwayat Transaksi</TabsTrigger>
                <TabsTrigger value="edit">Edit Pelanggan</TabsTrigger>
              </TabsList>

              <TabsContent value="detail" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Informasi Dasar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Nama
                          </h3>
                          <p className="text-base">{currentCustomer.nama}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Tipe Pelanggan
                          </h3>
                          <p className="text-base">
                            {getCustomerType(currentCustomer.tipe)}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Cabang
                          </h3>
                          <p className="text-base">
                            {getBranchName(currentCustomer.cabangId)}
                          </p>
                        </div>

                        {currentCustomer.perusahaan && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Perusahaan
                            </h3>
                            <div className="flex items-center">
                              <Building className="h-4 w-4 text-muted-foreground mr-1" />
                              <p className="text-base">
                                {currentCustomer.perusahaan}
                              </p>
                            </div>
                          </div>
                        )}

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Tanggal Registrasi
                          </h3>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                            <p className="text-base">
                              {formatDate(currentCustomer.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Alamat & Kontak
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Alamat Lengkap
                        </h3>
                        <p className="text-base">{currentCustomer.alamat}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {[
                            currentCustomer.kelurahan,
                            currentCustomer.kecamatan,
                            currentCustomer.kota,
                            currentCustomer.provinsi,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Kontak
                        </h3>
                        <div className="space-y-2 mt-1">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                            <p className="text-base">
                              {currentCustomer.telepon}
                            </p>
                          </div>

                          {currentCustomer.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                              <p className="text-base">
                                {currentCustomer.email}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transaksi" className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Pengiriman (STT)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!customerSTTs || !customerSTTs[id] ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium mb-1">
                          Belum ada data pengiriman
                        </h3>
                        <p className="text-muted-foreground">
                          Pelanggan ini belum memiliki riwayat pengiriman
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>No. STT</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Tujuan</TableHead>
                              <TableHead>Nama Barang</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customerSTTs[id].map((stt) => (
                              <TableRow key={stt._id}>
                                <TableCell className="font-medium">
                                  {stt.noSTT}
                                </TableCell>
                                <TableCell>
                                  {formatDate(stt.createdAt)}
                                </TableCell>
                                <TableCell>
                                  {getBranchName(stt.cabangTujuanId)}
                                </TableCell>
                                <TableCell>{stt.namaBarang}</TableCell>
                                <TableCell>
                                  {getSTTStatusBadge(stt.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Link href={`/stt/${stt._id}`}>
                                    <Button variant="outline" size="sm">
                                      Detail
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="h-5 w-5 mr-2" />
                      Permintaan Pengambilan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!customerPickups || !customerPickups[id] ? (
                      <div className="text-center py-8">
                        <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium mb-1">
                          Belum ada permintaan pengambilan
                        </h3>
                        <p className="text-muted-foreground">
                          Pelanggan ini belum pernah melakukan permintaan
                          pengambilan barang
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Alamat Pengambilan</TableHead>
                              <TableHead>Tujuan</TableHead>
                              <TableHead>Jumlah Colly</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customerPickups[id].map((pickup) => (
                              <TableRow key={pickup._id}>
                                <TableCell>
                                  {formatDateTime(pickup.tanggal)}
                                </TableCell>
                                <TableCell>
                                  {pickup.alamatPengambilan}
                                </TableCell>
                                <TableCell>{pickup.tujuan}</TableCell>
                                <TableCell>{pickup.jumlahColly}</TableCell>
                                <TableCell>
                                  {getPickupStatusBadge(pickup.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Link
                                    href={`/pengambilan/request/${pickup._id}`}
                                  >
                                    <Button variant="outline" size="sm">
                                      Detail
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="edit">
                <div className="pt-4">
                  <CustomerForm customerId={id} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
