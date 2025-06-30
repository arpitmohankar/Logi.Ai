const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Create necessary indexes
async function createIndexes() {
  try {
    const Delivery = require('../models/Delivery');
    const TrackingSession = require('../models/TrackingSession');
    const User = require('../models/User');

    // Delivery indexes
    await Delivery.collection.createIndex({ assignedTo: 1, status: 1 });
    await Delivery.collection.createIndex({ trackingCode: 1 });
    await Delivery.collection.createIndex({ scheduledDate: 1 });

    // TrackingSession indexes
    await TrackingSession.collection.createIndex({ trackingCode: 1 });
    await TrackingSession.collection.createIndex({ expiresAt: 1 });

    // User indexes
    await User.collection.createIndex({ email: 1 });
    await User.collection.createIndex({ role: 1 });

    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('Index creation error:', error);
  }
}

module.exports = connectDB;
