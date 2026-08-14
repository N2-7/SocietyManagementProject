const express = require('express');
const router = express.Router();
const {
  getMaintenance,
  generateMaintenance,
  updateMaintenance,
  deleteMaintenance,
  downloadReceipt,
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getParking,
  assignParking,
  updateParking,
  deleteParking,
  getAmenities,
  updateAmenity,
  deleteAmenity,
  getSecurityLogs,
  exportReport,
  getExpenseSummary,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getNOCRequests,
  approveNOC,
  rejectNOC,
  downloadNOCCertificate,
  previewNOCCertificate,
  deleteNOC,
} = require('../controllers/adminController2');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Maintenance Management
router.get('/maintenance', getMaintenance);
router.post('/maintenance', generateMaintenance);
router.put('/maintenance/:id', updateMaintenance);
router.delete('/maintenance/:id', deleteMaintenance);
router.get('/maintenance/:id/receipt', downloadReceipt);

// Notice Management
router.get('/notices', getNotices);
router.post('/notices', createNotice);
router.put('/notices/:id', updateNotice);
router.delete('/notices/:id', deleteNotice);

// Event Management
router.get('/events', getEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

// Parking Management
router.get('/parking', getParking);
router.post('/parking', assignParking);
router.put('/parking/:id', updateParking);
router.delete('/parking/:id', deleteParking);

// Amenity Management
router.get('/amenities', getAmenities);
router.put('/amenities/:id', updateAmenity);
router.delete('/amenities/:id', deleteAmenity);

// Security Logs
router.get('/security-logs', getSecurityLogs);

// Reports
router.get('/reports/:type', exportReport);

// Expense Management
router.get('/expenses/summary', getExpenseSummary);
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

// NOC Management
router.get('/noc', getNOCRequests);
router.put('/noc/:id/approve', approveNOC);
router.put('/noc/:id/reject', rejectNOC);
router.get('/noc/:id/download', downloadNOCCertificate);
router.get('/noc/:id/preview', previewNOCCertificate);
router.delete('/noc/:id', deleteNOC);

module.exports = router;

