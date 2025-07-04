const mongoose = require('mongoose');

const trackingSessionSchema = new mongoose.Schema({
  trackingCode: {
    type: String,
    required: true,
    unique: true
  },
  
  deliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    required: true
  },
  
  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  sharedAt: {
    type: Date,
    default: Date.now
  },
  
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  },
  
  locationHistory: [{
    lat: Number,
    lng: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

// Index for faster queries
trackingSessionSchema.index({ trackingCode: 1 });
trackingSessionSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('TrackingSession', trackingSessionSchema);
