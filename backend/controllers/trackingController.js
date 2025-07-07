const TrackingSession = require('../models/TrackingSession');
const Delivery        = require('../models/Delivery');
const User            = require('../models/User');
const { googleMapsClient, GOOGLE_MAPS_API_KEY } = require('../config/googleMaps');

// GET  /api/tracking/:code
exports.getTrackingData = async (req, res) => {
  const code = (req.params.code || '').toUpperCase();

 let session = await TrackingSession.findOne({
    trackingCode: code,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
  if (!session) {
    const delivery = await Delivery.findOne({ trackingCode: code });
    if (!delivery) {
      return res
        .status(404)
        .json({ success: false, error: 'Invalid or expired code' });
    }
    // fabricate a lightweight session object so the rest of the flow works
    session = {
      deliveryId:    delivery._id,
      deliveryBoyId: delivery.assignedTo,
      trackingCode:  code
    };
   }

  const delivery = await Delivery.findById(session.deliveryId);
  const driver   = await User.findById(session.deliveryBoyId).select('name phone currentLocation');

  res.json({
    success: true,
    data: {
      delivery,
      deliveryBoy: driver,
      trackingCode: code
    }
  });
};

// GET /api/tracking/:code/eta
exports.getETA = async (req, res) => {
  const code = (req.params.code || '').toUpperCase();

   let session = await TrackingSession.findOne({
    trackingCode: code,
    isActive: true,
    expiresAt: { $gt: new Date() }
  });
  if (!session) {
      const delivery = await Delivery.findOne({ trackingCode: code });
    if (!delivery) {
      return res
        .status(404)
        .json({ success: false, error: 'Code expired or invalid' });
    }
    session = {
      deliveryId:    delivery._id,
      deliveryBoyId: delivery.assignedTo
    };
   }

  const delivery   = await Delivery.findById(session.deliveryId);
  const driver     = await User.findById(session.deliveryBoyId);

  if (!driver.currentLocation?.lat) {
    return res.status(400).json({ success: false, error: 'Driver location unavailable' });
  }

  const origin      = `${driver.currentLocation.lat},${driver.currentLocation.lng}`;
  const destination = `${delivery.coordinates.lat},${delivery.coordinates.lng}`;

  const gRes = await googleMapsClient.directions({
    params: {
      origin,
      destination,
      mode: 'driving',
      departureTime: 'now',
      key: GOOGLE_MAPS_API_KEY
    }
  });

  if (gRes.data.status !== 'OK') {
    return res.status(400).json({ success: false, error: 'Directions API error' });
  }

  const leg = gRes.data.routes[0].legs[0];
  res.json({
    success: true,
    data: {
      isRealtime: true,
      distanceRemaining: leg.distance,
      durationRemaining: leg.duration,
      estimatedArrival:  new Date(Date.now() + leg.duration.value * 1000)
    }
  });
};
