/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  MoreVertical,
  MapPin,
  User,
  Package
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import DeliveryList from '../../../components/admin/DeliveryList';
import DeliveryAssignment from '../../../components/admin/DeliveryAssignment';
import useDeliveryStore from '../../../store/deliveryStore';
import { adminAPI } from '../../../utils/api';
import { formatDate, formatAddress, formatDeliveryStatus } from '../../../utils/formatters';
import { DELIVERY_STATUS, STATUS_COLORS, PRIORITY_COLORS } from '../../../lib/constants';
import { toast } from 'react-hot-toast';

export default function DeliveriesPage() {
  const router = useRouter();
  const { deliveries, fetchDeliveries, isLoading } = useDeliveryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(router.query.status || 'all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      await fetchDeliveries('admin', {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined
      });
      
      // Fetch delivery boys for assignment
      try {
        const response = await adminAPI.getDeliveryBoys();
        setDeliveryBoys(response.data.data);
      } catch (error) {
        console.error('Failed to fetch delivery boys:', error);
      }
    };
    
    loadData();
  }, [statusFilter, priorityFilter]);

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customerPhone.includes(searchQuery) ||
      delivery.trackingCode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleBulkAssign = async (deliveryBoyId) => {
    try {
      await adminAPI.bulkAssignDeliveries({
        deliveryIds: selectedDeliveries,
        deliveryBoyId
      });
      toast.success('Deliveries assigned successfully');
      setSelectedDeliveries([]);
      await fetchDeliveries('admin');
    } catch (error) {
      toast.error('Failed to assign deliveries');
    }
  };

  const handleExport = () => {
    // Export functionality
    const csv = [
      ['ID', 'Customer', 'Address', 'Status', 'Priority', 'Scheduled Date'],
      ...filteredDeliveries.map(d => [
        d._id,
        d.customerName,
        formatAddress(d.address),
        d.status,
        d.priority,
        formatDate(d.scheduledDate)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deliveries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout title="Deliveries">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Deliveries</h1>
              <p className="text-muted-foreground">
                Manage and track all deliveries
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fetchDeliveries('admin')}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => router.push('/admin/deliveries/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Delivery
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, phone, or tracking code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.values(DELIVERY_STATUS).map(status => (
                      <SelectItem key={status} value={status}>
                        {formatDeliveryStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Deliveries</TabsTrigger>
              <TabsTrigger value="pending">Pending Assignment</TabsTrigger>
              <TabsTrigger value="active">Active Deliveries</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <LoadingSpinner size="large" className="py-20" />
              ) : (
                <DeliveryList 
                  deliveries={filteredDeliveries}
                  selectedDeliveries={selectedDeliveries}
                  onSelectionChange={setSelectedDeliveries}
                />
              )}
            </TabsContent>

            <TabsContent value="pending">
              <DeliveryAssignment
                deliveries={filteredDeliveries.filter(d => d.status === 'pending')}
                deliveryBoys={deliveryBoys}
                onAssign={handleBulkAssign}
              />
            </TabsContent>

            <TabsContent value="active">
              <DeliveryList 
                deliveries={filteredDeliveries.filter(d => 
                  ['assigned', 'picked-up', 'in-transit'].includes(d.status)
                )}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
