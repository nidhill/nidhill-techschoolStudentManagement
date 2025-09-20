class User {
  constructor(data = {}) {
    this.id = data.id || data._id || null;
    this.username = data.username || '';
    this.password = data.password || '';
    this.fullName = data.fullName || '';
    this.email = data.email || '';
    this.mobileNumber = data.mobileNumber || '';
    this.role = data.role || '';
    this.photo = data.photo || null;
    this.photoUrl = data.photoUrl || null;
    this.isActive = data.isActive !== false; // Default to true
    this.lastLogin = data.lastLogin || null;
    this.loginCount = data.loginCount || 0;
    this.recentLogins = data.recentLogins || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  // Validation methods
  validate() {
    const errors = [];
    
    if (!this.fullName.trim()) {
      errors.push('Full name is required');
    }
    
    if (!this.username.trim()) {
      errors.push('Username is required');
    } else if (this.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (!this.password.trim()) {
      errors.push('Password is required');
    } else if (this.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (!this.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!this.mobileNumber.trim()) {
      errors.push('Mobile number is required');
    } else if (!/^[0-9]{10}$/.test(this.mobileNumber)) {
      errors.push('Mobile number must be exactly 10 digits');
    }
    
    return errors;
  }

  validateForUpdate() {
    const errors = [];
    
    if (!this.fullName.trim()) {
      errors.push('Full name is required');
    }
    
    if (!this.username.trim()) {
      errors.push('Username is required');
    } else if (this.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }
    
    if (this.password && this.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (!this.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!this.mobileNumber.trim()) {
      errors.push('Mobile number is required');
    } else if (!/^[0-9]{10}$/.test(this.mobileNumber)) {
      errors.push('Mobile number must be exactly 10 digits');
    }
    
    return errors;
  }

  // Convert to plain object for API calls
  toObject() {
    return {
      username: this.username,
      password: this.password,
      fullName: this.fullName,
      email: this.email,
      mobileNumber: this.mobileNumber,
      role: this.role,
      photo: this.photo,
      photoUrl: this.photoUrl,
      isActive: this.isActive
    };
  }

  // Create from API response
  static fromApiResponse(data) {
    return new User(data);
  }

  // Get display name
  getDisplayName() {
    return this.fullName || this.username;
  }

  // Get status text
  getStatusText() {
    return this.isActive ? 'Active' : 'Inactive';
  }

  // Get photo URL
  getPhotoUrl() {
    if (this.photoUrl) {
      return this.photoUrl;
    }
    if (this.photo) {
      return `http://localhost:8000/uploads/${this.photo}`;
    }
    return null;
  }

  // Get formatted last login time
  getLastLoginText() {
    if (!this.lastLogin) {
      return 'Never logged in';
    }
    
    const lastLogin = new Date(this.lastLogin);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastLogin) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 10080) {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return lastLogin.toLocaleDateString() + ' ' + lastLogin.toLocaleTimeString();
    }
  }

  // Get login status
  getLoginStatus() {
    if (!this.lastLogin) {
      return { text: 'Never logged in', color: 'text-gray-500' };
    }
    
    const lastLogin = new Date(this.lastLogin);
    const now = new Date();
    const diffInHours = (now - lastLogin) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return { text: 'Online', color: 'text-green-600' };
    } else if (diffInHours < 24) {
      return { text: 'Active today', color: 'text-blue-600' };
    } else if (diffInHours < 168) {
      return { text: 'Active this week', color: 'text-yellow-600' };
    } else {
      return { text: 'Inactive', color: 'text-red-600' };
    }
  }

  // Get recent login summary
  getRecentLoginSummary() {
    if (!this.recentLogins || this.recentLogins.length === 0) {
      return 'No recent activity';
    }
    
    const successfulLogins = this.recentLogins.filter(login => login.success);
    const failedLogins = this.recentLogins.filter(login => !login.success);
    
    return {
      total: this.recentLogins.length,
      successful: successfulLogins.length,
      failed: failedLogins.length,
      lastAttempt: this.recentLogins[0] ? new Date(this.recentLogins[0].loginTime) : null
    };
  }
}

export default User;
