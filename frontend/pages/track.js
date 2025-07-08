/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Package, 
  MapPin, 
  Clock, 
  Search,
  Phone,
  CheckCircle,
  Truck,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import Layout from '../components/common/Layout';
import TrackingForm from '../components/customer/TrackingForm';
import LiveTracking from '../components/customer/LiveTracking';
import { trackingAPI } from '../utils/api';
import { toast } from 'react-hot-toast';

export default function TrackingPage() {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for tracking code in URL
  useEffect(() => {
    if (router.query.code) {
      setTrackingCode(router.query.code);
      handleTrack(router.query.code);
    }
  }, [router.query]);

  const handleTrack = async (code = trackingCode) => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-character tracking code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await trackingAPI.trackDelivery(code.toUpperCase());
      setTrackingData(response.data.data);
      
      // Update URL without page reload
      router.push(`/track?code=${code}`, undefined, { shallow: true });
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid tracking code');
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTrackingCode('');
    setTrackingData(null);
    setError('');
    router.push('/track', undefined, { shallow: true });
  };

  return (
    <Layout title="Track Delivery">
      <div className="aurora-bg min-h-screen relative" style={{ zIndex: 0 }}>
        <div className="aurora-bg-after2" style={{ opacity: 0.85, zIndex: 1 }} />
        {/* Header */}
        <div className="bg-white/80 border-b backdrop-blur z-10 relative">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded flex items-center justify-center shadow-md bg-white">
                  <img src="/route.png" alt="Logi.AI Logo" className="h-6 w-6" />
                </div>
                <span className="font-bold text-xl text-blue-900">Logi.AI</span>
              </div>
              {trackingData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  Track Another
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-6xl mx-auto px-4 py-8 relative z-20">
          {!trackingData ? (
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Track Your Delivery</CardTitle>
                  <CardDescription>
                    Enter your 6-character tracking code to see live delivery status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TrackingForm
                    trackingCode={trackingCode}
                    onTrackingCodeChange={setTrackingCode}
                    onSubmit={() => handleTrack()}
                    isLoading={isLoading}
                    error={error}
                  />
                  
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>Your tracking code was shared via SMS or WhatsApp</p>
                    <p className="mt-2">Example: ABC123</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <LiveTracking 
              trackingData={trackingData}
              trackingCode={trackingCode}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        {!trackingData && (
          <footer className="border-t mt-auto bg-white/80 backdrop-blur z-10 relative">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-sm text-blue-700">
                <p>Need help? Contact support at 1-800-WALMART</p>
                <p className="mt-2">&copy; 2025 Logi.AI All rights reserved.</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </Layout>
  );
}
