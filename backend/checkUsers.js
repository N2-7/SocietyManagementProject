require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const checkUsers = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    
    const allUsers = await User.find()
      .select('name email flatNo role status createdAt')
      .sort({ createdAt: -1 });
    
    console.log('\n=== All Users in Database ===');
    if (allUsers.length === 0) {
      console.log('No users found in database');
    } else {
      allUsers.forEach(u => {
        console.log(`Name: ${u.name}`);
        console.log(`Email: ${u.email}`);
        console.log(`Flat: ${u.flatNo}`);
        console.log(`Role: ${u.role}`);
        console.log(`Status: ${u.status}`);
        console.log(`Created: ${u.createdAt}`);
        console.log('---');
      });
    }
    
    const pendingUsers = await User.find({ status: 'pending' });
    console.log(`\n=== Pending Users: ${pendingUsers.length} ===`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
