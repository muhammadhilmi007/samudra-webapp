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
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export default function DivisiPage() {
  const dispatch = useDispatch()
  const { divisions = [], loading, error, success } = useSelector((state) => state.divisi)
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [divisionToDelete, setDivisionToDelete] = useState(null)
  
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
  
  // Filter divisions based on search query
  const filteredDivisions = divisions.filter(division =>
    division.namaDivisi.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
      
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Cari divisi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>Nama Divisi</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
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
                  <TableRow key={division._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{division.namaDivisi}</TableCell>
                    <TableCell>{formatDate(division.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/divisi/${division._id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteClick(division)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
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