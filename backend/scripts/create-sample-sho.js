const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../config.env' });

// Import User model
const User = require('../models/User');

async function createSampleSHO() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if SHO already exists
    const existingSHO = await User.findOne({ role: 'sho', email: 'sho1@example.com' });
    if (existingSHO) {
      console.log('Sample SHO already exists');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create sample SHO
    const sampleSHO = new User({
      username: 'sho001',
      password: hashedPassword,
      role: 'sho',
      fullName: 'John Smith',
      email: 'sho1@example.com',
      mobileNumber: '9876543210',
      loginHistory: [
        {
          timestamp: new Date(),
          success: true,
          ip: '127.0.0.1'
        }
      ],
      lastLogin: new Date()
    });

    await sampleSHO.save();
    console.log('Sample SHO created successfully');
    console.log('Username: sho001');
    console.log('Password: password123');
    console.log('Email: sho1@example.com');

    // Create another sample SHO
    const sampleSHO2 = new User({
      username: 'sho002',
      password: hashedPassword,
      role: 'sho',
      fullName: 'Jane Doe',
      email: 'sho2@example.com',
      mobileNumber: '9876543211',
      loginHistory: [
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          success: true,
          ip: '127.0.0.1'
        }
      ],
      lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    await sampleSHO2.save();
    console.log('Second sample SHO created successfully');
    console.log('Username: sho002');
    console.log('Password: password123');
    console.log('Email: sho2@example.com');

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample SHO:', error);
    process.exit(1);
  }
}

createSampleSHO();