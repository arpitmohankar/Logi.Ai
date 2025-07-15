import { format, formatRelative, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date, formatString = 'PP') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};
export const formatDistance = (meters, { unit = 'metric' } = {}) => {
  if (meters == null || isNaN(meters)) return '-';

  if (unit === 'imperial') {
    const miles = meters / 1609.34;
    if (miles < 0.1) return `${Math.round(miles * 5280)} ft`;
    return `${miles.toFixed(1)} mi`;
  }

  // metric (default)
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};
export const formatTime = (dateLike) => {
  const d = new Date(dateLike);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
export const formatCurrency = (amount, currency = 'INR') => {
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
  if (seconds == null || isNaN(seconds)) return '-';
  const mins  = Math.round(seconds / 60);
  const hrs   = Math.floor(mins / 60);
  const restM = mins % 60;
  return hrs ? `${hrs} h ${restM} m` : `${mins} m`;
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