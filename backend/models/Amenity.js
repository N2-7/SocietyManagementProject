const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide amenity name'],
    enum: ['gym', 'pool', 'clubhouse', 'tennis-court', 'badminton-court', 'community-hall', 'garden', 'playground'],
  },
  bookingDate: {
    type: Date,
    required: [true, 'Please provide booking date'],
  },
  timeSlot: {
    type: String,
    required: [true, 'Please provide time slot'],
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for name, bookingDate, timeSlot to prevent double booking
amenitySchema.index({ name: 1, bookingDate: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Amenity', amenitySchema);
