const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getDeliveries,
  getDelivery,
  updateDelivery,
  deleteDelivery,
  assignDelivery,
  getDeliveryBoys,
  getDashboardStats,
  bulkAssignDeliveries
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validateDelivery } = require('../middleware/validation');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Delivery boys management
router.get('/delivery-boys', getDeliveryBoys);

// Delivery routes
router.route('/deliveries')
  .get(getDeliveries)
  .post(validateDelivery, createDelivery);

router.route('/deliveries/:id')
  .get(getDelivery)
  .put(updateDelivery)
  .delete(deleteDelivery);

// Delivery assignment
router.put('/deliveries/:id/assign', assignDelivery);
router.post('/deliveries/bulk-assign', bulkAssignDeliveries);

module.exports = router;
