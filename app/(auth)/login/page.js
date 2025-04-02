"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { login } from '@/lib/redux/slices/authSlice'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/lib/hooks/use-toast'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Dispatch login action
      const resultAction = await dispatch(login(formData))
      
      // Check for fulfilled/rejected status
      if (login.fulfilled.match(resultAction)) {
        // Login successful
        toast({
          title: 'Login Berhasil',
          description: 'Selamat datang di Samudra ERP!',
          variant: 'success',
        })
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // Login failed - extract error from payload
        setError(resultAction.payload || 'Login gagal, silakan coba lagi.')
        toast({
          title: 'Login Gagal',
          description: resultAction.payload || 'Login gagal, silakan coba lagi.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      setError('Terjadi kesalahan, silakan coba lagi.')
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan, silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-samudra-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900">Samudra ERP</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistem Manajemen Logistik & Pengiriman
          </p>
        </div>
        
        <Card className="auth-card">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Masuk ke akun Anda untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Masukkan username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      href="#" 
                      className="text-xs text-samudra-600 hover:text-samudra-800"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Masukkan password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-6 bg-samudra-600 hover:bg-samudra-700" 
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Login'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center">
            <div className="text-sm text-center text-gray-500 pt-4">
              &copy; {new Date().getFullYear()} Samudra ERP. All rights reserved.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}