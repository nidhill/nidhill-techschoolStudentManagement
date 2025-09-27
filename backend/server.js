const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');
const shoRoutes = require('./routes/sho');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test database connection endpoint
app.get('/test/db', async (req, res) => {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    const adminUser = await User.findOne({ username: 'admin' });
    const allUsers = await User.find({}, 'username role email');
    
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      userCount: userCount,
      adminExists: adminUser ? true : false,
      adminDetails: adminUser ? { username: adminUser.username, role: adminUser.role, email: adminUser.email } : null,
      allUsers: allUsers,
      dbName: mongoose.connection.db.databaseName
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Test endpoint for SHO creation (no auth required)
app.post('/test/sho', async (req, res) => {
  try {
    const { fullName, email, mobileNumber } = req.body;
    
    if (!fullName || !email || !mobileNumber) {
      return res.status(400).json({ 
        success: false,
        message: 'Full name, email, and mobile number are required' 
      });
    }

    const User = require('./models/User');
    const username = email.split('@')[0];
    const password = 'Sho@2024!';

    const shoData = {
      username,
      password,
      fullName,
      email,
      mobileNumber,
      role: 'sho'
    };

    console.log('Creating test SHO with data:', shoData);
    const sho = new User(shoData);
    const savedSho = await sho.save();
    
    console.log('Test SHO created successfully:', savedSho._id);

    res.json({
      success: true,
      message: 'Test SHO created successfully',
      sho: {
        id: savedSho._id,
        username: savedSho.username,
        fullName: savedSho.fullName,
        email: savedSho.email,
        mobileNumber: savedSho.mobileNumber,
        role: savedSho.role
      }
    });
  } catch (error) {
    console.error('Test SHO creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error: ' + error.message 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/sho', shoRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File too large. Maximum size allowed is 10MB.'
    });
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      message: 'Too many files. Only 1 file is allowed.'
    });
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      message: 'Only image files are allowed!'
    });
  }
  
  // Default error response
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
      ssl: true,
      tlsAllowInvalidCertificates: true,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Connected to: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔧 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0 for all IPs)');
    console.log('3. Check database credentials and cluster status');
    console.log('4. Ensure the connection string is correct');
    console.log('5. Try updating your Node.js version if using an older version');
    console.log('⚠️  Server will continue running without database connection');
    
    // Don't exit - let server continue without database
    // process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
  // Don't exit on connection errors - let server continue
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT. Graceful shutdown...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
