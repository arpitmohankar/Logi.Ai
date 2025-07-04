import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { adminAPI, deliveryAPI } from '../utils/api';
import { toast } from 'react-hot-toast';

const useDeliveryStore = create(
  devtools((set, get) => ({
    deliveries: [],
    selectedDelivery: null,
    optimizedRoute: null,
    isLoading: false,
    filters: {
      status: '',
      date: '',
      priority: ''
    },
    
    // Fetch deliveries based on user role
    fetchDeliveries: async (userRole, params = {}) => {
      set({ isLoading: true });
      try {
        let response;
        if (userRole === 'admin') {
          response = await adminAPI.getDeliveries(params);
        } else {
          response = await deliveryAPI.getMyDeliveries(params);
        }
        
        set({ 
          deliveries: response.data.data,
          isLoading: false 
        });
        return response.data.data;
      } catch (error) {
        set({ isLoading: false });
        toast.error('Failed to fetch deliveries');
        return [];
      }
    },
    
    // Get single delivery
    fetchDelivery: async (id, userRole) => {
      set({ isLoading: true });
      try {
        const response = await adminAPI.getDelivery(id);
        set({ 
          selectedDelivery: response.data.data,
          isLoading: false 
        });
        return response.data.data;
      } catch (error) {
        set({ isLoading: false });
        toast.error('Failed to fetch delivery details');
        return null;
      }
    },
    
    // Create new delivery (admin only)
    createDelivery: async (deliveryData) => {
      set({ isLoading: true });
      try {
        const response = await adminAPI.createDelivery(deliveryData);
        const newDelivery = response.data.data;
        
        set((state) => ({
          deliveries: [newDelivery, ...state.deliveries],
          isLoading: false
        }));
        
        toast.success('Delivery created successfully');
        return { success: true, delivery: newDelivery };
      } catch (error) {
        set({ isLoading: false });
        const message = error.response?.data?.error || 'Failed to create delivery';
        toast.error(message);
        return { success: false, error: message };
      }
    },
    
    // Update delivery
    updateDelivery: async (id, updates) => {
      set({ isLoading: true });
      try {
        const response = await adminAPI.updateDelivery(id, updates);
        const updatedDelivery = response.data.data;
        
        set((state) => ({
          deliveries: state.deliveries.map(d => 
            d._id === id ? updatedDelivery : d
          ),
          selectedDelivery: state.selectedDelivery?._id === id 
            ? updatedDelivery 
            : state.selectedDelivery,
          isLoading: false
        }));
        
        toast.success('Delivery updated successfully');
        return { success: true, delivery: updatedDelivery };
      } catch (error) {
        set({ isLoading: false });
        toast.error('Failed to update delivery');
        return { success: false, error: error.message };
      }
    },
    
    // Optimize route
    // Update the optimizeRoute action
optimizeRoute: async (deliveryIds, currentLocation) => {
  set({ isLoading: true });
  try {
    // Validate inputs
    if (!deliveryIds || deliveryIds.length === 0) {
      throw new Error('No deliveries to optimize');
    }
    
    if (!currentLocation || !currentLocation.lat || !currentLocation.lng) {
      throw new Error('Invalid current location');
    }
    
    const response = await deliveryAPI.optimizeRoute({
      deliveryIds,
      currentLocation,
      useTraffic: true
    });
    
    // Validate response
    if (!response.data.success) {
      throw new Error(response.data.error || 'Optimization failed');
    }
    
    set({ 
      optimizedRoute: response.data.data.optimizedRoute || response.data.data,
      isLoading: false 
    });
    
    toast.success('Route optimized successfully');
    return { success: true, route: response.data.data };
  } catch (error) {
    set({ isLoading: false });
    console.error('Route optimization error:', error);
    toast.error(error.message || 'Failed to optimize route');
    return { success: false, error: error.message };
  }
},
    
    // Refresh route (unique feature)
    refreshRoute: async (currentLocation, remainingDeliveryIds) => {
      set({ isLoading: true });
      try {
        const response = await deliveryAPI.refreshRoute({
          currentLocation,
          remainingDeliveryIds
        });
        
        set({ 
          optimizedRoute: response.data.data,
          isLoading: false 
        });
        
        toast.success('Route refreshed with current traffic conditions');
        return { success: true, route: response.data.data };
      } catch (error) {
        set({ isLoading: false });
        toast.error('Failed to refresh route');
        return { success: false, error: error.message };
      }
    },
    
    // Update delivery status
    updateDeliveryStatus: async (id, status, additionalData = {}) => {
      try {
        const response = await deliveryAPI.updateDeliveryStatus(id, {
          status,
          ...additionalData
        });
        
        set((state) => ({
          deliveries: state.deliveries.map(d => 
            d._id === id ? { ...d, status } : d
          )
        }));
        
        toast.success(`Delivery marked as ${status}`);
        return { success: true };
      } catch (error) {
        toast.error('Failed to update delivery status');
        return { success: false, error: error.message };
      }
    },
    
    // Set filters
    setFilters: (filters) => {
      set({ filters });
    },
    
    // Clear selected delivery
    clearSelectedDelivery: () => {
      set({ selectedDelivery: null });
    },
    
    // Clear optimized route
    clearOptimizedRoute: () => {
      set({ optimizedRoute: null });
    }
  }))
);

export default useDeliveryStore;
