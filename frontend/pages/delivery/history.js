/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Calendar, Package, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import DeliveryQueue from '../../components/delivery/DeliveryQueue';
import useDeliveryStore from '../../store/deliveryStore';
import { formatDate } from '../../utils/formatters';

export default function DeliveryHistory() {
  const { deliveries, fetchDeliveries, isLoading } = useDeliveryStore();
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDeliveries('delivery', { 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      date: dateFilter || undefined
    });
  }, [dateFilter, statusFilter]);

  const completedDeliveries = deliveries.filter(d => 
    d.status === 'delivered' || d.status === 'failed'
  );

  return (
    <ProtectedRoute allowedRoles={['delivery']}>
      <Layout title="Delivery History">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Delivery History</h1>
            <p className="text-muted-foreground">
              View your past deliveries and performance
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    placeholder="Filter by date"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* History List */}
          <DeliveryQueue
            deliveries={completedDeliveries}
            title="Completed Deliveries"
            emptyMessage="No delivery history found"
            showCompletedTime={true}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
