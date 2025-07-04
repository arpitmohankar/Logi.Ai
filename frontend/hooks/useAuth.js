/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import { getAuthToken } from '../utils/auth';

export const useAuth = (options = {}) => {
  const router = useRouter();
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    login,
    logout,
    fetchUser 
  } = useAuthStore();
  
  const { 
    redirectTo = null,
    redirectIfFound = false,
    allowedRoles = []
  } = options;
  
  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token && !user) {
        await fetchUser();
      }
    };
    
    checkAuth();
  }, []);
  
  useEffect(() => {
    // Handle redirects based on authentication status
    if (!isLoading) {
      if (!isAuthenticated && redirectTo && !redirectIfFound) {
        router.push(redirectTo);
      } else if (isAuthenticated && redirectTo && redirectIfFound) {
        router.push(redirectTo);
      }
      
      // Check role-based access
      if (isAuthenticated && allowedRoles.length > 0 && user) {
        if (!allowedRoles.includes(user.role)) {
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, redirectTo, redirectIfFound, allowedRoles]);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    fetchUser
  };
};

// Hook for requiring authentication
export const useRequireAuth = (allowedRoles = []) => {
  const auth = useAuth({
    redirectTo: '/',
    allowedRoles
  });
  
  return auth;
};

// Hook for guest users (redirect if authenticated)
export const useRequireGuest = () => {
  const auth = useAuth({
    redirectTo: '/dashboard',
    redirectIfFound: true
  });
  
  return auth;
};
