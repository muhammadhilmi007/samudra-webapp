"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { getMe, logout } from '@/lib/redux/slices/authSlice'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  useEffect(() => {
    // Check auth status when component mounts
    const checkAuth = async () => {
      if (!isAuthenticated) {
        const token = localStorage.getItem('token')
        
        if (!token) {
          router.push('/login')
          return
        }
        
        // Try to get user data with the token
        try {
          const resultAction = await dispatch(getMe())
          if (getMe.rejected.match(resultAction)) {
            // Token is invalid, redirect to login
            router.push('/login')
          }
        } catch (error) {
          router.push('/login')
        }
      }
    }
    
    checkAuth()
  }, [isAuthenticated, dispatch, router])
  
  const handleLogout = async () => {
    await dispatch(logout())
    router.push('/login')
  }
  
  // Show loading state while checking authentication
  if (loading && !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-samudra-600"></div>
      </div>
    )
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar component */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user}
      />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header component */}
        <Header 
          onMenuButtonClick={() => setSidebarOpen(true)} 
          user={user}
          onLogout={handleLogout}
        />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}