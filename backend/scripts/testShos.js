const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: '../config.env' });

const testShos = [
  {
    username: 'john_doe',
    password: 'password123',
    fullName: 'John Doe',
    email: 'john.doe@techschool.com',
    mobileNumber: '9876543210',
    role: 'sho'
  },
  {
    username: 'jane_smith',
    password: 'password123',
    fullName: 'Jane Smith',
    email: 'jane.smith@techschool.com',
    mobileNumber: '9876543211',
    role: 'sho'
  },
  {
    username: 'mike_wilson',
    password: 'password123',
    fullName: 'Mike Wilson',
    email: 'mike.wilson@techschool.com',
    mobileNumber: '9876543212',
    role: 'sho'
  }
];

const createTestShos = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing test SHOs
    await User.deleteMany({ role: 'sho' });
    console.log('Cleared existing SHOs');

    // Create test SHOs
    for (const shoData of testShos) {
      const hashedPassword = await bcrypt.hash(shoData.password, 10);
      const sho = new User({
        ...shoData,
        password: hashedPassword
      });
      await sho.save();
      console.log(`Created SHO: ${shoData.fullName} (${shoData.username})`);
    }

    console.log('\n=== TEST SHOs CREATED ===');
    testShos.forEach(sho => {
      console.log(`${sho.fullName}: ${sho.username} / ${sho.password}`);
    });
    console.log('========================\n');

  } catch (error) {
    console.error('Error creating test SHOs:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestShos();
