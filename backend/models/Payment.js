const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  maintenanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maintenance',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
  },
  transactionId: {
    type: String,
    required: [true, 'Please provide transaction ID'],
    unique: true,
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'cash', 'cheque', 'upi'],
    required: [true, 'Please provide payment method'],
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
