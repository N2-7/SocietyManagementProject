const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  visitorName: {
    type: String,
    required: [true, 'Please provide visitor name'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
  },
  vehicleNumber: {
    type: String,
    default: '',
  },
  purpose: {
    type: String,
    required: [true, 'Please provide purpose of visit'],
  },
  customPurpose: {
    type: String,
    default: '',
  },
  flatNo: {
    type: String,
    required: [true, 'Please provide flat number'],
  },
  entryTime: {
    type: Date,
    default: Date.now,
  },
  exitTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'exited'],
    default: 'pending',
  },
  guardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  qrCode: {
    type: String,
  },
  preRegistered: {
    type: Boolean,
    default: false,
  },
  expectedDate: {
    type: Date,
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Visitor', visitorSchema);
