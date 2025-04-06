"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// User info component
const UserInfo = ({ user }) => {
  const [initial, setInitial] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    setInitial(user?.nama ? user.nama.charAt(0) : "-");
    setDisplayName(user?.nama || "Guest");
    setRole(user?.jabatan || "-");
  }, [user]);

  if (initial === null) {
    return null; // Hindari render sebelum useEffect dijalankan
  }

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-samudra-100 flex items-center justify-center">
          <span className="text-samudra-700 font-medium">{initial}</span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-700">{displayName}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
};

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building,
  Building2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Truck,
  Package,
  Users,
  CircleDollarSign,
  BoxesIcon,
  FileText,
  ReceiptText,
  ArrowLeftRight,
  RotateCcw,
  X,
} from "lucide-react";

// Navigation item component
const NavItem = ({ href, icon: Icon, title, active, onClick, children }) => {
  return (
    <div className="mb-1">
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-samudra-100 text-samudra-900"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        {Icon && <Icon className="h-5 w-5" />}
        <span>{title}</span>
        {children && <ChevronDown className="ml-auto h-4 w-4" />}
      </Link>
    </div>
  );
};

// Sidebar component
export default function Sidebar({ isOpen, onClose, user }) {
  const pathname = usePathname();

  // Check if current route matches with nav item
  const isActive = (path) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }

    return pathname.startsWith(path) && path !== "/dashboard";
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform lg:relative lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-samudra-600 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-medium">Samudra ERP</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar user info */}
        <UserInfo user={user} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <NavItem
              href="/dashboard"
              icon={BarChart3}
              title="Dashboard"
              active={isActive("/dashboard")}
            />

            {/* Master Data */}
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Master Data
              </h3>
              <div className="mt-3 space-y-1">
                <NavItem
                  href="/divisi"
                  icon={Building}
                  title="Divisi"
                  active={isActive("/divisi")}
                />
                <NavItem
                  href="/cabang"
                  icon={Building2}
                  title="Cabang"
                  active={isActive("/cabang")}
                />
                <NavItem
                  href="/pegawai"
                  icon={Users}
                  title="Pegawai"
                  active={isActive("/pegawai")}
                />
                <NavItem
                  href="/pelanggan"
                  icon={Users}
                  title="Pelanggan"
                  active={isActive("/pelanggan")}
                />
                <NavItem
                  href="/kendaraan"
                  icon={Truck}
                  title="Kendaraan"
                  active={isActive("/kendaraan")}
                />
                <NavItem
                  href="/antrian-kendaraan"
                  icon={Truck}
                  title="Antrian Kendaraan"
                  active={isActive("/antrian-kendaraan")}
                />
              </div>
            </div>

            {/* Operasional */}
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Operasional
              </h3>
              <div className="mt-3 space-y-1">
                <NavItem
                  href="/pengambilan"
                  icon={Package}
                  title="Pengambilan"
                  active={isActive("/pengambilan")}
                />
                <NavItem
                  href="/stt"
                  icon={FileText}
                  title="STT"
                  active={isActive("/stt")}
                />
                <NavItem
                  href="/muat"
                  icon={BoxesIcon}
                  title="Muat & Transit"
                  active={isActive("/muat")}
                />
                <NavItem
                  href="/lansir"
                  icon={Truck}
                  title="Lansir"
                  active={isActive("/lansir")}
                />
                <NavItem
                  href="/retur"
                  icon={RotateCcw}
                  title="Retur"
                  active={isActive("/retur")}
                />
              </div>
            </div>

            {/* Keuangan */}
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Keuangan
              </h3>
              <div className="mt-3 space-y-1">
                <NavItem
                  href="/penagihan"
                  icon={ReceiptText}
                  title="Penagihan"
                  active={isActive("/penagihan")}
                />
                <NavItem
                  href="/keuangan/kas"
                  icon={CreditCard}
                  title="Kas & Bank"
                  active={isActive("/keuangan/kas")}
                />
                <NavItem
                  href="/keuangan/jurnal"
                  icon={ClipboardList}
                  title="Jurnal Umum"
                  active={isActive("/keuangan/jurnal")}
                />
                <NavItem
                  href="/keuangan/akun"
                  icon={CircleDollarSign}
                  title="Akun"
                  active={isActive("/keuangan/akun")}
                />
                <NavItem
                  href="/aset"
                  icon={Building}
                  title="Aset"
                  active={isActive("/aset")}
                />
              </div>
            </div>

            {/* Laporan */}
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Laporan
              </h3>
              <div className="mt-3 space-y-1">
                <NavItem
                  href="/laporan/penjualan"
                  icon={ArrowLeftRight}
                  title="Laporan Penjualan"
                  active={isActive("/laporan/penjualan")}
                />
                <NavItem
                  href="/laporan/operasional"
                  icon={Truck}
                  title="Laporan Operasional"
                  active={isActive("/laporan/operasional")}
                />
                <NavItem
                  href="/laporan/keuangan"
                  icon={CircleDollarSign}
                  title="Laporan Keuangan"
                  active={isActive("/laporan/keuangan")}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t p-4">
          <div className="text-xs text-gray-500 text-center">
            Samudra ERP v1.0
          </div>
        </div>
      </div>
    </>
  );
}
