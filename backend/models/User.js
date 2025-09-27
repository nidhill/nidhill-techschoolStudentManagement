const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'sho', 'student'],
    required: true
  },
  fullName: {
    type: String,
    required: function() {
      return this.role === 'sho';
    },
    trim: true
  },
  email: {
    type: String,
    required: function() {
      return this.role === 'sho' || this.role === 'student';
    },
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  mobileNumber: {
    type: String,
    required: function() {
      return this.role === 'sho' || this.role === 'student';
    },
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  photo: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginHistory: [{
    loginTime: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    success: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Password reset fields
  passwordResetToken: {
    type: String,
    default: undefined
  },
  passwordResetExpires: {
    type: Date,
    default: undefined
  },
  
  // Email verification fields
  emailVerificationToken: {
    type: String,
    default: undefined
  },
  emailVerificationExpires: {
    type: Date,
    default: undefined
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  pendingEmail: {
    type: String,
    default: undefined
  },
  
  // Student-specific fields
  assignedSho: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'student';
    }
  },
  
  // Personal details
  domain: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    trim: true
  },
  
  // Parent Details
  parentDetails: {
    fatherName: {
      type: String,
      trim: true
    },
    fatherContact: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    motherName: {
      type: String,
      trim: true
    },
    motherContact: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    }
  },
  
  // Guardian Details
  guardianDetails: {
    guardianName: {
      type: String,
      trim: true
    },
    guardianRelationship: {
      type: String,
      trim: true
    },
    guardianContact: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    }
  },
  
  // Address Details
  address: {
    houseNo: {
      type: String,
      trim: true
    },
    postOffice: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
    },
    village: {
      type: String,
      trim: true
    },
    taluk: {
      type: String,
      trim: true
    }
  },
  
  // Educational Background
  education: {
    qualification: {
      type: String,
      trim: true
    },
    collegeOrSchool: {
      type: String,
      trim: true
    }
  },
  
  // Work Experience
  workExperience: {
    hasExperience: {
      type: Boolean,
      default: false
    },
    companyName: {
      type: String,
      trim: true,
      default: ''
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Legacy fields for backward compatibility
  parentName: {
    type: String,
    trim: true
  },
  
  // Academic tracking
  pointTracker: {
    week1: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    week2: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    week3: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    week4: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    week5: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    week6: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    week7: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    week8: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Weekly reviews
  review: {
    reviewWeek1: {
      type: String,
      default: '',
      trim: true
    },
    reviewWeek2: {
      type: String,
      default: '',
      trim: true
    },
    reviewWeek3: {
      type: String,
      default: '',
      trim: true
    },
    reviewWeek4: {
      type: String,
      default: '',
      trim: true
    },
    reviewWeek5: {
      type: String,
      default: '',
      trim: true
    },
    reviewWeek6: {
      type: String,
      default: '',
      trim: true
    },
    reviewWeek7: {
      type: String,
      default: '',
      trim: true
    },
    reviewWeek8: {
      type: String,
      default: '',
      trim: true
    }
  },
  
  // Participation tracking
  participation: {
    type: String,
    default: '',
    trim: true
  },
  
  // LinkedIn profile management
  linkedinPlanner: {
    profileCreation: {
      type: String,
      default: '',
      trim: true
    },
    connections: {
      type: String,
      default: '',
      trim: true
    },
    posts: {
      type: String,
      default: '',
      trim: true
    },
    networking: {
      type: String,
      default: '',
      trim: true
    }
  },
  
  // Communication skills
  communication: {
    type: String,
    default: '',
    trim: true
  },
  
  // Attendance tracking
  attendance: {
    type: String,
    default: '',
    trim: true
  },
  
  // Presentation skills
  presentation: {
    topic: {
      type: String,
      default: '',
      trim: true
    },
    score: {
      type: String,
      default: '',
      trim: true
    },
    feedback: {
      type: String,
      default: '',
      trim: true
    },
    date: {
      type: Date,
      default: null
    }
  },
  
  // Additional student fields
  registerNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows null values but ensures uniqueness when present
    trim: true
  },
  
  course: {
    type: String,
    default: '',
    trim: true
  },
  
  semester: {
    type: String,
    default: '',
    trim: true
  },
  
  batch: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Track login attempt
userSchema.methods.trackLogin = function(ipAddress, userAgent, success = true) {
  this.lastLogin = new Date();
  this.loginHistory.push({
    loginTime: new Date(),
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    success: success
  });
  
  // Keep only last 50 login attempts
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
