import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Users,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DeliveryStats from '../../components/admin/DeliveryStats';
import { adminAPI } from '../../utils/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.data.data);
      
      // Prepare chart data
      const data = [
        { name: 'Pending', value: response.data.data.pendingDeliveries, fill: '#FFA500' },
        { name: 'In Transit', value: response.data.data.inTransitDeliveries, fill: '#3B82F6' },
        { name: 'Completed', value: response.data.data.completedToday, fill: '#22C55E' },
        { name: 'Failed', value: response.data.data.failedToday, fill: '#EF4444' }
      ];
      setChartData(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every minute
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const statsCards = [
    {
      title: 'Total Deliveries',
      value: stats?.totalDeliveries || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All time deliveries'
    },
    {
      title: 'Active Delivery Boys',
      value: stats?.activeDeliveryBoys || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Currently active'
    },
    {
      title: 'Today\'s Revenue',
      value: formatCurrency(stats?.revenueToday || 0),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Revenue generated today'
    },
    {
      title: 'Success Rate',
      value: formatPercentage(stats?.successRate || 0),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Delivery success rate'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout title="Admin Dashboard">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Heres your delivery overview.
              </p>
            </div>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <LoadingSpinner size="large" className="py-20" />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                  <Card key={index}>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="deliveries">Todays Deliveries</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Delivery Status Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Delivery Status Distribution</CardTitle>
                        <CardDescription>
                          Current status of all deliveries
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                          Manage deliveries and assignments
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          className="w-full justify-start"
                          onClick={() => router.push('/admin/deliveries/new')}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Create New Delivery
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => router.push('/admin/deliveries')}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          View All Deliveries
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => router.push('/admin/deliveries?status=pending')}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Pending Assignments
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="deliveries">
                  <DeliveryStats stats={stats} />
                </TabsContent>

                <TabsContent value="performance">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Completed Today
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                          {stats?.completedToday || 0}
                        </div>
                        <Progress 
                          value={(stats?.completedToday / stats?.totalDeliveries) * 100 || 0} 
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-600" />
                          In Transit
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                          {stats?.inTransitDeliveries || 0}
                        </div>
                        <Progress 
                          value={(stats?.inTransitDeliveries / stats?.totalDeliveries) * 100 || 0} 
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          Failed Today
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-red-600">
                          {stats?.failedToday || 0}
                        </div>
                        <Progress 
                          value={(stats?.failedToday / stats?.totalDeliveries) * 100 || 0} 
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
