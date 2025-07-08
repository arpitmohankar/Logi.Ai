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
        <Label htmlFor="trackingCode" className="text-[#2243b6] font-semibold">Tracking Code</Label>
        <div className="relative">
          <Input
            id="trackingCode"
            type="text"
            value={localCode}
            onChange={handleInputChange}
            placeholder="ABC123"
            maxLength={6}
            className="text-center text-xl font-mono uppercase pr-10 text-[#2243b6] placeholder:text-[#2243b6] border-[#2243b6] focus-visible:border-[#2243b6] focus-visible:ring-[#2243b6]/30"
            disabled={isLoading}
            autoFocus
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#2243b6]" />
        </div>
      </div>

      {/* Remove error message display */}
      {/* {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-[#2243b6]">{error}</AlertDescription>
        </Alert>
      )} */}

      <Button 
        type="submit" 
        className="w-full font-bold"
        size="lg"
        variant="cobalt"
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
