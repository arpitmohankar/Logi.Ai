import { useEffect, useState } from 'react';
import MapWrapper from '../common/MapWrapper'; // Use the wrapper instead
import { getMarkerColor } from '../../utils/mapHelpers';
import LoadingSpinner from '../common/LoadingSpinner';
import { Polyline } from '@react-google-maps/api';
import { decodePolyline } from '../../utils/mapHelpers';

const RouteMap = ({ 
  deliveries, 
  optimizedRoute, 
  currentLocation,
  currentDeliveryIndex = 0 
}) => {
  const [markers, setMarkers] = useState([]);
  const [route, setRoute] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [polylinePath, setPolylinePath] = useState(null);

  useEffect(() => {
    // Ensure we have data before setting up the map
    if (!deliveries || deliveries.length === 0) {
      console.log('No deliveries to display on map');
      return;
    }

    let deliveryMarkers = [];

   if (optimizedRoute?.deliveryOrder?.length) {
       deliveryMarkers = optimizedRoute.deliveryOrder
         .filter(item => item.delivery && item.delivery.coordinates)
         .map((item, index) => {
           const d = item.delivery;
           return {
             id: d._id,
             lat: d.coordinates.lat,
             lng: d.coordinates.lng,
             title: `${index + 1}. ${d.customerName}`,
             type:
               index < currentDeliveryIndex
                 ? 'completed'
                 : index === currentDeliveryIndex
                 ? 'current'
                 : 'pending',
             info: {
               address: d.address,
               phone:   d.customerPhone,
               status:  d.status
             }
           };
         });
         setMarkers(deliveryMarkers); 
    } else {
      // Fallback to showing all deliveries without optimization
      deliveryMarkers = deliveries
        .filter(d => d.coordinates?.lat != null && d.coordinates?.lng != null)
        .map((d, i) => ({
          id: d._id,
          lat: d.coordinates.lat,
          lng: d.coordinates.lng,
          title: `${i + 1}. ${d.customerName}`,
          type: 'pending',
          info: {
            address: d.address,
            phone:   d.customerPhone,
            status:  d.status
          }
        }));

      setMarkers(deliveryMarkers);
    }

     // ------------------------------------------------------------------
   if (optimizedRoute?.routePolyline) {
     // Server already supplied the overview polyline
     setPolylinePath(decodePolyline(optimizedRoute.routePolyline));
     setRoute(null);                 // no DirectionsService needed
   } else if (currentLocation && deliveryMarkers.length > 0) {
     // Build a way-point list for client-side DirectionsService draw
     const waypoints = [
       { lat: currentLocation.lat, lng: currentLocation.lng },
       ...deliveryMarkers.map(m => ({ lat: m.lat, lng: m.lng }))
     ];
     setRoute({ waypoints, optimize: false });
     setPolylinePath(null);
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
      >
      {/* draw server-computed polyline if available */}
    {polylinePath && (
       <Polyline
         path={polylinePath}
         options={{
           strokeColor:   '#0071CE',
           strokeOpacity: 0.8,
           strokeWeight:  4
         }}
       />
     )}
       </MapWrapper>
    </div>
  );
};

export default RouteMap;
