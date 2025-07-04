// const axios = require('axios');

// const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
// const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

// /**
//  * Direct API call to Google Directions API
//  */
// exports.getDirections = async (params) => {
//   try {
//     const url = `${GOOGLE_MAPS_BASE_URL}/directions/json`;
    
//     const response = await axios.get(url, {
//       params: {
//         ...params,
//         key: GOOGLE_MAPS_API_KEY
//       }
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Direct Google Maps API error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// /**
//  * Direct API call to Google Geocoding API
//  */
// exports.geocode = async (address) => {
//   try {
//     const url = `${GOOGLE_MAPS_BASE_URL}/geocode/json`;
    
//     const response = await axios.get(url, {
//       params: {
//         address: address,
//         key: GOOGLE_MAPS_API_KEY,
//         region: 'in',
//         components: 'country:IN'
//       }
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Geocoding API error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// /**
//  * Direct API call to Google Places Autocomplete
//  */
// exports.placeAutocomplete = async (input) => {
//   try {
//     const url = `${GOOGLE_MAPS_BASE_URL}/place/autocomplete/json`;
    
//     const response = await axios.get(url, {
//       params: {
//         input: input,
//         key: GOOGLE_MAPS_API_KEY,
//         types: 'address',
//         components: 'country:IN',
//         language: 'en'
//       }
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Places Autocomplete API error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// /**
//  * Direct API call to Distance Matrix API
//  */
// exports.distanceMatrix = async (origins, destinations) => {
//   try {
//     const url = `${GOOGLE_MAPS_BASE_URL}/distancematrix/json`;
    
//     const response = await axios.get(url, {
//       params: {
//         origins: origins,
//         destinations: destinations,
//         key: GOOGLE_MAPS_API_KEY,
//         units: 'metric',
//         region: 'in'
//       }
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Distance Matrix API error:', error.response?.data || error.message);
//     throw error;
//   }
// };