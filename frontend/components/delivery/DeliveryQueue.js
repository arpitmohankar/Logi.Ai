import { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Phone, 
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatAddress, formatRelativeTime, formatDeliveryStatus } from '../../utils/formatters';
import { STATUS_COLORS } from '../../lib/constants';
import DeliveryCard from './DeliveryCard';

const DeliveryQueue = ({ 
  deliveries = [], 
  title = 'Deliveries',
  emptyMessage = 'No deliveries found',
  showActions = false,
  showCompletedTime = false
}) => {
  const [expandedDelivery, setExpandedDelivery] = useState(null);

  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        {deliveries.map((delivery) => (
          <DeliveryCard
            key={delivery._id}
            delivery={delivery}
            isExpanded={expandedDelivery === delivery._id}
            onToggle={() => setExpandedDelivery(
              expandedDelivery === delivery._id ? null : delivery._id
            )}
            showActions={showActions}
            showCompletedTime={showCompletedTime}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default DeliveryQueue;
