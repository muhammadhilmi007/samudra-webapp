"use client"

import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useRouter } from 'next/navigation'
import { trackSTT } from '@/lib/redux/slices/sttSlice'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Search, Loader2, PackageCheck, TruckIcon, Building, MapPin, ArrowRight } from 'lucide-react'

export default function STTTrackingPage() {
  const { nomor } = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { trackedSTT, loading, error } = useSelector((state) => state.stt)
  
  const [trackingNumber, setTrackingNumber] = useState(nomor || '')
  
  const breadcrumbItems = [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Tracking', link: '/tracking' },
    { title: 'STT', link: `/tracking/${nomor || ''}`, active: true }
  ]
  
  const handleSearch = async () => {
    if (!trackingNumber.trim()) return
    
    await dispatch(trackSTT(trackingNumber.trim()))
    
    // Update URL without refreshing the page
    if (nomor !== trackingNumber) {
      router.push(`/tracking/${trackingNumber.trim()}`)
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  
  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Pending', variant: 'warning', icon: <PackageCheck className="h-4 w-4 mr-1" /> },
      'MUAT': { label: 'Dimuat', variant: 'info', icon: <TruckIcon className="h-4 w-4 mr-1" /> },
      'TRANSIT': { label: 'Transit', variant: 'info', icon: <TruckIcon className="h-4 w-4 mr-1" /> },
      'LANSIR': { label: 'Lansir', variant: 'warning', icon: <TruckIcon className="h-4 w-4 mr-1" /> },
      'TERKIRIM': { label: 'Terkirim', variant: 'success', icon: <PackageCheck className="h-4 w-4 mr-1" /> },
      'RETURN': { label: 'Retur', variant: 'destructive', icon: <TruckIcon className="h-4 w-4 mr-1" /> }
    }
    
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary', icon: null }
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center px-3 py-1 text-base">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    )
  }
  
  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tracking STT</h1>
          <p className="text-muted-foreground">
            Lacak status pengiriman barang melalui nomor STT
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cari STT</CardTitle>
            <CardDescription>
              Masukkan nomor STT untuk melacak status pengiriman
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Masukkan nomor STT (contoh: BDG-010225-1002)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading || !trackingNumber.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Lacak STT
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Tidak ditemukan</CardTitle>
              <CardDescription>
                STT dengan nomor tersebut tidak ditemukan. Periksa kembali nomor STT Anda.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        
        {trackedSTT && !error && (
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>{trackedSTT.noSTT}</CardTitle>
                  <CardDescription>
                    Dibuat pada {formatDateTime(trackedSTT.createdAt)}
                  </CardDescription>
                </div>
                <div>
                  {getStatusBadge(trackedSTT.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Detail Pengiriman</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/2 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Cabang Asal</p>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{trackedSTT.cabangAsal?.namaCabang || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-1/2 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Cabang Tujuan</p>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-muted-foreground mr-2" />
                        <span>{trackedSTT.cabangTujuan?.namaCabang || '-'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/2 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Pengirim</p>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                        <div>
                          <div>{trackedSTT.pengirim?.nama || '-'}</div>
                          <div className="text-sm text-muted-foreground">{trackedSTT.pengirim?.alamat || '-'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-1/2 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Penerima</p>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                        <div>
                          <div>{trackedSTT.penerima?.nama || '-'}</div>
                          <div className="text-sm text-muted-foreground">{trackedSTT.penerima?.alamat || '-'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Detail Barang</h3>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Nama Barang</p>
                    <p>{trackedSTT.namaBarang}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Komoditi</p>
                      <p>{trackedSTT.komoditi}</p>
                    </div>
                    
                    <div className="w-full sm:w-1/3 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Packing</p>
                      <p>{trackedSTT.packing}</p>
                    </div>
                    
                    <div className="w-full sm:w-1/3 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Jumlah</p>
                      <p>{trackedSTT.jumlahColly} colly</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Berat</p>
                      <p>{trackedSTT.berat} kg</p>
                    </div>
                    
                    <div className="w-full sm:w-1/3 space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Pembayaran</p>
                      <p>{trackedSTT.paymentType}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {trackedSTT && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Status</CardTitle>
              <CardDescription>
                Informasi perjalanan barang Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Status timeline - in real implementation, this would come from tracking data */}
                <div className="relative border-l border-muted pl-6 ml-3">
                  <div className="absolute w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center -left-3">
                    4
                  </div>
                  <div className="mb-4">
                    <p className="font-medium">{trackedSTT.status === 'TERKIRIM' ? 'Barang telah diterima' : 'Status saat ini'}</p>
                    <p className="text-muted-foreground">{formatDate(new Date())}</p>
                    <p className="mt-1">Barang {trackedSTT.status === 'TERKIRIM' ? 'telah diterima oleh penerima' : 'sedang ' + trackedSTT.status.toLowerCase()}</p>
                  </div>
                </div>
                
                {trackedSTT.status !== 'PENDING' && (
                  <div className="relative border-l border-muted pl-6 ml-3">
                    <div className="absolute w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center -left-3">
                      3
                    </div>
                    <div className="mb-4">
                      <p className="font-medium">Barang sedang dalam pengiriman</p>
                      <p className="text-muted-foreground">{formatDate(trackedSTT.updatedAt)}</p>
                      <p className="mt-1">Barang sedang dalam perjalanan ke tujuan</p>
                    </div>
                  </div>
                )}
                
                <div className="relative border-l border-muted pl-6 ml-3">
                  <div className="absolute w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center -left-3">
                    2
                  </div>
                  <div className="mb-4">
                    <p className="font-medium">STT dibuat</p>
                    <p className="text-muted-foreground">{formatDate(trackedSTT.createdAt)}</p>
                    <p className="mt-1">Dokumen pengiriman telah dibuat</p>
                  </div>
                </div>
                
                <div className="relative pl-6 ml-3">
                  <div className="absolute w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center -left-3">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Barang diterima di cabang asal</p>
                    <p className="text-muted-foreground">{formatDate(trackedSTT.createdAt)}</p>
                    <p className="mt-1">Barang telah diterima di {trackedSTT.cabangAsal?.namaCabang || 'cabang asal'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}