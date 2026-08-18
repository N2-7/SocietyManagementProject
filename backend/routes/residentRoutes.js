const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getProfile,
  updateProfile,
  getComplaints,
  createComplaint,
  addComplaintComment,
  getMaintenance,
  getPayments,
  createPaymentOrder,
  verifyPayment,
  sendPaymentOTP,
  verifyPaymentOTP,
  getNotices,
  getEvents,
  rsvpEvent,
  getParking,
  getAmenities,
  bookAmenity,
  cancelAmenity,
  getVisitors,
  preRegisterVisitor,
  downloadReceipt,
  getNOCRequests,
  createNOCRequest,
  downloadNOCCertificate,
  previewNOCCertificate,
  getExpenses,
  getExpenseSummary,
} = require('../controllers/residentController');
const { protect, authorize } = require('../middleware/auth');

// All resident routes require authentication and resident role
router.use(protect);
router.use(authorize('resident'));

// Dashboard
router.get('/dashboard', getDashboard);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Complaints
router.get('/complaints', getComplaints);
router.post('/complaints', createComplaint);
router.post('/complaints/:id/comments', addComplaintComment);

// Maintenance
router.get('/maintenance', getMaintenance);

// Payments
router.get('/payments', getPayments);
router.post('/payment/send-otp', sendPaymentOTP);
router.post('/payment/verify-otp', verifyPaymentOTP);
router.post('/payment/create-order', createPaymentOrder);
router.post('/payment/verify', verifyPayment);

// Notices
router.get('/notices', getNotices);

// Events
router.get('/events', getEvents);
router.post('/events/:id/rsvp', rsvpEvent);

// Parking
router.get('/parking', getParking);

// Amenities
router.get('/amenities', getAmenities);
router.post('/amenities', bookAmenity);
router.put('/amenities/:id/cancel', cancelAmenity);

// Visitors
router.get('/visitors', getVisitors);
router.post('/visitors', preRegisterVisitor);

// Receipt
router.get('/receipt/:id', downloadReceipt);

// NOC
router.get('/noc', getNOCRequests);
router.post('/noc', createNOCRequest);
router.get('/noc/:id/download', downloadNOCCertificate);
router.get('/noc/:id/preview', previewNOCCertificate);

// Expenses (read-only for residents)
router.get('/expenses', getExpenses);
router.get('/expenses/summary', getExpenseSummary);

module.exports = router;

