import { useEffect, useState } from 'react';
import MapWrapper from '../common/MapWrapper'; // Use the wrapper instead
import { getMarkerColor } from '../../utils/mapHelpers';
import LoadingSpinner from '../common/LoadingSpinner';

const RouteMap = ({ 
  deliveries, 
  optimizedRoute, 
  currentLocation,
  currentDeliveryIndex = 0 
}) => {
  const [markers, setMarkers] = useState([]);
  const [route, setRoute] = useState(null);
  const [isReady, setIsReady] = useState(0);

  useEffect(() => {
    // Ensure we have data before setting up the map
    if (!deliveries || deliveries.length === 0) {
      console.log('No deliveries to display on map');
      return;
    }

    // Create markers from deliveries or optimized route
    if (optimizedRoute && optimizedRoute.deliveryOrder) {
      const deliveryMarkers = optimizedRoute.deliveryOrder
        .filter(item => item.delivery && item.delivery.coordinates)
        .map((item, index) => {
          const delivery = item.delivery;
          return {
            id: delivery._id,
            lat: delivery.coordinates.lat,
            lng: delivery.coordinates.lng,
            title: `${index + 1}. ${delivery.customerName}`,
            type: index < currentDeliveryIndex ? 'completed' : 
                  index === currentDeliveryIndex ? 'current' : 'pending',
            info: {
              address: delivery.address,
              phone: delivery.customerPhone,
              status: delivery.status
            }
          };
        });

      setMarkers(deliveryMarkers);

      // Create route waypoints
      if (currentLocation && deliveryMarkers.length > 0) {
        const waypoints = [
          { lat: currentLocation.lat, lng: currentLocation.lng },
          ...deliveryMarkers.map(marker => ({
            lat: marker.lat,
            lng: marker.lng
          }))
        ];

        setRoute({
          waypoints,
          optimize: false // Already optimized
        });
      }
    } else {
      // Fallback to showing all deliveries without optimization
      const deliveryMarkers = deliveries
        .filter(d => d.coordinates && d.coordinates.lat && d.coordinates.lng)
        .map((delivery, index) => ({
          id: delivery._id,
          lat: delivery.coordinates.lat,
          lng: delivery.coordinates.lng,
          title: `${index + 1}. ${delivery.customerName}`,
          type: 'pending',
          info: {
            address: delivery.address,
            phone: delivery.customerPhone,
            status: delivery.status
          }
        }));

      setMarkers(deliveryMarkers);
    }

    setIsReady(true);
  }, [optimizedRoute, currentLocation, currentDeliveryIndex, deliveries]);

  // Calculate map center
  const getMapCenter = () => {
    if (currentLocation) {
      return currentLocation;
    }
    if (markers.length > 0) {
      return { lat: markers[0].lat, lng: markers[0].lng };
    }
    return {
      lat: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT) || 32.7767,
      lng: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG) || -96.7970
    };
  };

  if (!isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <MapWrapper
        center={getMapCenter()}
        zoom={13}
        markers={markers}
        route={route}
        showTraffic={true}
        showUserLocation={true}
        height="100%"
        width="100%"
      />
    </div>
  );
};

export default RouteMap;
