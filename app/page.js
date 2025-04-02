import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-samudra-50 to-samudra-100">
      <header className="container mx-auto py-6 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-samudra-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-xl font-bold text-samudra-900">Samudra ERP</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-samudra-700 hover:text-samudra-900">
            Fitur
          </Link>
          <Link href="#about" className="text-sm font-medium text-samudra-700 hover:text-samudra-900">
            Tentang
          </Link>
          <Link href="#contact" className="text-sm font-medium text-samudra-700 hover:text-samudra-900">
            Kontak
          </Link>
        </nav>
        <div>
          <Link href="/login">
            <Button className="bg-samudra-600 hover:bg-samudra-700">Login</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6">
        <section className="py-12 md:py-24 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-samudra-900">
              Solusi Logistik & Pengiriman Terpadu
            </h2>
            <p className="text-xl text-samudra-700 md:w-[85%]">
              Kelola seluruh operasional bisnis pengiriman Anda dengan Samudra ERP - sistem manajemen terpadu untuk perusahaan logistik.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="bg-samudra-600 hover:bg-samudra-700 text-white">
                  Masuk ke Sistem
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-samudra-600 text-samudra-600 hover:bg-samudra-50">
                  Pelajari Fitur
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 relative min-h-[300px] rounded-xl overflow-hidden border border-samudra-200 shadow-lg">
            <div className="w-full h-full bg-samudra-200 flex items-center justify-center">
              <div className="text-samudra-600 font-semibold">Dashboard Preview</div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-samudra-900 mb-4">Fitur Unggulan</h2>
            <p className="text-samudra-700 md:w-2/3 mx-auto">
              Samudra ERP menyediakan berbagai fitur komprehensif untuk mendukung seluruh operasional bisnis pengiriman dan logistik Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Manajemen Pengiriman",
                description: "Kelola pengiriman dari penjemputan hingga pengantaran, dengan pelacakan real-time."
              },
              {
                title: "Sistem Keuangan",
                description: "Pencatatan otomatis transaksi, laporan keuangan, dan manajemen piutang."
              },
              {
                title: "Dashboard Analitik",
                description: "Visualisasi data bisnis untuk pengambilan keputusan yang lebih baik."
              },
              {
                title: "Manajemen Armada",
                description: "Kelola kendaraan, jadwal, dan perawatan armada pengiriman."
              },
              {
                title: "Pelacakan STT",
                description: "Pelacakan status pengiriman dengan Surat Tanda Terima (STT)."
              },
              {
                title: "Manajemen Cabang",
                description: "Koordinasi antar cabang dengan data terpusat dan terintegrasi."
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg border border-samudra-100 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-samudra-900 mb-2">{feature.title}</h3>
                <p className="text-samudra-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="py-12 md:py-24 bg-white rounded-xl border border-samudra-100 p-8 shadow-sm">
          <div className="md:w-2/3 mx-auto">
            <h2 className="text-3xl font-bold text-samudra-900 mb-4">Tentang Samudra ERP</h2>
            <p className="text-samudra-700 mb-4">
              Samudra ERP adalah sistem manajemen terpadu yang dirancang khusus untuk perusahaan logistik dan pengiriman. Sistem ini menghubungkan seluruh operasional bisnis, mulai dari administrasi, keuangan, operasional, hingga pelacakan pengiriman.
            </p>
            <p className="text-samudra-700 mb-4">
              Dengan Samudra ERP, Anda dapat mengoptimalkan operasional bisnis, meningkatkan efisiensi, dan memberikan layanan pengiriman yang lebih baik kepada pelanggan.
            </p>
            <p className="text-samudra-700">
              Dibangun dengan teknologi modern dan antarmuka yang intuitif, Samudra ERP mudah digunakan oleh seluruh staf perusahaan.
            </p>
          </div>
        </section>

        <section id="contact" className="py-12 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-samudra-900 mb-4">Hubungi Kami</h2>
            <p className="text-samudra-700 md:w-2/3 mx-auto">
              Tertarik menggunakan Samudra ERP untuk bisnis logistik Anda? Hubungi kami untuk informasi lebih lanjut.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-samudra-100 p-8 shadow-sm max-w-2xl mx-auto">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-samudra-900 mb-2">Nama</label>
                <input type="text" className="w-full p-2 border border-samudra-200 rounded-md" placeholder="Masukkan nama Anda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-samudra-900 mb-2">Email</label>
                <input type="email" className="w-full p-2 border border-samudra-200 rounded-md" placeholder="Masukkan email Anda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-samudra-900 mb-2">Pesan</label>
                <textarea className="w-full p-2 border border-samudra-200 rounded-md" rows="4" placeholder="Masukkan pesan Anda"></textarea>
              </div>
              <Button className="bg-samudra-600 hover:bg-samudra-700 text-white">Kirim Pesan</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-samudra-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <span className="text-samudra-900 font-bold text-sm">S</span>
                </div>
                <h3 className="text-lg font-bold">Samudra ERP</h3>
              </div>
              <p className="text-samudra-100 text-sm">
                Sistem manajemen terpadu untuk perusahaan logistik dan pengiriman.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-samudra-100 hover:text-white">Fitur</Link></li>
                <li><Link href="#" className="text-samudra-100 hover:text-white">Harga</Link></li>
                <li><Link href="#" className="text-samudra-100 hover:text-white">Demonstrasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-samudra-100 hover:text-white">Tentang Kami</Link></li>
                <li><Link href="#" className="text-samudra-100 hover:text-white">Karir</Link></li>
                <li><Link href="#" className="text-samudra-100 hover:text-white">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-samudra-100 hover:text-white">Bantuan</Link></li>
                <li><Link href="#" className="text-samudra-100 hover:text-white">Kontak</Link></li>
                <li><Link href="#" className="text-samudra-100 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-samudra-800 mt-8 pt-8 text-center text-xs text-samudra-300">
            &copy; {new Date().getFullYear()} Samudra ERP. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}