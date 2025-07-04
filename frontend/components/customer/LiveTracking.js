import { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Phone, 
  Clock,
  CheckCircle,
  Truck,
  RefreshCw,
  Navigation,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import Map from '../common/Map';
import DeliveryStatus from './DeliveryStatus';
import EstimatedArrival from './EstimatedArrival';
import FeedbackForm from './FeedbackForm';
import { joinTrackingRoom, onLocationUpdate, onStatusUpdate } from '../../utils/socket';
import { formatAddress, formatPhoneNumber } from '../../utils/formatters';
import { STATUS_COLORS } from '../../lib/constants';

const LiveTracking = ({ trackingData, trackingCode, onReset }) => {
  const [liveLocation, setLiveLocation] = useState(trackingData.deliveryBoy.currentLocation);
  const [deliveryStatus, setDeliveryStatus] = useState(trackingData.delivery.status);
  const [showFeedback, setShowFeedback] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    // Join tracking room for real-time updates
    joinTrackingRoom(trackingCode);

    // Listen for location updates
    const unsubscribeLocation = onLocationUpdate((data) => {
      setLiveLocation({
        lat: data.location.lat,
        lng: data.location.lng,
        lastUpdated: data.timestamp
      });
    });

    // Listen for status updates
    const unsubscribeStatus = onStatusUpdate((data) => {
      setDeliveryStatus(data.status);
      if (data.status === 'delivered') {
        setTimeout(() => setShowFeedback(true), 2000);
      }
    });

    return () => {
      unsubscribeLocation();
      unsubscribeStatus();
    };
  }, [trackingCode]);

  // Calculate map center between delivery location and current driver location
  useEffect(() => {
    if (liveLocation && trackingData.delivery.coordinates) {
      const centerLat = (liveLocation.lat + trackingData.delivery.coordinates.lat) / 2;
      const centerLng = (liveLocation.lng + trackingData.delivery.coordinates.lng) / 2;
      setMapCenter({ lat: centerLat, lng: centerLng });
    }
  }, [liveLocation, trackingData.delivery.coordinates]);

  const markers = [
    {
      id: 'delivery',
      lat: trackingData.delivery.coordinates.lat,
      lng: trackingData.delivery.coordinates.lng,
      title: 'Delivery Location',
      type: 'delivery'
    }
  ];

  if (liveLocation) {
    markers.push({
      id: 'driver',
      lat: liveLocation.lat,
      lng: liveLocation.lng,
      title: 'Delivery Partner',
      type: 'user'
    });
  }

  const route = liveLocation ? {
    waypoints: [
      { lat: liveLocation.lat, lng: liveLocation.lng },
      { lat: trackingData.delivery.coordinates.lat, lng: trackingData.delivery.coordinates.lng }
    ]
  } : null;

  const isDelivered = deliveryStatus === 'delivered';
  const isFailed = deliveryStatus === 'failed';

  return (
    <div className="space-y-6">
      {/* Tracking Code Display */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Tracking Code</p>
        <p className="text-2xl font-mono font-bold">{trackingCode}</p>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Delivery Status</CardTitle>
              <CardDescription>
                Real-time tracking for your package
              </CardDescription>
            </div>
            <Badge 
              variant="secondary"
              style={{ 
                backgroundColor: `${STATUS_COLORS[deliveryStatus]}20`,
                color: STATUS_COLORS[deliveryStatus],
                borderColor: STATUS_COLORS[deliveryStatus]
              }}
              className="text-sm"
            >
              {deliveryStatus.replace('-', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DeliveryStatus 
            status={deliveryStatus}
            delivery={trackingData.delivery}
          />
        </CardContent>
      </Card>

      {/* Map Section */}
      {!isDelivered && !isFailed && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Live Location</CardTitle>
            <CardDescription>
              Track your delivery partner in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] md:h-[500px]">
              <Map
                center={mapCenter}
                zoom={14}
                markers={markers}
                route={route}
                showTraffic={true}
                height="100%"
                width="100%"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Package Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Package Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{trackingData.delivery.packageInfo.description}</p>
            </div>
            {trackingData.delivery.packageInfo.fragile && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Fragile - Handle with Care
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Delivery Address</p>
              <p className="font-medium">{formatAddress(trackingData.delivery.address)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{trackingData.delivery.customerName}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ETA and Delivery Partner */}
      {!isDelivered && !isFailed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EstimatedArrival 
            trackingCode={trackingCode}
            currentLocation={liveLocation}
            deliveryLocation={trackingData.delivery.coordinates}
            estimatedTime={trackingData.delivery.estimatedDeliveryTime}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Delivery Partner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{trackingData.deliveryBoy.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <a 
                  href={`tel:${trackingData.deliveryBoy.phone}`}
                  className="font-medium text-primary hover:underline flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {formatPhoneNumber(trackingData.deliveryBoy.phone)}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback Form */}
      {isDelivered && showFeedback && (
        <FeedbackForm 
          trackingCode={trackingCode}
          onClose={() => setShowFeedback(false)}
        />
      )}

      {/* Actions */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={onReset}>
          Track Another Delivery
        </Button>
      </div>
    </div>
  );
};

export default LiveTracking;
