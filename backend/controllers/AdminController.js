const UserService = require('../services/UserService');
const mongoose = require('mongoose');
const sendEmail = require('../utils/emailService');

class AdminController {
  static async getAllShos(req, res) {
    try {
      console.log('getAllShos called - starting to fetch SHOs...');
      const shos = await UserService.findByRole('sho');
      console.log('Found SHOs:', shos ? shos.length : 0);
      
      const shosWithPhotoUrl = shos.map(sho => ({
        ...sho.toObject(),
        id: sho._id.toString(),
        photoUrl: sho.photo ? `http://localhost:8000/uploads/${sho.photo}` : null,
        lastLogin: sho.lastLogin,
        loginCount: sho.loginHistory ? sho.loginHistory.filter(login => login.success).length : 0,
        recentLogins: sho.loginHistory ? sho.loginHistory.slice(-5).reverse() : []
      }));
      
      console.log('Processed SHOs with photo URLs:', shosWithPhotoUrl.length);
      res.json(shosWithPhotoUrl);
    } catch (error) {
      console.error('Get SHOs error:', error);
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
      
      // Generate a secure password
      const password = `${username}@${Math.floor(1000 + Math.random() * 9000)}`; // e.g., username@1234

      const shoData = {
        username,
        password,
        fullName,
        email,
        mobileNumber,
        role: 'sho',
        isEmailVerified: true // Admin-created SHOs are pre-verified
      };

      // Add photo path if uploaded
      if (req.file) {
        shoData.photo = req.file.filename;
      }

      console.log('Saving SHO data:', shoData);
      const sho = await UserService.create(shoData);
      console.log('SHO created successfully:', sho._id);

      // Send email with credentials
      try {
        const emailHtml = `
          <h1>Welcome to TechSchool!</h1>
          <p>Hello ${fullName},</p>
          <p>An account has been created for you to access the SHO Dashboard.</p>
          <p>Please use the following credentials to log in:</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>For security reasons, we recommend changing your password after your first login.</p>
          <p>Best regards,<br>TechSchool Admin Team</p>
        `;

        await sendEmail({
          email: email,
          subject: 'Your SHO Dashboard Account Credentials',
          html: emailHtml,
        });

        console.log('Login credentials sent to SHO successfully.');
      } catch (emailError) {
        console.error('Error sending email to SHO:', emailError);
        // Don't block the process if email fails
      }

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

      if (!fullName || !email || !mobileNumber) {
        return res.status(400).json({ message: 'Full name, email, and mobile number are required' });
      }

      // Generate username from email if not provided
      const finalUsername = username || email.split('@')[0];

      // Check if username already exists (excluding current user)
      const existingUser = await UserService.findByUsernameExcludingId(finalUsername, id);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Check if email already exists (excluding current user)
      const existingEmail = await UserService.findByEmailExcludingId(email, id);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const updateData = { 
        username: finalUsername, 
        fullName, 
        email, 
        mobileNumber,
        isEmailVerified: true // Admin-updated emails remain verified
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

  static async getDashboardStats(req, res) {
    try {
      // Get all SHOs
      const shos = await UserService.findByRole('sho');
      const shoCount = shos.length;

      res.json({
        success: true,
        data: {
          shoCount
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      
      res.status(500).json({ 
        success: false,
        message: 'Server error while fetching dashboard statistics' 
      });
    }
  }

  static async getMostActiveSho(req, res) {
    try {
      // Get all SHOs
      const shos = await UserService.findByRole('sho');
      
      if (!shos || shos.length === 0) {
        return res.json({
          success: true,
          data: null,
          message: 'No SHOs found'
        });
      }

      // Sort SHOs by login count (descending order)
      const sortedShos = shos.sort((a, b) => {
        const aLoginCount = a.loginHistory ? a.loginHistory.length : 0;
        const bLoginCount = b.loginHistory ? b.loginHistory.length : 0;
        return bLoginCount - aLoginCount;
      });

      const mostActiveSho = sortedShos[0];
      const loginCount = mostActiveSho.loginHistory ? mostActiveSho.loginHistory.length : 0;

      // Format the response with photo URL
      const shoData = {
        ...mostActiveSho.toObject(),
        photoUrl: mostActiveSho.photo ? `http://localhost:8000/uploads/${mostActiveSho.photo}` : null,
        loginCount: loginCount,
        lastLogin: mostActiveSho.lastLogin,
        recentLogins: mostActiveSho.loginHistory ? mostActiveSho.loginHistory.slice(-5).reverse() : []
      };

      res.json({
        success: true,
        data: shoData,
        message: 'Most active SHO retrieved successfully'
      });
    } catch (error) {
      console.error('Get most active SHO error:', error);
      
      res.status(500).json({ 
        success: false,
        message: 'Server error while fetching most active SHO' 
      });
    }
  }

  static async getShoById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'SHO ID is required'
        });
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid SHO ID format'
        });
      }

      // Find the SHO by ID
      const sho = await UserService.findById(id);

      if (!sho) {
        return res.status(404).json({
          success: false,
          message: 'SHO not found'
        });
      }

      // Check if the user is actually a SHO
      if (sho.role !== 'sho') {
        return res.status(404).json({
          success: false,
          message: 'User is not a SHO'
        });
      }

      // Format the response with all SHO details
      const shoDetails = {
        id: sho._id.toString(),
        fullName: sho.fullName || 'N/A',
        email: sho.email || 'N/A',
        username: sho.username || 'N/A',
        mobileNumber: sho.mobileNumber || 'N/A',
        photoUrl: sho.photo ? `http://localhost:8000/uploads/${sho.photo}` : null,
        isActive: sho.isActive !== false,
        role: sho.role,
        createdAt: sho.createdAt,
        lastLogin: sho.lastLogin,
        loginCount: sho.loginHistory ? sho.loginHistory.filter(login => login.success).length : 0,
        loginHistory: sho.loginHistory || [],
        recentLogins: sho.loginHistory ? sho.loginHistory.slice(-10).reverse() : []
      };

      res.json({
        success: true,
        data: shoDetails,
        message: 'SHO details retrieved successfully'
      });
    } catch (error) {
      console.error('Get SHO by ID error:', error);

      // Handle database connection errors
      if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
        console.log('Database connection error');
        return res.status(500).json({
          success: false,
          message: 'Database connection error'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while fetching SHO details'
      });
    }
  }

  static async getStudentsBySho(req, res) {
    try {
      const { shoId } = req.params;

      if (!shoId) {
        return res.status(400).json({
          success: false,
          message: 'SHO ID is required'
        });
      }

      // Find all students assigned to this SHO
      const students = await UserService.findByRole('student');
      const studentsOfSho = students.filter(student =>
        student.assignedSho && student.assignedSho.toString() === shoId
      );

      // Format the response
      const formattedStudents = studentsOfSho.map(student => ({
        id: student._id.toString(),
        fullName: student.fullName || 'N/A',
        email: student.email || 'N/A',
        registerNumber: student.registerNumber || 'N/A',
        username: student.username,
        mobileNumber: student.mobileNumber || 'N/A',
        isActive: student.isActive !== false,
        createdAt: student.createdAt
      }));

      res.json({
        success: true,
        data: formattedStudents,
        count: formattedStudents.length,
        message: `Found ${formattedStudents.length} students assigned to this SHO`
      });
    } catch (error) {
      console.error('Get students by SHO error:', error);

      // Handle database connection errors
      if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
        console.log('Database connection error, returning empty array');
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'Database connection error'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while fetching students for SHO'
      });
    }
  }

  static async getAllStudents(req, res) {
    try {
      // Find all students and populate their assigned SHO details
      const students = await UserService.getUserModel().find({ role: 'student' })
        .populate('assignedSho', 'fullName email username')
        .sort({ createdAt: -1 })
        .exec();

      const studentsWithDetails = students.map(student => ({
        ...student.toObject(),
        id: student._id.toString(),
        assignedShoName: student.assignedSho ? student.assignedSho.fullName : 'Not Assigned',
        assignedShoUsername: student.assignedSho ? student.assignedSho.username : null,
        totalPoints: student.pointTracker ? 
          Object.values(student.pointTracker).reduce((sum, points) => sum + (points || 0), 0) : 0,
        averagePoints: student.pointTracker ? 
          (Object.values(student.pointTracker).reduce((sum, points) => sum + (points || 0), 0) / 8).toFixed(1) : 0,
        lastLoginFormatted: student.lastLogin ? student.lastLogin.toLocaleDateString() : 'Never',
        createdAtFormatted: student.createdAt ? student.createdAt.toLocaleDateString() : 'Unknown'
      }));

      res.json(studentsWithDetails);
    } catch (error) {
      console.error('Get all students error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Server error while fetching students'
      });
    }
  }

  static async deleteAllStudents(req, res) {
    try {
      const User = UserService.getUserModel();
      const result = await User.deleteMany({ role: 'student' });
      return res.json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
      console.error('Delete all students error:', error);
      return res.status(500).json({ success: false, message: 'Server error while deleting students' });
    }
  }

  static async createStudentForSho(req, res) {
    try {
      const User = UserService.getUserModel();
      const {
        assignedSho, email, mobileNumber, domain, batch,
        fullName, registerNumber, gender, dateOfBirth
      } = req.body;

      if (!assignedSho || !email || !mobileNumber || !domain || !batch || !gender || !dateOfBirth) {
        return res.status(400).json({ success: false, message: 'assignedSho, email, mobileNumber, domain, batch, gender, dateOfBirth are required' });
      }

      if (!mongoose.Types.ObjectId.isValid(assignedSho)) {
        return res.status(400).json({ success: false, message: 'Invalid SHO ID' });
      }

      // Ensure unique username from email
      const base = email.split('@')[0];
      let username = base;
      let counter = 1;
      // eslint-disable-next-line no-constant-condition
      while (await UserService.findByUsername(username)) {
        username = `${base}${counter++}`;
      }

      if (await UserService.findByEmail(email)) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      const studentDoc = await UserService.create({
        role: 'student',
        username,
        password: 'hacatechschool',
        fullName: fullName || undefined,
        email,
        mobileNumber,
        domain,
        batch,
        registerNumber: registerNumber || undefined,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        assignedSho,
        isEmailVerified: false, // Students can have unverified emails
        pointTracker: { week1:0, week2:0, week3:0, week4:0, week5:0, week6:0, week7:0, week8:0 },
        review: { reviewWeek1:'',reviewWeek2:'',reviewWeek3:'',reviewWeek4:'',reviewWeek5:'',reviewWeek6:'',reviewWeek7:'',reviewWeek8:'' },
        linkedinPlanner: { profileCreation:'', connections:'', posts:'', networking:'' },
        participation: '',
        communication: '',
        attendance: '',
        presentation: { topic:'', score:'', feedback:'', date: null }
      });

      return res.status(201).json({
        success: true,
        message: 'Student created',
        student: { id: studentDoc._id, username: studentDoc.username, email: studentDoc.email }
      });
    } catch (error) {
      console.error('Create student for SHO error:', error);
      if (error.code === 11000) {
        return res.status(400).json({ success:false, message: 'Duplicate key error' });
      }
      return res.status(500).json({ success:false, message: 'Server error' });
    }
  }

  static async createStudentsBatchForSho(req, res) {
    try {
      const User = UserService.getUserModel();
      const { assignedSho, students } = req.body;

      if (!assignedSho || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success:false, message: 'assignedSho and students[] are required' });
      }
      if (!mongoose.Types.ObjectId.isValid(assignedSho)) {
        return res.status(400).json({ success:false, message: 'Invalid SHO ID' });
      }

      const results = { created: 0, errors: [] };
      for (let i = 0; i < students.length; i++) {
        const s = students[i];
        try {
          const base = s.email.split('@')[0];
          let username = base;
          let counter = 1;
          // eslint-disable-next-line no-await-in-loop
          while (await UserService.findByUsername(username)) {
            username = `${base}${counter++}`;
          }
          // eslint-disable-next-line no-await-in-loop
          if (await UserService.findByEmail(s.email)) {
            throw new Error('Email already exists');
          }
          // eslint-disable-next-line no-await-in-loop
          await UserService.create({
            role: 'student',
            username,
            password: 'hacatechschool',
            fullName: s.fullName,
            email: s.email,
            mobileNumber: s.mobileNumber,
            domain: s.domain,
            batch: s.batch,
            registerNumber: s.registerNumber,
            gender: s.gender,
            dateOfBirth: new Date(s.dateOfBirth),
            assignedSho
          });
          results.created += 1;
        } catch (err) {
          results.errors.push({ line: i + 1, email: s.email, message: err.message });
        }
      }

      return res.json({ success:true, ...results });
    } catch (error) {
      console.error('Batch create students error:', error);
      return res.status(500).json({ success:false, message:'Server error' });
    }
  }

  static async getShoMonitoringData(req, res) {
    try {
      // Get all SHOs with their student counts
      const shos = await UserService.findByRole('sho');
      
      const monitoringData = await Promise.all(shos.map(async (sho) => {
        // Count students assigned to this SHO
        const totalStudents = await UserService.getUserModel().countDocuments({
          role: 'student',
          assignedSho: sho._id
        });

        // Count active students (those who have logged in recently)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeStudents = await UserService.getUserModel().countDocuments({
          role: 'student',
          assignedSho: sho._id,
          lastLogin: { $gte: thirtyDaysAgo }
        });

        // Pending students are those who haven't logged in yet or logged in more than 30 days ago
        const pendingStudents = totalStudents - activeStudents;

        return {
          ...sho.toObject(),
          id: sho._id.toString(),
          photoUrl: sho.photo ? `http://localhost:8000/uploads/${sho.photo}` : null,
          currentStudentCount: activeStudents,
          pendingStudentCount: pendingStudents,
          totalStudentCount: totalStudents,
          lastActivity: sho.lastLogin,
          isActive: sho.isActive
        };
      }));

      res.json(monitoringData);
    } catch (error) {
      console.error('Get monitoring data error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Server error while fetching monitoring data'
      });
    }
  }

}

module.exports = AdminController;
