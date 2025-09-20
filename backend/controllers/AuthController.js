const jwt = require('jsonwebtoken');
const UserService = require('../services/UserService');

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const user = await UserService.findByUsername(username);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Track failed login attempt
        await user.trackLogin(
          req.ip || req.connection.remoteAddress,
          req.get('User-Agent'),
          false
        );
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Track successful login
      await user.trackLogin(
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent'),
        true
      );

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          fullName: user.fullName,
          email: user.email,
          lastLogin: user.lastLogin
        }
      });
      console.log(token);
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      res.json({
        user: {
          id: req.user._id,
          username: req.user.username,
          role: req.user.role
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = AuthController;
