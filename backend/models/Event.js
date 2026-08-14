const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide event description'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide event date'],
  },
  location: {
    type: String,
    required: [true, 'Please provide event location'],
  },
  organizer: {
    type: String,
    required: [true, 'Please provide organizer name'],
  },
  image: {
    type: String,
  },
  rsvpCount: {
    type: Number,
    default: 0,
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Event', eventSchema);
