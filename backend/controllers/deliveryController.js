const Delivery = require('../models/Delivery');
const TrackingSession = require('../models/TrackingSession');
const { optimizeDeliveryRoute, optimizeWithTraffic, getDirections } = require('../utils/routeOptimizer');
const crypto = require('crypto');
const { sendEmail }   = require('../utils/emailSender');

// exports.getMyDeliveries = async (req, res) => {
//   try {
//     const { status, date } = req.query;
    
//     // Build query
//     const query = { assignedTo: req.user._id };
    
//     if (status) {
//       query.status = status;
//     } else {
//       // Default: show active deliveries (include 'assigned' status)
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
//       .populate('customerName customerPhone customerEmail address coordinates packageInfo')
//       .sort({ priority: -1, scheduledDate: 1 });

//     // Ensure coordinates are properly formatted
//     const formattedDeliveries = deliveries.map(delivery => {
//       const deliveryObj = delivery.toObject();
      
//       // Ensure coordinates exist and are numbers
//       if (!deliveryObj.coordinates || 
//           typeof deliveryObj.coordinates.lat !== 'number' || 
//           typeof deliveryObj.coordinates.lng !== 'number') {
//         console.warn(`Delivery ${deliveryObj._id} has invalid coordinates`);
//       }
      
//       return deliveryObj;
//     });

//     res.status(200).json({
//       success: true,
//       count: formattedDeliveries.length,
//       data: formattedDeliveries
//     });
//   } catch (error) {
//     console.error('Get deliveries error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// @desc   All deliveries assigned to the logged-in driver (with trackingCode)
// @route  GET /api/delivery/my
// @access Private (role: delivery)
exports.getMyDeliveries = async (req, res) => {
  try {
    // 1. pull the deliveries
    const deliveries = await Delivery.find({
      assignedTo: req.user._id,
      status:     { $in: ['assigned','picked-up','in-transit','delivered'] }
    }).lean();                              // lean ⇒ plain JS objects

    // 2. look up any active tracking sessions
    const ids   = deliveries.map(d => d._id);
    const now   = new Date();
    const sessions = await TrackingSession.find({
      deliveryId : { $in: ids },
      isActive   : true,
      expiresAt  : { $gt: now }
    }).select('deliveryId trackingCode').lean();

    const codeMap = {};
    sessions.forEach(s => { codeMap[s.deliveryId.toString()] = s.trackingCode; });

    // 3. attach trackingCode to each delivery object (but DO NOT save)
    deliveries.forEach(d => {
      d.trackingCode = codeMap[d._id.toString()] || null;
    });

    res.json({ success:true, data: deliveries });
  } catch (err) {
    console.error('getMyDeliveries', err);
    res.status(500).json({ success:false, error:'Failed to fetch deliveries' });
  }
};


// @desc    Get optimized route for deliveries
// @route   POST /api/delivery/optimize-route
// @access  Private/Delivery
exports.getOptimizedRoute = async (req, res) => {
  try {
    // Accept either { deliveryIds, currentLocation } or { deliveries, startLocation }
    let { deliveryIds, currentLocation, useTraffic } = req.body;
    if ((!deliveryIds || !Array.isArray(deliveryIds)) && Array.isArray(req.body.deliveries)) {
      deliveryIds = req.body.deliveries;
    }
    if ((!currentLocation || currentLocation.lat == null) && req.body.startLocation) {
      currentLocation = req.body.startLocation;
    }

    console.log('→ getOptimizedRoute payload:', { deliveryIds, currentLocation, useTraffic });

    // Validate location
    if (
      !currentLocation ||
      typeof currentLocation.lat !== 'number' ||
      typeof currentLocation.lng !== 'number'
    ) {
      return res.status(400).json({
        success: false,
        error: 'Valid current location with lat/lng required'
      });
    }

    // Validate IDs
    if (!deliveryIds || !Array.isArray(deliveryIds) || deliveryIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Delivery IDs array required'
      });
    }

    // Fetch the Delivery docs…
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

    // Optionally filter out any without numeric coords…
    const validDeliveries = deliveries.filter(d =>
      d.coordinates?.lat != null && d.coordinates?.lng != null
    );

    if (validDeliveries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No deliveries with valid coordinates found'
      });
    }

    console.log(`Optimizing ${validDeliveries.length} stops from`, currentLocation);

    // Call your optimizer
    const result = useTraffic
      ? await optimizeWithTraffic(validDeliveries, currentLocation)
      : await optimizeDeliveryRoute(validDeliveries, currentLocation);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    // Persist routeIndex, etc… (unchanged)
    // …

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('getOptimizedRoute error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Refresh route with real-time optimization
// @route   POST /api/delivery/refresh-route
// @access  Private/Delivery
exports.refreshRoute = async (req, res) => {
  try {
    // Accept either { remainingDeliveryIds, currentLocation } or { deliveries, startLocation }
    let { remainingDeliveryIds, currentLocation } = req.body;
    if ((!remainingDeliveryIds || !Array.isArray(remainingDeliveryIds)) && Array.isArray(req.body.deliveries)) {
      remainingDeliveryIds = req.body.deliveries;
    }
    if ((!currentLocation || currentLocation.lat == null) && req.body.startLocation) {
      currentLocation = req.body.startLocation;
    }

    console.log('→ refreshRoute payload:', { remainingDeliveryIds, currentLocation });

    if (
      !currentLocation ||
      typeof currentLocation.lat !== 'number' ||
      typeof currentLocation.lng !== 'number' ||
      !remainingDeliveryIds?.length
    ) {
      return res.status(400).json({
        success: false,
        error: 'Current location and remaining deliveries are required'
      });
    }

    const deliveries = await Delivery.find({
      _id: { $in: remainingDeliveryIds },
      assignedTo: req.user._id,
      status: { $in: ['assigned', 'picked-up', 'in-transit'] }
    });

    // Re-optimize with traffic-aware or fallback
    let result = await optimizeWithTraffic(deliveries, currentLocation);
    if (!result.success) {
      result = await optimizeDeliveryRoute(deliveries, currentLocation, { refreshRoute: true });
    }

    // Emit socket event (optional)
    const io = req.app.get('io');
    io.to(`delivery-${req.user._id}`).emit('route-refreshed', {
      message: 'Route has been refreshed',
      timestamp: new Date()
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('refreshRoute error:', error);
    return res.status(500).json({ success: false, error: error.message });
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

exports.generateTrackingCode = async (req, res) => {
  const { id } = req.params;               // delivery id
  const delivery = await Delivery.findById(id);
  if (!delivery) {
    return res.status(404).json({ success: false, error: 'Delivery not found' });
  }

  // Only assigned driver may call
  if (delivery.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  // Re-use active session if it exists
  let session = await TrackingSession.findOne({
    deliveryId: id,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });

  if (!session) {
    // Generate 6-char alphanumeric
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    session = await TrackingSession.create({
      trackingCode: code,
      deliveryId:   id,
      deliveryBoyId:req.user._id
    });
  }

  res.json({ success: true, data: { trackingCode: session.trackingCode } });
};

// POST /api/delivery/:id/tracking-email
exports.emailTrackingCode = async (req, res) => {
  try {
    const { id } = req.params;                        // delivery id
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery not found' });
    }
    // must be assigned driver
    if (delivery.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    // ensure session exists
    let session = await TrackingSession.findOne({
      deliveryId: id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    if (!session) {
      const code = crypto.randomBytes(3).toString('hex').toUpperCase();
      session = await TrackingSession.create({
        trackingCode:  code,
        deliveryId:    id,
        deliveryBoyId: req.user._id
      });
    }

    const trackUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/track?code=${session.trackingCode}`;

    // 1. email customer
    const customerHtml = `
      <h3>Your package is on the way!</h3>
      <p>Tracking code: <strong>${session.trackingCode}</strong></p>
      <p>You can monitor live progress here: <a href="${trackUrl}">${trackUrl}</a></p>
    `;
    await sendEmail({
      to: delivery.customerEmail,
      subject: 'Track your delivery',
      html: customerHtml
    });

    // 2. email admins (optional list)
    if (process.env.ADMIN_EMAILS) {
      const adminHtml = `
        <p>Tracking code <strong>${session.trackingCode}</strong> generated for delivery
        <strong>${delivery.customerName}</strong> (${delivery._id}).</p>
      `;
      await sendEmail({
        to: process.env.ADMIN_EMAILS,
        subject: `Tracking code for delivery ${delivery._id}`,
        html: adminHtml
      });
    }

    res.json({
      success: true,
      data: { trackingCode: session.trackingCode }
    });
  } catch (err) {
    console.error('emailTrackingCode error', err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
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



function getStatusMessage(status) {
  const messages = {
    'picked-up': 'Your package has been picked up',
    'in-transit': 'Your package is on the way',
    'delivered': 'Your package has been delivered',
    'failed': 'Delivery attempt failed'
  };
  return messages[status] || 'Status updated';
}
