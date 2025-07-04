import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { getAuthToken } from '../utils/auth';

export const useSocket = (namespace = '') => {
  const socketRef = useRef(null);
  
  useEffect(() => {
    const token = getAuthToken();
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    // Initialize socket connection
    socketRef.current = io(`${socketUrl}${namespace}`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });
    
    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [namespace]);
  
  // Emit event
  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };
  
  // Listen to event
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };
  
  // Remove listener
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };
  
  return {
    socket: socketRef.current,
    emit,
    on,
    off
  };
};
