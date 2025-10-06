// Middleware to enforce email verification for certain operations
const requireEmailVerification = (req, res, next) => {
  const user = req.user;
  
  // Skip for admin users
  if (user.role === 'admin') return next();
  
  // For SHO and students, require email verification
  if ((user.role === 'sho' || user.role === 'student') && !user.isEmailVerified) {
    return res.status(403).json({ 
      message: 'Email verification required. Please verify your email address before proceeding.',
      requiresEmailVerification: true
    });
  }
  
  next();
};

module.exports = { requireEmailVerification };
