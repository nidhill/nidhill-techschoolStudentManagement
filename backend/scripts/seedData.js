const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: './config.env' });

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ 
      username: { $in: ['admin', 'student', 'testsho'] } 
    });
    console.log('Cleared existing test users');

    // Create test accounts
    const testUsers = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        fullName: 'Admin User',
        email: 'admin@techschool.com'
      },
      {
        username: 'student',
        password: 'student123',
        role: 'student',
        fullName: 'Test Student',
        email: 'student@techschool.com'
      },
      {
        username: 'testsho',
        password: 'sho123',
        role: 'sho',
        fullName: 'Test SHO',
        email: 'sho@techschool.com',
        mobileNumber: '1234567890'
      }
    ];

    // Create all test users
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`${userData.role.toUpperCase()} user created:`, userData.username);
    }

    console.log('\n=== TEST ACCOUNTS CREATED ===');
    console.log('Admin: admin / admin123');
    console.log('Student: student / student123');
    console.log('SHO: testsho / sho123');
    console.log('=============================\n');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();

