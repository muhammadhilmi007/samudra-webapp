// app/divisi/tambah/page.js
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { createDivision, clearError, clearSuccess } from '@/lib/redux/slices/divisiSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/lib/hooks/use-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'

export default function TambahDivisiPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { loading, error, success } = useSelector((state) => state.divisi)
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Mock user data - in a real app, this would come from your auth system
  const user = {
    nama: 'Admin User',
    jabatan: 'Administrator',
    email: 'admin@example.com'
  }
  
  const [formData, setFormData] = useState({
    namaDivisi: ''
  })
  
  const [formErrors, setFormErrors] = useState({})
  
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
      dispatch(clearError())
    }
    
    if (success) {
      toast({
        title: 'Berhasil',
        description: 'Divisi berhasil dibuat',
        variant: 'success',
      })
      dispatch(clearSuccess())
      router.push('/divisi')
    }
  }, [error, success, toast, dispatch, router])
  
  const validateForm = () => {
    const errors = {}
    if (!formData.namaDivisi.trim()) {
      errors.namaDivisi = 'Nama divisi harus diisi'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error on this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      })
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      await dispatch(createDivision(formData))
    }
  }
  
  // Mock logout function
  const handleLogout = () => {
    console.log('User logged out')
    // Implement actual logout logic here
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
            <div className="flex items-center">
              <Link href="/divisi" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">Tambah Divisi</h1>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Formulir Tambah Divisi</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="namaDivisi" 
                      className={formErrors.namaDivisi ? 'text-red-500' : ''}
                    >
                      Nama Divisi
                    </Label>
                    <Input
                      id="namaDivisi"
                      name="namaDivisi"
                      placeholder="Masukkan nama divisi"
                      value={formData.namaDivisi}
                      onChange={handleInputChange}
                      className={formErrors.namaDivisi ? 'border-red-500' : ''}
                    />
                    {formErrors.namaDivisi && (
                      <p className="text-sm text-red-500">{formErrors.namaDivisi}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="/divisi">
                    <Button variant="outline" type="button">Batal</Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
