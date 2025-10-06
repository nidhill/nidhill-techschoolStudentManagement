const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

async function setupAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-dashboard');
    console.log('Connected to MongoDB');

    // Clear all existing users
    console.log('Clearing all existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} users`);

    // Create admin user
    console.log('Creating admin user...');
    const adminUser = new User({
      username: 'admin',
      password: 'techschool', // This will be automatically hashed by the pre-save hook
      fullName: 'Admin User',
      email: process.env.EMAIL_USER || 'admin@techschool.com',
      mobileNumber: '1234567890',
      role: 'admin',
      isActive: true,
      isEmailVerified: true // Admin email is pre-verified
    });

    // Save the user (password will be hashed automatically)
    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: techschool');

  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the setup
setupAdmin();
