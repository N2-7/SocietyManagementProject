const Visitor = require('../models/Visitor');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');

/**
 * @desc    Get guard dashboard data
 * @route   GET /api/guard/dashboard
 * @access  Private/Guard
 */
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's visitors
    const visitorsToday = await Visitor.find({
      entryTime: { $gte: today, $lt: tomorrow },
    })
      .populate('residentId', 'name flatNo')
      .sort({ entryTime: -1 });

    // Active visitors (not exited)
    const activeVisitors = await Visitor.find({
      status: { $in: ['approved', 'pending'] },
    })
      .populate('residentId', 'name flatNo')
      .sort({ entryTime: -1 });

    // Today's security logs
    const todayLogs = await SecurityLog.find({
      time: { $gte: today, $lt: tomorrow },
      guardId: req.user.id,
    })
      .sort({ time: -1 })
      .limit(10);

    // Pre-registered visitors (with QR codes)
    const preRegistered = await Visitor.find({
      preRegistered: true,
      status: 'pending',
    })
      .populate('residentId', 'name flatNo')
      .sort({ entryTime: -1 });

    res.status(200).json({
      success: true,
      data: {
        visitorsToday,
        activeVisitors,
        todayLogs,
        preRegistered,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Register visitor entry
 * @route   POST /api/guard/visitor-entry
 * @access  Private/Guard
 */
exports.visitorEntry = async (req, res) => {
  try {
    const { visitorName, phone, vehicleNumber, purpose, flatNo } = req.body;

    // Verify resident exists
    const resident = await User.findOne({ flatNo, role: 'resident', status: 'active' });
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found or not active' });
    }

    // Create new walk-in visitor
    const visitor = await Visitor.create({
      visitorName,
      phone,
      vehicleNumber: vehicleNumber || '',
      purpose,
      flatNo,
      residentId: resident._id,
      guardId: req.user.id,
      status: 'approved',
      entryTime: new Date(),
      preRegistered: false,
    });

    // Create security log
    await SecurityLog.create({
      guardId: req.user.id,
      visitorId: visitor._id,
      activity: 'visitor-entry',
      description: `Visitor ${visitorName} entered for flat ${flatNo}`,
      time: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Visitor entry recorded successfully',
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Register visitor exit
 * @route   PUT /api/guard/visitor-exit/:id
 * @access  Private/Guard
 */
exports.visitorExit = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    visitor.exitTime = new Date();
    visitor.status = 'exited';
    await visitor.save();

    // Create security log
    await SecurityLog.create({
      guardId: req.user.id,
      visitorId: visitor._id,
      activity: 'visitor-exit',
      description: `Visitor ${visitor.visitorName} exited from flat ${visitor.flatNo}`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Visitor exit recorded successfully',
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve visitor
 * @route   PUT /api/guard/visitors/:id/approve
 * @access  Private/Guard
 */
exports.approveVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    if (visitor.status !== 'pending') {
      return res.status(400).json({ message: 'Visitor has already been processed' });
    }

    visitor.status = 'approved';
    visitor.guardId = req.user.id;
    visitor.entryTime = new Date();
    await visitor.save();

    // Create security log
    await SecurityLog.create({
      guardId: req.user.id,
      visitorId: visitor._id,
      activity: 'visitor-entry',
      description: `Visitor ${visitor.visitorName} approved and entered for flat ${visitor.flatNo}`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Visitor approved successfully',
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Decline visitor
 * @route   PUT /api/guard/visitors/:id/decline
 * @access  Private/Guard
 */
exports.declineVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    if (visitor.status !== 'pending') {
      return res.status(400).json({ message: 'Visitor has already been processed' });
    }

    visitor.status = 'rejected';
    visitor.guardId = req.user.id;
    await visitor.save();

    // Create security log
    await SecurityLog.create({
      guardId: req.user.id,
      visitorId: visitor._id,
      activity: 'visitor-rejected',
      description: `Visitor ${visitor.visitorName} declined for flat ${visitor.flatNo}`,
      time: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Visitor declined successfully',
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Search flat
 * @route   GET /api/guard/search-flat/:flatNo
 * @access  Private/Guard
 */
exports.searchFlat = async (req, res) => {
  try {
    const { flatNo } = req.params;

    const resident = await User.findOne({ flatNo, role: 'resident', status: 'active' })
      .select('name flatNo phone');

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    res.status(200).json({
      success: true,
      data: resident,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify resident
 * @route   GET /api/guard/verify-resident/:flatNo
 * @access  Private/Guard
 */
exports.verifyResident = async (req, res) => {
  try {
    const { flatNo } = req.params;

    const resident = await User.findOne({ flatNo, role: 'resident', status: 'active' })
      .select('name flatNo phone profileImage');

    if (!resident) {
      return res.status(404).json({ message: 'Resident not found or not active' });
    }

    res.status(200).json({
      success: true,
      message: 'Resident verified successfully',
      data: resident,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get visitor history
 * @route   GET /api/guard/visitor-history
 * @access  Private/Guard
 */
exports.getVisitorHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const date = req.query.date || '';
    const status = req.query.status || '';

    const query = {};
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.entryTime = { $gte: startDate, $lt: endDate };
    }

    if (status) {
      query.status = status;
    }

    const visitors = await Visitor.find(query)
      .populate('residentId', 'name flatNo')
      .populate('guardId', 'name')
      .sort({ entryTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Visitor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: visitors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create delivery entry
 * @route   POST /api/guard/delivery
 * @access  Private/Guard
 */
exports.deliveryEntry = async (req, res) => {
  try {
    const { deliveryPerson, phone, flatNo, deliveryType } = req.body;

    // Verify resident exists
    const resident = await User.findOne({ flatNo, role: 'resident', status: 'active' });
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found or not active' });
    }

    // Create visitor entry for delivery
    const visitor = await Visitor.create({
      visitorName: deliveryPerson,
      phone,
      purpose: 'delivery',
      flatNo,
      residentId: resident._id,
      guardId: req.user.id,
      status: 'approved',
      entryTime: new Date(),
      preRegistered: false,
    });

    // Create security log
    await SecurityLog.create({
      guardId: req.user.id,
      visitorId: visitor._id,
      activity: 'delivery',
      description: `${deliveryType} delivery by ${deliveryPerson} for flat ${flatNo}`,
      time: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Delivery entry recorded successfully',
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create cab entry
 * @route   POST /api/guard/cab
 * @access  Private/Guard
 */
exports.cabEntry = async (req, res) => {
  try {
    const { driverName, phone, vehicleNumber, flatNo } = req.body;

    // Verify resident exists
    const resident = await User.findOne({ flatNo, role: 'resident', status: 'active' });
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found or not active' });
    }

    // Create visitor entry for cab
    const visitor = await Visitor.create({
      visitorName: driverName,
      phone,
      vehicleNumber,
      purpose: 'cab',
      flatNo,
      residentId: resident._id,
      guardId: req.user.id,
      status: 'approved',
      entryTime: new Date(),
      preRegistered: false,
    });

    // Create security log
    await SecurityLog.create({
      guardId: req.user.id,
      visitorId: visitor._id,
      activity: 'cab',
      description: `Cab ${vehicleNumber} by ${driverName} for flat ${flatNo}`,
      time: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Cab entry recorded successfully',
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create emergency alert
 * @route   POST /api/guard/emergency
 * @access  Private/Guard
 */
exports.emergencyAlert = async (req, res) => {
  try {
    const { type, description, location } = req.body;

    // Create security log for emergency
    await SecurityLog.create({
      guardId: req.user.id,
      activity: 'emergency',
      description: `Emergency: ${type} - ${description}`,
      location: location || 'Society premises',
      time: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Emergency alert recorded successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get security logs
 * @route   GET /api/guard/security-logs
 * @access  Private/Guard
 */
exports.getSecurityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const activity = req.query.activity || '';

    const query = { guardId: req.user.id };
    
    if (activity) {
      query.activity = activity;
    }

    const logs = await SecurityLog.find(query)
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SecurityLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create patrol log
 * @route   POST /api/guard/patrol
 * @access  Private/Guard
 */
exports.createPatrolLog = async (req, res) => {
  try {
    const { location, description } = req.body;

    await SecurityLog.create({
      guardId: req.user.id,
      activity: 'patrol',
      description: description || 'Routine patrol',
      location,
      time: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Patrol log recorded successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Security guard check-in
 * @route   POST /api/guard/security-checkin
 * @access  Private/Guard
 */
exports.securityCheckIn = async (req, res) => {
  try {
    const { shift, notes } = req.body;

    // Get guard details
    const guard = await User.findById(req.user.id);
    if (!guard) {
      return res.status(404).json({ message: 'Guard not found' });
    }

    // Create security check-in log
    const securityLog = await SecurityLog.create({
      guardId: req.user.id,
      guardName: guard.name,
      activity: 'security-checkin',
      description: `Security guard ${guard.name} checked in for ${shift} shift`,
      location: 'Main Gate',
      time: new Date(),
      shift,
      checkInTime: new Date(),
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Security check-in recorded successfully',
      data: securityLog,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Security guard check-out
 * @route   POST /api/guard/security-checkout
 * @access  Private/Guard
 */
exports.securityCheckOut = async (req, res) => {
  try {
    const { notes } = req.body;

    // Get guard details
    const guard = await User.findById(req.user.id);
    if (!guard) {
      return res.status(404).json({ message: 'Guard not found' });
    }

    // Find the most recent check-in without checkout
    const lastCheckIn = await SecurityLog.findOne({
      guardId: req.user.id,
      activity: 'security-checkin',
      checkOutTime: { $exists: false },
    }).sort({ checkInTime: -1 });

    if (!lastCheckIn) {
      return res.status(400).json({ message: 'No active check-in found' });
    }

    // Update the check-in with checkout time
    lastCheckIn.checkOutTime = new Date();
    lastCheckIn.notes = lastCheckIn.notes + (notes ? `\nCheckout notes: ${notes}` : '');
    await lastCheckIn.save();

    // Create security check-out log
    const securityLog = await SecurityLog.create({
      guardId: req.user.id,
      guardName: guard.name,
      activity: 'security-checkout',
      description: `Security guard ${guard.name} checked out from ${lastCheckIn.shift} shift`,
      location: 'Main Gate',
      time: new Date(),
      shift: lastCheckIn.shift,
      checkInTime: lastCheckIn.checkInTime,
      checkOutTime: new Date(),
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Security check-out recorded successfully',
      data: securityLog,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
