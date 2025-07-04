/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Phone, 
  Clock,
  User,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Truck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import DeliveryForm from '../../../components/admin/DeliveryForm';
import Map from '../../../components/common/Map';
import { adminAPI } from '../../../utils/api';
import { 
  formatDate, 
  formatTime, 
  formatAddress, 
  formatPhoneNumber,
  formatCurrency,
  formatRelativeTime,
  formatDeliveryStatus,
  formatPriority
} from '../../../utils/formatters';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../../lib/constants';
import { toast } from 'react-hot-toast';

export default function DeliveryDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [delivery, setDelivery] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('');

  useEffect(() => {
    if (id) {
      fetchDeliveryDetails();
      fetchDeliveryBoys();
    }
  }, [id]);

  useEffect(() => {
    // Check if edit mode is requested
    if (router.query.edit === 'true') {
      setIsEditing(true);
    }
  }, [router.query]);

  const fetchDeliveryDetails = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getDelivery(id);
      setDelivery(response.data.data);
      
      // Set selected delivery boy if already assigned
      if (response.data.data.assignedTo) {
        setSelectedDeliveryBoy(response.data.data.assignedTo._id);
      }
    } catch (error) {
      toast.error('Failed to fetch delivery details');
      router.push('/admin/deliveries');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      const response = await adminAPI.getDeliveryBoys();
      setDeliveryBoys(response.data.data);
    } catch (error) {
      console.error('Failed to fetch delivery boys');
    }
  };

  const handleAssignDeliveryBoy = async () => {
    if (!selectedDeliveryBoy) {
      toast.error('Please select a delivery boy');
      return;
    }

    setIsAssigning(true);
    try {
      await adminAPI.assignDelivery(id, selectedDeliveryBoy);
      toast.success('Delivery assigned successfully');
      await fetchDeliveryDetails();
    } catch (error) {
      toast.error('Failed to assign delivery');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateDelivery = async (data) => {
    try {
      await adminAPI.updateDelivery(id, data);
      toast.success('Delivery updated successfully');
      setIsEditing(false);
      await fetchDeliveryDetails();
    } catch (error) {
      toast.error('Failed to update delivery');
    }
  };

  const handleDeleteDelivery = async () => {
    if (!confirm('Are you sure you want to delete this delivery?')) return;

    try {
      await adminAPI.deleteDelivery(id);
      toast.success('Delivery deleted successfully');
      router.push('/admin/deliveries');
    } catch (error) {
      toast.error('Failed to delete delivery');
    }
  };

  const getStatusBadge = (status) => {
    return (
      <Badge 
        variant="secondary"
        style={{ 
          backgroundColor: `${STATUS_COLORS[status]}20`,
          color: STATUS_COLORS[status],
          borderColor: STATUS_COLORS[status]
        }}
      >
        {formatDeliveryStatus(status)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    return (
      <Badge 
        variant="outline"
        style={{ 
          borderColor: PRIORITY_COLORS[priority],
          color: PRIORITY_COLORS[priority]
        }}
      >
        {formatPriority(priority)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <Layout title="Delivery Details">
          <div className="container mx-auto px-4 py-8">
            <LoadingSpinner size="large" className="py-20" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!delivery) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <Layout title="Delivery Not Found">
          <div className="container mx-auto px-4 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Delivery not found</AlertDescription>
            </Alert>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout title="Delivery Details">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Delivery Details</h1>
                <p className="text-muted-foreground">
                  ID: {delivery._id}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteDelivery}
                    disabled={delivery.status !== 'pending'}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <DeliveryForm
              initialData={delivery}
              onSubmit={handleUpdateDelivery}
              isLoading={false}
            />
          ) : (
            <div className="space-y-6">
              {/* Status and Assignment Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Status & Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(delivery.status)}
                        {getPriorityBadge(delivery.priority)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{formatRelativeTime(delivery.createdAt)}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Delivery Boy Assignment */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery Assignment
                    </h4>
                    
                    {delivery.assignedTo ? (
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{delivery.assignedTo.name}</p>
                            <p className="text-sm text-muted-foreground">{delivery.assignedTo.phone}</p>
                          </div>
                        </div>
                        {delivery.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDeliveryBoy('')}
                          >
                            Change
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            This delivery is not assigned to any delivery partner yet.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="flex gap-2">
                          <Select
                            value={selectedDeliveryBoy}
                            onValueChange={setSelectedDeliveryBoy}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select delivery partner" />
                            </SelectTrigger>
                            <SelectContent>
                              {deliveryBoys.map((boy) => (
                                <SelectItem key={boy._id} value={boy._id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{boy.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      ({boy.activeDeliveries} active)
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Button
                            onClick={handleAssignDeliveryBoy}
                            disabled={!selectedDeliveryBoy || isAssigning}
                          >
                            {isAssigning ? 'Assigning...' : 'Assign'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for Details */}
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{delivery.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a 
                          href={`tel:${delivery.customerPhone}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {formatPhoneNumber(delivery.customerPhone)}
                        </a>
                      </div>
                      {delivery.customerEmail && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">Email</p>
                          <a 
                            href={`mailto:${delivery.customerEmail}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {delivery.customerEmail}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Package Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Package Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="font-medium">{delivery.packageInfo.description}</p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Weight</p>
                          <p className="font-medium">{delivery.packageInfo.weight} kg</p>
                        </div>
                        {delivery.packageInfo.value && (
                          <div>
                            <p className="text-sm text-muted-foreground">Value</p>
                            <p className="font-medium">{formatCurrency(delivery.packageInfo.value)}</p>
                          </div>
                        )}
                        {delivery.packageInfo.fragile && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Fragile
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delivery Schedule */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Delivery Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Scheduled Date</p>
                          <p className="font-medium">{formatDate(delivery.scheduledDate)}</p>
                        </div>
                        {delivery.deliveryWindow && (
                          <div>
                            <p className="text-sm text-muted-foreground">Time Window</p>
                            <p className="font-medium">
                              {delivery.deliveryWindow.start} - {delivery.deliveryWindow.end}
                            </p>
                          </div>
                        )}
                      </div>
                      {delivery.deliveryInstructions && (
                        <div>
                          <p className="text-sm text-muted-foreground">Instructions</p>
                          <p className="font-medium">{delivery.deliveryInstructions}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="location">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Delivery Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Address</p>
                        <p className="font-medium">{formatAddress(delivery.address)}</p>
                      </div>
                      
                      {/* Map */}
                      <div className="h-[400px] rounded-lg overflow-hidden">
                        <Map
                          center={delivery.coordinates}
                          zoom={15}
                          markers={[{
                            id: delivery._id,
                            lat: delivery.coordinates.lat,
                            lng: delivery.coordinates.lng,
                            title: delivery.customerName,
                            type: 'delivery'
                          }]}
                          height="100%"
                          width="100%"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline">
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="absolute top-10 left-5 h-full w-0.5 bg-gray-200" />
                          </div>
                          <div className="flex-1 pb-8">
                            <h4 className="font-medium">Order Created</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(delivery.createdAt)} at {formatTime(delivery.createdAt)}
                            </p>
                            <p className="text-sm mt-1">
                              Created by {delivery.createdBy?.name || 'Admin'}
                            </p>
                          </div>
                        </div>

                        {delivery.assignedTo && (
                          <div className="flex gap-4">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="absolute top-10 left-5 h-full w-0.5 bg-gray-200" />
                            </div>
                            <div className="flex-1 pb-8">
                              <h4 className="font-medium">Assigned to Delivery Partner</h4>
                              <p className="text-sm text-muted-foreground">
                                {delivery.assignedTo.name}
                              </p>
                            </div>
                          </div>
                        )}

                        {delivery.actualDeliveryTime && (
                          <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">Delivered</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(delivery.actualDeliveryTime)} at {formatTime(delivery.actualDeliveryTime)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
