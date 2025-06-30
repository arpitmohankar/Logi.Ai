const express = require('express');
const router = express.Router();
const {
  trackDelivery,
  getRealtimeLocation,
  getLocationHistory,
  getEstimatedArrival,
  submitFeedback
} = require('../controllers/customerController');

// All routes are public - no authentication required
router.post('/track', trackDelivery);
router.get('/:trackingCode/location', getRealtimeLocation);
router.get('/:trackingCode/history', getLocationHistory);
router.get('/:trackingCode/eta', getEstimatedArrival);
router.post('/:trackingCode/feedback', submitFeedback);

module.exports = router;
