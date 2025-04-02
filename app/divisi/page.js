"use client"

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Link from 'next/link'
import { 
  fetchDivisions, 
  deleteDivision, 
  clearError, 
  clearSuccess 
} from '@/lib/redux/slices/divisiSlice'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'

export default function DivisiPage() {
  const dispatch = useDispatch()
  const { divisions = [], loading, error, success } = useSelector((state) => state.divisi)
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [divisionToDelete, setDivisionToDelete] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Mock user data (replace with actual auth logic)
  const mockUser = {
    nama: "Admin User",
    jabatan: "Administrator",
    email: "admin@samudra-erp.com"
  }
  
  useEffect(() => {
    dispatch(fetchDivisions())
  }, [dispatch])
  
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
        description: 'Operasi divisi berhasil dilakukan',
        variant: 'success',
      })
      dispatch(clearSuccess())
    }
  }, [error, success, toast, dispatch])
  
  const handleDeleteClick = (division) => {
    setDivisionToDelete(division)
    setDeleteDialogOpen(true)
  }
  
  const handleConfirmDelete = async () => {
    if (divisionToDelete) {
      await dispatch(deleteDivision(divisionToDelete._id))
      setDeleteDialogOpen(false)
      setDivisionToDelete(null)
    }
  }
  
  const handleLogout = () => {
    // Implement logout functionality
    console.log('Logging out...')
  }
  
  // Filter divisions based on search query
  const filteredDivisions = divisions.filter(division =>
    division.namaDivisi?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
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
                <h1 className="text-2xl font-bold tracking-tight">Manajemen Divisi</h1>
                <p className="text-muted-foreground">
                  Kelola data divisi perusahaan
                </p>
              </div>
              <Link href="/divisi/tambah">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Divisi
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari divisi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 max-w-sm"
                />
              </div>
              
              <div className="bg-white rounded-md border shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">No.</TableHead>
                        <TableHead>Nama Divisi</TableHead>
                        <TableHead className="hidden md:table-cell">Tanggal Dibuat</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                              <span className="ml-2">Memuat data...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredDivisions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            {searchQuery ? (
                              <div>Tidak ada divisi yang cocok dengan pencarian "{searchQuery}"</div>
                            ) : (
                              <div>Belum ada data divisi</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDivisions.map((division, index) => (
                          <TableRow key={division._id} className="group">
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{division.namaDivisi}</TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(division.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                <Link href={`/divisi/${division._id}`}>
                                  <Button variant="outline" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                </Link>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleDeleteClick(division)}
                                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
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
              Tindakan ini akan menghapus divisi &quot;{divisionToDelete?.namaDivisi}&quot; dan tidak dapat dibatalkan.
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
  )
}
