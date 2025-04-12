"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  Users,
  BarChart,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Users", path: "/dashboard/users" },
    { icon: BarChart, label: "Analytics", path: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            App Name
          </h1>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100
                    dark:text-gray-300 dark:hover:bg-gray-800 transition-colors`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100
              dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const TopBar = () => {
  return (
    <header className="h-16 fixed right-0 left-64 top-0 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-end h-full px-6">
        {/* Add user profile, notifications, etc. here */}
      </div>
    </header>
  );
};

export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <TopBar />
      <main className="ml-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
