const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const rateLimit = require('express-rate-limit');
// Add this with other imports
const adminRoutes = require('./routes/adminRoutes');

const utilsRoutes = require('./routes/utilsRoutes');

const deliveryRoutes = require('./routes/deliveryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const socketHandlers = require('./utils/socketHandlers');

// Load environment variables
dotenv.config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});
app.set('io', io);
// // Rate limiting
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 30 * 60 * 1000,
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
//   message: 'Too many requests from this IP, please try again later.'
// });

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://10.209.18.67:3000',// Update with your client URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Walmart Delivery API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      delivery: '/api/delivery',
      tracking: '/api/tracking'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);



// Add this with other routes
app.use('/api/admin', adminRoutes);
// Add with other routes
app.use('/api/utils', utilsRoutes);


app.use('/api/delivery', deliveryRoutes);
app.use('/api/tracking', customerRoutes);

// Error Handler Middleware (must be after routes)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  // Create default admin user if not exists
  createDefaultAdmin();
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// // Socket.io connection handling
// io.on('connection', (socket) => {
//   console.log('New client connected:', socket.id);
  
//   // Join room for tracking
//   socket.on('join-tracking', (trackingCode) => {
//     socket.join(`tracking-${trackingCode}`);
//     console.log(`Socket ${socket.id} joined tracking room: ${trackingCode}`);
//   });
  
//   // Join room for delivery boy location updates
//   socket.on('join-delivery-updates', (userId) => {
//     socket.join(`delivery-${userId}`);
//     console.log(`Socket ${socket.id} joined delivery room for user: ${userId}`);
//   });
  
//   // Handle location updates from delivery boy
//   socket.on('update-location', (data) => {
//     // Broadcast to all clients tracking this delivery boy
//     io.to(`tracking-${data.trackingCode}`).emit('location-update', {
//       lat: data.lat,
//       lng: data.lng,
//       timestamp: new Date()
//     });
//   });
  
//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

socketHandlers(io);

// Create default admin user
async function createDefaultAdmin() {
  try {
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@walmart.com';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        phone: '1234567890'
      });
      console.log('✅ Default admin user created');
      console.log('   Email:', adminEmail);
      console.log('   Password:', process.env.ADMIN_PASSWORD || 'Admin@123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});
