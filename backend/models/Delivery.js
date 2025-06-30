const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  // Customer Information
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required']
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Delivery Address
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    fullAddress: String // Complete formatted address for geocoding
  },
  
  coordinates: {
    lat: Number,
    lng: Number
  },
  
  // Package Information
  packageInfo: {
    description: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    value: Number,
    fragile: {
      type: Boolean,
      default: false
    }
  },
  
  // Delivery Management
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked-up', 'in-transit', 'delivered', 'failed'],
    default: 'pending'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Tracking
  trackingCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Time Management
  scheduledDate: {
    type: Date,
    required: true
  },
  
  deliveryWindow: {
    start: String, // e.g., "09:00"
    end: String    // e.g., "17:00"
  },
  
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  
  // Route Information
  routeIndex: Number, // Position in the optimized route
  distanceFromPrevious: Number, // in meters
  estimatedTimeFromPrevious: Number, // in seconds
  
  // Additional Info
  deliveryInstructions: String,
  
  deliveryProof: {
    signature: String,
    photo: String,
    notes: String
  },
  
  failureReason: String,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
deliverySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate tracking code before saving
deliverySchema.pre('save', async function(next) {
  if (!this.trackingCode && this.status !== 'pending') {
    this.trackingCode = await generateTrackingCode();
  }
  next();
});

// Helper function to generate unique tracking code
async function generateTrackingCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Check if code already exists
    const existing = await mongoose.model('Delivery').findOne({ trackingCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
}

module.exports = mongoose.model('Delivery', deliverySchema);
