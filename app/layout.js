import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/redux/provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Samudra ERP - Sistem Manajemen Logistik & Pengiriman',
  description: 'Sistem Enterprise Resource Planning untuk perusahaan logistik dan pengiriman',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}