const User = require('../models/User');
const Visitor = require('../models/Visitor');
const Complaint = require('../models/Complaint');
const Maintenance = require('../models/Maintenance');
const Payment = require('../models/Payment');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Parking = require('../models/Parking');
const Amenity = require('../models/Amenity');
const SecurityLog = require('../models/SecurityLog');
const PenaltyLog = require('../models/PenaltyLog');
const Expense = require('../models/Expense');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Statistics
    const totalResidents = await User.countDocuments({ role: 'resident', status: 'active' });
    const totalFlats = 100; // Assuming 100 flats total - can be made configurable
    const occupiedFlats = totalResidents;
    const vacantFlats = totalFlats - occupiedFlats;
    
    const visitorsToday = await Visitor.countDocuments({
      entryTime: { $gte: today, $lt: tomorrow },
    });
    
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    
    const paidMaintenance = await Maintenance.countDocuments({ paymentStatus: 'paid' });
    const pendingMaintenance = await Maintenance.countDocuments({ paymentStatus: 'pending' });

    // Calculate expense summary
    const paidMaintenanceRecords = await Maintenance.find({ paymentStatus: 'paid' });
    const totalCollected = paidMaintenanceRecords.reduce((sum, maintenance) => {
      return sum + (maintenance.totalAmount || maintenance.amount);
    }, 0);

    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const societyFund = totalCollected - totalExpenses;

    // Monthly maintenance collection for chart
    const monthlyCollection = await Maintenance.aggregate([
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    // Complaint statistics
    const complaintStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Visitor analytics
    const visitorAnalytics = await Visitor.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryTime' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]);

    // Recent activities
    const recentVisitors = await Visitor.find()
      .sort({ entryTime: -1 })
      .limit(5)
      .populate('residentId', 'name flatNo');
    
    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('residentId', 'name flatNo');

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalResidents,
          totalFlats,
          occupiedFlats,
          vacantFlats,
          visitorsToday,
          pendingComplaints,
          paidMaintenance,
          pendingMaintenance,
          totalCollected,
          totalExpenses,
          societyFund,
        },
        charts: {
          monthlyCollection,
          complaintStats,
          visitorAnalytics,
        },
        recentActivities: {
          visitors: recentVisitors,
          complaints: recentComplaints,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all residents with pagination
 * @route   GET /api/admin/residents
 * @access  Private/Admin
 */
exports.getResidents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const role = req.query.role || 'resident';
    const residentType = req.query.residentType || '';

    const query = { role };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { flatNo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (residentType) {
      query.residentType = residentType;
    }

    const residents = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: residents,
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
 * @desc    Get pending registration requests
 * @route   GET /api/admin/pending-requests
 * @access  Private/Admin
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending', role: 'resident' })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve resident registration
 * @route   PUT /api/admin/approve-resident/:id
 * @access  Private/Admin
 */
exports.approveResident = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resident approved successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Block/Unblock resident
 * @route   PUT /api/admin/block-resident/:id
 * @access  Private/Admin
 */
exports.blockResident = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = user.status === 'blocked' ? 'active' : 'blocked';
    await user.save();

    res.status(200).json({
      success: true,
      message: `Resident ${user.status === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete resident
 * @route   DELETE /api/admin/residents/:id
 * @access  Private/Admin
 */
exports.deleteResident = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resident deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create resident (admin only)
 * @route   POST /api/admin/residents
 * @access  Private/Admin
 */
exports.createResident = async (req, res) => {
  try {
    const { name, email, flatNo, password, phone, residentType } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { flatNo }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or flat number' });
    }

    const user = await User.create({
      name,
      email,
      flatNo,
      password,
      phone,
      role: 'resident',
      residentType: residentType || 'owner',
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Resident created successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update resident
 * @route   PUT /api/admin/residents/:id
 * @access  Private/Admin
 */
exports.updateResident = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, flatNo, phone, status } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (flatNo) user.flatNo = flatNo;
    if (phone) user.phone = phone;
    if (status) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resident updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all visitors
 * @route   GET /api/admin/visitors
 * @access  Private/Admin
 */
exports.getVisitors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const date = req.query.date || '';

    const query = {};
    
    if (search) {
      query.$or = [
        { visitorName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { flatNo: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.entryTime = { $gte: startDate, $lt: endDate };
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
 * @desc    Get all complaints
 * @route   GET /api/admin/complaints
 * @access  Private/Admin
 */
exports.getComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const priority = req.query.priority || '';
    const category = req.query.category || '';

    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    const complaints = await Complaint.find(query)
      .populate('residentId', 'name flatNo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments(query);

    res.status(200).json({
      success: true,
      data: complaints,
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
 * @desc    Update complaint status
 * @route   PUT /api/admin/complaints/:id
 * @access  Private/Admin
 */
exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const { status, priority, adminRemark } = req.body;

    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;
    if (adminRemark !== undefined) complaint.adminRemark = adminRemark;

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Add comment to complaint
 * @route   POST /api/admin/complaints/:id/comments
 * @access  Private/Admin
 */
exports.addComplaintComment = async (req, res) => {
  try {
    const { comment } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.comments.push({
      userId: req.user.id,
      comment,
      createdAt: new Date(),
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete complaint
 * @route   DELETE /api/admin/complaints/:id
 * @access  Private/Admin
 */
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get security logs
 * @route   GET /api/admin/security-logs
 * @access  Private/Admin
 */
exports.getSecurityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const activity = req.query.activity || '';

    const query = {};
    
    if (activity) {
      query.activity = activity;
    }

    const logs = await SecurityLog.find(query)
      .populate('guardId', 'name')
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
 * @desc    Delete security log
 * @route   DELETE /api/admin/security-logs/:id
 * @access  Private/Admin
 */
exports.deleteSecurityLog = async (req, res) => {
  try {
    const log = await SecurityLog.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({ message: 'Security log not found' });
    }

    // If the log is related to a visitor, also delete the visitor entry
    if (log.visitorId && (log.activity === 'visitor-entry' || log.activity === 'visitor-exit' || log.activity === 'visitor-rejected')) {
      await Visitor.findByIdAndDelete(log.visitorId);
    }

    await SecurityLog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Security log deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete visitor
 * @route   DELETE /api/admin/visitors/:id
 * @access  Private/Admin
 */
exports.deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    // Delete all related security logs for this visitor
    await SecurityLog.deleteMany({ visitorId: req.params.id });

    // Delete the visitor
    await Visitor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Visitor and related security logs deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all maintenance records
 * @route   GET /api/admin/maintenance
 * @access  Private/Admin
 */
exports.getMaintenance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const month = req.query.month || '';
    const year = req.query.year || '';

    const query = {};
    
    if (search) {
      query.flatNo = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.paymentStatus = status;
    }

    if (month) {
      query.month = month;
    }

    if (year) {
      query.year = parseInt(year);
    }

    const maintenance = await Maintenance.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Maintenance.countDocuments(query);

    res.status(200).json({
      success: true,
      data: maintenance,
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
 * @desc    Generate maintenance bills for all residents
 * @route   POST /api/admin/maintenance/generate
 * @access  Private/Admin
 */
exports.generateMaintenanceBills = async (req, res) => {
  try {
    const { month, year, ownerAmount, tenantAmount, dueDate } = req.body;

    // Validation
    if (!month || !year || !ownerAmount || !tenantAmount || !dueDate) {
      return res.status(400).json({ message: 'Please provide month, year, owner amount, tenant amount, and due date' });
    }

    // Get all active residents
    const residents = await User.find({ role: 'resident', status: 'active' });

    if (residents.length === 0) {
      return res.status(404).json({ message: 'No active residents found' });
    }

    const billsCreated = [];
    const billsSkipped = [];

    for (const resident of residents) {
      // Check if bill already exists for this flat, month, and year
      const existingBill = await Maintenance.findOne({
        flatNo: resident.flatNo,
        month,
        year: parseInt(year),
      });

      if (existingBill) {
        billsSkipped.push({
          flatNo: resident.flatNo,
          reason: 'Bill already exists',
        });
        continue;
      }

      // Determine amount based on resident type
      const baseAmount = resident.residentType === 'owner' ? parseFloat(ownerAmount) : parseFloat(tenantAmount);

      // Create new maintenance bill
      const bill = await Maintenance.create({
        flatNo: resident.flatNo,
        month,
        year: parseInt(year),
        baseAmount,
        latePenalty: 0,
        otherCharges: 0,
        otherChargesDescription: '',
        totalAmount: baseAmount,
        dueDate: new Date(dueDate),
        paymentStatus: 'pending',
        residentType: resident.residentType,
      });

      billsCreated.push({
        flatNo: resident.flatNo,
        billId: bill._id,
        residentType: resident.residentType,
        amount: baseAmount,
      });
    }

    res.status(201).json({
      success: true,
      message: `Generated ${billsCreated.length} bills successfully`,
      data: {
        billsCreated,
        billsSkipped,
        totalResidents: residents.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update maintenance bill
 * @route   PUT /api/admin/maintenance/:id
 * @access  Private/Admin
 */
exports.updateMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    const { baseAmount, latePenalty, otherCharges, otherChargesDescription, dueDate, paymentStatus } = req.body;

    if (baseAmount !== undefined) maintenance.baseAmount = parseFloat(baseAmount);
    if (latePenalty !== undefined) maintenance.latePenalty = parseFloat(latePenalty);
    if (otherCharges !== undefined) maintenance.otherCharges = parseFloat(otherCharges);
    if (otherChargesDescription !== undefined) maintenance.otherChargesDescription = otherChargesDescription;
    if (dueDate) maintenance.dueDate = new Date(dueDate);
    if (paymentStatus) {
      maintenance.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && !maintenance.paymentDate) {
        maintenance.paymentDate = new Date();
      }
    }

    // Recalculate total amount
    maintenance.totalAmount = maintenance.baseAmount + maintenance.latePenalty + maintenance.otherCharges;

    await maintenance.save();

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete maintenance bill
 * @route   DELETE /api/admin/maintenance/:id
 * @access  Private/Admin
 */
exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    await maintenance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Apply late penalty to overdue bills
 * @route   POST /api/admin/maintenance/apply-penalty
 * @access  Private/Admin
 */
exports.applyLatePenalty = async (req, res) => {
  try {
    const { penaltyAmount, penaltyType } = req.body;

    // Validation
    if (!penaltyAmount || penaltyAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid penalty amount' });
    }

    // Find all pending bills that are past due date
    const today = new Date();
    const overdueBills = await Maintenance.find({
      paymentStatus: 'pending',
      dueDate: { $lt: today },
      latePenalty: 0 // Only apply to bills without penalty
    });

    if (overdueBills.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No overdue bills found without penalty',
        data: {
          updated: 0,
        },
      });
    }

    let updatedCount = 0;

    for (const bill of overdueBills) {
      // Calculate days overdue
      const dueDate = new Date(bill.dueDate);
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

      // Calculate penalty based on type
      let calculatedPenalty = 0;
      if (penaltyType === 'percentage') {
        calculatedPenalty = (bill.baseAmount * penaltyAmount) / 100;
      } else {
        calculatedPenalty = parseFloat(penaltyAmount);
      }

      // Apply penalty
      bill.latePenalty = calculatedPenalty;
      bill.totalAmount = bill.baseAmount + bill.latePenalty + bill.otherCharges;
      bill.paymentStatus = 'overdue';
 
      await bill.save();

      // Log the penalty application
      await PenaltyLog.create({
        flatNo: bill.flatNo,
        month: bill.month,
        year: bill.year,
        baseAmount: bill.baseAmount,
        penaltyAmount: calculatedPenalty,
        penaltyType: penaltyType || 'fixed',
        totalAmount: bill.totalAmount,
        appliedBy: req.user.name || 'Admin',
        dueDate: bill.dueDate,
        daysOverdue: daysOverdue,
      });

      updatedCount++;
    }

    res.status(200).json({
      success: true,
      message: `Applied late penalty to ${updatedCount} overdue bills`,
      data: {
        updated: updatedCount,
        penaltyAmount: penaltyAmount,
        penaltyType: penaltyType || 'fixed',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get penalty logs
 * @route   GET /api/admin/penalty-logs
 * @access  Private/Admin
 */
exports.getPenaltyLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const month = req.query.month || '';
    const year = req.query.year || '';

    const query = {};
    
    if (search) {
      query.flatNo = { $regex: search, $options: 'i' };
    }

    if (month) {
      query.month = month;
    }

    if (year) {
      query.year = parseInt(year);
    }

    const penaltyLogs = await PenaltyLog.find(query)
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PenaltyLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: penaltyLogs,
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
