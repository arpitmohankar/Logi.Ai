import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { cn } from '../../lib/utils';

const DeliveryStatus = ({ status, delivery }) => {
  const statusSteps = [
    {
      key: 'pending',
      label: 'Order Placed',
      icon: Package,
      description: 'Your order has been received'
    },
    {
      key: 'assigned',
      label: 'Assigned',
      icon: Clock,
      description: 'Delivery partner assigned'
    },
    {
      key: 'picked-up',
      label: 'Picked Up',
      icon: Package,
      description: 'Package picked up from warehouse'
    },
    {
      key: 'in-transit',
      label: 'On The Way',
      icon: Truck,
      description: 'Your package is on the way'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: CheckCircle,
      description: 'Package delivered successfully'
    }
  ];

  const failedStep = {
    key: 'failed',
    label: 'Delivery Failed',
    icon: XCircle,
    description: 'Unable to deliver package'
  };

  // Get current step index
  const currentStepIndex = status === 'failed' 
    ? -1 
    : statusSteps.findIndex(step => step.key === status);

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-muted -translate-y-1/2" />
        <div 
          className="absolute left-0 top-1/2 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500"
          style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
        />
        
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div 
                key={step.key}
                className="flex flex-col items-center"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <step.icon className={cn(
                    "h-5 w-5",
                    isCurrent && "animate-pulse"
                  )} />
                </div>
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-xs font-medium",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Failed Status */}
      {status === 'failed' && (
        <div className="mt-6 p-4 bg-destructive/10 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Delivery Failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                We were unable to deliver your package. Please contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Status Description */}
      {status !== 'failed' && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-3">
            {statusSteps[currentStepIndex].icon && (
              <statusSteps[currentStepIndex].icon className="h-5 w-5 text-primary mt-0.5" />
            )}
            <div>
              <p className="font-medium">Current Status: {statusSteps[currentStepIndex].label}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {statusSteps[currentStepIndex].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatus;
