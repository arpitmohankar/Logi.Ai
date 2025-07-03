import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import DeliveryForm from '../../../components/admin/DeliveryForm';
import useDeliveryStore from '../../../store/deliveryStore';
import { deliverySchema } from '../../../lib/validators';

export default function NewDeliveryPage() {
  const router = useRouter();
  const { createDelivery, isLoading } = useDeliveryStore();
  const [error, setError] = useState('');

  const handleSubmit = async (data) => {
    setError('');
    const result = await createDelivery(data);
    
    if (result.success) {
      router.push('/admin/deliveries');
    } else {
      setError(result.error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout title="New Delivery">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Delivery</h1>
              <p className="text-muted-foreground">
                Add a new delivery to the system
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DeliveryForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Create Delivery"
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
