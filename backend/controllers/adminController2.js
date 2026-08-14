const Maintenance = require('../models/Maintenance');
const Payment = require('../models/Payment');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Parking = require('../models/Parking');
const Amenity = require('../models/Amenity');
const SecurityLog = require('../models/SecurityLog');
const Expense = require('../models/Expense');
const NOC = require('../models/NOC');
const generatePDF = require('../utils/generatePDF');
const generateExcel = require('../utils/generateExcel');

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
    const status = req.query.status || '';
    const month = req.query.month || '';
    const year = req.query.year || '';

    const query = {};
    
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
 * @desc    Generate monthly maintenance bill
 * @route   POST /api/admin/maintenance
 * @access  Private/Admin
 */
exports.generateMaintenance = async (req, res) => {
  try {
    const { flatNo, month, year, amount, dueDate } = req.body;

    // Check if maintenance already exists for this flat, month, year
    const existing = await Maintenance.findOne({ flatNo, month, year });
    if (existing) {
      return res.status(400).json({ message: 'Maintenance bill already exists for this flat and month' });
    }

    const maintenance = await Maintenance.create({
      flatNo,
      month,
      year,
      amount,
      dueDate,
      paymentStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance bill generated successfully',
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update maintenance
 * @route   PUT /api/admin/maintenance/:id
 * @access  Private/Admin
 */
exports.updateMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    const { amount, dueDate, paymentStatus } = req.body;

    if (amount) maintenance.amount = amount;
    if (dueDate) maintenance.dueDate = dueDate;
    if (paymentStatus) {
      maintenance.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') {
        maintenance.paymentDate = new Date();
        maintenance.receiptId = `RCP-${Date.now()}`;
      }
    }

    await maintenance.save();

    res.status(200).json({
      success: true,
      message: 'Maintenance updated successfully',
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete maintenance
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
      message: 'Maintenance deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Download maintenance receipt as PDF
 * @route   GET /api/admin/maintenance/:id/receipt
 * @access  Private/Admin
 */
exports.downloadReceipt = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    if (maintenance.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Receipt is only available for paid bills' });
    }

    // Get payment details
    const payment = await Payment.findOne({ maintenanceId: maintenance._id });

    const receiptData = {
      receiptId: maintenance.receiptId || `RCP-${maintenance._id.toString().slice(-8).toUpperCase()}`,
      transactionId: payment?.transactionId || 'N/A',
      paymentDate: maintenance.paymentDate,
      amount: maintenance.totalAmount || maintenance.amount,
      baseAmount: maintenance.baseAmount || maintenance.amount,
      latePenalty: maintenance.latePenalty || 0,
      otherCharges: maintenance.otherCharges || 0,
      otherChargesDescription: maintenance.otherChargesDescription || '',
      totalAmount: maintenance.totalAmount || maintenance.amount,
      paymentMethod: payment?.paymentMethod === 'razorpay' ? 'Razorpay (Online)' : 
                     payment?.paymentMethod || 'Online Payment',
      status: maintenance.paymentStatus,
      flatNo: maintenance.flatNo,
      residentType: maintenance.residentType,
      month: maintenance.month,
      year: maintenance.year,
      dueDate: maintenance.dueDate,
    };

    await generatePDF(receiptData, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all notices
 * @route   GET /api/admin/notices
 * @access  Private/Admin
 */
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('createdBy', 'name')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create notice
 * @route   POST /api/admin/notices
 * @access  Private/Admin
 */
exports.createNotice = async (req, res) => {
  try {
    const { title, description, isPinned, attachments } = req.body;

    const notice = await Notice.create({
      title,
      description,
      createdBy: req.user.id,
      isPinned: isPinned || false,
      attachments: attachments || [],
    });

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update notice
 * @route   PUT /api/admin/notices/:id
 * @access  Private/Admin
 */
exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    const { title, description, isPinned, attachments } = req.body;

    if (title) notice.title = title;
    if (description) notice.description = description;
    if (isPinned !== undefined) notice.isPinned = isPinned;
    if (attachments) notice.attachments = attachments;

    await notice.save();

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: notice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete notice
 * @route   DELETE /api/admin/notices/:id
 * @access  Private/Admin
 */
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all events
 * @route   GET /api/admin/events
 * @access  Private/Admin
 */
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create event
 * @route   POST /api/admin/events
 * @access  Private/Admin
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, organizer, image } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer,
      image,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update event
 * @route   PUT /api/admin/events/:id
 * @access  Private/Admin
 */
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { title, description, date, location, organizer, image } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (location) event.location = location;
    if (organizer) event.organizer = organizer;
    if (image) event.image = image;

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete event
 * @route   DELETE /api/admin/events/:id
 * @access  Private/Admin
 */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all parking slots
 * @route   GET /api/admin/parking
 * @access  Private/Admin
 */
exports.getParking = async (req, res) => {
  try {
    const parking = await Parking.find()
      .sort({ slotNo: 1 });

    res.status(200).json({
      success: true,
      data: parking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Assign parking slot
 * @route   POST /api/admin/parking
 * @access  Private/Admin
 */
exports.assignParking = async (req, res) => {
  try {
    const { flatNo, vehicleNumber, slotNo, vehicleType } = req.body;

    // Check if slot is already occupied
    const existingSlot = await Parking.findOne({ slotNo });
    if (existingSlot) {
      return res.status(400).json({ message: 'Slot is already occupied' });
    }

    const parking = await Parking.create({
      flatNo,
      vehicleNumber,
      slotNo,
      vehicleType,
      isOccupied: true,
    });

    res.status(201).json({
      success: true,
      message: 'Parking slot assigned successfully',
      data: parking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update parking
 * @route   PUT /api/admin/parking/:id
 * @access  Private/Admin
 */
exports.updateParking = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    
    if (!parking) {
      return res.status(404).json({ message: 'Parking not found' });
    }

    const { flatNo, vehicleNumber, slotNo, vehicleType, isOccupied } = req.body;

    if (flatNo) parking.flatNo = flatNo;
    if (vehicleNumber) parking.vehicleNumber = vehicleNumber;
    if (slotNo) parking.slotNo = slotNo;
    if (vehicleType) parking.vehicleType = vehicleType;
    if (isOccupied !== undefined) parking.isOccupied = isOccupied;

    await parking.save();

    res.status(200).json({
      success: true,
      message: 'Parking updated successfully',
      data: parking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete parking
 * @route   DELETE /api/admin/parking/:id
 * @access  Private/Admin
 */
exports.deleteParking = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    
    if (!parking) {
      return res.status(404).json({ message: 'Parking not found' });
    }

    await parking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Parking deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all amenity bookings
 * @route   GET /api/admin/amenities
 * @access  Private/Admin
 */
exports.getAmenities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const name = req.query.name || '';

    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = name;
    }

    const amenities = await Amenity.find(query)
      .populate('residentId', 'name flatNo')
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Amenity.countDocuments(query);

    res.status(200).json({
      success: true,
      data: amenities,
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
 * @desc    Approve/Reject amenity booking
 * @route   PUT /api/admin/amenities/:id
 * @access  Private/Admin
 */
exports.updateAmenity = async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    
    if (!amenity) {
      return res.status(404).json({ message: 'Amenity booking not found' });
    }

    const { status } = req.body;

    if (status) {
      amenity.status = status;
    }

    await amenity.save();

    res.status(200).json({
      success: true,
      message: `Amenity booking ${status} successfully`,
      data: amenity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete amenity booking
 * @route   DELETE /api/admin/amenities/:id
 * @access  Private/Admin
 */
exports.deleteAmenity = async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    
    if (!amenity) {
      return res.status(404).json({ message: 'Amenity booking not found' });
    }

    await amenity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Amenity booking deleted successfully',
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
 * @desc    Export reports (PDF/Excel)
 * @route   GET /api/admin/reports/:type
 * @access  Private/Admin
 */
exports.exportReport = async (req, res) => {
  try {
    const { type } = req.params;
    const format = req.query.format || 'excel';
    
    let data = [];
    let filename = '';

    switch (type) {
      case 'residents':
        data = await User.find({ role: 'resident' }).select('-password -refreshToken');
        filename = 'residents_report';
        break;
      case 'visitors':
        data = await Visitor.find().populate('residentId', 'name flatNo');
        filename = 'visitors_report';
        break;
      case 'complaints':
        data = await Complaint.find().populate('residentId', 'name flatNo');
        filename = 'complaints_report';
        break;
      case 'maintenance':
        data = await Maintenance.find();
        filename = 'maintenance_report';
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    if (format === 'excel') {
      generateExcel(data, filename, res);
    } else {
      return res.status(400).json({ message: 'PDF export not implemented for this report type' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get expense summary (total collected, total expenses, society fund)
 * @route   GET /api/admin/expenses/summary
 * @access  Private/Admin
 */
exports.getExpenseSummary = async (req, res) => {
  try {
    // Calculate total maintenance collected
    const paidMaintenance = await Maintenance.find({ paymentStatus: 'paid' });
    const totalCollected = paidMaintenance.reduce((sum, maintenance) => {
      return sum + (maintenance.totalAmount || maintenance.amount);
    }, 0);

    // Calculate total expenses
    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate society fund (remaining balance)
    const societyFund = totalCollected - totalExpenses;

    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCollected,
        totalExpenses,
        societyFund,
        expensesByCategory,
        totalTransactions: expenses.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all expenses
 * @route   GET /api/admin/expenses
 * @access  Private/Admin
 */
exports.getExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category || '';
    const startDate = req.query.startDate || '';
    const endDate = req.query.endDate || '';

    const query = {};
    
    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) {
        query.expenseDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.expenseDate.$lte = new Date(endDate);
      }
    }

    const expenses = await Expense.find(query)
      .populate('addedBy', 'name')
      .sort({ expenseDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Expense.countDocuments(query);

    res.status(200).json({
      success: true,
      data: expenses,
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
 * @desc    Create expense
 * @route   POST /api/admin/expenses
 * @access  Private/Admin
 */
exports.createExpense = async (req, res) => {
  try {
    const { title, description, amount, category, expenseDate } = req.body;

    const expense = await Expense.create({
      title,
      description,
      amount,
      category: category || 'other',
      expenseDate: expenseDate || new Date(),
      addedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update expense
 * @route   PUT /api/admin/expenses/:id
 * @access  Private/Admin
 */
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { title, description, amount, category, expenseDate } = req.body;

    if (title) expense.title = title;
    if (description) expense.description = description;
    if (amount) expense.amount = amount;
    if (category) expense.category = category;
    if (expenseDate) expense.expenseDate = expenseDate;

    await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete expense
 * @route   DELETE /api/admin/expenses/:id
 * @access  Private/Admin
 */
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all NOC requests
 * @route   GET /api/admin/noc
 * @access  Private/Admin
 */
exports.getNOCRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const nocType = req.query.nocType || '';
    const search = req.query.search || '';

    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (nocType) {
      query.nocType = nocType;
    }

    if (search) {
      query.$or = [
        { flatNo: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
      ];
    }

    const nocRequests = await NOC.find(query)
      .populate('residentId', 'name email phone')
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await NOC.countDocuments(query);

    // Add pending maintenance information for each NOC request
    const nocRequestsWithDues = await Promise.all(nocRequests.map(async (noc) => {
      const pendingMaintenance = await Maintenance.find({
        flatNo: noc.flatNo,
        paymentStatus: 'pending',
      });
      return {
        ...noc.toObject(),
        pendingMaintenanceCount: pendingMaintenance.length,
        pendingMaintenanceAmount: pendingMaintenance.reduce((sum, m) => sum + (m.totalAmount || m.amount), 0),
      };
    }));

    res.status(200).json({
      success: true,
      data: nocRequestsWithDues,
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
 * @desc    Approve NOC request
 * @route   PUT /api/admin/noc/:id/approve
 * @access  Private/Admin
 */
exports.approveNOC = async (req, res) => {
  try {
    const noc = await NOC.findById(req.params.id);
    
    if (!noc) {
      return res.status(404).json({ message: 'NOC request not found' });
    }

    if (noc.status !== 'pending') {
      return res.status(400).json({ message: 'NOC request is already processed' });
    }

    // Generate certificate number
    const certificateNumber = `NOC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    noc.status = 'approved';
    noc.approvedBy = req.user.id;
    noc.certificateNumber = certificateNumber;
    noc.issueDate = new Date();
    noc.adminRemarks = req.body.adminRemarks || '';
    
    // Set expiry date if provided
    if (req.body.expiryDate) {
      noc.expiryDate = new Date(req.body.expiryDate);
    }

    await noc.save();

    res.status(200).json({
      success: true,
      message: 'NOC approved successfully',
      data: noc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Reject NOC request
 * @route   PUT /api/admin/noc/:id/reject
 * @access  Private/Admin
 */
exports.rejectNOC = async (req, res) => {
  try {
    const noc = await NOC.findById(req.params.id);
    
    if (!noc) {
      return res.status(404).json({ message: 'NOC request not found' });
    }

    if (noc.status !== 'pending') {
      return res.status(400).json({ message: 'NOC request is already processed' });
    }

    noc.status = 'rejected';
    noc.approvedBy = req.user.id;
    noc.adminRemarks = req.body.adminRemarks || '';

    await noc.save();

    res.status(200).json({
      success: true,
      message: 'NOC rejected successfully',
      data: noc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Download NOC certificate
 * @route   GET /api/admin/noc/:id/download
 * @access  Private/Admin
 */
exports.downloadNOCCertificate = async (req, res) => {
  try {
    const noc = await NOC.findById(req.params.id)
      .populate('residentId', 'name flatNo phone email')
      .populate('approvedBy', 'name');
    
    if (!noc) {
      return res.status(404).json({ message: 'NOC request not found' });
    }

    if (noc.status !== 'approved') {
      return res.status(400).json({ message: 'NOC certificate is only available for approved requests' });
    }

    const generateNOCPDF = require('../utils/generateNOCPDF');
    await generateNOCPDF(noc, res, 'attachment');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Preview NOC certificate (inline)
 * @route   GET /api/admin/noc/:id/preview
 * @access  Private/Admin
 */
exports.previewNOCCertificate = async (req, res) => {
  try {
    const noc = await NOC.findById(req.params.id)
      .populate('residentId', 'name flatNo phone email')
      .populate('approvedBy', 'name');
    
    if (!noc) {
      return res.status(404).json({ message: 'NOC request not found' });
    }

    if (noc.status !== 'approved') {
      return res.status(400).json({ message: 'NOC certificate preview is only available for approved requests' });
    }

    const generateNOCPDF = require('../utils/generateNOCPDF');
    await generateNOCPDF(noc, res, 'inline');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete NOC request
 * @route   DELETE /api/admin/noc/:id
 * @access  Private/Admin
 */
exports.deleteNOC = async (req, res) => {
  try {
    const noc = await NOC.findById(req.params.id);
    
    if (!noc) {
      return res.status(404).json({ message: 'NOC request not found' });
    }

    await NOC.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'NOC request deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

