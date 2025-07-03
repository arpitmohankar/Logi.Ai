import { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { getAuthToken } from '../utils/auth';
import useAuthStore from '../store/authStore';

const SocketContext = createContext({});

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      const token = getAuthToken();
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

      // Initialize socket connection
      socketRef.current = io(socketUrl, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      // Join user-specific room
      if (user.role === 'delivery') {
        socketRef.current.emit('delivery-boy-join', user._id);
      }

      // Global event listeners
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Cleanup on unmount or user change
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [user]);

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const value = {
    socket: socketRef.current,
    emit,
    on,
    off,
    isConnected: socketRef.current?.connected || false
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
};
