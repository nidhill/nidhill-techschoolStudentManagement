const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const sendEmail = require('../utils/emailService');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt:', { username, password: '***' });

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.username, user.role);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password match successful for user:', username);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token generated successfully');

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
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
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No user found with this email address' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token to user
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetURL = `http://localhost:5000/reset-password/${resetToken}`;

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Hello ${user.fullName || user.username},</p>
        <p>You requested a password reset for your Tech School account.</p>
        <p>Click the link below to reset your password:</p>
        <div style="margin: 20px 0;">
          <a href="${resetURL}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>Tech School Admin Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - Tech School',
      html: emailHtml,
    });

    res.json({
      message: 'Password reset link sent to your email address'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify reset token route
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    res.json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password route
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    // Update password
    user.password = newPassword; // This will be hashed by the pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send email verification
router.post('/send-email-verification', auth, async (req, res) => {
  try {
    const { email, password } = req.body;
    const userId = req.user.id;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Verify current password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save verification token and pending email to user
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    user.emailVerificationExpires = verificationTokenExpiry;
    user.pendingEmail = email; // Store the new email temporarily
    await user.save();

    // Create verification URL
    const verificationURL = `http://localhost:5000/verify-email/${verificationToken}`;

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Email Verification Required</h1>
        <p>Hello ${user.fullName || user.username},</p>
        <p>You requested to update your email address for your Tech School account.</p>
        <p>Click the link below to verify your new email address:</p>
        <div style="margin: 20px 0;">
          <a href="${verificationURL}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this email change, please ignore this email.</p>
        <p>Best regards,<br>Tech School Admin Team</p>
      </div>
    `;

    await sendEmail({
      email: email,
      subject: 'Email Verification Required - Tech School',
      html: emailHtml,
    });

    res.json({
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    // Update user email and mark as verified
    if (user.pendingEmail) {
      user.email = user.pendingEmail;
      user.pendingEmail = undefined;
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ 
      message: 'Email verified successfully',
      email: user.email 
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

