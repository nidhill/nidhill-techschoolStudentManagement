const UserService = require('../services/UserService');
const mongoose = require('mongoose');

class AdminController {
  static async getAllShos(req, res) {
    try {
      // Check if database is connected
      if (!this.isDatabaseConnected()) {
        console.log('Database not connected, returning empty array');
        return res.json([]);
      }

      const shos = await UserService.findByRole('sho');
      const shosWithPhotoUrl = shos.map(sho => ({
        ...sho.toObject(),
        photoUrl: sho.photo ? `http://localhost:8000/uploads/${sho.photo}` : null,
        lastLogin: sho.lastLogin,
        loginCount: sho.loginHistory ? sho.loginHistory.filter(login => login.success).length : 0,
        recentLogins: sho.loginHistory ? sho.loginHistory.slice(-5).reverse() : []
      }));
      res.json(shosWithPhotoUrl);
    } catch (error) {
      console.error('Get SHOs error:', error);
      // If it's a database connection error, return empty array instead of error
      if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
        console.log('Database connection error, returning empty array');
        return res.json([]);
      }
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async createSho(req, res) {
    try {
      console.log('Creating new SHO...');
      console.log('Request body:', req.body);
      console.log('Request file:', req.file);
      
      const { fullName, email, mobileNumber } = req.body;

      if (!fullName || !email || !mobileNumber) {
        return res.status(400).json({ 
          success: false,
          message: 'Full name, email, and mobile number are required' 
        });
      }

      // Check if database is connected
      if (!this.isDatabaseConnected()) {
        console.log('Database not connected, attempting to reconnect...');
        // Try to reconnect
        try {
          await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 15000,
            connectTimeoutMS: 10000
          });
          console.log('Database reconnected successfully');
        } catch (reconnectError) {
          console.error('Failed to reconnect to database:', reconnectError.message);
          return res.status(503).json({ 
            success: false,
            message: 'Database not available. Please try again later.' 
          });
        }
      }

      // Check if email already exists
      const existingEmail = await UserService.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already exists' 
        });
      }

      // Generate username from email (before @ symbol)
      const username = email.split('@')[0];
      
      // Generate a default password
      const password = 'Sho@2024!';

      const shoData = {
        username,
        password,
        fullName,
        email,
        mobileNumber,
        role: 'sho'
      };

      // Add photo path if uploaded
      if (req.file) {
        shoData.photo = req.file.filename;
      }

      console.log('Saving SHO data:', shoData);
      const sho = await UserService.create(shoData);
      console.log('SHO created successfully:', sho._id);

      res.status(201).json({
        success: true,
        message: 'SHO created successfully',
        sho: {
          id: sho._id,
          username: sho.username,
          fullName: sho.fullName,
          email: sho.email,
          mobileNumber: sho.mobileNumber,
          photo: sho.photo,
          photoUrl: sho.photo ? `http://localhost:8000/uploads/${sho.photo}` : null,
          role: sho.role,
          isActive: sho.isActive,
          lastLogin: sho.lastLogin,
          createdAt: sho.createdAt,
          updatedAt: sho.updatedAt
        }
      });
    } catch (error) {
      console.error('Create SHO error:', error);
      console.error('Error stack:', error.stack);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          success: false,
          message: errors.join(', ') 
        });
      }
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({ 
          success: false,
          message: `${field} already exists` 
        });
      }
      if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
        return res.status(503).json({ 
          success: false,
          message: 'Database connection error. Please try again later.' 
        });
      }
      res.status(500).json({ 
        success: false,
        message: 'Server error: ' + error.message 
      });
    }
  }

  static async updateSho(req, res) {
    try {
      const { username, password, fullName, email, mobileNumber } = req.body;
      const { id } = req.params;

      if (!username || !fullName || !email || !mobileNumber) {
        return res.status(400).json({ message: 'Username, full name, email, and mobile number are required' });
      }

      // Check if username already exists (excluding current user)
      const existingUser = await UserService.findByUsernameExcludingId(username, id);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Check if email already exists (excluding current user)
      const existingEmail = await UserService.findByEmailExcludingId(email, id);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const updateData = { 
        username, 
        fullName, 
        email, 
        mobileNumber 
      };
      
      if (password) {
        updateData.password = password;
      }

      // Add photo path if uploaded
      if (req.file) {
        updateData.photo = req.file.filename;
      }

      const sho = await UserService.updateById(id, updateData);

      if (!sho) {
        return res.status(404).json({ message: 'SHO not found' });
      }

    res.json({
      success: true,
      message: 'SHO updated successfully',
      sho: {
        ...sho.toObject(),
        photoUrl: sho.photo ? `http://localhost:8000/uploads/${sho.photo}` : null
      }
    });
    } catch (error) {
      console.error('Update SHO error:', error);
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: errors.join(', ') });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async deleteSho(req, res) {
    try {
      const { id } = req.params;

      const sho = await UserService.deleteById(id);
      if (!sho) {
        return res.status(404).json({ message: 'SHO not found' });
      }

      res.json({ message: 'SHO deleted successfully' });
    } catch (error) {
      console.error('Delete SHO error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static isDatabaseConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = AdminController;
