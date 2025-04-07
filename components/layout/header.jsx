"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Bell, 
  Menu, 
  Search, 
  User, 
  LogOut, 
  Settings,
  HelpCircle,
  BarChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'

export default function Header({ onMenuButtonClick, user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)

  // Add useEffect to handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
    // Implement search functionality
  }

  const notificationCount = 3 // Example, should come from API/state

  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={onMenuButtonClick}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar */}
          <div className="ml-4 hidden lg:block">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-64">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari STT, pelanggan..."
                  className="block w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-samudra-500 focus:outline-none focus:ring-1 focus:ring-samudra-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="ml-2">
                Cari
              </Button>
            </form>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Mobile search button */}
          <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center rounded-full text-sm focus:outline-none">
                <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-samudra-100">
                  {mounted && user?.fotoProfil ? (
                    <img
                      src={user.fotoProfil}
                      alt={user?.nama || 'User'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-samudra-100 text-samudra-700">
                      {getInitials(user?.nama || 'User')}
                    </div>
                  )}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.nama || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Bantuan</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}