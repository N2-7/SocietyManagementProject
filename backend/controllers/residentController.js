const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Maintenance = require('../models/Maintenance');
const Payment = require('../models/Payment');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const Parking = require('../models/Parking');
const Amenity = require('../models/Amenity');
const Visitor = require('../models/Visitor');
const NOC = require('../models/NOC');
const Expense = require('../models/Expense');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

/**
 * @desc    Get resident dashboard data
 * @route   GET /api/resident/dashboard
 * @access  Private/Resident
 */
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const flatNo = req.user.flatNo;

    // Get user's complaints
    const myComplaints = await Complaint.find({ residentId: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending complaints count
    const pendingComplaints = await Complaint.countDocuments({
      residentId: userId,
      status: 'pending',
    });

    // Get maintenance bills for user's flat
    const maintenanceBills = await Maintenance.find({ flatNo })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending maintenance amount
    const pendingMaintenance = await Maintenance.find({
      flatNo,
      paymentStatus: 'pending',
    });

    const totalPendingAmount = pendingMaintenance.reduce(
      (sum, bill) => sum + bill.amount,
      0
    );

    // Get notices
    const notices = await Notice.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5);

    // Get events
    const events = await Event.find()
      .sort({ date: -1 })
      .limit(5);

    // Get visitor requests
    const visitors = await Visitor.find({ residentId: userId })
      .sort({ entryTime: -1 })
      .limit(5);

    // Get parking slot
    const parking = await Parking.findOne({ flatNo });

    // Get amenity bookings
    const amenityBookings = await Amenity.find({ residentId: userId })
      .sort({ bookingDate: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        complaints: myComplaints,
        pendingComplaints,
        maintenance: maintenanceBills,
        totalPendingAmount,
        notices,
        events,
        visitors,
        parking,
        amenityBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get resident profile
 * @route   GET /api/resident/profile
 * @access  Private/Resident
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update resident profile
 * @route   PUT /api/resident/profile
 * @access  Private/Resident
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get resident's complaints
 * @route   GET /api/resident/complaints
 * @access  Private/Resident
 */
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ residentId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create complaint
 * @route   POST /api/resident/complaints
 * @access  Private/Resident
 */
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, images } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      category,
      residentId: req.user.id,
      priority: priority || 'medium',
      images: images || [],
    });

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Add comment to complaint
 * @route   POST /api/resident/complaints/:id/comments
 * @access  Private/Resident
 */
exports.addComplaintComment = async (req, res) => {
  try {
    const { comment } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if complaint belongs to user
    if (complaint.residentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to comment on this complaint' });
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
 * @desc    Get resident's maintenance bills
 * @route   GET /api/resident/maintenance
 * @access  Private/Resident
 */
exports.getMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.find({ flatNo: req.user.flatNo })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get payment history
 * @route   GET /api/resident/payments
 * @access  Private/Resident
 */
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ residentId: req.user.id })
      .populate('maintenanceId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create Razorpay order for maintenance payment
 * @route   POST /api/resident/payment/create-order
 * @access  Private/Resident
 */
exports.createPaymentOrder = async (req, res) => {
  try {
    const { maintenanceId } = req.body;

    // Get maintenance bill
    const maintenance = await Maintenance.findById(maintenanceId);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance bill not found' });
    }

    // Check if bill belongs to user's flat
    if (maintenance.flatNo !== req.user.flatNo) {
      return res.status(403).json({ message: 'Not authorized to pay this bill' });
    }

    // Check if already paid
    if (maintenance.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This bill is already paid' });
    }

    // Create Razorpay order
    const options = {
      amount: maintenance.totalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `maintenance_${maintenance._id}`,
      notes: {
        maintenanceId: maintenance._id.toString(),
        residentId: req.user.id.toString(),
        flatNo: maintenance.flatNo,
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        maintenance: {
          id: maintenance._id,
          month: maintenance.month,
          year: maintenance.year,
          amount: maintenance.totalAmount,
        },
      },
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify Razorpay payment and update maintenance status
 * @route   POST /api/resident/payment/verify
 * @access  Private/Resident
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      maintenanceId 
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'your_key_secret')
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Get maintenance bill
    const maintenance = await Maintenance.findById(maintenanceId);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance bill not found' });
    }

    // Check if bill belongs to user's flat
    if (maintenance.flatNo !== req.user.flatNo) {
      return res.status(403).json({ message: 'Not authorized for this payment' });
    }

    // Check if already paid
    if (maintenance.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'This bill is already paid' });
    }

    // Create payment record
    const payment = await Payment.create({
      residentId: req.user.id,
      maintenanceId: maintenanceId,
      amount: maintenance.totalAmount,
      transactionId: razorpay_payment_id,
      paymentMethod: 'razorpay',
      status: 'completed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    // Update maintenance status
    maintenance.paymentStatus = 'paid';
    maintenance.paymentDate = new Date();
    maintenance.receiptId = payment._id.toString();
    await maintenance.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        payment,
        maintenance,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get notices
 * @route   GET /api/resident/notices
 * @access  Private/Resident
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
 * @desc    Get events
 * @route   GET /api/resident/events
 * @access  Private/Resident
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
 * @desc    RSVP for event
 * @route   POST /api/resident/events/:id/rsvp
 * @access  Private/Resident
 */
exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already RSVP'd
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already RSVP\'d for this event' });
    }

    event.attendees.push(req.user.id);
    event.rsvpCount = event.attendees.length;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'RSVP successful',
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get parking slot
 * @route   GET /api/resident/parking
 * @access  Private/Resident
 */
exports.getParking = async (req, res) => {
  try {
    const parking = await Parking.findOne({ flatNo: req.user.flatNo });

    res.status(200).json({
      success: true,
      data: parking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get amenity bookings
 * @route   GET /api/resident/amenities
 * @access  Private/Resident
 */
exports.getAmenities = async (req, res) => {
  try {
    const amenities = await Amenity.find({ residentId: req.user.id })
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      data: amenities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Book amenity
 * @route   POST /api/resident/amenities
 * @access  Private/Resident
 */
exports.bookAmenity = async (req, res) => {
  try {
    const { name, bookingDate, timeSlot } = req.body;

    // Check if slot is already booked
    const existing = await Amenity.findOne({ name, bookingDate, timeSlot });
    if (existing) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    const amenity = await Amenity.create({
      name,
      bookingDate,
      timeSlot,
      residentId: req.user.id,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Amenity booked successfully',
      data: amenity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Cancel amenity booking
 * @route   PUT /api/resident/amenities/:id/cancel
 * @access  Private/Resident
 */
exports.cancelAmenity = async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    
    if (!amenity) {
      return res.status(404).json({ message: 'Amenity booking not found' });
    }

    // Check if booking belongs to user
    if (amenity.residentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    amenity.status = 'cancelled';
    await amenity.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: amenity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get visitor requests
 * @route   GET /api/resident/visitors
 * @access  Private/Resident
 */
exports.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({ residentId: req.user.id })
      .populate('guardId', 'name')
      .sort({ entryTime: -1 });

    res.status(200).json({
      success: true,
      data: visitors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Pre-register visitor
 * @route   POST /api/resident/visitors
 * @access  Private/Resident
 */
exports.preRegisterVisitor = async (req, res) => {
  try {
    const { visitorName, phone, vehicleNumber, purpose, expectedDate, expectedTime } = req.body;

    // Combine date and time if both are provided
    let entryTime = new Date();
    if (expectedDate) {
      if (expectedTime) {
        entryTime = new Date(`${expectedDate}T${expectedTime}`);
      } else {
        entryTime = new Date(expectedDate);
      }
    }

    const visitor = await Visitor.create({
      visitorName,
      phone,
      vehicleNumber: vehicleNumber || '',
      purpose,
      flatNo: req.user.flatNo,
      residentId: req.user.id,
      status: 'pending',
      preRegistered: true,
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
      entryTime,
    });

    res.status(201).json({
      success: true,
      message: 'Visitor pre-registered successfully',
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Download receipt
 * @route   GET /api/resident/receipt/:id
 * @access  Private/Resident
 */
exports.downloadReceipt = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    if (maintenance.flatNo !== req.user.flatNo) {
      return res.status(403).json({ message: 'Not authorized to download this receipt' });
    }

    if (maintenance.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Receipt is only available for paid bills' });
    }

    // Get payment details
    const payment = await Payment.findOne({ maintenanceId: maintenance._id });

    const generatePDF = require('../utils/generatePDF');
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
 * @desc    Get resident's NOC requests
 * @route   GET /api/resident/noc
 * @access  Private/Resident
 */
exports.getNOCRequests = async (req, res) => {
  try {
    const nocRequests = await NOC.find({ residentId: req.user.id })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: nocRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create NOC request
 * @route   POST /api/resident/noc
 * @access  Private/Resident
 */
exports.createNOCRequest = async (req, res) => {
  try {
    const { nocType, otherType, purpose, documentUrl } = req.body;

    // Check if user has any pending maintenance (for information only, not blocking)
    const pendingMaintenance = await Maintenance.find({
      flatNo: req.user.flatNo,
      paymentStatus: 'pending',
    });

    const hasPendingDues = pendingMaintenance.length > 0;

    const noc = await NOC.create({
      residentId: req.user.id,
      flatNo: req.user.flatNo,
      nocType,
      otherType: nocType === 'other' ? otherType : '',
      purpose,
      documentUrl,
      requestedBy: req.user.id,
      hasPendingDues,
    });

    res.status(201).json({
      success: true,
      message: hasPendingDues 
        ? 'NOC request submitted. Note: You have pending maintenance dues that may affect approval.' 
        : 'NOC request submitted successfully',
      data: noc,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Download NOC certificate
 * @route   GET /api/resident/noc/:id/download
 * @access  Private/Resident
 */
exports.downloadNOCCertificate = async (req, res) => {
  try {
    const noc = await NOC.findById(req.params.id)
      .populate('residentId', 'name flatNo phone email')
      .populate('approvedBy', 'name');
    
    if (!noc) {
      return res.status(404).json({ message: 'NOC request not found' });
    }

    // Check if the NOC belongs to the requesting resident
    if (noc.residentId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to download this NOC' });
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
 * @route   GET /api/resident/noc/:id/preview
 * @access  Private/Resident
 */
exports.previewNOCCertificate = async (req, res) => {
  try {
    const noc = await NOC.findById(req.params.id)
      .populate('residentId', 'name flatNo phone email')
      .populate('approvedBy', 'name');
    
    if (!noc) {
      return res.status(404).json({ message: 'NOC request not found' });
    }

    if (noc.residentId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this NOC' });
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
 * @desc    Get all expenses (read-only for residents)
 * @route   GET /api/resident/expenses
 * @access  Private/Resident
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

    if (startDate && endDate) {
      query.expenseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
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
 * @desc    Get expense summary (read-only for residents)
 * @route   GET /api/resident/expenses/summary
 * @access  Private/Resident
 */
exports.getExpenseSummary = async (req, res) => {
  try {
    // Calculate total maintenance collected (same as admin)
    const paidMaintenance = await Maintenance.find({ paymentStatus: 'paid' });
    const totalCollected = paidMaintenance.reduce((sum, maintenance) => {
      return sum + (maintenance.totalAmount || maintenance.amount);
    }, 0);

    // Calculate total expenses
    const totalExpenses = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
        },
      },
    ]);

    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Calculate society fund (remaining balance)
    const societyFund = totalCollected - (totalExpenses[0]?.totalExpenses || 0);

    const summary = {
      totalCollected,
      totalExpenses: totalExpenses[0]?.totalExpenses || 0,
      societyFund,
      expensesByCategory: expensesByCategory || [],
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

