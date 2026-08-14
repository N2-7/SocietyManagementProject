const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide notice title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide notice description'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  attachments: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notice', noticeSchema);
