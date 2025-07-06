/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { X, Navigation, Phone, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { deliveryAPI } from '../../utils/api';
import { formatAddress, formatDuration, formatDistanceMeters } from '../../utils/formatters';
import LoadingSpinner from '../common/LoadingSpinner';

import {toast} from 'react-hot-toast';
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const NavigationPanel = ({ delivery, currentLocation, onClose }) => {
  const [directions, setDirections] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentLocation && currentLocation.lat && currentLocation.lng) {
      fetchDirections();
    } else {
      setError('Current location not available');
      setIsLoading(false);
    }
  }, [delivery, currentLocation]);

  const fetchDirections = async () => {
      setIsLoading(true);
    setError(null);
    if (!currentLocation) return;

      try {
      const response = await deliveryAPI.getDirections({
        origin: currentLocation,
        destination: delivery.coordinates
      });
      
      if (response.data.success) {
        setDirections(response.data.directions);
      } else {
        setError('Unable to get directions');
      }
    } catch (error) {
      console.error('Failed to fetch directions:', error);
      setError('Failed to fetch directions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const startNavigation = () => {
  //   const address = encodeURIComponent(formatAddress(delivery.address));
  //   window.open(`https://maps.google.com/maps?daddr=${address}`, '_blank');
  // };
  const startNavigation = () => {
    if (!delivery.coordinates || !delivery.coordinates.lat || !delivery.coordinates.lng) {
      toast.error('Invalid delivery coordinates');
      return;
    }
    
    const destination = `${delivery.coordinates.lat},${delivery.coordinates.lng}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=${googleMapsApiKey}&destination=${destination}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <Card className="absolute bottom-0 left-0 right-0 z-20 rounded-t-xl max-h-[70vh] overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Navigation</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 overflow-auto">
        {/* Delivery Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{delivery.customerName}</span>
          </div>
          <p className="text-sm text-muted-foreground">{formatAddress(delivery.address)}</p>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${delivery.customerPhone}`} className="text-sm text-primary">
              {delivery.customerPhone}
            </a>
          </div>
        </div>

        <Separator />

        {/* Route Info */}
        {isLoading ? (
          <LoadingSpinner size="medium" className="py-8" />
        ) : directions ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{formatDistanceMeters(directions.distance)}</p>
                <p className="text-sm text-muted-foreground">Distance</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatDuration(directions.duration)}</p>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={startNavigation}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>

            {/* Turn-by-turn directions */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Directions</h4>
              <div className="space-y-1 max-h-40 overflow-auto">
                {directions.steps.map((step, index) => (
                  <div key={index} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <div>
                      <p dangerouslySetInnerHTML={{ __html: step.instruction }} />
                      <p className="text-xs text-muted-foreground">
                        {step.distance.text} • {step.duration.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Unable to fetch directions
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default NavigationPanel;
