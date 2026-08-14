require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ flatNo: 'ADMIN' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@society.com',
      flatNo: 'ADMIN',
      password: hashedPassword,
      phone: '1234567890',
      role: 'admin',
      status: 'active'
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@society.com');
    console.log('Flat No: ADMIN');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('Status: active');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();