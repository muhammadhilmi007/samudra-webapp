# Samudra ERP - Frontend

Samudra ERP adalah sistem Enterprise Resource Planning (ERP) terpadu yang dirancang khusus untuk perusahaan logistik dan pengiriman. Frontend ini dibangun menggunakan Next.js dengan App Router, diintegrasikan dengan backend Node.js dan MongoDB.

## Fitur Utama

- **Dashboard** - Tampilan komprehensif untuk metrik bisnis dan KPI
- **Manajemen Master Data** - Divisi, Cabang, Pegawai, Pelanggan, Kendaraan
- **Operasional** - Pengambilan, STT, Muat & Transit, Lansir, Retur
- **Keuangan** - Penagihan, Kas & Bank, Jurnal Umum, Aset
- **Laporan** - Penjualan, Operasional, Keuangan

## Teknologi yang Digunakan

- **Next.js 14** - Framework React dengan App Router
- **Tailwind CSS** - Untuk styling yang konsisten dan responsive
- **shadcn/ui** - Komponen UI yang dapat disesuaikan
- **Redux Toolkit** - State management
- **React Hook Form** - Manajemen form yang efisien
- **Recharts** - Visualisasi data
- **Axios** - HTTP client

## Instalasi dan Pengaturan

### Prasyarat

- Node.js 18.0.0 atau lebih baru
- Backend Samudra ERP berjalan pada `http://localhost:5000` (atau konfigurasi di .env.local)

### Langkah Instalasi

1. Klon repositori
   ```sh
   git clone https://github.com/username/samudra-erp-frontend.git
   cd samudra-erp-frontend
   ```

2. Instal dependensi
   ```sh
   npm install
   ```

3. Buat file `.env.local` dan sesuaikan konfigurasi
   ```sh
   cp .env.example .env.local
   ```
   Edit `.env.local` dan sesuaikan variabel seperti `API_URL`

4. Jalankan server development
   ```sh
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) di browser

## Struktur Proyek

- `app/` - Halaman dan routes menggunakan Next.js App Router
- `components/` - Komponen React yang dapat digunakan kembali
  - `ui/` - Komponen dasar UI (button, card, dll)
  - `layout/` - Komponen layout (sidebar, header, dll)
  - `forms/` - Form-form untuk input data
  - `data-tables/` - Komponen tabel untuk menampilkan data
- `lib/` - Utilitas dan konfigurasi
  - `redux/` - Store dan slices Redux
  - `hooks/` - Custom React hooks
  - `utils/` - Fungsi utilitas
  - `api.js` - Klien API Axios

## Deployment

### Build untuk Production

```sh
npm run build
```

### Menjalankan Build Production

```sh
npm start
```

## Integrasi dengan Backend

Frontend ini didesain untuk bekerja dengan backend Samudra ERP API. Pastikan backend berjalan dan dapat diakses pada URL yang dikonfigurasi di `.env.local` (`API_URL`).

## Dukungan Browser

Aplikasi ini mendukung browser modern terkini:

- Chrome
- Firefox
- Safari
- Edge

## Lisensi

[MIT](LICENSE)