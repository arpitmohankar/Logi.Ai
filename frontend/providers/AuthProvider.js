/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import { getAuthToken } from '../utils/auth';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const { user, isAuthenticated, fetchUser, logout } = useAuthStore();

  useEffect(() => {
    // Check for existing auth token on mount
    const initAuth = async () => {
      const token = getAuthToken();
      if (token && !user) {
        try {
          await fetchUser();
        } catch (error) {
          console.error('Failed to fetch user:', error);
          logout();
        }
      }
    };

    initAuth();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      if (!isAuthenticated && router.pathname.startsWith('/admin')) {
        router.push('/admin/login');
      } else if (!isAuthenticated && router.pathname.startsWith('/delivery')) {
        router.push('/delivery/login');
      }
    };

    handleAuthChange();
  }, [isAuthenticated, router.pathname]);

  const value = {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isDelivery: user?.role === 'delivery'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
