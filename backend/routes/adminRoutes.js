const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getResidents,
  getPendingRequests,
  approveResident,
  blockResident,
  deleteResident,
  createResident,
  updateResident,
  getVisitors,
  deleteVisitor,
  getComplaints,
  updateComplaint,
  addComplaintComment,
  deleteComplaint,
  getSecurityLogs,
  deleteSecurityLog,
  getMaintenance,
  generateMaintenanceBills,
  updateMaintenance,
  deleteMaintenance,
  applyLatePenalty,
  getPenaltyLogs,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Resident Management
router.get('/residents', getResidents);
router.get('/pending-requests', getPendingRequests);
router.post('/residents', createResident);
router.put('/approve-resident/:id', approveResident);
router.put('/block-resident/:id', blockResident);
router.put('/residents/:id', updateResident);
router.delete('/residents/:id', deleteResident);

// Visitor Management
router.get('/visitors', getVisitors);
router.delete('/visitors/:id', deleteVisitor);

// Security Logs Management
router.get('/security-logs', getSecurityLogs);
router.delete('/security-logs/:id', deleteSecurityLog);

// Complaint Management
router.get('/complaints', getComplaints);
router.put('/complaints/:id', updateComplaint);
router.post('/complaints/:id/comments', addComplaintComment);
router.delete('/complaints/:id', deleteComplaint);

// Maintenance Management
router.get('/maintenance', getMaintenance);
router.post('/maintenance/generate', generateMaintenanceBills);
router.post('/maintenance/apply-penalty', applyLatePenalty);
router.put('/maintenance/:id', updateMaintenance);
router.delete('/maintenance/:id', deleteMaintenance);

// Penalty Logs
router.get('/penalty-logs', getPenaltyLogs);

module.exports = router;
