// lib/utils/pdf-generator.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatDate, formatCurrency } from './format';

// Helper untuk membuat header PDF
const addPDFHeader = (doc, title, companyInfo = {}) => {
  const { 
    name = 'PT. Sarana Mudah Raya "Samudra"', 
    address = 'Jl. Logistik No. 123, Jakarta',
    phone = '021-12345678',
    email = 'info@samudra-express.com'
  } = companyInfo;
  
  // Add logo (placeholder)
  // doc.addImage('/logo.png', 'PNG', 14, 10, 30, 30);
  
  // Company info
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(name, 15, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(address, 15, 27);
  doc.text(`Telp: ${phone} | Email: ${email}`, 15, 34);
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, 47);
  
  // Line divider
  doc.setLineWidth(0.5);
  doc.line(15, 50, 195, 50);
  
  // Start content below this line
  return 60; // Return Y position for content start
};

// Function to generate STT PDF
export const generateSTTPDF = (stt) => {
  const doc = new jsPDF();
  
  const startY = addPDFHeader(doc, `SURAT TANDA TERIMA (STT) - ${stt.noSTT}`);
  
  // STT details in table format
  const sttDetails = [
    ['Nomor STT', ':', stt.noSTT],
    ['Cabang Asal', ':', stt.cabangAsal?.namaCabang || '-'],
    ['Cabang Tujuan', ':', stt.cabangTujuan?.namaCabang || '-'],
    ['Tgl Pembuatan', ':', formatDate(stt.createdAt)],
    ['Status', ':', stt.status],
    ['Metode Pembayaran', ':', stt.paymentType]
  ];
  
  doc.autoTable({
    startY,
    body: sttDetails,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 5 },
      2: { cellWidth: 'auto' }
    }
  });
  
  // Draw two columns for shipper and receiver
  const colStartY = doc.lastAutoTable.finalY + 10;
  
  // Shipper details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PENGIRIM:', 15, colStartY);
  
  const shipperDetails = [
    ['Nama', ':', stt.pengirim?.nama || '-'],
    ['Alamat', ':', stt.pengirim?.alamatLengkap || '-'],
    ['Telepon', ':', stt.pengirim?.telepon || '-'],
    ['Email', ':', stt.pengirim?.email || '-']
  ];
  
  doc.autoTable({
    startY: colStartY + 5,
    body: shipperDetails,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold' },
      1: { cellWidth: 5 },
      2: { cellWidth: 65 }
    }
  });
  
  // Receiver details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PENERIMA:', 115, colStartY);
  
  const receiverDetails = [
    ['Nama', ':', stt.penerima?.nama || '-'],
    ['Alamat', ':', stt.penerima?.alamatLengkap || '-'],
    ['Telepon', ':', stt.penerima?.telepon || '-'],
    ['Email', ':', stt.penerima?.email || '-']
  ];
  
  doc.autoTable({
    startY: colStartY + 5,
    margin: { left: 115 },
    body: receiverDetails,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1 },
   columnStyles: {
     0: { cellWidth: 25, fontStyle: 'bold' },
     1: { cellWidth: 5 },
     2: { cellWidth: 45 }
   }
 });
 
 // Package details
 const packageY = Math.max(doc.lastAutoTable.finalY, doc.previousAutoTable.finalY) + 10;
 
 doc.setFontSize(12);
 doc.setFont('helvetica', 'bold');
 doc.text('DETAIL BARANG:', 15, packageY);
 
 const packageDetails = [
   [
     'Nama Barang', 
     'Komoditi', 
     'Packing', 
     'Jumlah Colly', 
     'Berat (kg)', 
     'Harga', 
     'Keterangan'
   ],
   [
     stt.namaBarang || '-',
     stt.komoditi || '-',
     stt.packing || '-',
     stt.jumlahColly?.toString() || '-',
     stt.berat?.toString() || '-',
     formatCurrency(stt.harga) || '-',
     stt.keterangan || '-'
   ]
 ];
 
 doc.autoTable({
   startY: packageY + 5,
   head: [packageDetails[0]],
   body: [packageDetails[1]],
   theme: 'striped',
   headStyles: {
     fillColor: [66, 66, 66],
     textColor: 255,
     fontStyle: 'bold',
     halign: 'center'
   },
   styles: { fontSize: 9, cellPadding: 3 }
 });
 
 // Signatures
 const signatureY = doc.lastAutoTable.finalY + 20;
 
 // Left signature for sender
 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 doc.text('Pengirim', 30, signatureY);
 doc.line(15, signatureY + 25, 60, signatureY + 25);
 doc.text('(.....................................)', 15, signatureY + 30);
 
 // Middle signature for officer
 doc.text('Petugas', 95, signatureY);
 doc.line(80, signatureY + 25, 125, signatureY + 25);
 doc.text('(.....................................)', 80, signatureY + 30);
 
 // Right signature for receiver
 doc.text('Penerima', 160, signatureY);
 doc.line(145, signatureY + 25, 190, signatureY + 25);
 doc.text('(.....................................)', 145, signatureY + 30);
 
 // Footer with terms and conditions
 const footerY = signatureY + 40;
 doc.setFontSize(8);
 doc.setFont('helvetica', 'bold');
 doc.text('SYARAT DAN KETENTUAN:', 15, footerY);
 doc.setFont('helvetica', 'normal');
 const termsText = 
   '1. Pengiriman tunduk pada Syarat dan Ketentuan yang berlaku di PT. Sarana Mudah Raya "Samudra"\n' +
   '2. Perusahaan tidak bertanggung jawab atas kehilangan/kerusakan yang disebabkan oleh Force Majeure\n' +
   '3. Waktu pengiriman merupakan estimasi, bukan jaminan\n' +
   '4. Klaim harus diajukan dalam waktu 3x24 jam sejak barang diterima\n' +
   '5. Pengirim bertanggung jawab atas kebenaran informasi barang yang dikirim';
 
 doc.setFontSize(7);
 const splitText = doc.splitTextToSize(termsText, 180);
 doc.text(splitText, 15, footerY + 5);
 
 // Return the PDF document as base64 string
 return doc.output('datauristring');
};

// Function to generate Invoice PDF
export const generateInvoicePDF = (invoice) => {
 const doc = new jsPDF();
 
 const startY = addPDFHeader(doc, `INVOICE PENAGIHAN - ${invoice.noPenagihan}`);
 
 // Invoice details in table format
 const invoiceDetails = [
   ['Nomor Invoice', ':', invoice.noPenagihan],
   ['Tanggal', ':', formatDate(invoice.createdAt)],
   ['Status', ':', invoice.status],
   ['Jatuh Tempo', ':', invoice.overdue ? 'Ya' : 'Tidak']
 ];
 
 doc.autoTable({
   startY,
   body: invoiceDetails,
   theme: 'plain',
   styles: { fontSize: 10, cellPadding: 1 },
   columnStyles: {
     0: { cellWidth: 40, fontStyle: 'bold' },
     1: { cellWidth: 5 },
     2: { cellWidth: 'auto' }
   }
 });
 
 // Customer details
 const customerY = doc.lastAutoTable.finalY + 10;
 
 doc.setFontSize(12);
 doc.setFont('helvetica', 'bold');
 doc.text('DITAGIHKAN KEPADA:', 15, customerY);
 
 const customerDetails = [
   ['Nama', ':', invoice.pelanggan?.nama || '-'],
   ['Tipe', ':', invoice.tipePelanggan || '-'],
   ['Alamat', ':', invoice.pelanggan?.alamatLengkap || '-'],
   ['Telepon', ':', invoice.pelanggan?.telepon || '-'],
   ['Email', ':', invoice.pelanggan?.email || '-']
 ];
 
 doc.autoTable({
   startY: customerY + 5,
   body: customerDetails,
   theme: 'plain',
   styles: { fontSize: 10, cellPadding: 1 },
   columnStyles: {
     0: { cellWidth: 25, fontStyle: 'bold' },
     1: { cellWidth: 5 },
     2: { cellWidth: 65 }
   }
 });
 
 // STT Details
 const sttY = doc.lastAutoTable.finalY + 10;
 
 doc.setFontSize(12);
 doc.setFont('helvetica', 'bold');
 doc.text('DETAIL PENGIRIMAN:', 15, sttY);
 
 // Prepare STT table data
 const sttTableHead = [
   ['No STT', 'Tanggal', 'Barang', 'Jumlah Colly', 'Berat', 'Harga', 'Status']
 ];
 
 const sttTableBody = invoice.sttIds?.map(stt => [
   stt.noSTT || '-',
   formatDate(stt.createdAt) || '-',
   stt.namaBarang || '-',
   stt.jumlahColly?.toString() || '-',
   `${stt.berat} kg` || '-',
   formatCurrency(stt.harga) || '-',
   stt.status || '-'
 ]) || [];
 
 // Add totals row
 sttTableBody.push([
   '', '', '', '', 'TOTAL:', formatCurrency(invoice.totalTagihan), ''
 ]);
 
 doc.autoTable({
   startY: sttY + 5,
   head: sttTableHead,
   body: sttTableBody,
   theme: 'striped',
   headStyles: {
     fillColor: [66, 66, 66],
     textColor: 255,
     fontStyle: 'bold',
     halign: 'center'
   },
   styles: { fontSize: 9, cellPadding: 3 },
   columnStyles: {
     5: { halign: 'right' }
   },
   foot: [['', '', '', '', 'TOTAL', formatCurrency(invoice.totalTagihan), '']],
   footStyles: {
     fillColor: [240, 240, 240],
     fontStyle: 'bold'
   }
 });
 
 // Payment details
 const paymentY = doc.lastAutoTable.finalY + 10;
 
 doc.setFontSize(12);
 doc.setFont('helvetica', 'bold');
 doc.text('INFORMASI PEMBAYARAN:', 15, paymentY);
 
 // Calculate total paid and remaining
 let totalPaid = 0;
 if (invoice.jumlahBayarTermin && invoice.jumlahBayarTermin.length > 0) {
   totalPaid = invoice.jumlahBayarTermin.reduce((sum, termin) => sum + termin.jumlah, 0);
 }
 const remainingAmount = invoice.totalTagihan - totalPaid;
 
 const paymentDetails = [
   ['Total Tagihan', ':', formatCurrency(invoice.totalTagihan)],
   ['Total Dibayar', ':', formatCurrency(totalPaid)],
   ['Sisa Pembayaran', ':', formatCurrency(remainingAmount)]
 ];
 
 doc.autoTable({
   startY: paymentY + 5,
   body: paymentDetails,
   theme: 'plain',
   styles: { fontSize: 10, cellPadding: 1 },
   columnStyles: {
     0: { cellWidth: 40, fontStyle: 'bold' },
     1: { cellWidth: 5 },
     2: { cellWidth: 'auto' }
   }
 });
 
 // Bank account details
 const bankY = doc.lastAutoTable.finalY + 10;
 
 doc.setFontSize(10);
 doc.setFont('helvetica', 'bold');
 doc.text('Pembayaran dapat dilakukan melalui transfer ke rekening berikut:', 15, bankY);
 
 const bankDetails = [
   ['Bank', ':', 'Bank Mandiri'],
   ['No. Rekening', ':', '123-456-7890'],
   ['Atas Nama', ':', 'PT. Sarana Mudah Raya']
 ];
 
 doc.autoTable({
   startY: bankY + 5,
   body: bankDetails,
   theme: 'plain',
   styles: { fontSize: 10, cellPadding: 1 },
   columnStyles: {
     0: { cellWidth: 30, fontStyle: 'bold' },
     1: { cellWidth: 5 },
     2: { cellWidth: 'auto' }
   }
 });
 
 // Signatures
 const signatureY = doc.lastAutoTable.finalY + 15;
 
 // Right signature for finance officer
 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 doc.text('Finance Officer', 150, signatureY);
 doc.line(130, signatureY + 25, 180, signatureY + 25);
 doc.text('(.....................................)', 130, signatureY + 30);
 
 // Footer with terms and conditions
 const footerY = doc.internal.pageSize.height - 30;
 doc.setFontSize(8);
 doc.text('Dokumen ini adalah bukti penagihan yang sah dan tidak memerlukan tanda tangan.', 15, footerY);
 
 // Return the PDF document as base64 string
 return doc.output('datauristring');
};

// Function to generate DMB (Daftar Muat Barang) PDF
export const generateDMBPDF = (loading) => {
 const doc = new jsPDF();
 
 const startY = addPDFHeader(doc, `DAFTAR MUAT BARANG - ${loading.idMuat}`);
 
 // DMB details in table format
 const dmbDetails = [
   ['Nomor DMB', ':', loading.idMuat],
   ['Cabang Muat', ':', loading.cabangMuat?.namaCabang || '-'],
   ['Cabang Tujuan', ':', loading.cabangBongkar?.namaCabang || '-'],
   ['Tanggal', ':', formatDate(loading.createdAt)],
   ['Status', ':', loading.status]
 ];
 
 doc.autoTable({
   startY,
   body: dmbDetails,
   theme: 'plain',
   styles: { fontSize: 10, cellPadding: 1 },
   columnStyles: {
     0: { cellWidth: 40, fontStyle: 'bold' },
     1: { cellWidth: 5 },
     2: { cellWidth: 'auto' }
   }
 });
 
 // Truck information
 const truckY = doc.lastAutoTable.finalY + 10;
 
 doc.setFontSize(12);
 doc.setFont('helvetica', 'bold');
 doc.text('INFORMASI KENDARAAN:', 15, truckY);
 
 const truck = loading.antrianTruck?.truck || {};
 
 const truckDetails = [
   ['Kendaraan', ':', truck.namaKendaraan || '-'],
   ['Nomor Polisi', ':', truck.noPolisi || '-'],
   ['Supir', ':', loading.antrianTruck?.supir?.nama || '-'],
   ['Kenek', ':', loading.antrianTruck?.kenek?.nama || '-'],
   ['Waktu Berangkat', ':', loading.waktuBerangkat ? formatDate(loading.waktuBerangkat, true) : '-'],
   ['Waktu Sampai', ':', loading.waktuSampai ? formatDate(loading.waktuSampai, true) : '-']
 ];
 
 doc.autoTable({
   startY: truckY + 5,
   body: truckDetails,
   theme: 'plain',
   styles: { fontSize: 10, cellPadding: 1 },
   columnStyles: {
     0: { cellWidth: 40, fontStyle: 'bold' },
     1: { cellWidth: 5 },
     2: { cellWidth: 'auto' }
   }
 });
 
 // STT list
 const sttY = doc.lastAutoTable.finalY + 10;
 
 doc.setFontSize(12);
 doc.setFont('helvetica', 'bold');
 doc.text('DAFTAR STT:', 15, sttY);
 
 const sttTableHead = [
   ['No', 'No STT', 'Pengirim', 'Penerima', 'Barang', 'Colly', 'Berat', 'Harga']
 ];
 
 const sttTableBody = loading.sttIds?.map((stt, index) => [
   (index + 1).toString(),
   stt.noSTT || '-',
   stt.pengirim?.nama || '-',
   stt.penerima?.nama || '-',
   stt.namaBarang || '-',
   stt.jumlahColly?.toString() || '-',
   `${stt.berat} kg` || '-',
   formatCurrency(stt.harga) || '-'
 ]) || [];
 
 // Calculate totals
 const totalColly = loading.sttIds?.reduce((sum, stt) => sum + (stt.jumlahColly || 0), 0) || 0;
 const totalWeight = loading.sttIds?.reduce((sum, stt) => sum + (stt.berat || 0), 0) || 0;
 const totalValue = loading.sttIds?.reduce((sum, stt) => sum + (stt.harga || 0), 0) || 0;
 
 doc.autoTable({
   startY: sttY + 5,
   head: sttTableHead,
   body: sttTableBody,
   theme: 'striped',
   headStyles: {
     fillColor: [66, 66, 66],
     textColor: 255,
     fontStyle: 'bold',
     halign: 'center'
   },
   styles: { fontSize: 9, cellPadding: 3 },
   foot: [['', 'TOTAL', '', '', '', totalColly.toString(), `${totalWeight.toFixed(1)} kg`, formatCurrency(totalValue)]],
   footStyles: {
     fillColor: [240, 240, 240],
     fontStyle: 'bold'
   }
 });
 
 // Signatures
 const signatureY = doc.lastAutoTable.finalY + 15;
 
 // Left signature for checker
 doc.setFontSize(10);
 doc.setFont('helvetica', 'normal');
 doc.text('Checker', 30, signatureY);
 doc.line(15, signatureY + 25, 60, signatureY + 25);
 doc.text(loading.checker?.nama || '(.....................................)', 15, signatureY + 30);
 
 // Middle signature for driver
 doc.text('Supir', 95, signatureY);
 doc.line(80, signatureY + 25, 125, signatureY + 25);
 doc.text(loading.antrianTruck?.supir?.nama || '(.....................................)', 80, signatureY + 30);
 
 // Right signature for warehouse manager
 doc.text('Kepala Gudang', 160, signatureY);
 doc.line(145, signatureY + 25, 190, signatureY + 25);
 doc.text('(.....................................)', 145, signatureY + 30);
 
 // Return the PDF document as base64 string
 return doc.output('datauristring');
};