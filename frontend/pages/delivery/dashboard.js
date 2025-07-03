/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Navigation,
  TrendingUp,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DeliveryQueue from '../../components/delivery/DeliveryQueue';
import useDeliveryStore from '../../store/deliveryStore';
import useAuthStore from '../../store/authStore';
import { deliveryAPI } from '../../utils/api';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import { useGeolocation } from '../../hooks/useGeolocation';

export default function DeliveryDashboard() {
  const router = useRouter();
  const { user, updateLocation } = useAuthStore();
  const { deliveries, fetchDeliveries, isLoading } = useDeliveryStore();
  const [stats, setStats] = useState(null);
  const { location, getCurrentPosition, watchPosition, isWatching } = useGeolocation();

  // Update location when it changes
  useEffect(() => {
    if (location && user) {
      updateLocation({ lat: location.lat, lng: location.lng });
    }
  }, [location, user]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [statsResponse] = await Promise.all([
        deliveryAPI.getStats(),
        fetchDeliveries('delivery')
      ]);
      setStats(statsResponse.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Start watching location
    watchPosition();
    
    // Refresh data every minute
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeDeliveries = deliveries.filter(d => 
    ['assigned', 'picked-up', 'in-transit'].includes(d.status)
  );

  const todaysDeliveries = deliveries.filter(d => {
    const today = new Date().toDateString();
    const deliveryDate = new Date(d.scheduledDate).toDateString();
    return deliveryDate === today;
  });

  const statsCards = [
    {
      title: 'Active Deliveries',
      value: stats?.totalAssigned || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: () => router.push('/delivery/route')
    },
    {
      title: 'Completed Today',
      value: stats?.completedToday || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending Today',
      value: stats?.pendingToday || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Success Rate',
      value: formatPercentage(stats?.successRate || 0),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['delivery']}>
      <Layout title="Delivery Dashboard">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-muted-foreground">
                {isWatching ? (
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    Location tracking active
                  </span>
                ) : (
                  'Location tracking inactive'
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={fetchDashboardData}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => router.push('/delivery/route')}
                className="bg-walmart-blue hover:bg-walmart-blue/90"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Start Route
              </Button>
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner size="large" className="py-20" />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statsCards.map((stat, index) => (
                  <Card 
                    key={index}
                    className={stat.action ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
                    onClick={stat.action}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <div className={`${stat.bgColor} p-2 rounded-full`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Today's Overview */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Todays Overview</CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{stats?.completedToday || 0} of {todaysDeliveries.length}</span>
                      </div>
                      <Progress 
                        value={(stats?.completedToday / todaysDeliveries.length) * 100 || 0} 
                        className="h-2"
                      />
                    </div>
                    
                    {activeDeliveries.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                          You have {activeDeliveries.length} active deliveries
                        </p>
                        <Button 
                          className="w-full"
                          onClick={() => router.push('/delivery/route')}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          View Route & Navigate
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Deliveries Tabs */}
              <Tabs defaultValue="active" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="today">Todays Queue</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                  <DeliveryQueue
                    deliveries={activeDeliveries}
                    title="Active Deliveries"
                    emptyMessage="No active deliveries"
                    showActions
                  />
                </TabsContent>

                <TabsContent value="today">
                  <DeliveryQueue
                    deliveries={todaysDeliveries}
                    title="Today's Deliveries"
                    emptyMessage="No deliveries scheduled for today"
                  />
                </TabsContent>

                <TabsContent value="completed">
                  <DeliveryQueue
                    deliveries={deliveries.filter(d => d.status === 'delivered')}
                    title="Completed Deliveries"
                    emptyMessage="No completed deliveries"
                    showCompletedTime
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
