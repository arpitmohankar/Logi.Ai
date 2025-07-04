import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authAPI } from '../utils/api';
import { setAuthToken } from '../utils/auth';
import { toast } from 'react-hot-toast';

const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        
        // Login action
        login: async (credentials) => {
          set({ isLoading: true });
          try {
            const response = await authAPI.login(credentials);
            const { token, user } = response.data;
            
            setAuthToken(token);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            
            toast.success('Login successful!');
            return { success: true, user };
          } catch (error) {
            set({ isLoading: false });
            const message = error.response?.data?.error || 'Login failed';
            toast.error(message);
            return { success: false, error: message };
          }
        },
        
        // Register action
        register: async (userData) => {
          set({ isLoading: true });
          try {
            const response = await authAPI.register(userData);
            const { token, user } = response.data;
            
            setAuthToken(token);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            
            toast.success('Registration successful!');
            return { success: true, user };
          } catch (error) {
            set({ isLoading: false });
            const message = error.response?.data?.error || 'Registration failed';
            toast.error(message);
            return { success: false, error: message };
          }
        },
        
        // Logout action
        logout: async () => {
          try {
            await authAPI.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            setAuthToken(null);
            set({ user: null, isAuthenticated: false });
            toast.success('Logged out successfully');
          }
        },
        
        // Get current user
        fetchUser: async () => {
          set({ isLoading: true });
          try {
            const response = await authAPI.getMe();
            set({ 
              user: response.data.data, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return response.data.data;
          } catch (error) {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
            return null;
          }
        },
        
        // Update user location (for delivery boys)
        updateLocation: async (location) => {
          try {
            await authAPI.updateLocation(location);
            set((state) => ({
              user: {
                ...state.user,
                currentLocation: {
                  ...location,
                  lastUpdated: new Date()
                }
              }
            }));
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
        
        // Clear auth state
        clearAuth: () => {
          setAuthToken(null);
          set({ user: null, isAuthenticated: false });
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated 
        })
      }
    )
  )
);

export default useAuthStore;
