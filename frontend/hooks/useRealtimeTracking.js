/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { useSocketContext } from '../providers/SocketProvider';
import { trackingAPI } from '../utils/api';

export const useRealtimeTracking = (trackingCode) => {
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { on, off, emit } = useSocketContext();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!trackingCode) return;

    // Initial fetch
    fetchTrackingData();

    // Join tracking room
    emit('join-tracking', trackingCode);

    // Set up real-time listeners
    const handleLocationUpdate = (data) => {
      setTrackingData(prev => ({
        ...prev,
        deliveryBoy: {
          ...prev.deliveryBoy,
          currentLocation: {
            lat: data.location.lat,
            lng: data.location.lng,
            lastUpdated: data.timestamp
          }
        }
      }));
      setLastUpdate(new Date());
    };

    const handleStatusUpdate = (data) => {
      setTrackingData(prev => ({
        ...prev,
        delivery: {
          ...prev.delivery,
          status: data.status
        }
      }));
      setLastUpdate(new Date());
    };

    on('location-update', handleLocationUpdate);
    on('status-changed', handleStatusUpdate);

    // Periodic refresh every 30 seconds
    intervalRef.current = setInterval(fetchTrackingData, 30000);

    return () => {
      off('location-update', handleLocationUpdate);
      off('status-changed', handleStatusUpdate);
      emit('leave-tracking', trackingCode);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [trackingCode]);

  const fetchTrackingData = async () => {
    try {
      setIsLoading(true);
      const response = await trackingAPI.trackDelivery(trackingCode);
      setTrackingData(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    fetchTrackingData();
  };

  return {
    trackingData,
    isLoading,
    error,
    lastUpdate,
    refresh
  };
};
