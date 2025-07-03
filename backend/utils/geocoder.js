const { googleMapsClient, GOOGLE_MAPS_API_KEY } = require('../config/googleMaps');


// Convert address to coordinates
exports.geocodeAddress = async (address) => {
  try {
    const response = await googleMapsClient.geocode({
      params: {
        address: address,
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      const formattedAddress = response.data.results[0].formatted_address;
      
      return {
        success: true,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        formattedAddress: formattedAddress
      };
    } else {
      return {
        success: false,
        error: 'Address not found'
      };
    }
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
        input: input,
        key: GOOGLE_MAPS_API_KEY,
        types: 'address',
        components: 'country:in'
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
