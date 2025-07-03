import { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { deliveryAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

const LocationSharer = ({ delivery, onClose }) => {
  const [trackingCode, setTrackingCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateTrackingCode = async () => {
    setIsGenerating(true);
    try {
      const response = await deliveryAPI.generateTrackingCode(delivery._id);
      setTrackingCode(response.data.data.trackingCode);
      toast.success('Tracking code generated');
    } catch (error) {
      toast.error('Failed to generate tracking code');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    toast.success('Tracking code copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const message = `Track your delivery with code: ${trackingCode}\n\nTrack here: ${window.location.origin}/track?code=${trackingCode}`;
    window.open(`https://wa.me/${delivery.customerPhone}?text=${encodeURIComponent(message)}`);
  };

  const shareViaSMS = () => {
    const message = `Your delivery tracking code: ${trackingCode}. Track at: ${window.location.origin}/track`;
    window.open(`sms:${delivery.customerPhone}?body=${encodeURIComponent(message)}`);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Tracking Code</DialogTitle>
          <DialogDescription>
            Generate and share a tracking code with the customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Customer</p>
            <p className="font-medium">{delivery.customerName}</p>
            <p className="text-sm">{delivery.customerPhone}</p>
          </div>

          {!trackingCode ? (
            <Button
              onClick={generateTrackingCode}
              disabled={isGenerating}
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Generate Tracking Code
            </Button>
          ) : (
            <>
              <div className="relative">
                <Input
                  value={trackingCode}
                  readOnly
                  className="text-center text-2xl font-bold pr-12"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={shareViaWhatsApp}
                  className="text-green-600 hover:text-green-700"
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={shareViaSMS}
                >
                  SMS
                </Button>
              </div>

              <div className="text-sm text-center text-muted-foreground">
                <p>Valid for 24 hours</p>
                <p className="mt-1">
                  Customer can track at: {window.location.origin}/track
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSharer;
