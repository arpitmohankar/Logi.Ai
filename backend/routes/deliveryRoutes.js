const express = require('express');
const router = express.Router();
const {
  getMyDeliveries,
  getOptimizedRoute,
  refreshRoute,
  updateDeliveryStatus,
  generateTrackingCode,
  getDirections,
  uploadDeliveryProof,
  getDeliveryStats
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and delivery role
router.use(protect);
router.use(authorize('delivery'));

// Delivery management
router.get('/my-deliveries', getMyDeliveries);
router.get('/stats', getDeliveryStats);

// Route optimization - Core features
router.post('/optimize-route', getOptimizedRoute);
router.post('/refresh-route', refreshRoute); // UNIQUE FEATURE
router.post('/directions', getDirections);

// Delivery operations
router.put('/:id/status', updateDeliveryStatus);
router.post('/:id/generate-tracking', generateTrackingCode);
router.post('/:id/proof', uploadDeliveryProof);

module.exports = router;
