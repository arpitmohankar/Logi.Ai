/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const defaultOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watchId, setWatchId] = useState(null);

  const mergedOptions = { ...defaultOptions, ...options };

  // Get current position
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast.error('Geolocation is not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };
        setLocation(coords);
        setIsLoading(false);
      },
      (error) => {
        setError(error.message);
        setIsLoading(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information unavailable');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out');
            break;
          default:
            toast.error('An unknown error occurred');
        }
      },
      mergedOptions
    );
  }, [mergedOptions]);

  // Watch position
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    if (watchId) {
      // Already watching
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };
        setLocation(coords);
        setError(null);
      },
      (error) => {
        setError(error.message);
        console.error('Watch position error:', error);
      },
      mergedOptions
    );

    setWatchId(id);
  }, [watchId, mergedOptions]);

  // Clear watch
  const clearWatch = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    isLoading,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    isWatching: !!watchId
  };
};
