const { Client } = require('@googlemaps/google-maps-services-js');
require('dotenv').config();

// Initialize Google Maps client
const googleMapsClient = new Client({});

// Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

module.exports = {
  googleMapsClient,
  GOOGLE_MAPS_API_KEY
};
