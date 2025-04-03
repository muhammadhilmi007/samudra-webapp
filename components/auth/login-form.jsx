// components/auth/login-form.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/lib/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!formData.username || !formData.password) {
        setError('Username dan password harus diisi');
        return;
      }
      
      // Dispatch login action
      const resultAction = await dispatch(login(formData)).unwrap();
      
      // Login successful
      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang di Samudra ERP!',
        variant: 'success',
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err || 'Login gagal, silakan coba lagi.');
      toast({
        title: 'Login Gagal',
        description: err || 'Login gagal, silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
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
            className="text-xs text-blue-600 hover:text-blue-800"
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
      
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : 'Login'}
      </Button>
    </form>
  );
}