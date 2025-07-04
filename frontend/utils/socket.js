import io from 'socket.io-client';
import { getAuthToken } from './auth';

let socket = null;

export const initSocket = () => {
  if (socket) return socket;
  
  const token = getAuthToken();
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
  
  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });
  
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Delivery boy specific events
export const joinDeliveryRoom = (userId) => {
  const socket = getSocket();
  socket.emit('delivery-boy-join', userId);
};

export const updateLocation = (location, trackingCodes = []) => {
  const socket = getSocket();
  const token = getAuthToken();
  
  socket.emit('update-location', {
    userId: socket.auth.userId,
    location,
    trackingCodes
  });
};

// Customer tracking events
export const joinTrackingRoom = (trackingCode) => {
  const socket = getSocket();
  socket.emit('join-tracking', trackingCode);
};

export const leaveTrackingRoom = (trackingCode) => {
  const socket = getSocket();
  socket.emit('leave-tracking', trackingCode);
};

// Socket event listeners
export const onLocationUpdate = (callback) => {
  const socket = getSocket();
  socket.on('location-update', callback);
  
  return () => {
    socket.off('location-update', callback);
  };
};

export const onStatusUpdate = (callback) => {
  const socket = getSocket();
  socket.on('status-changed', callback);
  
  return () => {
    socket.off('status-changed', callback);
  };
};

export const onNewDelivery = (callback) => {
  const socket = getSocket();
  socket.on('new-delivery', callback);
  
  return () => {
    socket.off('new-delivery', callback);
  };
};

export const onNewAssignment = (callback) => {
  const socket = getSocket();
  socket.on('new-assignment', callback);
  
  return () => {
    socket.off('new-assignment', callback);
  };
};

export const onRouteRefreshed = (callback) => {
  const socket = getSocket();
  socket.on('route-refreshed', callback);
  
  return () => {
    socket.off('route-refreshed', callback);
  };
};
