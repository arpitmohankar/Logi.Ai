/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { RefreshCw, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '../ui/tooltip';
import { formatRelativeTime } from '../../utils/formatters';

const RefreshButton = ({ onRefresh, isLoading = false, lastRefreshed }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (isRefreshing && !isLoading) {
      setIsRefreshing(false);
      // Start countdown for next refresh availability
      setCountdown(30);
    }
  }, [isLoading]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
  };

  const isDisabled = isLoading || countdown > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleRefresh}
            disabled={isDisabled}
            variant="default"
            className="bg-walmart-blue hover:bg-walmart-blue/90"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {countdown > 0 ? `${countdown}s` : 'Refresh Route'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium mb-1">AI-Powered Route Refresh</p>
            <p className="text-muted-foreground">
              Recalculates optimal route based on:
            </p>
            <ul className="list-disc list-inside mt-1 text-muted-foreground">
              <li>Current traffic conditions</li>
              <li>Weather updates</li>
              <li>Road incidents</li>
              <li>Delivery time windows</li>
            </ul>
            {lastRefreshed && (
              <p className="mt-2 text-xs">
                Last refreshed: {formatRelativeTime(lastRefreshed)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RefreshButton;
