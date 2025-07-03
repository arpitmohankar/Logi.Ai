const { googleMapsClient, GOOGLE_MAPS_API_KEY } = require('../config/googleMaps');
const axios = require('axios');

/**
 * Optimize route for multiple delivery stops using Directions API
 */
exports.optimizeDeliveryRoute = async (deliveries, startLocation, options = {}) => {
  try {
    // Validate inputs
    if (!deliveries || deliveries.length === 0) {
      return {
        success: false,
        error: 'No deliveries to optimize'
      };
    }

    if (!startLocation || !startLocation.lat || !startLocation.lng) {
      return {
        success: false,
        error: 'Invalid start location'
      };
    }

    // For single delivery, no optimization needed
    if (deliveries.length === 1) {
      return {
        success: true,
        optimizedRoute: {
          deliveryOrder: [{
            delivery: deliveries[0],
            visitIndex: 0,
            isFirstDelivery: true,
            isLastDelivery: true
          }],
          totalDistance: 0,
          totalDuration: 0,
          totalDeliveries: 1,
          optimizationMethod: 'single-delivery',
          optimizationTimestamp: new Date()
        }
      };
    }

    // Use Directions API for optimization
    return await optimizeUsingDirectionsAPI(deliveries, startLocation);
  } catch (error) {
    console.error('Route optimization error:', error);
    // Fallback to simple optimization
    return fallbackRouteOptimization(deliveries, startLocation);
  }
};

/**
 * Optimize using Google Directions API
 */
async function optimizeUsingDirectionsAPI(deliveries, startLocation) {
  try {
    // Create waypoints from deliveries
    const waypoints = deliveries
      .filter(d => d.coordinates && d.coordinates.lat && d.coordinates.lng)
      .map(d => `${d.coordinates.lat},${d.coordinates.lng}`)
      .join('|');

    if (!waypoints) {
      throw new Error('No valid delivery coordinates');
    }

    const response = await googleMapsClient.directions({
      params: {
        origin: `${startLocation.lat},${startLocation.lng}`,
        destination: `${startLocation.lat},${startLocation.lng}`, // Return to start
        waypoints: `optimize:true|${waypoints}`,
        key: GOOGLE_MAPS_API_KEY,
        mode: 'driving',
        departure_time: 'now'
      }
    });

    if (!response.data || response.data.status !== 'OK') {
      throw new Error(`Directions API error: ${response.data?.status || 'Unknown error'}`);
    }

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No routes found');
    }

    const route = response.data.routes[0];
    const optimizedOrder = route.waypoint_order || [];
    
    // Create delivery order based on optimization
    const deliveryOrder = optimizedOrder.map((originalIndex, newIndex) => ({
      delivery: deliveries[originalIndex],
      visitIndex: newIndex,
      isFirstDelivery: newIndex === 0,
      isLastDelivery: newIndex === optimizedOrder.length - 1
    }));

    // Calculate totals safely
    let totalDistance = 0;
    let totalDuration = 0;
    
    if (route.legs && Array.isArray(route.legs)) {
      route.legs.forEach(leg => {
        if (leg.distance && leg.distance.value) {
          totalDistance += leg.distance.value;
        }
        if (leg.duration && leg.duration.value) {
          totalDuration += leg.duration.value;
        }
      });
    }

    return {
      success: true,
      optimizedRoute: {
        deliveryOrder,
        totalDistance,
        totalDuration,
        totalDeliveries: deliveryOrder.length,
        routePolyline: route.overview_polyline?.points || null,
        optimizationMethod: 'directions-api',
        optimizationTimestamp: new Date()
      }
    };
  } catch (error) {
    console.error('Directions API optimization error:', error);
    throw error;
  }
}

/**
 * Get turn-by-turn directions for a route
 */
exports.getDirections = async (origin, destination, waypoints = []) => {
  try {
    // Validate inputs
    if (!origin || !destination) {
      return {
        success: false,
        error: 'Invalid origin or destination'
      };
    }

    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      key: GOOGLE_MAPS_API_KEY,
      mode: 'driving',
      units: 'metric'
    };

    if (waypoints && waypoints.length > 0) {
      params.waypoints = waypoints
        .filter(wp => wp && wp.lat && wp.lng)
        .map(wp => `${wp.lat},${wp.lng}`)
        .join('|');
    }

    const response = await googleMapsClient.directions({ params });

    if (!response.data || response.data.status !== 'OK') {
      throw new Error(`Directions API error: ${response.data?.status || 'Unknown error'}`);
    }

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No routes found');
    }

    const route = response.data.routes[0];
    
    return {
      success: true,
      directions: {
        distance: route.legs?.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) || 0,
        duration: route.legs?.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0) || 0,
        polyline: route.overview_polyline?.points || '',
        steps: route.legs?.flatMap(leg => 
          leg.steps?.map(step => ({
            instruction: step.html_instructions || '',
            distance: step.distance || { text: '', value: 0 },
            duration: step.duration || { text: '', value: 0 },
            startLocation: step.start_location || { lat: 0, lng: 0 },
            endLocation: step.end_location || { lat: 0, lng: 0 }
          })) || []
        ) || [],
        waypointOrder: route.waypoint_order || []
      }
    };
  } catch (error) {
    console.error('Directions API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Calculate optimal route considering real-time traffic
 */
exports.optimizeWithTraffic = async (deliveries, currentLocation) => {
  try {
    // Use the same optimization as regular route
    return await exports.optimizeDeliveryRoute(deliveries, currentLocation);
  } catch (error) {
    console.error('Traffic optimization error:', error);
    return fallbackRouteOptimization(deliveries, currentLocation);
  }
};

/**
 * Refresh route - unique feature
 */
exports.refreshRoute = exports.optimizeWithTraffic;

/**
 * Fallback route optimization using nearest neighbor algorithm
 */
function fallbackRouteOptimization(deliveries, startLocation) {
  try {
    if (!deliveries || deliveries.length === 0) {
      return {
        success: false,
        error: 'No deliveries to optimize'
      };
    }

    if (!startLocation || typeof startLocation.lat !== 'number' || typeof startLocation.lng !== 'number') {
      return {
        success: false,
        error: 'Invalid start location'
      };
    }

    // Filter deliveries with valid coordinates
    const validDeliveries = deliveries.filter(d => 
      d.coordinates && 
      typeof d.coordinates.lat === 'number' && 
      typeof d.coordinates.lng === 'number'
    );

    if (validDeliveries.length === 0) {
      return {
        success: false,
        error: 'No deliveries with valid coordinates'
      };
    }

    // Simple nearest neighbor algorithm
    const unvisited = [...validDeliveries];
    const route = [];
    let currentLocation = { ...startLocation };
    let totalDistance = 0;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      // Find nearest unvisited delivery
      unvisited.forEach((delivery, index) => {
        const distance = haversineDistance(
          currentLocation.lat,
          currentLocation.lng,
          delivery.coordinates.lat,
          delivery.coordinates.lng
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      // Add to route
      const nextDelivery = unvisited.splice(nearestIndex, 1)[0];
      route.push({
        delivery: nextDelivery,
        visitIndex: route.length,
        distanceFromPrevious: nearestDistance,
        isFirstDelivery: route.length === 0,
        isLastDelivery: unvisited.length === 0
      });

      totalDistance += nearestDistance;
      currentLocation = {
        lat: nextDelivery.coordinates.lat,
        lng: nextDelivery.coordinates.lng
      };
    }

    return {
      success: true,
      optimizedRoute: {
        deliveryOrder: route,
        totalDistance: Math.round(totalDistance),
        totalDuration: Math.round(totalDistance / 10), // Rough estimate
        totalDeliveries: route.length,
        optimizationMethod: 'fallback-nearest-neighbor',
        optimizationTimestamp: new Date()
      }
    };
  } catch (error) {
    console.error('Fallback optimization error:', error);
    return {
      success: false,
      error: `Optimization failed: ${error.message}`
    };
  }
}

/**
 * Calculate Haversine distance between two coordinates
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
