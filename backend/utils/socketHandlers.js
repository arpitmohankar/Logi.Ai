const TrackingSession = require('../models/TrackingSession');
const User = require('../models/User');

module.exports = (io) => {
  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // Delivery boy joins their room
    socket.on('delivery-boy-join', async (userId) => {
      socket.join(`delivery-${userId}`);
      console.log(`Delivery boy ${userId} joined their room`);
    });

    // Customer joins tracking room
    socket.on('join-tracking', async (trackingCode) => {
      try {
        // Verify tracking code
        const session = await TrackingSession.findOne({
          trackingCode: trackingCode.toUpperCase(),
          isActive: true,
          expiresAt: { $gt: new Date() }
        });

        if (session) {
          socket.join(`tracking-${trackingCode}`);
          console.log(`Customer joined tracking room: ${trackingCode}`);
          
          // Send initial confirmation
          socket.emit('tracking-joined', {
            success: true,
            message: 'Successfully joined tracking session'
          });
        } else {
          socket.emit('tracking-error', {
            error: 'Invalid or expired tracking code'
          });
        }
      } catch (error) {
        socket.emit('tracking-error', {
          error: 'Failed to join tracking session'
        });
      }
    });

    // Delivery boy updates location
    socket.on('update-location', async (data) => {
      try {
        const { userId, location, trackingCodes } = data;

        // Update user's current location in database
        await User.findByIdAndUpdate(userId, {
          currentLocation: {
            lat: location.lat,
            lng: location.lng,
            lastUpdated: new Date()
          }
        });

        // Update location history for active tracking sessions
        if (trackingCodes && trackingCodes.length > 0) {
          await TrackingSession.updateMany(
            {
              trackingCode: { $in: trackingCodes },
              isActive: true
            },
            {
              $push: {
                locationHistory: {
                  lat: location.lat,
                  lng: location.lng,
                  timestamp: new Date()
                }
              }
            }
          );

          // Broadcast to all tracking rooms
          trackingCodes.forEach(code => {
            io.to(`tracking-${code}`).emit('location-update', {
              location,
              timestamp: new Date()
            });
          });
        }

        // Acknowledge update
        socket.emit('location-updated', {
          success: true,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('update-error', {
          error: 'Failed to update location'
        });
      }
    });

    // Handle delivery status updates
    socket.on('delivery-status-update', async (data) => {
      const { deliveryId, status, trackingCode } = data;

      // Broadcast to tracking room
      if (trackingCode) {
        io.to(`tracking-${trackingCode}`).emit('status-changed', {
          deliveryId,
          status,
          message: getStatusMessage(status),
          timestamp: new Date()
        });
      }

      // Broadcast to admin dashboard
      io.emit(`delivery-status-${deliveryId}`, {
        status,
        timestamp: new Date()
      });
    });

    // Handle route refresh notifications
    socket.on('route-refreshed', (data) => {
      const { userId, message } = data;
      
      // Notify delivery boy
      io.to(`delivery-${userId}`).emit('route-updated', {
        message: message || 'Route has been optimized',
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  // Helper function for status messages
  function getStatusMessage(status) {
    const messages = {
      'assigned': 'Order assigned to delivery partner',
      'picked-up': 'Order picked up from warehouse',
      'in-transit': 'Order is on the way',
      'delivered': 'Order delivered successfully',
      'failed': 'Delivery attempt failed'
    };
    return messages[status] || 'Status updated';
  }
};
