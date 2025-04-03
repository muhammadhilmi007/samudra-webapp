// lib/utils/export-excel.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatDate } from './format';

// Helper function for cell formatting
const formatCell = (value, type) => {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'date':
      return value ? formatDate(value) : '';
    case 'number':
      return typeof value === 'number' ? value : 0;
    case 'currency':
      return typeof value === 'number' ? value : 0;
    case 'boolean':
      return value ? 'Ya' : 'Tidak';
    default:
      return value.toString();
  }
};

// Function to export data to Excel
export const exportToExcel = (data, columns, filename = 'export', sheetName = 'Sheet1') => {
  // Check if data is available
  if (!data || data.length === 0) {
    throw new Error('Tidak ada data untuk diekspor');
  }
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet([]);
  
  // Add header row
  const headerRow = columns.map(col => col.header || col.accessorKey);
  XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A1' });
  
  // Format data rows according to column types
  const formattedData = data.map(row => {
    return columns.map(col => {
      const accessorKey = col.accessorKey || col.id;
      const value = accessorKey.includes('.') 
        ? accessorKey.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : null, row)
        : row[accessorKey];
      return formatCell(value, col.type);
    });
  });
  
  // Add data rows
  XLSX.utils.sheet_add_aoa(ws, formattedData, { origin: 'A2' });
  
  // Auto-size columns
  const colWidths = headerRow.map((header, i) => {
    // Get maximum width from header and data in this column
    const maxDataLength = formattedData.reduce((max, row) => {
      const cellLength = String(row[i] || '').length;
      return cellLength > max ? cellLength : max;
    }, 0);
    
    return Math.max(header.length, maxDataLength) + 2; // Add padding
  });
  
  ws['!cols'] = colWidths.map(width => ({ width }));
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  
  // Save file
  saveAs(blob, `${filename}.xlsx`);
  
  return true;
};

// Function to export STTs to Excel
export const exportSTTsToExcel = (stts, filename = 'stt-export') => {
  // Define columns for STT export
  const columns = [
    { accessorKey: 'noSTT', header: 'Nomor STT', type: 'text' },
    { accessorKey: 'cabangAsal.namaCabang', header: 'Cabang Asal', type: 'text' },
    { accessorKey: 'cabangTujuan.namaCabang', header: 'Cabang Tujuan', type: 'text' },
    { accessorKey: 'pengirim.nama', header: 'Pengirim', type: 'text' },
    { accessorKey: 'penerima.nama', header: 'Penerima', type: 'text' },
    { accessorKey: 'namaBarang', header: 'Nama Barang', type: 'text' },
    { accessorKey: 'komoditi', header: 'Komoditi', type: 'text' },
    { accessorKey: 'packing', header: 'Packing', type: 'text' },
    { accessorKey: 'jumlahColly', header: 'Jumlah Colly', type: 'number' },
    { accessorKey: 'berat', header: 'Berat (kg)', type: 'number' },
    { accessorKey: 'hargaPerKilo', header: 'Harga/Kg', type: 'currency' },
    { accessorKey: 'harga', header: 'Harga Total', type: 'currency' },
    { accessorKey: 'paymentType', header: 'Metode Pembayaran', type: 'text' },
    { accessorKey: 'status', header: 'Status', type: 'text' },
    { accessorKey: 'createdAt', header: 'Tanggal Dibuat', type: 'date' },
  ];
  
  return exportToExcel(stts, columns, filename, 'STT');
};

// Function to export collections/invoices to Excel
export const exportCollectionsToExcel = (collections, filename = 'penagihan-export') => {
  // Define columns for Collections export
  const columns = [
    { accessorKey: 'noPenagihan', header: 'Nomor Penagihan', type: 'text' },
    { accessorKey: 'pelanggan.nama', header: 'Pelanggan', type: 'text' },
    { accessorKey: 'tipePelanggan', header: 'Tipe Pelanggan', type: 'text' },
    { accessorKey: 'totalTagihan', header: 'Total Tagihan', type: 'currency' },
    { accessorKey: 'status', header: 'Status', type: 'text' },
    { accessorKey: 'overdue', header: 'Jatuh Tempo', type: 'boolean' },
    { accessorKey: 'tanggalBayar', header: 'Tanggal Bayar', type: 'date' },
    { accessorKey: 'cabang.namaCabang', header: 'Cabang', type: 'text' },
    { accessorKey: 'createdAt', header: 'Tanggal Dibuat', type: 'date' },
  ];
  
  return exportToExcel(collections, columns, filename, 'Penagihan');
};

// Function to export journals to Excel
export const exportJournalsToExcel = (journals, filename = 'jurnal-export') => {
  // Define columns for Journals export
  const columns = [
    { accessorKey: 'tanggal', header: 'Tanggal', type: 'date' },
    { accessorKey: 'account.namaAccount', header: 'Akun', type: 'text' },
    { accessorKey: 'account.kodeAccount', header: 'Kode Akun', type: 'text' },
    { accessorKey: 'keterangan', header: 'Keterangan', type: 'text' },
    { accessorKey: 'debet', header: 'Debet', type: 'currency' },
    { accessorKey: 'kredit', header: 'Kredit', type: 'currency' },
    { accessorKey: 'cabang.namaCabang', header: 'Cabang', type: 'text' },
    { accessorKey: 'tipe', header: 'Tipe', type: 'text' },
    { accessorKey: 'status', header: 'Status', type: 'text' },
    { accessorKey: 'user.nama', header: 'Dibuat Oleh', type: 'text' },
  ];
  
  return exportToExcel(journals, columns, filename, 'Jurnal');
};