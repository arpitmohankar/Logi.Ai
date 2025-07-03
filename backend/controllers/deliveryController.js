const Delivery = require('../models/Delivery');
const TrackingSession = require('../models/TrackingSession');
const { optimizeDeliveryRoute, optimizeWithTraffic, getDirections } = require('../utils/routeOptimizer');

// @desc    Get assigned deliveries for delivery boy
// @route   GET /api/delivery/my-deliveries
// @access  Private/Delivery
// exports.getMyDeliveries = async (req, res) => {
//   try {
//     const { status, date } = req.query;
    
//     // Build query
//     const query = { assignedTo: req.user._id };
    
//     if (status) {
//       query.status = status;
//     } else {
//       // Default: show active deliveries
//       query.status = { $in: ['assigned', 'picked-up', 'in-transit'] };
//     }
    
//     if (date) {
//       const startDate = new Date(date);
//       const endDate = new Date(date);
//       endDate.setDate(endDate.getDate() + 1);
      
//       query.scheduledDate = {
//         $gte: startDate,
//         $lt: endDate
//       };
//     }

//     const deliveries = await Delivery.find(query)
//       .sort({ priority: -1, scheduledDate: 1 });

//     res.status(200).json({
//       success: true,
//       count: deliveries.length,
//       data: deliveries
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Get optimized route for deliveries
// // @route   POST /api/delivery/optimize-route
// // @access  Private/Delivery
// exports.getOptimizedRoute = async (req, res) => {
//   try {
//     const { deliveryIds, currentLocation, useTraffic } = req.body;

//     if (!currentLocation || !currentLocation.lat || !currentLocation.lng) {
//       return res.status(400).json({
//         success: false,
//         error: 'Current location is required'
//       });
//     }

//     // Get deliveries
//     const deliveries = await Delivery.find({
//       _id: { $in: deliveryIds },
//       assignedTo: req.user._id,
//       status: { $in: ['assigned', 'picked-up', 'in-transit'] }
//     });

//     if (deliveries.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: 'No valid deliveries found'
//       });
//     }

//     // Optimize route
//     let result;
//     if (useTraffic) {
//       result = await optimizeWithTraffic(deliveries, currentLocation);
//     } else {
//       result = await optimizeDeliveryRoute(deliveries, currentLocation);
//     }

//     if (!result.success) {
//       return res.status(400).json({
//         success: false,
//         error: result.error
//       });
//     }

//     // Update delivery order in database
//     const optimizedRoute = result.optimizedRoute || result.trafficOptimizedRoute;
//     if (optimizedRoute && optimizedRoute.deliveryOrder) {
//       await Promise.all(
//         optimizedRoute.deliveryOrder.map((item, index) =>
//           Delivery.findByIdAndUpdate(item.delivery._id, {
//             routeIndex: index,
//             estimatedDeliveryTime: item.arrivalTime
//           })
//         )
//       );
//     }

//     res.status(200).json({
//       success: true,
//       data: result
//     });
//   } catch (error) {
//     console.error('Route optimization error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// @desc    Get assigned deliveries for delivery boy
// @route   GET /api/delivery/my-deliveries
// @access  Private/Delivery
exports.getMyDeliveries = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    // Build query
    const query = { assignedTo: req.user._id };
    
    if (status) {
      query.status = status;
    } else {
      // Default: show active deliveries (include 'assigned' status)
      query.status = { $in: ['assigned', 'picked-up', 'in-transit'] };
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.scheduledDate = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const deliveries = await Delivery.find(query)
      .populate('customerName customerPhone customerEmail address coordinates packageInfo')
      .sort({ priority: -1, scheduledDate: 1 });

    // Ensure coordinates are properly formatted
    const formattedDeliveries = deliveries.map(delivery => {
      const deliveryObj = delivery.toObject();
      
      // Ensure coordinates exist and are numbers
      if (!deliveryObj.coordinates || 
          typeof deliveryObj.coordinates.lat !== 'number' || 
          typeof deliveryObj.coordinates.lng !== 'number') {
        console.warn(`Delivery ${deliveryObj._id} has invalid coordinates`);
      }
      
      return deliveryObj;
    });

    res.status(200).json({
      success: true,
      count: formattedDeliveries.length,
      data: formattedDeliveries
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get optimized route for deliveries
// @route   POST /api/delivery/optimize-route
// @access  Private/Delivery
exports.getOptimizedRoute = async (req, res) => {
  try {
    const { deliveryIds, currentLocation, useTraffic } = req.body;

    if (!currentLocation || !currentLocation.lat || !currentLocation.lng) {
      return res.status(400).json({
        success: false,
        error: 'Current location is required with valid lat/lng'
      });
    }

    if (!deliveryIds || deliveryIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No deliveries selected for optimization'
      });
    }

    // Get deliveries with full details
    const deliveries = await Delivery.find({
      _id: { $in: deliveryIds },
      assignedTo: req.user._id,
      status: { $in: ['assigned', 'picked-up', 'in-transit'] }
    });

    if (deliveries.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid deliveries found for optimization'
      });
    }

    // Validate all deliveries have coordinates
    const validDeliveries = deliveries.filter(d => 
      d.coordinates && 
      typeof d.coordinates.lat === 'number' && 
      typeof d.coordinates.lng === 'number'
    );

    if (validDeliveries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No deliveries with valid coordinates found'
      });
    }

    // Optimize route
    let result;
    if (useTraffic) {
      result = await optimizeWithTraffic(validDeliveries, currentLocation);
    } else {
      result = await optimizeDeliveryRoute(validDeliveries, currentLocation);
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Route optimization failed'
      });
    }

    // Update delivery order in database if optimization succeeded
    if (result.optimizedRoute && result.optimizedRoute.deliveryOrder) {
      await Promise.all(
        result.optimizedRoute.deliveryOrder.map((item, index) =>
          Delivery.findByIdAndUpdate(item.delivery._id, {
            routeIndex: index,
            estimatedDeliveryTime: item.arrivalTime
          })
        )
      );
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};




// @desc    Refresh route with real-time optimization (UNIQUE FEATURE)
// @route   POST /api/delivery/refresh-route
// @access  Private/Delivery
exports.refreshRoute = async (req, res) => {
  try {
    const { currentLocation, remainingDeliveryIds } = req.body;

    if (!currentLocation || !remainingDeliveryIds || remainingDeliveryIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Current location and remaining deliveries are required'
      });
    }

    // Get remaining deliveries
    const deliveries = await Delivery.find({
      _id: { $in: remainingDeliveryIds },
      assignedTo: req.user._id,
      status: { $in: ['assigned', 'picked-up', 'in-transit'] }
    });

    // Re-optimize with current traffic conditions
    const result = await optimizeWithTraffic(deliveries, currentLocation);

    if (!result.success) {
      // Fallback to regular optimization
      const fallbackResult = await optimizeDeliveryRoute(deliveries, currentLocation, {
        refreshRoute: true
      });
      
      return res.status(200).json({
        success: true,
        data: fallbackResult,
        optimizationType: 'standard'
      });
    }

    // Emit route update via socket
    const io = req.app.get('io');
    io.to(`delivery-${req.user._id}`).emit('route-refreshed', {
      message: 'Route has been optimized with current traffic conditions',
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      data: result,
      optimizationType: 'traffic-aware',
      refreshedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update delivery status
// @route   PUT /api/delivery/:id/status
// @access  Private/Delivery
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, location, notes, failureReason } = req.body;

    const delivery = await Delivery.findOne({
      _id: req.params.id,
      assignedTo: req.user._id
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      'assigned': ['picked-up'],
      'picked-up': ['in-transit'],
      'in-transit': ['delivered', 'failed']
    };

    if (!validTransitions[delivery.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot change status from ${delivery.status} to ${status}`
      });
    }

    // Update delivery
    delivery.status = status;
    
    if (status === 'delivered') {
      delivery.actualDeliveryTime = new Date();
      if (notes) delivery.deliveryProof.notes = notes;
    }
    
    if (status === 'failed' && failureReason) {
      delivery.failureReason = failureReason;
    }

    await delivery.save();

    // Emit status update
    const io = req.app.get('io');
    io.emit(`delivery-status-${delivery._id}`, {
      deliveryId: delivery._id,
      status: status,
      timestamp: new Date()
    });

    // If tracking is active, notify customer
    const activeTracking = await TrackingSession.findOne({
      deliveryId: delivery._id,
      isActive: true
    });
    
    if (activeTracking) {
      io.to(`tracking-${activeTracking.trackingCode}`).emit('status-update', {
        status: status,
        message: getStatusMessage(status),
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Generate tracking code for delivery
// @route   POST /api/delivery/:id/generate-tracking
// @access  Private/Delivery
exports.generateTrackingCode = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
      status: { $in: ['picked-up', 'in-transit'] }
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found or not eligible for tracking'
      });
    }

    // Check if active tracking session exists
    let trackingSession = await TrackingSession.findOne({
      deliveryId: delivery._id,
      isActive: true
    });

    if (trackingSession) {
      return res.status(200).json({
        success: true,
        data: {
          trackingCode: trackingSession.trackingCode,
          expiresAt: trackingSession.expiresAt
        }
      });
    }

    // Generate new tracking code
    const trackingCode = generateRandomCode(6);
    
    trackingSession = await TrackingSession.create({
      trackingCode,
      deliveryId: delivery._id,
      deliveryBoyId: req.user._id
    });

    res.status(201).json({
      success: true,
      data: {
        trackingCode: trackingSession.trackingCode,
        expiresAt: trackingSession.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get turn-by-turn directions
// @route   POST /api/delivery/directions
// @access  Private/Delivery
exports.getDirections = async (req, res) => {
  try {
    const { origin, destination, waypoints } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination are required'
      });
    }

    const result = await getDirections(origin, destination, waypoints);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.directions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload delivery proof
// @route   POST /api/delivery/:id/proof
// @access  Private/Delivery
exports.uploadDeliveryProof = async (req, res) => {
  try {
    const { signature, photo, notes } = req.body;

    const delivery = await Delivery.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
      status: 'delivered'
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found or not completed'
      });
    }

    // Update delivery proof
    delivery.deliveryProof = {
      signature: signature || delivery.deliveryProof.signature,
      photo: photo || delivery.deliveryProof.photo,
      notes: notes || delivery.deliveryProof.notes
    };

    await delivery.save();

    res.status(200).json({
      success: true,
      data: delivery.deliveryProof
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get delivery statistics
// @route   GET /api/delivery/stats
// @access  Private/Delivery
exports.getDeliveryStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalAssigned,
      completedToday,
      pendingToday,
      failedToday
    ] = await Promise.all([
      Delivery.countDocuments({
        assignedTo: req.user._id,
        status: { $in: ['assigned', 'picked-up', 'in-transit'] }
      }),
      Delivery.countDocuments({
        assignedTo: req.user._id,
        status: 'delivered',
        actualDeliveryTime: { $gte: today, $lt: tomorrow }
      }),
      Delivery.countDocuments({
        assignedTo: req.user._id,
        status: { $in: ['assigned', 'picked-up', 'in-transit'] },
        scheduledDate: { $gte: today, $lt: tomorrow }
      }),
      Delivery.countDocuments({
        assignedTo: req.user._id,
        status: 'failed',
        updatedAt: { $gte: today, $lt: tomorrow }
      })
    ]);

    // Calculate success rate
    const totalToday = completedToday + failedToday;
    const successRate = totalToday > 0 ? (completedToday / totalToday * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalAssigned,
        completedToday,
        pendingToday,
        failedToday,
        successRate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper Functions
function generateRandomCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

function getStatusMessage(status) {
  const messages = {
    'picked-up': 'Your package has been picked up',
    'in-transit': 'Your package is on the way',
    'delivered': 'Your package has been delivered',
    'failed': 'Delivery attempt failed'
  };
  return messages[status] || 'Status updated';
}
