const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide expense title'],
  },
  description: {
    type: String,
    required: [true, 'Please provide expense description'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide expense amount'],
  },
  category: {
    type: String,
    enum: ['maintenance', 'utilities', 'security', 'cleaning', 'repairs', 'events', 'administrative', 'other'],
    default: 'other',
  },
  expenseDate: {
    type: Date,
    required: [true, 'Please provide expense date'],
    default: Date.now,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Expense', expenseSchema);
