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
import MapWrapper from '../common/MapWrapper';


const DeliveryForm = ({ 
  initialData = null, 
  onSubmit, 
  isLoading = false,
  submitLabel = 'Save'
}) => {
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
   const [pickedPos, setPickedPos]           = useState(null);
   

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
  const timer = setTimeout(async () => {
    if (streetValue?.length > 3) {
      setIsLoadingSuggestions(true);
      try {
        const response = await utilsAPI.autocompleteAddress(streetValue);
        if (response.data.success) {
        // BACKEND returns { success:true, data:[{description, place_id or placeId}] }
        const raw = response.data.data || [];
        const preds = raw.map(item => ({
          description: item.description,
          // normalize whichever key your API returned
          placeId:      item.placeId ?? item.place_id
        }));
        setAddressSuggestions(preds);
        setShowSuggestions(true);
      }
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);
  return () => clearTimeout(timer);
}, [streetValue]);

  const handleAddressSelect = async (suggestion) => {
  // 1) Fill the text field
  setValue('address.street', suggestion.description, { shouldValidate: true });
  setShowSuggestions(false);

  // 2) Geocode to get precise lat/lng
  try {
    const geoRes = await utilsAPI.geocodeAddress(suggestion.placeId);

    if (geoRes.data.success) {
      const { coordinates, address } = geoRes.data.data;
      // fill hidden lat/lng
      setValue('coordinates.lat', coordinates.lat);
      setValue('coordinates.lng', coordinates.lng);

      // fill city, state, ZIP
      setValue('address.city',    address.city    || '');
      setValue('address.state',   address.state   || '');
      setValue('address.zipCode', address.postalCode || '');
    } else {
      console.warn('Geocode failed:', geoRes.data);
      setValue('coordinates.lat', null);
      setValue('coordinates.lng', null);
      toast.error('Could not resolve address to coordinates');
    }
  } catch (err) {
    console.error('Failed to geocode suggestion:', err);
    // clear on error
    setValue('coordinates.lat', null);
    setValue('coordinates.lng', null);
    toast.error('Error fetching location data');
  }
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
                placeholder="Gandhi Nagar, Bhandara"
                autoComplete="on"
              />
              {isLoadingSuggestions && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
              )}
            </div>
            {showSuggestions && addressSuggestions?.length > 0 && (
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
                placeholder="Bhandara"
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
                placeholder="BH"
                maxLength={10}
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
                placeholder="441904"
                maxLength={6}
              />
              {errors.address?.zipCode && (
                <p className="text-sm text-destructive">{errors.address.zipCode.message}</p>
              )}
            </div>

                           {/* Street + autocomplete etc. */}

          {/* Fallback: pick directly on map */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="mapPicker"
              checked={showMapPicker}
              onChange={() => setShowMapPicker(!showMapPicker)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="mapPicker">Pick location on map</Label>
          </div>
          {showMapPicker && (
            <div className="h-64 my-2">
              <MapWrapper
                center={ pickedPos || undefined }
                zoom={13}
                markers={
                  pickedPos ? [{ id: 'picked', lat: pickedPos.lat, lng: pickedPos.lng }] : []
                }
                onMapClick={(e) => {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setPickedPos({ lat, lng });
                  setValue('coordinates.lat', lat);
                  setValue('coordinates.lng', lng);
                }}
                height="100%"
                width="100%"
              />
              {pickedPos && (
                <p className="mt-1 text-sm text-gray-700">
                  Chosen: {pickedPos.lat.toFixed(5)}, {pickedPos.lng.toFixed(5)}
                </p>
              )}
            </div>
          )}

           {/* City / State / ZIP hidden fields */}

            <input type="hidden" {...register('coordinates.lat')} />
            <input type="hidden" {...register('coordinates.lng')} />
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
        <Button type="button" variant="cobalt" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" variant="cobalt" disabled={isLoading}>
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
