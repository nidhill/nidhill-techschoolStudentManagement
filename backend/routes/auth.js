const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const sendEmail = require('../utils/emailService');
const { generateOTP, generateSecureToken, hashToken } = require('../utils/tokenUtils');

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
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
        mobileNumber: req.user.mobileNumber,
        lastLogin: req.user.lastLogin,
        isActive: req.user.isActive
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: black;">
        <h1 style="color: black;">Password Reset Request</h1>
        <p style="color: black;">Hello ${user.fullName || user.username},</p>
        <p style="color: black;">You requested a password reset for your Tech account.</p>
        <p style="color: black;">Click the link below to reset your password:</p>
        <div style="margin: 20px 0;">
          <a href="${resetURL}" style="text-decoration: underline; color: blue;">
            Reset Password
          </a>
        </div>
        <p style="color: black;">This link will expire in 1 hour.</p>
        <p style="color: black;">If you didn't request this password reset, please ignore this email.</p>
        <p style="color: black;">Best regards,<br>Tech</p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: black;">
        <h1 style="color: black;">Email Verification Required</h1>
        <p style="color: black;">Hello ${user.fullName || user.username},</p>
        <p style="color: black;">You requested to update your email address for your Tech account.</p>
        <p style="color: black;">Click the link below to verify your new email address:</p>
        <div style="margin: 20px 0;">
          <a href="${verificationURL}" style="text-decoration: underline; color: blue;">
            Verify Email Address
          </a>
        </div>
        <p style="color: black;">This link will expire in 1 hour.</p>
        <p style="color: black;">If you didn't request this email change, please ignore this email.</p>
        <p style="color: black;">Best regards,<br>Tech</p>
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
    
    console.log('Email verification attempt with token:', token);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    console.log('Hashed token:', hashedToken);
    
    // First check if user already has verified email (token already used)
    const alreadyVerifiedUser = await User.findOne({
      emailVerificationToken: hashedToken,
      isEmailVerified: true
    });

    if (alreadyVerifiedUser) {
      console.log('Email already verified for user:', alreadyVerifiedUser.username);
      return res.json({ 
        message: 'Email already verified successfully',
        email: alreadyVerifiedUser.email,
        alreadyVerified: true
      });
    }

    // Check for pending verification
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
      isEmailVerified: false
    });

    console.log('Found user for verification:', user ? user.username : 'No user found');

    if (!user) {
      console.log('Token verification failed - invalid, expired, or already used');
      return res.status(400).json({ message: 'Token is invalid, expired, or already used' });
    }

    // Update user email and mark as verified
    if (user.pendingEmail) {
      console.log('Updating email from', user.email, 'to', user.pendingEmail);
      user.email = user.pendingEmail;
      user.pendingEmail = undefined;
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log('Email verification successful for user:', user.username);
    res.json({ 
      message: 'Email verified successfully',
      email: user.email,
      alreadyVerified: false
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for password reset
router.post('/send-otp-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No user found with this email address' });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to user
    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0;
    await user.save();

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: black;">
        <h1 style="color: black;">Password Reset OTP</h1>
        <p style="color: black;">Hello ${user.fullName || user.username},</p>
        <p style="color: black;">You requested a password reset for your Tech account.</p>
        <p style="color: black;">Your OTP code is:</p>
        <div style="padding: 20px; text-align: center; margin: 20px 0;">
          <h2 style="font-size: 32px; margin: 0; letter-spacing: 5px; color: black;">${otpCode}</h2>
        </div>
        <p style="color: black;">This OTP will expire in 10 minutes.</p>
        <p style="color: black;">If you didn't request this password reset, please ignore this email.</p>
        <p style="color: black;">Best regards,<br>Tech</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP - Tech School',
      html: emailHtml,
    });

    res.json({
      message: 'OTP sent to your email address',
      email: email // Return email for frontend confirmation
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and reset password
router.post('/verify-otp-reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No user found with this email address' });
    }

    // Check if OTP exists and is not expired
    if (!user.otpCode || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired or is invalid' });
    }

    // Check OTP attempts
    if (user.otpAttempts >= 3) {
      return res.status(400).json({ message: 'Too many OTP attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (user.otpCode !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // Update password and clear OTP
    user.password = newPassword; // This will be hashed by the pre-save hook
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Verify OTP reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Link email to admin account
router.post('/link-email', auth, async (req, res) => {
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

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: 'Email is already in use by another account' });
    }

    // STRICT VERIFICATION: Check if user already has a verified email
    if (user.email && user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'You already have a verified email address. Email verification is mandatory and cannot be changed without proper verification process.' 
      });
    }

    // Generate verification token
    const verificationToken = generateSecureToken();
    const verificationTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save verification token and pending email to user
    user.emailVerificationToken = hashToken(verificationToken);
    user.emailVerificationExpires = verificationTokenExpiry;
    user.pendingEmail = email; // Store the new email temporarily
    await user.save();

    // Create verification URL
    const verificationURL = `http://localhost:5000/verify-email/${verificationToken}`;

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: black;">
        <h1 style="color: black;">Email Verification Required</h1>
        <p style="color: black;">Hello ${user.fullName || user.username},</p>
        <p style="color: black;">You requested to link this email address to your Tech account.</p>
        <p style="color: black;">Click the link below to verify your email address:</p>
        <div style="margin: 20px 0;">
          <a href="${verificationURL}" style="text-decoration: underline; color: blue;">
            Verify Email Address
          </a>
        </div>
        <p style="color: black;">This link will expire in 1 hour.</p>
        <p style="color: black;">If you didn't request this email linking, please ignore this email.</p>
        <p style="color: black;">Best regards,<br>Tech</p>
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
    console.error('Link email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

