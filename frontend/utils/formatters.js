import { format, formatDistance, formatRelative, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date, formatString = 'PP') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

export const formatTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'p');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPp');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

export const formatRelativeDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatRelative(dateObj, new Date());
};

// Number formatting utilities
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatNumber = (number, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  return `${formatNumber(value, decimals)}%`;
};

// Distance formatting
export const formatDistanceMeters = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${formatNumber(meters / 1000, 1)} km`;
};

// Duration formatting
export const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} min`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

// Phone number formatting
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// Address formatting
export const formatAddress = (address) => {
  if (!address) return '';
  const { street, city, state, zipCode } = address;
  return `${street}, ${city}, ${state} ${zipCode}`;
};

// Status formatting
export const formatDeliveryStatus = (status) => {
  const statusMap = {
    'pending': 'Pending',
    'assigned': 'Assigned',
    'picked-up': 'Picked Up',
    'in-transit': 'In Transit',
    'delivered': 'Delivered',
    'failed': 'Failed'
  };
  return statusMap[status] || status;
};

// Priority formatting
export const formatPriority = (priority) => {
  const priorityMap = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  };
  return priorityMap[priority] || priority;
};
