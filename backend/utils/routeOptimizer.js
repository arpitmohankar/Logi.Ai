const { googleMapsClient, GOOGLE_MAPS_API_KEY } = require('../config/googleMaps');
const axios = require('axios');
// const { optimizeRouteWithML } = require('./mlRouteOptimizer');

/**
 * Optimize route for multiple delivery stops using Directions API
 */
exports.optimizeDeliveryRoute = async (deliveries, startLocation, options = {}) => {
  try {
    // Validate inputs
    if (!deliveries || deliveries.length === 0) {
      return { success: false, error: 'No deliveries to optimize' };
    }
    if (!startLocation || !startLocation.lat || !startLocation.lng) {
      return { success: false, error: 'Invalid start location' };
    }

    // // Single delivery—no need to call Google
    // if (deliveries.length === 1) {
    //   return {
    //     success: true,
    //     optimizedRoute: {
    //       deliveryOrder: [{
    //         delivery: deliveries[0],
    //         visitIndex: 0,
    //         isFirstDelivery: true,
    //         isLastDelivery: true
    //       }],
    //       totalDistance: 0,
    //       totalDuration: 0,
    //       totalDeliveries: 1,
    //       optimizationMethod: 'single-delivery',
    //       optimizationTimestamp: new Date()
    //     }
    //   };
    // }

    // // Optional ML optimization
    // if (process.env.USE_ML_OPTIMIZATION === 'true') {
    //   try {
    //     return await optimizeRouteWithML(deliveries, startLocation);
    //   } catch (mlError) {
    //     console.warn('ML optimization failed, falling back to Google:', mlError);
    //   }
    // }

    // Use Google Directions API
    return await optimizeUsingDirectionsAPI(deliveries, startLocation);

  } catch (error) {
    console.error('Route optimization error:', error);
    return fallbackRouteOptimization(deliveries, startLocation);
  }
};

/**
 * Optimize using Google Directions API
 */
async function optimizeUsingDirectionsAPI(deliveries, startLocation) {
  // Build waypoints array
  const waypoints = deliveries
  .filter(d => d.coordinates?.lat != null && d.coordinates?.lng != null)
  .map(d => `${d.coordinates.lat},${d.coordinates.lng}`); // send as strings
  if (waypoints.length === 0) {
    throw new Error('No valid delivery coordinates');
  }

  // // DEBUG: show the exact payload
  // console.debug('[RouteOptimizer] directions params →', {
  //   origin: startLocation,
  //   destination: startLocation,
  //   waypoints,
  //   optimizeWaypoints: true,
  //   departureTime: 'now'
  // });

  const response = await googleMapsClient.directions({
    params: {
      origin: `${startLocation.lat},${startLocation.lng}`,
      destination: `${startLocation.lat},${startLocation.lng}`,
      waypoints,
      optimizeWaypoints: true,
      mode:       'driving',
      departureTime: 'now',
      key:        GOOGLE_MAPS_API_KEY
    },
    timeout: 10000
  });
console.log('[RouteOptimizer] directions params →', {
  origin: `${startLocation.lat},${startLocation.lng}`,
  destination: `${startLocation.lat},${startLocation.lng}`,
  waypoints,
  optimizeWaypoints: true,
  departureTime: 'now'
});

console.log('Google API response:', response.data);

 

  // DEBUG: log status and summary
  console.debug('[RouteOptimizer] response status:', response.data.status);
  if (response.data.routes?.[0]) {
    console.debug('[RouteOptimizer] first route summary:', response.data.routes[0].summary);
  }

  if (response.data.status !== 'OK' || !response.data.routes?.length) {
    throw new Error(`Directions API error: ${response.data.status}`);
  }

  const route = response.data.routes[0];
  const order = route.waypoint_order || [];

  const deliveryOrder = order.map((origIdx, visitIdx) => ({
    delivery: deliveries[origIdx],
    visitIndex: visitIdx,
    isFirstDelivery: visitIdx === 0,
    isLastDelivery: visitIdx === order.length - 1
  }));

  // Sum up distance & duration
  let totalDistance = 0, totalDuration = 0;
  (route.legs || []).forEach(leg => {
    totalDistance += leg.distance?.value || 0;
    totalDuration += leg.duration?.value || 0;
  });

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
}

/**
 * Get turn-by-turn directions for a route
 */
exports.getDirections = async (origin, destination, waypoints = []) => {
  try {
    if (!origin || !destination) {
      return { success: false, error: 'Invalid origin or destination' };
    }

    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      key: GOOGLE_MAPS_API_KEY,
      mode: 'driving',
      units: 'metric'
    };

    if (waypoints.length > 0) {
      params.waypoints = waypoints
        .filter(wp => wp?.lat != null && wp?.lng != null)
        .map(wp => `${wp.lat},${wp.lng}`)
        .join('|');
    }

    const response = await googleMapsClient.directions({ params });

    if (response.data.status !== 'OK' || !response.data.routes?.length) {
      throw new Error(`Directions API error: ${response.data?.status || 'Unknown'}`);
    }

    const route = response.data.routes[0];
    return {
      success: true,
      directions: {
        distance: route.legs?.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0),
        duration: route.legs?.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0),
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
    return { success: false, error: error.message };
  }
};

/**
 * Optimize with real-time traffic (alias)
 */
exports.optimizeWithTraffic = async (deliveries, currentLocation) => {
  try {
    return await exports.optimizeDeliveryRoute(deliveries, currentLocation);
  } catch (error) {
    console.error('Traffic optimization error:', error);
    return fallbackRouteOptimization(deliveries, currentLocation);
  }
};

/**
 * Refresh route (same as traffic-optimized)
 */
exports.refreshRoute = exports.optimizeWithTraffic;

/**
 * Fallback: nearest-neighbor algorithm
 */
function fallbackRouteOptimization(deliveries, startLocation) {
  try {
    if (!deliveries?.length) {
      return { success: false, error: 'No deliveries to optimize' };
    }
    if (typeof startLocation.lat !== 'number' || typeof startLocation.lng !== 'number') {
      return { success: false, error: 'Invalid start location' };
    }

    const valid = deliveries.filter(d =>
      d.coordinates?.lat != null && d.coordinates?.lng != null
    );
    if (!valid.length) {
      return { success: false, error: 'No deliveries with valid coordinates' };
    }

    const unvisited = [...valid];
    const route = [];
    let current = { ...startLocation };
    let totalDist = 0;

    while (unvisited.length) {
      let nearestIdx = 0, minDist = Infinity;
      unvisited.forEach((d, i) => {
        const dist = haversineDistance(
          current.lat, current.lng,
          d.coordinates.lat, d.coordinates.lng
        );
        if (dist < minDist) {
          minDist = dist;
          nearestIdx = i;
        }
      });
      const next = unvisited.splice(nearestIdx, 1)[0];
      route.push({
        delivery: next,
        visitIndex: route.length,
        distanceFromPrevious: minDist,
        isFirstDelivery: route.length === 0,
        isLastDelivery: unvisited.length === 0
      });
      totalDist += minDist;
      current = { lat: next.coordinates.lat, lng: next.coordinates.lng };
    }

    return {
      success: true,
      optimizedRoute: {
        deliveryOrder: route,
        totalDistance: Math.round(totalDist),
        totalDuration: Math.round(totalDist / 10),
        totalDeliveries: route.length,
        optimizationMethod: 'fallback-nearest-neighbor',
        optimizationTimestamp: new Date()
      }
    };
  } catch (error) {
    console.error('Fallback optimization error:', error);
    return { success: false, error: `Optimization failed: ${error.message}` };
  }
}

/**
 * Haversine distance
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2 - lat1) * Math.PI/180;
  const Δλ = (lon2 - lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
