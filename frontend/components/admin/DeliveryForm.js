import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { deliverySchema } from '../../lib/validators';
import { utilsAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';

const DeliveryForm = ({ 
  initialData = null, 
  onSubmit, 
  isLoading = false,
  submitLabel = 'Save'
}) => {
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: initialData || {
      priority: 'medium',
      packageInfo: {
        fragile: false
      },
      scheduledDate: new Date().toISOString().split('T')[0]
    }
  });

  const streetValue = watch('address.street');

  // Address autocomplete
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (streetValue && streetValue.length > 3) {
        setIsLoadingSuggestions(true);
        try {
          const response = await utilsAPI.autocompleteAddress(streetValue);
          if (response.data.success) {
            setAddressSuggestions(response.data.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Address autocomplete error:', error);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [streetValue]);

  const handleAddressSelect = (suggestion) => {
    // Parse the address components from the suggestion
    const parts = suggestion.description.split(',');
    if (parts.length >= 3) {
      setValue('address.street', parts[0].trim());
      setValue('address.city', parts[1].trim());
      
      // Extract state and zip from last part
      const stateZip = parts[parts.length - 1].trim();
      const stateMatch = stateZip.match(/([A-Z]{2})\s+(\d{5})/);
      if (stateMatch) {
        setValue('address.state', stateMatch[1]);
        setValue('address.zipCode', stateMatch[2]);
      }
    }
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>
            Enter the customers contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              {...register('customerName')}
              placeholder="John Doe"
            />
            {errors.customerName && (
              <p className="text-sm text-destructive">{errors.customerName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone Number *</Label>
            <Input
              id="customerPhone"
              {...register('customerPhone')}
              placeholder="1234567890"
              maxLength={10}
            />
            {errors.customerPhone && (
              <p className="text-sm text-destructive">{errors.customerPhone.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customerEmail">Email (Optional)</Label>
            <Input
              id="customerEmail"
              type="email"
              {...register('customerEmail')}
              placeholder="john@example.com"
            />
            {errors.customerEmail && (
              <p className="text-sm text-destructive">{errors.customerEmail.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
          <CardDescription>
            Enter the delivery location details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <div className="relative">
              <Input
                id="street"
                {...register('address.street')}
                placeholder="123 Main St"
                autoComplete="off"
              />
              {isLoadingSuggestions && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
              )}
            </div>
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                    onClick={() => handleAddressSelect(suggestion)}
                  >
                    {suggestion.description}
                  </button>
                ))}
              </div>
            )}
            {errors.address?.street && (
              <p className="text-sm text-destructive">{errors.address.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('address.city')}
                placeholder="Dallas"
              />
              {errors.address?.city && (
                <p className="text-sm text-destructive">{errors.address.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                {...register('address.state')}
                placeholder="TX"
                maxLength={2}
              />
              {errors.address?.state && (
                <p className="text-sm text-destructive">{errors.address.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                {...register('address.zipCode')}
                placeholder="75201"
                maxLength={5}
              />
              {errors.address?.zipCode && (
                <p className="text-sm text-destructive">{errors.address.zipCode.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Package Information */}
      <Card>
        <CardHeader>
          <CardTitle>Package Information</CardTitle>
          <CardDescription>
            Describe the package details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Package Description *</Label>
            <Textarea
              id="description"
              {...register('packageInfo.description')}
              placeholder="Electronics, clothing, etc."
              rows={3}
            />
            {errors.packageInfo?.description && (
              <p className="text-sm text-destructive">{errors.packageInfo.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...register('packageInfo.weight', { valueAsNumber: true })}
                placeholder="2.5"
              />
              {errors.packageInfo?.weight && (
                <p className="text-sm text-destructive">{errors.packageInfo.weight.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value ($)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                {...register('packageInfo.value', { valueAsNumber: true })}
                placeholder="99.99"
              />
              {errors.packageInfo?.value && (
                <p className="text-sm text-destructive">{errors.packageInfo.value.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-8">
              <Controller
                name="packageInfo.fragile"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="fragile"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="fragile" className="cursor-pointer">
                Fragile Package
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Settings</CardTitle>
          <CardDescription>
            Configure delivery preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                {...register('scheduledDate')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.scheduledDate && (
                <p className="text-sm text-destructive">{errors.scheduledDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Delivery Window Start</Label>
              <Input
                id="startTime"
                type="time"
                {...register('deliveryWindow.start')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Delivery Window End</Label>
              <Input
                id="endTime"
                type="time"
                {...register('deliveryWindow.end')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Delivery Instructions</Label>
            <Textarea
              id="instructions"
              {...register('deliveryInstructions')}
              placeholder="Leave at door, ring doorbell, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
};

export default DeliveryForm;
