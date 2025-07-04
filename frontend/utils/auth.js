import { authAPI } from './api';
import Router from 'next/router';

export const setAuthToken = (token, refreshToken) => {
  if (token) {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    setAuthToken(null);
    Router.push('/');
  }
};

export const redirectBasedOnRole = (user) => {
  if (!user) return;
  
  switch (user.role) {
    case 'admin':
      Router.push('/admin/dashboard');
      break;
    case 'delivery':
      Router.push('/delivery/dashboard');
      break;
    default:
      Router.push('/');
  }
};

export const checkAuthAndRedirect = async () => {
  const token = getAuthToken();
  if (!token) {
    Router.push('/');
    return null;
  }
  
  try {
    const response = await authAPI.getMe();
    return response.data.data;
  } catch (error) {
    setAuthToken(null);
    Router.push('/');
    return null;
  }
};
