import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { token } = response.data;
          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to login if refresh fails
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // Show error message
    const message = error.response?.data?.error || 'Something went wrong';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateLocation: (location) => api.put('/auth/location', location),
};

export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/stats'),
  
  // Deliveries
  getDeliveries: (params) => api.get('/admin/deliveries', { params }),
  getDelivery: (id) => api.get(`/admin/deliveries/${id}`),
  createDelivery: (data) => api.post('/admin/deliveries', data),
  updateDelivery: (id, data) => api.put(`/admin/deliveries/${id}`, data),
  deleteDelivery: (id) => api.delete(`/admin/deliveries/${id}`),
  assignDelivery: (id, deliveryBoyId) => api.put(`/admin/deliveries/${id}/assign`, { deliveryBoyId }),
  bulkAssignDeliveries: (data) => api.post('/admin/deliveries/bulk-assign', data),
  
  // Delivery Boys
  getDeliveryBoys: () => api.get('/admin/delivery-boys'),
};

export const deliveryAPI = {
  // My deliveries
  getMyDeliveries: (params) => api.get('/delivery/my-deliveries', { params }),
  getStats: () => api.get('/delivery/stats'),
  
  // Route optimization
  optimizeRoute: (data) => api.post('/delivery/optimize-route', data),
  refreshRoute: (data) => api.post('/delivery/refresh-route', data),
  getDirections: (data) => api.post('/delivery/directions', data),
  
  // Delivery operations
  updateDeliveryStatus: (id, data) => api.put(`/delivery/${id}/status`, data),
  generateTrackingCode: (id) => api.post(`/delivery/${id}/generate-tracking`),
  uploadDeliveryProof: (id, data) => api.post(`/delivery/${id}/proof`, data),
};

export const trackingAPI = {
  trackDelivery: (trackingCode) => api.post('/tracking/track', { trackingCode }),
  getRealtimeLocation: (trackingCode) => api.get(`/tracking/${trackingCode}/location`),
  getLocationHistory: (trackingCode) => api.get(`/tracking/${trackingCode}/history`),
  getETA: (trackingCode) => api.get(`/tracking/${trackingCode}/eta`),
  submitFeedback: (trackingCode, data) => api.post(`/tracking/${trackingCode}/feedback`, data),
};

export const utilsAPI = {
  autocompleteAddress: (input) => api.get('/utils/autocomplete', { params: { input } }),
  geocodeAddress: (address) => api.post('/utils/geocode', { address }),
};

export default api;