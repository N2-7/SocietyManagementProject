const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  flatNo: {
    type: String,
    required: [true, 'Please provide a flat number'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  phone: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['admin', 'resident', 'guard'],
    default: 'resident',
  },
  residentType: {
    type: String,
    enum: ['owner', 'tenant'],
    default: 'owner',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'blocked'],
    default: 'pending',
  },
  profileImage: {
    type: String,
    default: '',
  },
  refreshToken: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
