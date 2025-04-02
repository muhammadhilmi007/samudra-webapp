"use client"

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Link from 'next/link'
import { 
  fetchEmployees, 
  deleteEmployee, 
  clearError, 
  clearSuccess 
} from '@/lib/redux/slices/pegawaiSlice'
import { fetchBranches } from '@/lib/redux/slices/cabangSlice'
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
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Search, 
  X,
  FilterIcon,
  UserPlus
} from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'
import { formatDate, getInitials } from '@/lib/utils'
import { Badge } from "@/components/ui/badge"

export default function PegawaiPage() {
  const dispatch = useDispatch()
  const { employees, loading, error, success } = useSelector((state) => state.pegawai)
  const { branches } = useSelector((state) => state.cabang)
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  
  useEffect(() => {
    dispatch(fetchEmployees())
    dispatch(fetchBranches())
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
        description: 'Operasi pegawai berhasil dilakukan',
        variant: 'success',
      })
      dispatch(clearSuccess())
    }
  }, [error, success, toast, dispatch])
  
  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
  }
  
  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      await dispatch(deleteEmployee(employeeToDelete._id))
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
    }
  }
  
  const handleClearFilters = () => {
    setSearchQuery('')
    setFilterBranch('')
    setFilterStatus('')
  }
  
  // Find branch name by id
  const getBranchName = (branchId) => {
    const branch = branches.find(branch => branch._id === branchId)
    return branch ? branch.namaCabang : '-'
  }
  
  // Filter employees based on search query, branch filter, and status filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.jabatan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.telepon?.includes(searchQuery)
    
    const matchesBranch = filterBranch ? employee.cabangId === filterBranch : true
    const matchesStatus = filterStatus === '' 
      ? true 
      : filterStatus === 'aktif' 
        ? employee.aktif === true 
        : employee.aktif === false
    
    return matchesSearch && matchesBranch && matchesStatus
  })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Pegawai</h1>
          <p className="text-muted-foreground">
            Kelola data pegawai perusahaan
          </p>
        </div>
        <Link href="/pegawai/tambah">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Tambah Pegawai
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Cari nama, jabatan, email, atau telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <Select
              value={filterBranch}
              onValueChange={setFilterBranch}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter cabang" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">Semua Cabang</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.namaCabang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-48">
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Non-Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(searchQuery || filterBranch || filterStatus) && (
            <Button variant="ghost" onClick={handleClearFilters} className="h-10 px-3 lg:w-auto">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pegawai</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                      <span className="ml-2">Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {searchQuery || filterBranch || filterStatus ? (
                      <div>Tidak ada pegawai yang cocok dengan filter yang dipilih</div>
                    ) : (
                      <div>Belum ada data pegawai</div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 overflow-hidden">
                          {employee.fotoProfil ? (
                            <img 
                              src={employee.fotoProfil} 
                              alt={employee.nama}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="font-medium text-sm">
                              {getInitials(employee.nama)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{employee.nama}</div>
                          <div className="text-sm text-gray-500">@{employee.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.jabatan}</TableCell>
                    <TableCell>{getBranchName(employee.cabangId)}</TableCell>
                    <TableCell>{employee.email || '-'}</TableCell>
                    <TableCell>{employee.telepon || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={employee.aktif ? "success" : "secondary"}
                        className={employee.aktif ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}
                      >
                        {employee.aktif ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/pegawai/${employee._id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteClick(employee)}
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
              Tindakan ini akan menghapus pegawai &quot;{employeeToDelete?.nama}&quot; dan tidak dapat dibatalkan.
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