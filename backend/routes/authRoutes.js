const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateLocation
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/location', protect, authorize('delivery'), updateLocation);

module.exports = router;
