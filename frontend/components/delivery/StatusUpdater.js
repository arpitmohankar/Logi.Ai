import { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Camera,
  Signature,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'react-hot-toast';

const StatusUpdater = ({ 
  delivery, 
  onStatusUpdate, 
  isActive = false,
  compact = false 
}) => {
  const [showFailureDialog, setShowFailureDialog] = useState(false);
  const [failureReason, setFailureReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusActions = {
    'assigned': {
      next: 'picked-up',
      label: 'Pick Up',
      icon: Package,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    'picked-up': {
      next: 'in-transit',
      label: 'Start Delivery',
      icon: Truck,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    'in-transit': {
      next: 'delivered',
      label: 'Complete Delivery',
      icon: CheckCircle,
      color: 'bg-green-600 hover:bg-green-700'
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(delivery._id, newStatus);
      toast.success(`Delivery marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFailure = async () => {
    if (!failureReason.trim()) {
      toast.error('Please provide a reason for failure');
      return;
    }

    setIsUpdating(true);
    try {
      await onStatusUpdate(delivery._id, 'failed', { failureReason });
      toast.success('Delivery marked as failed');
      setShowFailureDialog(false);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentAction = statusActions[delivery.status];

  if (delivery.status === 'delivered' || delivery.status === 'failed') {
    return (
      <div className={compact ? '' : 'p-4'}>
        <Badge 
          variant={delivery.status === 'delivered' ? 'default' : 'destructive'}
          className="w-full justify-center py-2"
        >
          {delivery.status === 'delivered' ? 'Completed' : 'Failed'}
        </Badge>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{delivery.customerName}</p>
            <p className="text-sm text-muted-foreground">{delivery.address.street}</p>
          </div>
          {isActive && currentAction && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(currentAction.next)}
              disabled={isUpdating}
              className={currentAction.color}
            >
              <currentAction.icon className="h-4 w-4 mr-2" />
              {currentAction.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{delivery.customerName}</h4>
          <p className="text-sm text-muted-foreground">{delivery.address.street}</p>
        </div>
        <Badge variant="outline">{delivery.status}</Badge>
      </div>

      {isActive && currentAction && (
        <div className="flex gap-2">
          <Button
            className={`flex-1 ${currentAction.color}`}
            onClick={() => handleStatusUpdate(currentAction.next)}
            disabled={isUpdating}
          >
            <currentAction.icon className="h-4 w-4 mr-2" />
            {currentAction.label}
          </Button>
          
          {delivery.status === 'in-transit' && (
            <Button
              variant="destructive"
              onClick={() => setShowFailureDialog(true)}
              disabled={isUpdating}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Failed
            </Button>
          )}
        </div>
      )}

      {/* Additional Actions for Delivered Status */}
      {delivery.status === 'in-transit' && (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Photo Proof
          </Button>
          <Button variant="outline" size="sm">
            <Signature className="h-4 w-4 mr-2" />
            Signature
          </Button>
        </div>
      )}

      {/* Failure Dialog */}
      <Dialog open={showFailureDialog} onOpenChange={setShowFailureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Delivery as Failed</DialogTitle>
            <DialogDescription>
              Please provide a reason for the delivery failure.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Customer not available, incorrect address, etc..."
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFailureDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleFailure}
              disabled={!failureReason.trim() || isUpdating}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Confirm Failure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StatusUpdater;
