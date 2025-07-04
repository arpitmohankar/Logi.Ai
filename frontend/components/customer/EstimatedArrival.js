/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Clock, Navigation, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { trackingAPI } from '../../utils/api';
import { formatTime, formatDuration, formatDistance } from '../../utils/formatters';

const EstimatedArrival = ({ 
  trackingCode, 
  currentLocation, 
  deliveryLocation,
  estimatedTime 
}) => {
  const [eta, setEta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchETA = async () => {
    setIsLoading(true);
    try {
      const response = await trackingAPI.getETA(trackingCode);
      if (response.data.success) {
        setEta(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch ETA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchETA();
    
    // Refresh ETA every 2 minutes
    const interval = setInterval(fetchETA, 120000);
    return () => clearInterval(interval);
  }, [trackingCode, currentLocation]);

  const getArrivalTime = () => {
    if (eta?.estimatedArrival) {
      return new Date(eta.estimatedArrival);
    }
    return new Date(estimatedTime);
  };

  const arrivalTime = getArrivalTime();
  const now = new Date();
  const minutesRemaining = Math.max(0, Math.floor((arrivalTime - now) / 60000));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Estimated Arrival
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchETA}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && !eta ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {formatTime(arrivalTime)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {minutesRemaining > 0 
                  ? `In ${minutesRemaining} minutes`
                  : 'Arriving soon'
                }
              </p>
            </div>

            {eta?.isRealtime && eta.distanceRemaining && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-medium">
                    {formatDistance(eta.distanceRemaining.value)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">
                    {formatDuration(eta.durationRemaining.value)}
                  </p>
                </div>
              </div>
            )}

            {lastUpdated && (
              <p className="text-xs text-center text-muted-foreground">
                Last updated: {formatTime(lastUpdated)}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimatedArrival;
