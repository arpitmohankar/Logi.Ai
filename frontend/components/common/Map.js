/* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable react-hooks/exhaustive-deps */
// import { useEffect, useRef, useState, useCallback } from 'react';
// import { GoogleMap, LoadScript, Marker, Polyline, TrafficLayer, DirectionsRenderer } from '@react-google-maps/api';
// import { toast } from 'react-hot-toast';
// import LoadingSpinner from './LoadingSpinner';
// import useMapStore from '../../store/mapStore';

// const libraries = ['places', 'geometry', 'drawing'];

// const Map = ({
//   center,
//   zoom = 12,
//   markers = [],
//   route = null,
//   showTraffic = true,
//   showUserLocation = false,
//   onMapClick = null,
//   onMarkerClick = null,
//   height = '100%',
//   width = '100%',
//   className = ''
// }) => {
//   const mapRef = useRef(null);
//   const [map, setMap] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [directions, setDirections] = useState(null);
//   const { mapType, setMapCenter, setMapZoom } = useMapStore();

//   const mapContainerStyle = {
//     width,
//     height
//   };

//   const defaultCenter = center || {
//     lat: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT) || 32.7767,
//     lng: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG) || -96.7970
//   };

//   const options = {
//     disableDefaultUI: false,
//     zoomControl: true,
//     mapTypeControl: true,
//     streetViewControl: false,
//     fullscreenControl: true,
//     mapTypeId: mapType
//   };

//   // Get user location
//   useEffect(() => {
//     if (showUserLocation && navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const pos = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           };
//           setUserLocation(pos);
//           if (map && !center) {
//             map.panTo(pos);
//             setMapCenter(pos);
//           }
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//           toast.error('Unable to get your location');
//         }
//       );
//     }
//   }, [showUserLocation, map, center]);

//   // Handle map load
//   const onLoad = useCallback((map) => {
//     mapRef.current = map;
//     setMap(map);
//   }, []);

//   // Handle map unload
//   const onUnmount = useCallback(() => {
//     mapRef.current = null;
//     setMap(null);
//   }, []);

//   // Handle center changed
//   const onCenterChanged = () => {
//     if (map) {
//       const center = map.getCenter();
//       setMapCenter({
//         lat: center.lat(),
//         lng: center.lng()
//       });
//     }
//   };

//   // Handle zoom changed
//   const onZoomChanged = () => {
//     if (map) {
//       setMapZoom(map.getZoom());
//     }
//   };

//   // Draw route if provided
//   useEffect(() => {
//     if (map && route && route.waypoints && route.waypoints.length > 1) {
//       const directionsService = new window.google.maps.DirectionsService();
      
//       const origin = route.waypoints[0];
//       const destination = route.waypoints[route.waypoints.length - 1];
//       const waypoints = route.waypoints.slice(1, -1).map(point => ({
//         location: { lat: point.lat, lng: point.lng },
//         stopover: true
//       }));

//       directionsService.route(
//         {
//           origin: { lat: origin.lat, lng: origin.lng },
//           destination: { lat: destination.lat, lng: destination.lng },
//           waypoints: waypoints,
//           travelMode: window.google.maps.TravelMode.DRIVING,
//           optimizeWaypoints: route.optimize || false
//         },
//         (result, status) => {
//           if (status === 'OK') {
//             setDirections(result);
//           } else {
//             console.error('Directions request failed:', status);
//           }
//         }
//       );
//     } else {
//       setDirections(null);
//     }
//   }, [map, route]);

//   // Custom marker icon
//   const getMarkerIcon = (type) => {
//     const iconMap = {
//       delivery: '📦',
//       user: '📍',
//       warehouse: '🏭',
//       completed: '✅'
//     };
    
//     return {
//       url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
//         `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
//           <text x="20" y="30" font-size="30" text-anchor="middle">${iconMap[type] || '📍'}</text>
//         </svg>`
//       )}`,
//       scaledSize: new window.google.maps.Size(40, 40),
//       anchor: new window.google.maps.Point(20, 40)
//     };
//   };

//   return (
//     <LoadScript
//       googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
//       libraries={libraries}
//       loadingElement={<LoadingSpinner size="large" />}
//     >
//       <GoogleMap
//         mapContainerStyle={mapContainerStyle}
//         mapContainerClassName={className}
//         center={defaultCenter}
//         zoom={zoom}
//         onLoad={onLoad}
//         onUnmount={onUnmount}
//         onCenterChanged={onCenterChanged}
//         onZoomChanged={onZoomChanged}
//         onClick={onMapClick}
//         options={options}
//       >
//         {/* User location marker */}
//         {userLocation && (
//           <Marker
//             position={userLocation}
//             icon={getMarkerIcon('user')}
//             title="Your Location"
//           />
//         )}

//         {/* Custom markers */}
//         {markers.map((marker, index) => (
//           <Marker
//             key={marker.id || index}
//             position={{ lat: marker.lat, lng: marker.lng }}
//             icon={marker.icon || getMarkerIcon(marker.type)}
//             title={marker.title}
//             onClick={() => onMarkerClick && onMarkerClick(marker)}
//           />
//         ))}

//         {/* Route directions */}
//         {directions && (
//           <DirectionsRenderer
//             directions={directions}
//             options={{
//               suppressMarkers: false,
//               polylineOptions: {
//                 strokeColor: '#0071CE',
//                 strokeOpacity: 0.8,
//                 strokeWeight: 4
//               }
//             }}
//           />
//         )}

//         {/* Traffic layer */}
//         {showTraffic && <TrafficLayer />}
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default Map;
import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, TrafficLayer, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import useMapStore from '../../store/mapStore';

const libraries = ['places', 'geometry', 'drawing'];

const Map = ({
  center,
  zoom = 12,
  markers = [],
  route = null,
  showTraffic = true,
  showUserLocation = false,
  onMapClick = null,
  onMarkerClick = null,
  height = '100%',
  width = '100%',
  className = ''
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const { mapType, setMapCenter, setMapZoom } = useMapStore();

  // Use the useJsApiLoader hook instead of LoadScript
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapContainerStyle = {
    width,
    height
  };

  const defaultCenter = center || {
    lat: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT) || 32.7767,
    lng: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG) || -96.7970
  };

  const options = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    mapTypeId: mapType || 'roadmap'
  };

  // Get user location
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(pos);
          if (map && !center) {
            map.panTo(pos);
            setMapCenter(pos);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location');
        }
      );
    }
  }, [showUserLocation, map, center]);

  // Handle map load
  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  // Handle map unload
  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
  }, []);

  // Handle center changed
  const onCenterChanged = () => {
    if (map) {
      const center = map.getCenter();
      setMapCenter({
        lat: center.lat(),
        lng: center.lng()
      });
    }
  };

  // Handle zoom changed
  const onZoomChanged = () => {
    if (map) {
      setMapZoom(map.getZoom());
    }
  };

  // Draw route if provided
  useEffect(() => {
    if (map && route && route.waypoints && route.waypoints.length > 1 && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      
      const origin = route.waypoints[0];
      const destination = route.waypoints[route.waypoints.length - 1];
      const waypoints = route.waypoints.slice(1, -1).map(point => ({
        location: { lat: point.lat, lng: point.lng },
        stopover: true
      }));

      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          waypoints: waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: route.optimize || false
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
          } else {
            console.error('Directions request failed:', status);
          }
        }
      );
    } else {
      setDirections(null);
    }
  }, [map, route]);

  // Custom marker icon
  const getMarkerIcon = (type) => {
    if (!window.google) return null;
    
    const iconMap = {
      delivery: '📦',
      user: '📍',
      warehouse: '🏭',
      completed: '✅',
      current: '🚚',
      pending: '📌'
    };
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <text x="20" y="30" font-size="30" text-anchor="middle">${iconMap[type] || '📍'}</text>
        </svg>`
      )}`,
      scaledSize: window.google ? new window.google.maps.Size(40, 40) : null,
      anchor: window.google ? new window.google.maps.Point(20, 40) : null
    };
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading maps</p>
          <p className="text-sm text-gray-600 mt-1">Please check your API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      mapContainerClassName={className}
      center={defaultCenter}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onCenterChanged={onCenterChanged}
      onZoomChanged={onZoomChanged}
      onClick={onMapClick}
      options={options}
    >
      {/* User location marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={getMarkerIcon('user')}
          title="Your Location"
        />
      )}

      {/* Custom markers */}
      {markers.map((marker, index) => (
        <Marker
          key={marker.id || index}
          position={{ lat: marker.lat, lng: marker.lng }}
          icon={marker.icon || getMarkerIcon(marker.type)}
          title={marker.title}
          onClick={() => onMarkerClick && onMarkerClick(marker)}
        />
      ))}

      {/* Route directions */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#0071CE',
              strokeOpacity: 0.8,
              strokeWeight: 4
            }
          }}
        />
      )}

      {/* Traffic layer */}
      {showTraffic && <TrafficLayer />}
    </GoogleMap>
  );
};

export default Map;
