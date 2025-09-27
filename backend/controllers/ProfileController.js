const UserService = require('../services/UserService');
const bcrypt = require('bcryptjs');

class ProfileController {
  static async updateMyProfile(req, res) {
    try {
      const { fullName, email } = req.body;
      const userId = req.user.id; // ID of the logged-in user

      if (!fullName || !email) {
        return res.status(400).json({ message: 'Full name and email are required' });
      }

      // Check if email already exists for another user
      const existingEmailUser = await UserService.findByEmailExcludingId(email, userId);
      if (existingEmailUser) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }

      const updatedUser = await UserService.updateById(userId, { fullName, email });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async changeMyPassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      // Find user with password hash
      const user = await UserService.findByIdWithPassword(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword; // The pre-save hook will hash the password
      await user.save();

      res.json({ 
        success: true, 
        message: 'Password changed successfully' 
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  }
}

module.exports = ProfileController;
