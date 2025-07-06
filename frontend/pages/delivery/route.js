/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef,Component } from 'react';
import { useRouter } from 'next/router';
import { 
  Navigation, 
  RefreshCw, 
  List, 
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Package } from 'lucide-react';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import RouteMap from '../../components/delivery/RouteMap';
import NavigationPanel from '../../components/delivery/NavigationPanel';
import RefreshButton from '../../components/delivery/RefreshButton';
import StatusUpdater from '../../components/delivery/StatusUpdater';
import useDeliveryStore from '../../store/deliveryStore';
import useAuthStore from '../../store/authStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSocketContext } from '../../providers/SocketProvider';
import { toast } from 'react-hot-toast';
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Card className="max-w-md">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-4">
                Unable to load the route. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function DeliveryRoute() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    deliveries, 
    optimizedRoute, 
    fetchDeliveries, 
    optimizeRoute, 
    refreshRoute,
    updateDeliveryStatus 
  } = useDeliveryStore();
  const { location, watchPosition, isWatching,error: locationError,getCurrentPosition, } = useGeolocation();
  const { emit } = useSocketContext();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentDeliveryIndex, setCurrentDeliveryIndex] = useState(0);
  const [showNavigation, setShowNavigation] = useState(false);
  const navigationIntervalRef = useRef(null);

  // Add manual location fallback
const [manualLocation, setManualLocation] = useState(null);
const [showLocationDialog, setShowLocationDialog] = useState(false);

// Use manual location if auto-location fails
const effectiveLocation = location || manualLocation;
useGeolocation({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
});
  


// Add location permission request
useEffect(() => {
  const requestLocationPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      
      if (result.state === 'denied') {
        toast.error('Location access denied. Please enable location in your browser settings.');
        return;
      }
      
      if (result.state === 'prompt') {
        toast.info('Please allow location access for route optimization');
      }
      
      // Start watching position
      watchPosition();
    } catch (error) {
      console.error('Permission query failed:', error);
      // Fallback - try to get position anyway
      watchPosition();
    }
  };
  
  requestLocationPermission();
}, []);

// // Handle location errors
// useEffect(() => {
//   if (locationError) {
//     toast.error(`Location error: ${locationError}`);
    
//     // Provide manual location option
//     setShowManualLocation(true);
//   }
// }, [locationError]);


  // Fetch active deliveries
  useEffect(() => {
    fetchDeliveries('delivery');
    
    // Start location tracking
    if (!isWatching) {
      watchPosition();
    }
    
    return () => {
      if (navigationIntervalRef.current) {
        clearInterval(navigationIntervalRef.current);
      }
    };
  }, []);

//   // Optimize route when deliveries are loaded
//   useEffect(() => {
//   const optimizeInitialRoute = async () => {
//     const activeDeliveries = deliveries.filter(d => 
//       ['assigned', 'picked-up', 'in-transit'].includes(d.status)
//     );
    
//     if (activeDeliveries.length > 0 && location && !optimizedRoute) {
//       try {
//         await handleOptimizeRoute();
//       } catch (error) {
//         console.error('Initial route optimization failed:', error);
//         toast.error('Failed to optimize route. Using default order.');
//       }
//     }
//   };
  
//   optimizeInitialRoute();
// }, [deliveries, location]);
// Update the optimization effect
useEffect(() => {
  const activeDeliveries = deliveries.filter(d => 
    ['assigned', 'picked-up', 'in-transit'].includes(d.status)
  );
  
  if (activeDeliveries.length > 0 && effectiveLocation && !optimizedRoute) {
    handleOptimizeRoute();
   }
}, [deliveries, effectiveLocation]);

// Add manual location setter
const handleSetManualLocation = (lat, lng) => {
  setManualLocation({ lat, lng });
  setShowLocationDialog(false);
  toast.success('Location set manually');
};

  // Update location via socket
  useEffect(() => {
    if (location && optimizedRoute) {
      const trackingCodes = optimizedRoute.deliveryOrder
        .map(item => item.delivery.trackingCode)
        .filter(code => code);
      
      emit('update-location', {
        userId: user._id,
        location: { lat: location.lat, lng: location.lng },
        trackingCodes
      });
    }
  }, [location, optimizedRoute]);

  const activeDeliveries = deliveries.filter(d => 
    ['assigned', 'picked-up', 'in-transit'].includes(d.status)
  );

  const handleOptimizeRoute = async () => {
  if (!effectiveLocation) {
     toast.error('Location not available');
     return;
   }
  setIsOptimizing(true);
  try {
     await optimizeRoute({
      deliveries: activeDeliveries.map(d => d._id),
      startLocation: {
        lat: effectiveLocation.lat,
        lng: effectiveLocation.lng
      }
    });
    toast.success('Route optimized successfully');
  } catch (err) {
    toast.error('Failed to optimize route');
  } finally {
    setIsOptimizing(false);
  }
};

  const handleRefreshRoute = async () => {
  if (!effectiveLocation || !optimizedRoute) return;
  const remainingIds = optimizedRoute.deliveryOrder
        .slice(currentDeliveryIndex)
       .map(item => item.delivery._id);
    if (!remainingIds.length) {
     toast.info('No deliveries to optimize');
     return;
   }
  setIsOptimizing(true);
  try {
    await refreshRoute({
      deliveries: remainingIds,
      startLocation: {
        lat: effectiveLocation.lat,
        lng: effectiveLocation.lng
      }
    });
    setCurrentDeliveryIndex(0);
    toast.success('Route refreshed successfully');
  } catch (err) {
    toast.error('Failed to refresh route');
  } finally {
    setIsOptimizing(false);
  }
};

  const handleStatusUpdate = async (deliveryId, status) => {
    const result = await updateDeliveryStatus(deliveryId, status);
    
    if (result.success) {
      // Move to next delivery if completed
      if (status === 'delivered' || status === 'failed') {
        setCurrentDeliveryIndex(prev => prev + 1);
      }
      
      // Emit status update via socket
      const delivery = deliveries.find(d => d._id === deliveryId);
      if (delivery?.trackingCode) {
        emit('delivery-status-update', {
          deliveryId,
          status,
          trackingCode: delivery.trackingCode
        });
      }
    }
  };

  const currentDelivery = optimizedRoute?.deliveryOrder[currentDeliveryIndex]?.delivery;

  if (activeDeliveries.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['delivery']}>
        <Layout title="Active Route">
          <ErrorBoundary> 
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="py-16 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-semibold mb-2">No Active Deliveries</h2>
                <p className="text-muted-foreground mb-6">
                  You dont have any deliveries assigned for today.
                </p>
                <Button onClick={() => router.push('/delivery/dashboard')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
          </ErrorBoundary>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['delivery']}>
      <Layout title="Active Route">
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="border-b bg-background p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">Active Route</h1>
                  <p className="text-sm text-muted-foreground">
                    {activeDeliveries.length} deliveries • 
                    {optimizedRoute ? ` ${Math.round(optimizedRoute.totalDistance / 1000)} km` : ' Calculating...'}
                  </p>
                </div>
              </div>
              
              <RefreshButton
                onRefresh={handleRefreshRoute}
                isLoading={isOptimizing}
                lastRefreshed={optimizedRoute?.optimizationTimestamp}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative">
            <Tabs defaultValue="map" className="h-full">
              <div className="absolute top-4 left-4 z-10 bg-background rounded-lg shadow-lg">
                <TabsList>
                  <TabsTrigger value="map">
                    <MapIcon className="h-4 w-4 mr-2" />
                    Map
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="map" className="h-full m-0">
                <RouteMap
                  deliveries={activeDeliveries}
                  optimizedRoute={optimizedRoute}
                  currentLocation={location}
                  currentDeliveryIndex={currentDeliveryIndex}
                />
              </TabsContent>

              <TabsContent value="list" className="h-full overflow-auto">
                <div className="container mx-auto p-4 space-y-4">
                  {optimizedRoute?.deliveryOrder.map((item, index) => (
                    <Card 
                      key={item.delivery._id}
                      className={index === currentDeliveryIndex ? 'ring-2 ring-primary' : ''}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Stop {index + 1}: {item.delivery.customerName}
                          </CardTitle>
                          {index === currentDeliveryIndex && (
                            <Badge className="bg-primary">Current</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <StatusUpdater
                          delivery={item.delivery}
                          onStatusUpdate={handleStatusUpdate}
                          isActive={index === currentDeliveryIndex}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Navigation Panel */}
            {currentDelivery && showNavigation && (
              <NavigationPanel
                delivery={currentDelivery}
                currentLocation={location}
                onClose={() => setShowNavigation(false)}
              />
            )}

            {/* Current Delivery Card */}
            {currentDelivery && !showNavigation && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">
                        Stop {currentDeliveryIndex + 1} of {optimizedRoute.deliveryOrder.length}
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => setShowNavigation(true)}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                    </div>
                    <StatusUpdater
                      delivery={currentDelivery}
                      onStatusUpdate={handleStatusUpdate}
                      isActive={true}
                      compact={true}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
