const TrackingSession = require('../models/TrackingSession');
const Delivery = require('../models/Delivery');
const User = require('../models/User');

// @desc    Track delivery using tracking code
// @route   POST /api/tracking/track
// @access  Public
exports.trackDelivery = async (req, res) => {
  try {
    const { trackingCode } = req.body;

    if (!trackingCode || trackingCode.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 6-character tracking code'
      });
    }

    // Find active tracking session
    const trackingSession = await TrackingSession.findOne({
      trackingCode: trackingCode.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate({
      path: 'deliveryId',
      select: 'customerName address packageInfo status estimatedDeliveryTime'
    }).populate({
      path: 'deliveryBoyId',
      select: 'name phone currentLocation'
    });

    if (!trackingSession) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired tracking code'
      });
    }

    // Get delivery details
    const delivery = trackingSession.deliveryId;
    const deliveryBoy = trackingSession.deliveryBoyId;

    // Prepare response
    const trackingInfo = {
      trackingCode,
      delivery: {
        id: delivery._id,
        customerName: delivery.customerName,
        address: delivery.address,
        packageInfo: {
          description: delivery.packageInfo.description,
          fragile: delivery.packageInfo.fragile
        },
        status: delivery.status,
        estimatedDeliveryTime: delivery.estimatedDeliveryTime
      },
      deliveryBoy: {
        name: deliveryBoy.name,
        phone: deliveryBoy.phone,
        currentLocation: deliveryBoy.currentLocation
      },
      sessionInfo: {
        expiresAt: trackingSession.expiresAt,
        lastLocationUpdate: deliveryBoy.currentLocation?.lastUpdated
      }
    };

    res.status(200).json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get real-time location updates
// @route   GET /api/tracking/:trackingCode/location
// @access  Public
exports.getRealtimeLocation = async (req, res) => {
  try {
    const { trackingCode } = req.params;

    // Verify tracking session
    const trackingSession = await TrackingSession.findOne({
      trackingCode: trackingCode.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('deliveryBoyId', 'currentLocation');

    if (!trackingSession) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired tracking code'
      });
    }

    const location = trackingSession.deliveryBoyId.currentLocation;

    res.status(200).json({
      success: true,
      data: {
        location,
        lastUpdated: location?.lastUpdated || null,
        isLive: location && (Date.now() - new Date(location.lastUpdated) < 60000) // Live if updated within last minute
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get location history for tracking session
// @route   GET /api/tracking/:trackingCode/history
// @access  Public
exports.getLocationHistory = async (req, res) => {
  try {
    const { trackingCode } = req.params;

    const trackingSession = await TrackingSession.findOne({
      trackingCode: trackingCode.toUpperCase()
    }).select('locationHistory');

    if (!trackingSession) {
      return res.status(404).json({
        success: false,
        error: 'Tracking code not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        history: trackingSession.locationHistory,
        count: trackingSession.locationHistory.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get estimated arrival time
// @route   GET /api/tracking/:trackingCode/eta
// @access  Public
exports.getEstimatedArrival = async (req, res) => {
  try {
    const { trackingCode } = req.params;

    const trackingSession = await TrackingSession.findOne({
      trackingCode: trackingCode.toUpperCase(),
      isActive: true
    }).populate({
      path: 'deliveryId',
      select: 'coordinates estimatedDeliveryTime status routeIndex'
    }).populate({
      path: 'deliveryBoyId',
      select: 'currentLocation'
    });

    if (!trackingSession) {
      return res.status(404).json({
        success: false,
        error: 'Invalid tracking code'
      });
    }

    const delivery = trackingSession.deliveryId;
    const deliveryBoyLocation = trackingSession.deliveryBoyId.currentLocation;

    if (!deliveryBoyLocation) {
      return res.status(200).json({
        success: true,
        data: {
          estimatedArrival: delivery.estimatedDeliveryTime,
          status: delivery.status,
          isEstimated: true
        }
      });
    }

    // Calculate real-time ETA based on current location
    const { calculateDistance } = require('../utils/geocoder');
    const distanceResult = await calculateDistance(
      deliveryBoyLocation,
      delivery.coordinates
    );

    if (distanceResult.success) {
      const etaInSeconds = distanceResult.duration.value;
      const estimatedArrival = new Date(Date.now() + etaInSeconds * 1000);

      res.status(200).json({
        success: true,
        data: {
          estimatedArrival,
          distanceRemaining: distanceResult.distance,
          durationRemaining: distanceResult.duration,
          status: delivery.status,
          isRealtime: true
        }
      });
    } else {
      res.status(200).json({
        success: true,
        data: {
          estimatedArrival: delivery.estimatedDeliveryTime,
          status: delivery.status,
          isEstimated: true
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Submit delivery feedback
// @route   POST /api/tracking/:trackingCode/feedback
// @access  Public
exports.submitFeedback = async (req, res) => {
  try {
    const { trackingCode } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a rating between 1 and 5'
      });
    }

    const trackingSession = await TrackingSession.findOne({
      trackingCode: trackingCode.toUpperCase()
    }).populate('deliveryId');

    if (!trackingSession) {
      return res.status(404).json({
        success: false,
        error: 'Invalid tracking code'
      });
    }

    const delivery = trackingSession.deliveryId;

    if (delivery.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Feedback can only be submitted for delivered packages'
      });
    }

    // Store feedback (you might want to create a separate Feedback model)
    delivery.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };
    await delivery.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
