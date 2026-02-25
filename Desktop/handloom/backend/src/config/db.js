const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        dbName: 'handloom',
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection error (attempt ${i}/${retries}):`, error.message);
      if (i === retries) {
        console.error('Could not connect to MongoDB after multiple attempts. Exiting.');
        process.exit(1);
      }
      const wait = i * 3000;
      console.log(`   Retrying in ${wait / 1000}s...`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
};

module.exports = connectDB;
