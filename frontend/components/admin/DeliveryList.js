import { useState } from 'react';
import { useRouter } from 'next/router';
import { MoreVertical, MapPin, Phone, Package, Calendar } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { formatDate, formatTime, formatAddress, formatDeliveryStatus } from '../../utils/formatters';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../lib/constants';

const DeliveryList = ({ deliveries, selectedDeliveries = [], onSelectionChange }) => {
  const router = useRouter();
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      onSelectionChange?.(deliveries.map(d => d._id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectDelivery = (deliveryId, checked) => {
    if (checked) {
      onSelectionChange?.([...selectedDeliveries, deliveryId]);
    } else {
      onSelectionChange?.(selectedDeliveries.filter(id => id !== deliveryId));
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
        {priority}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectionChange && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Customer</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="text-muted-foreground">
                  No deliveries found
                </div>
              </TableCell>
            </TableRow>
          ) : (
            deliveries.map((delivery) => (
              <TableRow 
                key={delivery._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/admin/deliveries/${delivery._id}`)}
              >
                {onSelectionChange && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedDeliveries.includes(delivery._id)}
                      onCheckedChange={(checked) => handleSelectDelivery(delivery._id, checked)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div>
                    <div className="font-medium">{delivery.customerName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {delivery.customerPhone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-1">
                    <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                    <div className="text-sm">
                      <div>{delivery.address.street}</div>
                      <div className="text-muted-foreground">
                        {delivery.address.city}, {delivery.address.state}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-1">
                    <Package className="h-3 w-3 mt-0.5 text-muted-foreground" />
                    <div className="text-sm">
                      <div>{delivery.packageInfo.description}</div>
                      <div className="text-muted-foreground">
                        {delivery.packageInfo.weight} kg
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                <TableCell>{getPriorityBadge(delivery.priority)}</TableCell>
                <TableCell>
                  <div className="flex items-start gap-1">
                    <Calendar className="h-3 w-3 mt-0.5 text-muted-foreground" />
                    <div className="text-sm">
                      <div>{formatDate(delivery.scheduledDate)}</div>
                      {delivery.deliveryWindow && (
                        <div className="text-muted-foreground">
                          {delivery.deliveryWindow.start} - {delivery.deliveryWindow.end}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {delivery.assignedTo ? (
                    <div className="text-sm">
                      <div>{delivery.assignedTo.name}</div>
                      <div className="text-muted-foreground">
                        {delivery.assignedTo.phone}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/deliveries/${delivery._id}`)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/deliveries/${delivery._id}?edit=true`)}
                      >
                        Edit Delivery
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        disabled={delivery.status !== 'pending'}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeliveryList;
