const { googleMapsClient, GOOGLE_MAPS_API_KEY } = require('../config/googleMaps');

// Convert address to coordinates
// File: backend/utils/geocoder.js

exports.geocodeAddress = async ({ address, placeId }) => {
  try {
    // Build params depending on which identifier you have
    let params;
    if (placeId) {
      // Must NOT include components when using place_id
      params = {
        key:       GOOGLE_MAPS_API_KEY,
        place_id:  placeId
      };
    } else if (address) {
      // Free‐form address lookup, restrict to India
      params = {
        key:        GOOGLE_MAPS_API_KEY,
        address,
        components: 'country:IN',
        region:     'in'
      };
    } else {
      throw new Error('geocodeAddress requires either placeId or address');
    }

    const response = await googleMapsClient.geocode({ params });

    if (!response.data.results?.length) {
      return { success: false, error: 'Address not found' };
    }

    const res0 = response.data.results[0];
    const loc  = res0.geometry.location;
    const comps = res0.address_components;

    // Extract city/state/postal_code if needed
    const cityComp   = comps.find(c => c.types.includes('locality') ||
                                       c.types.includes('sublocality') ||
                                       c.types.includes('administrative_area_level_2'));
    const stateComp  = comps.find(c => c.types.includes('administrative_area_level_1'));
    const postalComp = comps.find(c => c.types.includes('postal_code'));

    return {
      success: true,
      coordinates: {
        lat: loc.lat,
        lng: loc.lng
      },
      formattedAddress: res0.formatted_address,
      addressComponents: {
        city:       cityComp?.long_name    || '',
        state:      stateComp?.short_name  || stateComp?.long_name || '',
        postalCode: postalComp?.long_name  || ''
      }
    };
  } catch (error) {
    console.error('Geocoding error:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.error_message || error.message
    };
  }
};


// Calculate distance between two coordinates
exports.calculateDistance = async (origin, destination) => {
  try {
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [`${origin.lat},${origin.lng}`],
        destinations: [`${destination.lat},${destination.lng}`],
        key: GOOGLE_MAPS_API_KEY,
        units: 'metric'
      }
    });

    if (response.data.rows[0].elements[0].status === 'OK') {
      return {
        success: true,
        distance: response.data.rows[0].elements[0].distance,
        duration: response.data.rows[0].elements[0].duration
      };
    } else {
      return {
        success: false,
        error: 'Could not calculate distance'
      };
    }
  } catch (error) {
    console.error('Distance calculation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get address suggestions for autocomplete
exports.getAddressSuggestions = async (input) => {
  try {
    const response = await googleMapsClient.placeAutocomplete({
      params: {
        input,                              // user’s partial input
        key: GOOGLE_MAPS_API_KEY,
        types: 'address',
        components: 'country:IN',           // only India
        location: { lat: 20.5937, lng: 78.9629 }, // India’s centroid
        radius: 2000000,                    // 2,000 km radius
        strictBounds: true                  // strictly within radius
      }
    });

    return {
      success: true,
      predictions: response.data.predictions.map(pred => ({
        description: pred.description,
        placeId: pred.place_id
      }))
    };
  } catch (error) {
    console.error('Autocomplete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
