// Map utility functions

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

export const getBounds = (markers) => {
  if (!markers || markers.length === 0) return null;
  
  const bounds = {
    north: -90,
    south: 90,
    east: -180,
    west: 180
  };
  
  markers.forEach(marker => {
    bounds.north = Math.max(bounds.north, marker.lat);
    bounds.south = Math.min(bounds.south, marker.lat);
    bounds.east = Math.max(bounds.east, marker.lng);
    bounds.west = Math.min(bounds.west, marker.lng);
  });
  
  return bounds;
};

export const fitBounds = (map, markers) => {
  const bounds = getBounds(markers);
  if (!bounds || !map) return;
  
  const googleBounds = new window.google.maps.LatLngBounds(
    new window.google.maps.LatLng(bounds.south, bounds.west),
    new window.google.maps.LatLng(bounds.north, bounds.east)
  );
  
  map.fitBounds(googleBounds);
};

export const decodePolyline = (encoded) => {
  const poly = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;
    
    shift = 0;
    result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;
    
    poly.push({
      lat: lat / 1e5,
      lng: lng / 1e5
    });
  }
  
  return poly;
};

export const formatDistanceForDisplay = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDurationForDisplay = (seconds) => {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} min`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const getMarkerColor = (status) => {
  const colors = {
    pending: '#FFA500',
    assigned: '#3B82F6',
    'picked-up': '#8B5CF6',
    'in-transit': '#10B981',
    delivered: '#22C55E',
    failed: '#EF4444'
  };
  return colors[status] || '#6B7280';
};

export const createCustomMarkerIcon = (color, label) => {
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#FFFFFF',
    scale: 20,
    labelOrigin: new window.google.maps.Point(0, 0)
  };
};
