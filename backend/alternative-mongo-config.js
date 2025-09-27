// Alternative MongoDB connection configuration
// Use this if the main connection fails due to SSL issues

const mongoose = require('mongoose');

const alternativeConnectDB = async () => {
  try {
    // Try with different SSL options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 30000,
      // Alternative SSL configuration
      ssl: false, // Try without SSL first
      tlsAllowInvalidCertificates: true,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB connected successfully (Alternative config)');
    console.log(`📊 Connected to: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Alternative MongoDB connection also failed:', error.message);
    return false;
  }
};

module.exports = alternativeConnectDB;






