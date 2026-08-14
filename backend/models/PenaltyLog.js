const mongoose = require('mongoose');

const penaltyLogSchema = new mongoose.Schema({
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
  penaltyAmount: {
    type: Number,
    required: [true, 'Please provide penalty amount'],
  },
  penaltyType: {
    type: String,
    enum: ['fixed', 'percentage'],
    required: [true, 'Please provide penalty type'],
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please provide total amount'],
  },
  appliedBy: {
    type: String,
    required: [true, 'Please provide admin name'],
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide due date'],
  },
  daysOverdue: {
    type: Number,
    required: [true, 'Please provide days overdue'],
  },
});

module.exports = mongoose.model('PenaltyLog', penaltyLogSchema);
