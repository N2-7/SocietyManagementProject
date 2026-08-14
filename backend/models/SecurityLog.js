const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  guardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
  },
  activity: {
    type: String,
    required: [true, 'Please provide activity description'],
    enum: ['visitor-entry', 'visitor-exit', 'visitor-rejected', 'delivery', 'cab', 'patrol', 'emergency', 'security-checkin', 'security-checkout', 'other'],
  },
  description: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
  },
  // Security stamp specific fields
  guardName: {
    type: String,
  },
  shift: {
    type: String,
    enum: ['morning', 'afternoon', 'night'],
  },
  checkInTime: {
    type: Date,
  },
  checkOutTime: {
    type: Date,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SecurityLog', securityLogSchema);
