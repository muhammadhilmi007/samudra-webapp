'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Printer, Search } from 'lucide-react';
import { Loader2 } from 'lucide-react';

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Komponen untuk menampilkan dan berinteraksi dengan dokumen PDF
 * 
 * @param {string} url - URL dokumen PDF
 * @param {string} title - Judul dokumen (opsional)
 * @param {function} onClose - Callback ketika viewer ditutup (opsional)
 * @param {boolean} enableDownload - Aktifkan tombol unduh (default: true)
 * @param {boolean} enablePrint - Aktifkan tombol cetak (default: true)
 */
export default function PDFViewer({
  url,
  title,
  onClose,
  enableDownload = true,
  enablePrint = true
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);

  // Function to handle document loading success
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  // Function to handle document loading error
  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Tidak dapat memuat dokumen PDF. Silakan coba lagi nanti.');
    setLoading(false);
  };

  // Function to go to previous page
  const goToPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  // Function to go to next page
  const goToNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  };

  // Function to zoom in
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3));
  };

  // Function to zoom out
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  // Function to rotate document
  const rotateDocument = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  // Function to handle download
  const handleDownload = () => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = title ? `${title}.pdf` : 'document.pdf';
      link.target = '_blank';
      link.click();
    }
  };

  // Function to handle print
  const handlePrint = () => {
    if (url) {
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };

  // Handle page number input change
  const handlePageNumberChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= numPages) {
      setPageNumber(value);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title || 'Dokumen PDF'}</CardTitle>
        <div className="flex items-center space-x-2">
          {enableDownload && (
            <Button variant="outline" size="icon" onClick={handleDownload} title="Unduh">
              <Download className="h-4 w-4" />
            </Button>
          )}
          {enablePrint && (
            <Button variant="outline" size="icon" onClick={handlePrint} title="Cetak">
              <Printer className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button variant="outline" size="icon" onClick={onClose} title="Tutup">
              <span className="sr-only">Tutup</span>
              &times;
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              <Input
                type="number"
                min={1}
                max={numPages || 1}
                value={pageNumber}
                onChange={handlePageNumberChange}
                className="w-16 text-center"
              />
              <span className="mx-2">dari {numPages || 1}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
              title="Halaman Berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={zoomOut} title="Perkecil">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Select value={scale.toString()} onValueChange={(value) => setScale(parseFloat(value))}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder={`${Math.round(scale * 100)}%`}>{Math.round(scale * 100)}%</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">50%</SelectItem>
                <SelectItem value="0.75">75%</SelectItem>
                <SelectItem value="1">100%</SelectItem>
                <SelectItem value="1.25">125%</SelectItem>
                <SelectItem value="1.5">150%</SelectItem>
                <SelectItem value="2">200%</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={zoomIn} title="Perbesar">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={rotateDocument} title="Putar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari teks dalam dokumen..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" disabled={!searchText}>
              Cari
            </Button>
          </div>
        </div>

        <div className="flex justify-center border rounded-md p-4 min-h-[500px] bg-gray-50">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p>Memuat dokumen...</p>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-red-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12" y2="16"></line>
                </svg>
              </div>
              <p className="text-center">{error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className="pdf-document"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                className="pdf-page"
              />
            </Document>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {!loading && !error && `Halaman ${pageNumber} dari ${numPages}`}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1}>
            Sebelumnya
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)}>
            Berikutnya
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}