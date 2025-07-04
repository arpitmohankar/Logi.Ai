import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatNumber } from '../../utils/formatters';
import { STATUS_COLORS } from '../../lib/constants';

const DeliveryStats = ({ stats }) => {
  const deliveryBreakdown = [
    { label: 'Pending', value: stats?.pendingDeliveries || 0, color: STATUS_COLORS.pending },
    { label: 'Assigned', value: stats?.inTransitDeliveries || 0, color: STATUS_COLORS.assigned },
    { label: 'Completed', value: stats?.completedToday || 0, color: STATUS_COLORS.delivered },
    { label: 'Failed', value: stats?.failedToday || 0, color: STATUS_COLORS.failed }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Todays Summary</CardTitle>
          <CardDescription>Delivery performance for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveryBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Badge variant="secondary">{formatNumber(item.value)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
          <CardDescription>Important performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Delivery Time</span>
              <span className="font-medium">32 mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">On-Time Delivery Rate</span>
              <span className="font-medium text-green-600">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
              <span className="font-medium">4.8/5.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Routes</span>
              <span className="font-medium">{stats?.activeDeliveryBoys || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryStats;
