// lib/utils/format.js
// Format a currency value to IDR
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format a date to Indonesian format (DD/MM/YYYY)
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "-";
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Format a date to Indonesian datetime format (DD/MM/YYYY HH:MM)
export const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return "-";
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

// Format a number with thousand separators
export const formatNumber = (number) => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};


// Export formatCurrency as default for backward compatibility
export default formatCurrency;
