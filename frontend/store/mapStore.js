import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useMapStore = create(
  devtools((set) => ({
    // Map preferences
    mapCenter: {
      lat: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT) || 32.7767,
      lng: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG) || -96.7970
    },
    mapZoom: parseInt(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM) || 10,
    
    // Map settings
    showTraffic: true,
    showTransit: false,
    mapType: 'roadmap', // roadmap, satellite, hybrid, terrain
    
    // Markers and routes
    markers: [],
    routePolyline: null,
    selectedMarker: null,
    
    // User location
    userLocation: null,
    isTrackingLocation: false,
    
    // Update map center
    setMapCenter: (center) => set({ mapCenter: center }),
    
    // Update map zoom
    setMapZoom: (zoom) => set({ mapZoom: zoom }),
    
    // Toggle traffic layer
    toggleTraffic: () => set((state) => ({ showTraffic: !state.showTraffic })),
    
    // Toggle transit layer
    toggleTransit: () => set((state) => ({ showTransit: !state.showTransit })),
    
    // Set map type
    setMapType: (type) => set({ mapType: type }),
    
    // Set markers
    setMarkers: (markers) => set({ markers }),
    
    // Add marker
    addMarker: (marker) => set((state) => ({ 
      markers: [...state.markers, marker] 
    })),
    
    // Remove marker
    removeMarker: (markerId) => set((state) => ({ 
      markers: state.markers.filter(m => m.id !== markerId) 
    })),
    
    // Select marker
    selectMarker: (markerId) => set((state) => ({ 
      selectedMarker: state.markers.find(m => m.id === markerId) || null 
    })),
    
    // Clear selected marker
    clearSelectedMarker: () => set({ selectedMarker: null }),
    
    // Set route polyline
    setRoutePolyline: (polyline) => set({ routePolyline: polyline }),
    
    // Clear route
    clearRoute: () => set({ routePolyline: null }),
    
    // Set user location
    setUserLocation: (location) => set({ userLocation: location }),
    
    // Toggle location tracking
    toggleLocationTracking: () => set((state) => ({ 
      isTrackingLocation: !state.isTrackingLocation 
    })),
    
    // Reset map
    resetMap: () => set({
      markers: [],
      routePolyline: null,
      selectedMarker: null,
      mapCenter: {
        lat: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT) || 32.7767,
        lng: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG) || -96.7970
      },
      mapZoom: parseInt(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM) || 10
    })
  }))
);

export default useMapStore;
