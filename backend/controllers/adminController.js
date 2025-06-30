const Delivery = require('../models/Delivery');
const User = require('../models/User');
const { geocodeAddress } = require('../utils/geocoder');
const { validationResult } = require('express-validator');

// @desc    Create new delivery
// @route   POST /api/admin/deliveries
// @access  Private/Admin
exports.createDelivery = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      packageInfo,
      priority,
      scheduledDate,
      deliveryWindow,
      deliveryInstructions
    } = req.body;

    // Create full address string for geocoding
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    
    // Geocode the address
    const geocodeResult = await geocodeAddress(fullAddress);
    
    if (!geocodeResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address. Please check and try again.'
      });
    }

    // Create delivery
    const delivery = await Delivery.create({
      customerName,
      customerPhone,
      customerEmail,
      address: {
        ...address,
        fullAddress: geocodeResult.formattedAddress
      },
      coordinates: geocodeResult.coordinates,
      packageInfo,
      priority: priority || 'medium',
      scheduledDate,
      deliveryWindow,
      deliveryInstructions,
      createdBy: req.user._id
    });

    // Emit new delivery event
    const io = req.app.get('io');
    io.emit('new-delivery', {
      delivery: delivery,
      message: 'New delivery added'
    });

    res.status(201).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all deliveries
// @route   GET /api/admin/deliveries
// @access  Private/Admin
exports.getDeliveries = async (req, res) => {
  try {
    // Build query
    const query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by date if provided
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      const endDate = new Date(req.query.date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.scheduledDate = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    // Filter by assigned delivery boy
    if (req.query.deliveryBoy) {
      query.assignedTo = req.query.deliveryBoy;
    }

    const deliveries = await Delivery.find(query)
      .populate('assignedTo', 'name email phone')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single delivery
// @route   GET /api/admin/deliveries/:id
// @access  Private/Admin
exports.getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('assignedTo', 'name email phone currentLocation')
      .populate('createdBy', 'name');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update delivery
// @route   PUT /api/admin/deliveries/:id
// @access  Private/Admin
exports.updateDelivery = async (req, res) => {
  try {
    let delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    // If address is being updated, re-geocode
    if (req.body.address) {
      const fullAddress = `${req.body.address.street}, ${req.body.address.city}, ${req.body.address.state} ${req.body.address.zipCode}`;
      const geocodeResult = await geocodeAddress(fullAddress);
      
      if (geocodeResult.success) {
        req.body.coordinates = geocodeResult.coordinates;
        req.body.address.fullAddress = geocodeResult.formattedAddress;
      }
    }

    delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('assignedTo', 'name email phone');

    // Emit update event
    const io = req.app.get('io');
    io.emit('delivery-updated', {
      deliveryId: delivery._id,
      delivery: delivery
    });

    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete delivery
// @route   DELETE /api/admin/deliveries/:id
// @access  Private/Admin
exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    // Only allow deletion of pending deliveries
    if (delivery.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete delivery that is already in progress'
      });
    }

    await delivery.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Assign delivery to delivery boy
// @route   PUT /api/admin/deliveries/:id/assign
// @access  Private/Admin
exports.assignDelivery = async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;

    // Check if delivery boy exists and has correct role
    const deliveryBoy = await User.findById(deliveryBoyId);
    if (!deliveryBoy || deliveryBoy.role !== 'delivery') {
      return res.status(400).json({
        success: false,
        error: 'Invalid delivery boy'
      });
    }

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: deliveryBoyId,
        status: 'assigned'
      },
      {
        new: true
      }
    ).populate('assignedTo', 'name email phone');

    // Notify delivery boy via socket
    const io = req.app.get('io');
    io.to(`delivery-${deliveryBoyId}`).emit('new-assignment', {
      delivery: delivery,
      message: 'You have a new delivery assignment'
    });

    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all delivery boys
// @route   GET /api/admin/delivery-boys
// @access  Private/Admin
exports.getDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await User.find({ role: 'delivery', isActive: true })
      .select('name email phone currentLocation createdAt');

    // Get delivery count for each delivery boy
    const deliveryBoysWithStats = await Promise.all(
      deliveryBoys.map(async (boy) => {
        const activeDeliveries = await Delivery.countDocuments({
          assignedTo: boy._id,
          status: { $in: ['assigned', 'picked-up', 'in-transit'] }
        });
        
        const completedToday = await Delivery.countDocuments({
          assignedTo: boy._id,
          status: 'delivered',
          actualDeliveryTime: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999)
          }
        });

        return {
          ...boy.toObject(),
          activeDeliveries,
          completedToday
        };
      })
    );

    res.status(200).json({
      success: true,
      count: deliveryBoysWithStats.length,
      data: deliveryBoysWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get various statistics
    const [
      totalDeliveries,
      pendingDeliveries,
      inTransitDeliveries,
      completedToday,
      failedToday,
      activeDeliveryBoys
    ] = await Promise.all([
      Delivery.countDocuments(),
      Delivery.countDocuments({ status: 'pending' }),
      Delivery.countDocuments({ status: { $in: ['assigned', 'picked-up', 'in-transit'] } }),
      Delivery.countDocuments({
        status: 'delivered',
        actualDeliveryTime: { $gte: today, $lt: tomorrow }
      }),
      Delivery.countDocuments({
        status: 'failed',
        updatedAt: { $gte: today, $lt: tomorrow }
      }),
      User.countDocuments({ role: 'delivery', isActive: true })
    ]);

    // Get revenue stats (if package value is tracked)
    const revenueToday = await Delivery.aggregate([
      {
        $match: {
          status: 'delivered',
          actualDeliveryTime: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$packageInfo.value' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDeliveries,
        pendingDeliveries,
        inTransitDeliveries,
        completedToday,
        failedToday,
        activeDeliveryBoys,
        revenueToday: revenueToday[0]?.total || 0,
        successRate: totalDeliveries > 0 
          ? ((totalDeliveries - failedToday) / totalDeliveries * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Bulk assign deliveries
// @route   POST /api/admin/deliveries/bulk-assign
// @access  Private/Admin
exports.bulkAssignDeliveries = async (req, res) => {
  try {
    const { deliveryIds, deliveryBoyId } = req.body;

    // Validate delivery boy
    const deliveryBoy = await User.findById(deliveryBoyId);
    if (!deliveryBoy || deliveryBoy.role !== 'delivery') {
      return res.status(400).json({
        success: false,
        error: 'Invalid delivery boy'
      });
    }

    // Update all deliveries
    const result = await Delivery.updateMany(
      {
        _id: { $in: deliveryIds },
        status: 'pending'
      },
      {
        assignedTo: deliveryBoyId,
        status: 'assigned'
      }
    );

    // Get updated deliveries
    const updatedDeliveries = await Delivery.find({
      _id: { $in: deliveryIds }
    }).populate('assignedTo', 'name email phone');

    // Notify delivery boy
    const io = req.app.get('io');
    io.to(`delivery-${deliveryBoyId}`).emit('bulk-assignment', {
      count: result.modifiedCount,
      message: `You have been assigned ${result.modifiedCount} new deliveries`
    });

    res.status(200).json({
      success: true,
      data: {
        assigned: result.modifiedCount,
        deliveries: updatedDeliveries
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
