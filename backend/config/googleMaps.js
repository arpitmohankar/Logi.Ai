const { Client } = require('@googlemaps/google-maps-services-js');
require('dotenv').config();

// Initialize Google Maps client
const googleMapsClient = new Client({
  axiosInstance: require('axios').create({
    timeout: 10000,
    headers: {
      'Accept-Encoding': 'gzip',
      'User-Agent': 'google-maps-services-node'
    }
  })
});

// Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

module.exports = {
  googleMapsClient,
  GOOGLE_MAPS_API_KEY
};
