// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  ADMIN: {
    STATS: '/admin/stats',
    DELIVERIES: '/admin/deliveries',
    DELIVERY_BOYS: '/admin/delivery-boys',
  },
  DELIVERY: {
    MY_DELIVERIES: '/delivery/my-deliveries',
    OPTIMIZE_ROUTE: '/delivery/optimize-route',
    REFRESH_ROUTE: '/delivery/refresh-route',
  },
  TRACKING: {
    TRACK: '/tracking/track',
    LOCATION: '/tracking/location',
  }
};

// Delivery Status
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked-up',
  IN_TRANSIT: 'in-transit',
  DELIVERED: 'delivered',
  FAILED: 'failed'
};

// Delivery Priority
export const DELIVERY_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DELIVERY: 'delivery',
  CUSTOMER: 'customer'
};

// Map Constants
export const MAP_CONSTANTS = {
  DEFAULT_CENTER: {
    lat: 32.7767,
    lng: -96.7970
  },
  DEFAULT_ZOOM: 12,
  MAX_ZOOM: 20,
  MIN_ZOOM: 5
};

// Status Colors
export const STATUS_COLORS = {
  [DELIVERY_STATUS.PENDING]: '#FFA500',
  [DELIVERY_STATUS.ASSIGNED]: '#3B82F6',
  [DELIVERY_STATUS.PICKED_UP]: '#8B5CF6',
  [DELIVERY_STATUS.IN_TRANSIT]: '#10B981',
  [DELIVERY_STATUS.DELIVERED]: '#22C55E',
  [DELIVERY_STATUS.FAILED]: '#EF4444'
};

// Priority Colors
export const PRIORITY_COLORS = {
  [DELIVERY_PRIORITY.LOW]: '#6B7280',
  [DELIVERY_PRIORITY.MEDIUM]: '#3B82F6',
  [DELIVERY_PRIORITY.HIGH]: '#F59E0B',
  [DELIVERY_PRIORITY.URGENT]: '#EF4444'
};

// Refresh Intervals
export const REFRESH_INTERVALS = {
  LOCATION_UPDATE: 10000, // 10 seconds
  ROUTE_REFRESH: 30000, // 30 seconds
  STATS_REFRESH: 60000, // 1 minute
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  MAP_PREFERENCES: 'mapPreferences'
};

// Routes
export const ROUTES = {
  HOME: '/',
  TRACK: '/track',
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    DELIVERIES: '/admin/deliveries',
    SETTINGS: '/admin/settings'
  },
  DELIVERY: {
    LOGIN: '/delivery/login',
    DASHBOARD: '/delivery/dashboard',
    ROUTE: '/delivery/route',
    HISTORY: '/delivery/history'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_TRACKING_CODE: 'Invalid tracking code.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  DELIVERY_CREATED: 'Delivery created successfully.',
  DELIVERY_UPDATED: 'Delivery updated successfully.',
  ROUTE_OPTIMIZED: 'Route optimized successfully.',
  STATUS_UPDATED: 'Status updated successfully.'
};
