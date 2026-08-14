const express = require('express');
const router = express.Router();
const {
  getDashboard,
  visitorEntry,
  visitorExit,
  approveVisitor,
  declineVisitor,
  searchFlat,
  verifyResident,
  getVisitorHistory,
  deliveryEntry,
  cabEntry,
  emergencyAlert,
  getSecurityLogs,
  createPatrolLog,
  securityCheckIn,
  securityCheckOut,
} = require('../controllers/guardController');
const { protect, authorize } = require('../middleware/auth');

// All guard routes require authentication and guard role
router.use(protect);
router.use(authorize('guard'));

// Dashboard
router.get('/dashboard', getDashboard);

// Visitor Management
router.post('/visitor-entry', visitorEntry);
router.put('/visitor-exit/:id', visitorExit);
router.put('/visitors/:id/approve', approveVisitor);
router.put('/visitors/:id/decline', declineVisitor);
router.get('/visitor-history', getVisitorHistory);

// Resident Verification
router.get('/search-flat/:flatNo', searchFlat);
router.get('/verify-resident/:flatNo', verifyResident);

// Delivery & Cab
router.post('/delivery', deliveryEntry);
router.post('/cab', cabEntry);

// Emergency
router.post('/emergency', emergencyAlert);

// Security Logs
router.get('/security-logs', getSecurityLogs);
router.post('/patrol', createPatrolLog);

// Security Check-in/Check-out
router.post('/security-checkin', securityCheckIn);
router.post('/security-checkout', securityCheckOut);

module.exports = router;
