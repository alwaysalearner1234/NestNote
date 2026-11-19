/**
 * MongoDB Atlas Connection Helper
 * 
 * Exports a configured Mongoose instance connected to the Free M0 cluster.
 * Uses dbName: 'welcomekit' to keep all Welcome Kit collections in one database.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not defined in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'welcomekit',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.default = connectDB;