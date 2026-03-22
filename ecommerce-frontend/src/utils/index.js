// Format currency in INR
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength
    ? text.substring(0, maxLength) + '...'
    : text;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Calculate discount percentage
export const calculateDiscount = (original, final) => {
  if (!original || !final) return 0;
  return Math.round(((original - final) / original) * 100);
};

// Get star rating array
export const getStarArray = (rating) => {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
};

// Validate Indian phone number
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone);
};

// Validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Get error message from API response
export const getErrorMessage = (error) => {
  return error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.';
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Check if user has role
export const hasRole = (user, role) => {
  return user?.roles?.includes(role) || false;
};