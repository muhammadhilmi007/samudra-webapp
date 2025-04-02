"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { createBranch, clearError, clearSuccess } from '@/lib/redux/slices/cabangSlice'
import { fetchDivisions } from '@/lib/redux/slices/divisiSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/lib/hooks/use-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function TambahCabangPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { loading, error, success } = useSelector((state) => state.cabang)
  const { divisions, loading: divisionsLoading } = useSelector((state) => state.divisi)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    namaCabang: '',
    divisiId: '',
    alamat: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    provinsi: '',
    kontakPenanggungJawab: {
      nama: '',
      telepon: '',
      email: ''
    }
  })
  
  const [formErrors, setFormErrors] = useState({})
  
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
        description: 'Cabang berhasil dibuat',
        variant: 'success',
      })
      dispatch(clearSuccess())
      router.push('/cabang')
    }
  }, [error, success, toast, dispatch, router])
  
  const validateForm = () => {
    const errors = {}
    
    if (!formData.namaCabang.trim()) {
      errors.namaCabang = 'Nama cabang harus diisi'
    }
    
    if (!formData.divisiId) {
      errors.divisiId = 'Divisi harus dipilih'
    }
    
    if (!formData.kota.trim()) {
      errors.kota = 'Kota harus diisi'
    }
    
    if (!formData.provinsi.trim()) {
      errors.provinsi = 'Provinsi harus diisi'
    }
    
    if (!formData.kontakPenanggungJawab.nama.trim()) {
      errors['kontakPenanggungJawab.nama'] = 'Nama penanggung jawab harus diisi'
    }
    
    if (!formData.kontakPenanggungJawab.telepon.trim()) {
      errors['kontakPenanggungJawab.telepon'] = 'Telepon penanggung jawab harus diisi'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('kontakPenanggungJawab')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        kontakPenanggungJawab: {
          ...formData.kontakPenanggungJawab,
          [field]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      })
    }
  }
  
  const handleDivisionChange = (value) => {
    setFormData({
      ...formData,
      divisiId: value
    })
    
    if (formErrors.divisiId) {
      setFormErrors({
        ...formErrors,
        divisiId: undefined
      })
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      await dispatch(createBranch(formData))
    }
  }
  
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center">
        <Link href="/cabang" className="mr-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Tambah Cabang</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Formulir Tambah Cabang</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Cabang */}
              <div className="space-y-2">
                <Label 
                  htmlFor="namaCabang" 
                  className={formErrors.namaCabang ? 'text-red-500' : ''}
                >
                  Nama Cabang <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="namaCabang"
                  name="namaCabang"
                  placeholder="Masukkan nama cabang"
                  value={formData.namaCabang}
                  onChange={handleInputChange}
                  className={formErrors.namaCabang ? 'border-red-500' : ''}
                />
                {formErrors.namaCabang && (
                  <p className="text-sm text-red-500">{formErrors.namaCabang}</p>
                )}
              </div>
              
              {/* Divisi */}
              <div className="space-y-2">
                <Label 
                  htmlFor="divisiId" 
                  className={formErrors.divisiId ? 'text-red-500' : ''}
                >
                  Divisi <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.divisiId}
                  onValueChange={handleDivisionChange}
                >
                  <SelectTrigger 
                    id="divisiId"
                    className={formErrors.divisiId ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Pilih divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisionsLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Memuat divisi...</span>
                      </div>
                    ) : divisions.length === 0 ? (
                      <div className="p-2 text-center text-sm">
                        Tidak ada data divisi
                      </div>
                    ) : (
                      divisions.map((division) => (
                        <SelectItem 
                          key={division._id} 
                          value={division._id}
                        >
                          {division.namaDivisi}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.divisiId && (
                  <p className="text-sm text-red-500">{formErrors.divisiId}</p>
                )}
              </div>
              
              {/* Alamat */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  name="alamat"
                  placeholder="Masukkan alamat lengkap"
                  value={formData.alamat}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* Kelurahan & Kecamatan */}
              <div className="space-y-2">
                <Label htmlFor="kelurahan">Kelurahan</Label>
                <Input
                  id="kelurahan"
                  name="kelurahan"
                  placeholder="Masukkan kelurahan"
                  value={formData.kelurahan}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kecamatan">Kecamatan</Label>
                <Input
                  id="kecamatan"
                  name="kecamatan"
                  placeholder="Masukkan kecamatan"
                  value={formData.kecamatan}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* Kota & Provinsi */}
              <div className="space-y-2">
                <Label 
                  htmlFor="kota" 
                  className={formErrors.kota ? 'text-red-500' : ''}
                >
                  Kota <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kota"
                  name="kota"
                  placeholder="Masukkan kota"
                  value={formData.kota}
                  onChange={handleInputChange}
                  className={formErrors.kota ? 'border-red-500' : ''}
                />
                {formErrors.kota && (
                  <p className="text-sm text-red-500">{formErrors.kota}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label 
                  htmlFor="provinsi" 
                  className={formErrors.provinsi ? 'text-red-500' : ''}
                >
                  Provinsi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="provinsi"
                  name="provinsi"
                  placeholder="Masukkan provinsi"
                  value={formData.provinsi}
                  onChange={handleInputChange}
                  className={formErrors.provinsi ? 'border-red-500' : ''}
                />
                {formErrors.provinsi && (
                  <p className="text-sm text-red-500">{formErrors.provinsi}</p>
                )}
              </div>
              
              {/* Penanggung Jawab */}
              <div className="md:col-span-2">
                <h3 className="font-medium mb-4">Informasi Penanggung Jawab</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="kontakPenanggungJawab.nama" 
                      className={formErrors['kontakPenanggungJawab.nama'] ? 'text-red-500' : ''}
                    >
                      Nama <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="kontakPenanggungJawab.nama"
                      name="kontakPenanggungJawab.nama"
                      placeholder="Nama penanggung jawab"
                      value={formData.kontakPenanggungJawab.nama}
                      onChange={handleInputChange}
                      className={formErrors['kontakPenanggungJawab.nama'] ? 'border-red-500' : ''}
                    />
                    {formErrors['kontakPenanggungJawab.nama'] && (
                      <p className="text-sm text-red-500">{formErrors['kontakPenanggungJawab.nama']}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label 
                      htmlFor="kontakPenanggungJawab.telepon" 
                      className={formErrors['kontakPenanggungJawab.telepon'] ? 'text-red-500' : ''}
                    >
                      Telepon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="kontakPenanggungJawab.telepon"
                      name="kontakPenanggungJawab.telepon"
                      placeholder="Nomor telepon"
                      value={formData.kontakPenanggungJawab.telepon}
                      onChange={handleInputChange}
                      className={formErrors['kontakPenanggungJawab.telepon'] ? 'border-red-500' : ''}
                    />
                    {formErrors['kontakPenanggungJawab.telepon'] && (
                      <p className="text-sm text-red-500">{formErrors['kontakPenanggungJawab.telepon']}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="kontakPenanggungJawab.email">Email</Label>
                    <Input
                      type="email"
                      id="kontakPenanggungJawab.email"
                      name="kontakPenanggungJawab.email"
                      placeholder="Email (opsional)"
                      value={formData.kontakPenanggungJawab.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/cabang">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button type="submit" disabled={loading || divisionsLoading}>
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
  )
}