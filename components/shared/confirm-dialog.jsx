'use client';

import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle } from 'lucide-react';

/**
 * Komponen dialog konfirmasi yang dapat digunakan kembali
 * 
 * @param {boolean} isOpen - Status dialog terbuka atau tertutup
 * @param {function} onClose - Fungsi yang dipanggil saat dialog ditutup
 * @param {function} onConfirm - Fungsi yang dipanggil saat aksi dikonfirmasi
 * @param {string} title - Judul dialog
 * @param {string} description - Deskripsi atau pesan dalam dialog
 * @param {string} confirmText - Teks tombol konfirmasi (default: 'Konfirmasi')
 * @param {string} cancelText - Teks tombol batal (default: 'Batal')
 * @param {boolean} destructive - Apakah aksi berbahaya/destruktif (default: false)
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  destructive = false
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {destructive ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-primary" />
            )}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={destructive ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}