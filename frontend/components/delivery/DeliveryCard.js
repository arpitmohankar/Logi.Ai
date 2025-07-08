import {
  MapPin,
  Phone,
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  Navigation,
  Share2
} from 'lucide-react';
import { Badge }       from '../ui/badge';
import { Button }      from '../ui/button';
import { Card }        from '../ui/card';
import { formatAddress,
         formatRelativeTime,
         formatCurrency } from '../../utils/formatters';
import { STATUS_COLORS,
         PRIORITY_COLORS } from '../../lib/constants';
import LocationSharer   from './LocationSharer';
import { useState }     from 'react';

const DeliveryCard = ({
  delivery,
  isExpanded,
  onToggle,
  showActions = false,
  showCompletedTime = false
}) => {
  // controls LocationSharer dialog
  const [showLocationSharer, setShowLocationSharer] = useState(false);

  /* ---------- helpers ---------- */
  const StatusBadge = ({ status }) => (
    <Badge
      variant="secondary"
      className="text-xs"
      style={{
        backgroundColor: `${STATUS_COLORS[status]}20`,
        color:           STATUS_COLORS[status],
        borderColor:     STATUS_COLORS[status]
      }}
    >
      {status.replace('-', ' ')}
    </Badge>
  );

  const PriorityBar = ({ priority }) => (
    <div
      className="w-2 h-full absolute left-0 top-0 rounded-l"
      style={{ backgroundColor: PRIORITY_COLORS[priority] }}
    />
  );

  /* ---------- render ---------- */
  return (
    <div className="relative">
      <PriorityBar priority={delivery.priority} />

      {/* collapsed header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{delivery.customerName}</h4>
              <StatusBadge status={delivery.status} />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {delivery.address.city}
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                {delivery.packageInfo.weight} kg
              </span>
              {showCompletedTime && delivery.actualDeliveryTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(delivery.actualDeliveryTime)}
                </span>
              )}
            </div>
          </div>


          <div className="flex items-center gap-2">
            {/* show code badge if already generated */}
            {delivery.trackingCode && (
              <Badge variant="outline" className="font-mono text-xs">
                {delivery.trackingCode}
              </Badge>
            )}
            {/* share icon – visible for assigned / picked-up / in-transit */}
            {['assigned','picked-up','in-transit'].includes(delivery.status) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();          // don’t toggle accordion
                  setShowLocationSharer(true);  // open modal
                }}
                className="p-1.5 rounded hover:bg-muted"
              >
                <Share2 className="h-4 w-4 text-primary" />
              </button>
            )}

            {isExpanded
              ? <ChevronUp  className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
            }
          </div>
          {/* {isExpanded
            ? <ChevronUp  className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          } */}

        </div>
      </div>

      {/* expanded body */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t">
          <div className="pt-3 space-y-2">
            {/* address */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm">{formatAddress(delivery.address)}</p>
            </div>

            {/* phone */}
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a
                href={`tel:${delivery.customerPhone}`}
                className="text-sm text-primary hover:underline"
                onClick={e => e.stopPropagation()}
              >
                {delivery.customerPhone}
              </a>
            </div>

            {/* package details */}
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p>{delivery.packageInfo.description}</p>
                {delivery.packageInfo.value && (
                  <p className="text-muted-foreground">
                    Value: {formatCurrency(delivery.packageInfo.value)}
                  </p>
                )}
                {delivery.packageInfo.fragile && (
                  <Badge variant="outline" className="mt-1">Fragile</Badge>
                )}
              </div>
            </div>

            {/* instructions */}
            {delivery.deliveryInstructions && (
              <div className="text-sm bg-muted p-2 rounded">
                <p className="font-medium mb-1">Instructions:</p>
                <p className="text-muted-foreground">
                  {delivery.deliveryInstructions}
                </p>
              </div>
            )}
          </div>

          {/* action buttons */}
          {showActions && delivery.status !== 'delivered' && (
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const addr = encodeURIComponent(formatAddress(delivery.address));
                  window.open(`https://maps.google.com/?q=${addr}`, '_blank');
                }}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate
              </Button>

              {['picked-up', 'in-transit'].includes(delivery.status) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLocationSharer(true)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* modal */}
      {showLocationSharer && (
        <LocationSharer
          delivery={delivery}
          onClose={() => setShowLocationSharer(false)}
        />
      )}
    </div>
  );
};

export default DeliveryCard;
