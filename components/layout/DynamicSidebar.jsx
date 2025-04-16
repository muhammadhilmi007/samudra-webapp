"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Menu as MenuIcon,
  X,
  BarChart3,
  Building,
  Building2,
  Truck,
  Package,
  Users,
  CircleDollarSign,
  BoxesIcon,
  FileText,
  ReceiptText,
  ArrowLeftRight,
  RotateCcw,
  CreditCard,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";

// Import all Lucide icons dynamically
import * as LucideIcons from "lucide-react";

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
    return null; // Avoid rendering before useEffect runs
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-samudra-100 flex items-center justify-center">
          <span className="text-samudra-700 font-medium">{initial}</span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
};

const DynamicSidebar = ({ isOpen, onClose, user }) => {
  const pathname = usePathname();
  const { accessibleMenus } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [usingDynamicMenus, setUsingDynamicMenus] = useState(false);

  // Check if we should use dynamic menus or static ones
  useEffect(() => {
    setUsingDynamicMenus(accessibleMenus && accessibleMenus.length > 0);
  }, [accessibleMenus]);

  // Expand parent menus of the active menu on initial load for dynamic menus
  useEffect(() => {
    if (usingDynamicMenus) {
      const newExpandedState = {};

      // Recursive function to find the active menu and expand its parents
      const findActiveMenu = (menus, path = "") => {
        for (const menu of menus) {
          if (pathname.startsWith(menu.path)) {
            // This menu or its child is active, expand it
            newExpandedState[menu._id] = true;
          }

          // Check children recursively
          if (menu.children && menu.children.length > 0) {
            findActiveMenu(menu.children, path);
          }
        }
      };

      findActiveMenu(accessibleMenus);
      setExpandedMenus(newExpandedState);
    } else {
      // For static menus, expand based on current path
      const sections = {
        master: pathname.match(
          /^\/(divisi|cabang|pegawai|pelanggan|kendaraan|antrian-kendaraan)/
        ),
        operasional: pathname.match(/^\/(pengambilan|stt|muat|lansir|retur)/),
        keuangan: pathname.match(/^\/(penagihan|keuangan|aset)/),
        laporan: pathname.match(/^\/laporan/),
      };

      const newExpandedState = {};
      Object.keys(sections).forEach((key) => {
        if (sections[key]) {
          newExpandedState[key] = true;
        }
      });

      setExpandedMenus(newExpandedState);
    }
  }, [pathname, accessibleMenus, usingDynamicMenus]);

  // Toggle menu expansion
  const toggleMenuExpand = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  // Get Lucide icon component by name
  const getIconComponent = (iconName) => {
    if (!iconName) return LucideIcons.Circle;

    const Icon =
      LucideIcons[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
    return Icon || LucideIcons.Circle;
  };

  // Check if current route matches with nav item
  const isActive = (path) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    return pathname.startsWith(path) && path !== "/dashboard";
  };

  // Render dynamic menu items recursively
  const renderDynamicMenuItems = (menus, level = 0) => {
    return menus.map((menu) => {
      const isActive = pathname === menu.path;
      const hasChildren = menu.children && menu.children.length > 0;
      const isExpanded = expandedMenus[menu._id];
      const Icon = getIconComponent(menu.icon);

      return (
        <div key={menu._id} className="mb-1">
          {hasChildren ? (
            <div className="flex flex-col">
              <button
                onClick={() => toggleMenuExpand(menu._id)}
                className={cn(
                  "flex items-center px-4 py-2 text-sm rounded-md w-full",
                  "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                  isActive &&
                    "bg-samudra-100 text-samudra-900 dark:bg-gray-800 dark:text-gray-100"
                )}
                style={{ paddingLeft: `${level * 12 + 16}px` }}
              >
                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="flex-grow truncate">{menu.name}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-1">
                  {renderDynamicMenuItems(menu.children, level + 1)}
                </div>
              )}
            </div>
          ) : (
            <Link
              href={menu.path}
              className={cn(
                "flex items-center px-4 py-2 text-sm rounded-md w-full",
                "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                isActive &&
                  "bg-samudra-100 text-samudra-900 dark:bg-gray-800 dark:text-gray-100"
              )}
              style={{ paddingLeft: `${level * 12 + 16}px` }}
            >
              <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{menu.name}</span>
            </Link>
          )}
        </div>
      );
    });
  };

  // Navigation item component for static menu
  const NavItem = ({ href, icon: Icon, title, active, onClick, children }) => {
    return (
      <div className="mb-1">
        <Link
          href={href}
          onClick={onClick}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            active
              ? "bg-samudra-100 text-samudra-900 dark:bg-gray-800 dark:text-gray-100"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          )}
        >
          {Icon && <Icon className="h-5 w-5" />}
          <span>{title}</span>
          {children && <ChevronDown className="ml-auto h-4 w-4" />}
        </Link>
      </div>
    );
  };

  // Render static menu sections
  const renderStaticMenu = () => {
    return (
      <div className="space-y-1">
        <NavItem
          href="/dashboard"
          icon={BarChart3}
          title="Dashboard"
          active={isActive("/dashboard")}
        />

        {/* Master Data */}
        <div className="mb-4">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-4 mb-2">
            Master Data
          </h3>
          <div className="space-y-1">
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
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-4 mb-2">
            Operasional
          </h3>
          <div className="space-y-1">
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
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-4 mb-2">
            Keuangan
          </h3>
          <div className="space-y-1">
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
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-4 mb-2">
            Laporan
          </h3>
          <div className="space-y-1">
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
    );
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-gray-900 shadow-lg transition-transform lg:relative lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-samudra-600 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-medium dark:text-white">
              Samudra ERP
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <X className="h-6 w-6 dark:text-gray-300" />
          </button>
        </div>

        {/* Sidebar user info */}
        <UserInfo user={user} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {usingDynamicMenus ? (
            // Render dynamic menus if available
            accessibleMenus && accessibleMenus.length > 0 ? (
              renderDynamicMenuItems(accessibleMenus)
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                Loading menu...
              </div>
            )
          ) : (
            // Otherwise render static menu structure
            renderStaticMenu()
          )}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t p-4 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Samudra ERP v1.0
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicSidebar;
