const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

exports.optimizeRouteWithML = async (deliveries, startLocation) => {
  try {
    // Prepare data for ML service
    const mlDeliveries = deliveries.map(d => ({
      id: d._id,
      lat: d.coordinates.lat,
      lng: d.coordinates.lng,
      customerName: d.customerName,
      address: d.address
    }));

    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/optimize-route`, {
      deliveries: mlDeliveries,
      startingPoint: {
        lat: startLocation.lat,
        lng: startLocation.lng
      }
    });

    if (!response.data.success) {
      throw new Error('ML optimization failed');
    }

    // Format response to match your existing structure
    const optimizedData = response.data.optimizedRoute;
    const deliveryOrder = optimizedData.deliveries.map((d, index) => ({
      delivery: deliveries.find(del => del._id.toString() === d.id),
      visitIndex: index,
      isFirstDelivery: index === 0,
      isLastDelivery: index === optimizedData.deliveries.length - 1
    }));

    return {
      success: true,
      optimizedRoute: {
        deliveryOrder,
        totalDistance: optimizedData.totalDistance,
        totalDuration: optimizedData.totalTime,
        totalDeliveries: deliveryOrder.length,
        optimizationMethod: 'ml-xgboost-genetic',
        optimizationTimestamp: new Date()
      }
    };
  } catch (error) {
    console.error('ML Route optimization error:', error);
    throw error;
  }
};
