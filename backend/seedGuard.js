require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedGuard = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if guard already exists
    const existingGuard = await User.findOne({ flatNo: 'GUARD' });
    if (existingGuard) {
      console.log('Guard user already exists');
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('guard123', salt);

    // Create guard user
    const guard = await User.create({
      name: 'Security Guard',
      email: 'guard@society.com',
      flatNo: 'GUARD',
      password: hashedPassword,
      phone: '9876543210',
      role: 'guard',
      status: 'active'
    });

    console.log('Guard user created successfully:');
    console.log('Email: guard@society.com');
    console.log('Flat No: GUARD');
    console.log('Password: guard123');
    console.log('Role: guard');
    console.log('Status: active');

    process.exit(0);
  } catch (error) {
    console.error('Error creating guard user:', error.message);
    process.exit(1);
  }
};

seedGuard();