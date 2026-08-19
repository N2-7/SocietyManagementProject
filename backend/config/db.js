const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error(`👉 Tip: Your local MongoDB service is stopped. Run 'net start MongoDB' in Admin CMD/PowerShell or start it via services.msc`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
