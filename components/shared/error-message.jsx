"use client"

import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ErrorMessage({ 
  title = "Error", 
  description = "Terjadi kesalahan. Silahkan coba lagi.", 
  retryAction,
  backButton = true
}) {
  const router = useRouter()
  
  return (
    <Alert variant="destructive" className="flex flex-col items-center text-center py-6">
      <AlertTriangle className="h-12 w-12 mb-4" />
      <AlertTitle className="text-xl font-semibold mb-2">{title}</AlertTitle>
      <AlertDescription className="text-base">
        {description}
      </AlertDescription>
      
      <div className="flex gap-4 mt-6">
        {retryAction && (
          <Button onClick={retryAction} variant="outline">
            Coba Lagi
          </Button>
        )}
        
        {backButton && (
          <Button onClick={() => router.back()} variant="default">
            Kembali
          </Button>
        )}
      </div>
    </Alert>
  )
}