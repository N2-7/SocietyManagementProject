const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  flatNo: {
    type: String,
    required: [true, 'Please provide flat number'],
  },
  month: {
    type: String,
    required: [true, 'Please provide month'],
  },
  year: {
    type: Number,
    required: [true, 'Please provide year'],
  },
  baseAmount: {
    type: Number,
    required: [true, 'Please provide base amount'],
  },
  latePenalty: {
    type: Number,
    default: 0,
  },
  otherCharges: {
    type: Number,
    default: 0,
  },
  otherChargesDescription: {
    type: String,
    default: '',
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please provide total amount'],
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide due date'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  paymentDate: {
    type: Date,
  },
  receiptId: {
    type: String,
  },
  residentType: {
    type: String,
    enum: ['owner', 'tenant'],
    required: [true, 'Please provide resident type'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for flatNo, month, year to ensure uniqueness
maintenanceSchema.index({ flatNo: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
