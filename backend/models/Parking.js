const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  flatNo: {
    type: String,
    required: [true, 'Please provide flat number'],
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please provide vehicle number'],
  },
  slotNo: {
    type: String,
    required: [true, 'Please provide slot number'],
    unique: true,
  },
  vehicleType: {
    type: String,
    enum: ['car', 'bike', 'scooter', 'other'],
    default: 'car',
  },
  isOccupied: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Parking', parkingSchema);
