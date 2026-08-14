const mongoose = require('mongoose');

const nocSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  flatNo: {
    type: String,
    required: [true, 'Please provide flat number'],
  },
  nocType: {
    type: String,
    enum: ['gas-connection', 'electricity', 'bank', 'telephone', 'internet', 'property-sale', 'rent-agreement', 'passport', 'other'],
    required: [true, 'Please provide NOC type'],
  },
  otherType: {
    type: String,
    default: '',
  },
  purpose: {
    type: String,
    required: [true, 'Please provide purpose for NOC'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminRemarks: {
    type: String,
    default: '',
  },
  issueDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  certificateNumber: {
    type: String,
    unique: true,
  },
  documentUrl: {
    type: String,
  },
  hasPendingDues: {
    type: Boolean,
    default: false,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
nocSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('NOC', nocSchema);
