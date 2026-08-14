require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users (optional - comment out if you want to keep existing data)
    await User.deleteMany({});

    // Create Admin User
    const adminExists = await User.findOne({ flatNo: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@smartsociety.com',
        flatNo: 'admin',
        password: 'admin123',
        phone: '9876543210',
        role: 'admin',
        status: 'active',
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create Guard User
    const guardExists = await User.findOne({ flatNo: 'guard' });
    if (!guardExists) {
      await User.create({
        name: 'Security Guard',
        email: 'guard@smartsociety.com',
        flatNo: 'guard',
        password: 'guard123',
        phone: '9876543211',
        role: 'guard',
        status: 'active',
      });
      console.log('✅ Guard user created');
    } else {
      console.log('ℹ️ Guard user already exists');
    }

    // Create Test Resident User (approved)
    const residentExists = await User.findOne({ flatNo: 'A-101' });
    if (!residentExists) {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        flatNo: 'A-101',
        password: 'resident123',
        phone: '9876543212',
        role: 'resident',
        status: 'active',
      });
      console.log('✅ Test resident user created');
    } else {
      console.log('ℹ️ Test resident user already exists');
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nDefault Login Credentials:');
    console.log('Admin: flatNo=admin, password=admin123');
    console.log('Guard: flatNo=guard, password=guard123');
    console.log('Resident: flatNo=A-101, password=resident123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedUsers();
