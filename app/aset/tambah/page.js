'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import AssetForm from '@/components/forms/asset-form';

export default function TambahAsetPage() {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (data) => {
    setSubmitting(true);
    
    // Simulasi API call untuk menambah aset
    setTimeout(() => {
      setSubmitting(false);
      
      toast({
        title: "Aset berhasil ditambahkan",
        description: `Aset baru "${data.namaAset}" telah berhasil ditambahkan ke sistem.`,
      });
      
      router.push('/aset');
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/aset">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Tambah Aset Baru</h1>
      </div>
      
      <AssetForm 
        onSubmit={handleSubmit} 
        onCancel={() => router.push('/aset')} 
        isSubmitting={submitting}
      />
    </div>
  );
}