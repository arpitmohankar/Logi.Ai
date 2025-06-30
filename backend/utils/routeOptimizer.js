const { googleMapsClient, GOOGLE_MAPS_API_KEY } = require('../config/googleMaps');
const axios = require('axios');

// Google Route Optimization API endpoint
const ROUTE_OPTIMIZATION_API = 'https://routeoptimization.googleapis.com/v1/projects/:projectId/locations/:location:optimizeRoutes';

/**
 * Optimize route for multiple delivery stops
 * This is the core feature - real-time route optimization
 */
exports.optimizeDeliveryRoute = async (deliveries, startLocation, options = {}) => {
  try {
    // Build shipments array for the API
    const shipments = deliveries.map((delivery, index) => ({
      deliveries: [{
        arrivalLocation: {
          latitude: delivery.coordinates.lat,
          longitude: delivery.coordinates.lng
        },
        duration: '300s', // 5 minutes per delivery
        timeWindows: delivery.deliveryWindow ? [{
          startTime: `${delivery.scheduledDate}T${delivery.deliveryWindow.start}:00Z`,
          endTime: `${delivery.scheduledDate}T${delivery.deliveryWindow.end}:00Z`
        }] : []
      }],
      loadDemands: {
        weight: {
          amount: Math.ceil(delivery.packageInfo.weight || 1)
        }
      },
      label: `delivery_${delivery._id}`
    }));

    // Build vehicle configuration
    const vehicles = [{
      startLocation: {
        latitude: startLocation.lat,
        longitude: startLocation.lng
      },
      endLocation: options.endLocation || {
        latitude: startLocation.lat,
        longitude: startLocation.lng
      },
      costPerKilometer: 1,
      costPerHour: 60,
      loadLimits: {
        weight: {
          maxLoad: 1000 // kg
        }
      },
      routeDurationLimit: {
        maxDuration: '28800s' // 8 hours
      },
      label: 'delivery_vehicle'
    }];

    // Build the optimization request
    const request = {
      model: {
        shipments,
        vehicles,
        globalStartTime: new Date().toISOString(),
        globalEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      searchMode: options.refreshRoute ? 'RETURN_FAST' : 'DEFAULT_SEARCH',
      populatePolylines: true,
      populateTransitionPolylines: true,
      allowLargeDeadlineDespiteInterruptionRisk: true,
      useGeodesicDistances: true,
      geodesicMetersPerSecond: 10 // ~36 km/h average speed
    };

    // Call Google Route Optimization API
    const endpoint = ROUTE_OPTIMIZATION_API
      .replace(':projectId', process.env.GOOGLE_PROJECT_ID)
      .replace(':location', 'global');

    const response = await axios.post(endpoint, request, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.visits,routes.transitions,routes.routePolyline,routes.metrics'
      }
    });

    // Process the optimized route
    const optimizedRoute = response.data.routes[0];
    
    if (!optimizedRoute) {
      throw new Error('No optimized route found');
    }

    // Extract the delivery order and route details
    const deliveryOrder = [];
    let totalDistance = 0;
    let totalDuration = 0;
    
    // Process visits (deliveries)
    optimizedRoute.visits.forEach((visit, index) => {
      const deliveryId = visit.shipmentLabel.replace('delivery_', '');
      const delivery = deliveries.find(d => d._id.toString() === deliveryId);
      
      if (delivery) {
        deliveryOrder.push({
          delivery,
          visitIndex: index,
          arrivalTime: visit.startTime,
          departureTime: visit.endTime,
          isFirstDelivery: index === 0,
          isLastDelivery: index === optimizedRoute.visits.length - 1
        });
      }
    });

    // Process transitions (routes between stops)
    const routeSegments = optimizedRoute.transitions.map((transition, index) => ({
      startIndex: transition.startIndex,
      endIndex: transition.endIndex,
      distance: transition.distanceMeters,
      duration: transition.duration,
      polyline: transition.routePolyline?.encodedPolyline || null
    }));

    // Calculate totals from metrics
    if (optimizedRoute.metrics) {
      totalDistance = optimizedRoute.metrics.totalDistanceMeters || 0;
      totalDuration = optimizedRoute.metrics.totalDuration || '0s';
    }

    return {
      success: true,
      optimizedRoute: {
        deliveryOrder,
        routeSegments,
        totalDistance,
        totalDuration: parseDuration(totalDuration),
        totalDeliveries: deliveryOrder.length,
        routePolyline: optimizedRoute.routePolyline?.encodedPolyline || null,
        optimizationTimestamp: new Date()
      }
    };

  } catch (error) {
    console.error('Route optimization error:', error.response?.data || error.message);
    
    // Fallback to simple distance-based optimization
    if (error.response?.status === 403 || error.response?.status === 429) {
      return fallbackRouteOptimization(deliveries, startLocation);
    }
    
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

/**
 * Get turn-by-turn directions for a route
 */
exports.getDirections = async (origin, destination, waypoints = []) => {
  try {
    const waypointsString = waypoints
      .map(wp => `${wp.lat},${wp.lng}`)
      .join('|');

    const response = await googleMapsClient.directions({
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        waypoints: waypointsString,
        optimize: true,
        key: GOOGLE_MAPS_API_KEY,
        alternatives: false,
        mode: 'driving',
        units: 'metric'
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Directions API error: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    
    return {
      success: true,
      directions: {
        distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
        duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
        polyline: route.overview_polyline.points,
        steps: route.legs.flatMap(leg => leg.steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance,
          duration: step.duration,
          startLocation: step.start_location,
          endLocation: step.end_location
        }))),
        waypointOrder: route.waypoint_order
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
    // Get traffic-aware distance matrix
    const destinations = deliveries.map(d => `${d.coordinates.lat},${d.coordinates.lng}`);
    
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [`${currentLocation.lat},${currentLocation.lng}`, ...destinations],
        destinations: destinations,
        mode: 'driving',
        departure_time: 'now', // This enables traffic consideration
        traffic_model: 'best_guess',
        key: GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Distance Matrix API error: ${response.data.status}`);
    }

    // Build distance/duration matrix considering traffic
    const matrix = response.data.rows.map(row => 
      row.elements.map(element => ({
        distance: element.distance?.value || Infinity,
        duration: element.duration_in_traffic?.value || element.duration?.value || Infinity,
        status: element.status
      }))
    );

    // Use the matrix for optimization with current traffic conditions
    const optimizedIndices = greedyTSP(matrix, 0);
    
    // Map back to deliveries
    const optimizedDeliveries = optimizedIndices
      .slice(1) // Remove starting point
      .map(index => deliveries[index - 1]);

    return {
      success: true,
      trafficOptimizedRoute: {
        deliveries: optimizedDeliveries,
        estimatedDuration: calculateTotalDuration(matrix, optimizedIndices),
        trafficConditions: 'real-time',
        optimizedAt: new Date()
      }
    };
  } catch (error) {
    console.error('Traffic optimization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fallback route optimization using nearest neighbor algorithm
 */
function fallbackRouteOptimization(deliveries, startLocation) {
  try {
    // Simple nearest neighbor algorithm
    const unvisited = [...deliveries];
    const route = [];
    let currentLocation = startLocation;
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
        distanceFromPrevious: nearestDistance
      });

      totalDistance += nearestDistance;
      currentLocation = nextDelivery.coordinates;
    }

    return {
      success: true,
      optimizedRoute: {
        deliveryOrder: route,
        totalDistance: Math.round(totalDistance),
        totalDuration: Math.round(totalDistance / 10), // Rough estimate: 10m/s
        totalDeliveries: route.length,
        optimizationMethod: 'fallback',
        optimizationTimestamp: new Date()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Fallback optimization failed'
    };
  }
}

/**
 * Greedy Traveling Salesman Problem solver
 */
function greedyTSP(distanceMatrix, startIndex) {
  const n = distanceMatrix.length;
  const visited = new Array(n).fill(false);
  const path = [startIndex];
  visited[startIndex] = true;
  
  let current = startIndex;
  
  for (let i = 1; i < n; i++) {
    let nearest = -1;
    let nearestDuration = Infinity;
    
    for (let j = 0; j < n; j++) {
      if (!visited[j] && distanceMatrix[current][j].duration < nearestDuration) {
        nearest = j;
        nearestDuration = distanceMatrix[current][j].duration;
      }
    }
    
    if (nearest !== -1) {
      path.push(nearest);
      visited[nearest] = true;
      current = nearest;
    }
  }
  
  return path;
}

/**
 * Calculate Haversine distance between two coordinates
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Parse duration string to seconds
 */
function parseDuration(duration) {
  if (typeof duration === 'number') return duration;
  const match = duration.match(/(\d+)s/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Calculate total duration from path
 */
function calculateTotalDuration(matrix, path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += matrix[path[i]][path[i + 1]].duration;
  }
  return total;
}
