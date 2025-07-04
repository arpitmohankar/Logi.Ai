import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';

const TrackingForm = ({ 
  trackingCode, 
  onTrackingCodeChange, 
  onSubmit, 
  isLoading, 
  error 
}) => {
  const [localCode, setLocalCode] = useState(trackingCode);

  const handleSubmit = (e) => {
    e.preventDefault();
    onTrackingCodeChange(localCode);
    onSubmit();
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setLocalCode(value);
    onTrackingCodeChange(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trackingCode">Tracking Code</Label>
        <div className="relative">
          <Input
            id="trackingCode"
            type="text"
            value={localCode}
            onChange={handleInputChange}
            placeholder="ABC123"
            maxLength={6}
            className="text-center text-xl font-mono uppercase pr-10"
            disabled={isLoading}
            autoFocus
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={isLoading || localCode.length !== 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Tracking...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Track Delivery
          </>
        )}
      </Button>
    </form>
  );
};

export default TrackingForm;
