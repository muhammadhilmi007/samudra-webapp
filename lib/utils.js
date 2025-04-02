import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines and merges Tailwind CSS classes efficiently
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string or object to localized format
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  
  const mergedOptions = { ...defaultOptions, ...options }
  
  if (!date) return ''
  const dateObj = date instanceof Date ? date : new Date(date)
  
  return dateObj.toLocaleDateString('id-ID', mergedOptions)
}

/**
 * Formats a number as Indonesian currency (Rupiah)
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number') return 'Rp0'
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Truncates a string to a specified length
 */
export function truncateString(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str
  return `${str.substring(0, maxLength)}...`
}

/**
 * Creates a short ID from a longer MongoDB ObjectId
 */
export function shortId(id) {
  if (!id) return ''
  if (typeof id === 'object' && id._id) id = id._id
  if (typeof id === 'object' && id.toString) id = id.toString()
  
  return id.substring(id.length - 6).toUpperCase()
}

/**
 * Generates a color from a string (for avatar, etc)
 */
export function stringToColor(str) {
  if (!str) return '#000000'
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF
    color += ('00' + value.toString(16)).substr(-2)
  }
  
  return color
}

/**
 * Gets initials from a name string
 */
export function getInitials(name) {
  if (!name) return '?'
  
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Formats a phone number to a standard format
 */
export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return ''
  
  // Remove non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // Check if starts with 0, if not prepend it
  const formattedNumber = cleaned.startsWith('0') ? cleaned : `0${cleaned}`
  
  // Format by adding spaces
  if (formattedNumber.length <= 4) {
    return formattedNumber
  } else if (formattedNumber.length <= 8) {
    return `${formattedNumber.slice(0, 4)} ${formattedNumber.slice(4)}`
  } else {
    return `${formattedNumber.slice(0, 4)} ${formattedNumber.slice(4, 8)} ${formattedNumber.slice(8)}`
  }
}

/**
 * Creates a slug from a string
 */
export function toSlug(str) {
  if (!str) return ''
  
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

/**
 * Extracts error message from API error response
 */
export function getErrorMessage(error) {
  if (!error) return 'Terjadi kesalahan'
  
  if (error.response && error.response.data) {
    if (error.response.data.message) {
      return error.response.data.message
    }
    if (error.response.data.error) {
      return error.response.data.error
    }
  }
  
  return error.message || 'Terjadi kesalahan'
}

/**
 * Get the status label from a status code
 */
export function getStatusLabel(status) {
  const statusMap = {
    // STT status
    PENDING: 'Menunggu',
    MUAT: 'Dalam Pemuatan',
    TRANSIT: 'Dalam Pengiriman',
    LANSIR: 'Lansir ke Penerima',
    TERKIRIM: 'Terkirim',
    RETURN: 'Retur',
    
    // Payment status
    CASH: 'Tunai (Lunas)',
    COD: 'Bayar di Tempat',
    CAD: 'Bayar Setelah Terkirim',
    LUNAS: 'Lunas',
    'BELUM LUNAS': 'Belum Lunas',
    
    // Queue status
    MENUNGGU: 'Menunggu',
    BERANGKAT: 'Berangkat',
    SAMPAI: 'Sampai',
    KEMBALI: 'Kembali',
    
    // Validation status
    VALIDATED: 'Tervalidasi',
    UNVALIDATED: 'Belum Validasi',
    
    // Common status
    AKTIF: 'Aktif',
    NONAKTIF: 'Non-Aktif',
    DRAFT: 'Draft',
    FINAL: 'Final',
    MERGED: 'Digabung',
    SELESAI: 'Selesai',
    
    // Default
    DEFAULT: 'Tidak Diketahui'
  }
  
  return statusMap[status] || status || statusMap.DEFAULT
}

/**
 * Get the appropriate color for a status
 */
export function getStatusColor(status) {
  const colorMap = {
    // STT status
    PENDING: 'bg-yellow-100 text-yellow-800',
    MUAT: 'bg-blue-100 text-blue-800',
    TRANSIT: 'bg-indigo-100 text-indigo-800',
    LANSIR: 'bg-purple-100 text-purple-800',
    TERKIRIM: 'bg-green-100 text-green-800',
    RETURN: 'bg-red-100 text-red-800',
    
    // Payment status
    CASH: 'bg-green-100 text-green-800',
    COD: 'bg-orange-100 text-orange-800',
    CAD: 'bg-blue-100 text-blue-800',
    LUNAS: 'bg-green-100 text-green-800',
    'BELUM LUNAS': 'bg-red-100 text-red-800',
    
    // Queue status
    MENUNGGU: 'bg-yellow-100 text-yellow-800',
    BERANGKAT: 'bg-blue-100 text-blue-800',
    SAMPAI: 'bg-green-100 text-green-800',
    KEMBALI: 'bg-purple-100 text-purple-800',
    
    // Validation status
    VALIDATED: 'bg-green-100 text-green-800',
    UNVALIDATED: 'bg-yellow-100 text-yellow-800',
    
    // Common status
    AKTIF: 'bg-green-100 text-green-800',
    NONAKTIF: 'bg-gray-100 text-gray-800',
    DRAFT: 'bg-yellow-100 text-yellow-800',
    FINAL: 'bg-green-100 text-green-800',
    MERGED: 'bg-indigo-100 text-indigo-800',
    SELESAI: 'bg-green-100 text-green-800',
    
    // Default
    DEFAULT: 'bg-gray-100 text-gray-800'
  }
  
  return colorMap[status] || colorMap.DEFAULT
}