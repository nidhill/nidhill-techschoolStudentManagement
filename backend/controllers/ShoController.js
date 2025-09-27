const UserService = require('../services/UserService');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');

class ShoController {
  // Create a new student and assign to the logged-in SHO
  static async createStudent(req, res) {
    try {
      console.log('Creating new student...');
      console.log('Request body:', req.body);
      console.log('Logged-in SHO ID:', req.user.id);

      const {
        email,
        mobileNumber,
        domain,
        dateOfBirth,
        age,
        gender,
        parentDetails,
        guardianDetails,
        address,
        education,
        workExperience
      } = req.body;

      // Validate required fields
      if (!email || !mobileNumber || !domain || !dateOfBirth || !age || !gender) {
        return res.status(400).json({
          success: false,
          message: 'Email, mobile number, domain, date of birth, age, and gender are required'
        });
      }

      // Validate parent details
      if (!parentDetails || !parentDetails.fatherName || !parentDetails.fatherContact || 
          !parentDetails.motherName || !parentDetails.motherContact) {
        return res.status(400).json({
          success: false,
          message: 'Parent details (father name, father contact, mother name, mother contact) are required'
        });
      }

      // Validate guardian details
      if (!guardianDetails || !guardianDetails.guardianName || !guardianDetails.guardianRelationship || 
          !guardianDetails.guardianContact) {
        return res.status(400).json({
          success: false,
          message: 'Guardian details (name, relationship, contact) are required'
        });
      }

      // Validate address details
      if (!address || !address.houseNo || !address.postOffice || !address.district || 
          !address.pincode || !address.village || !address.taluk) {
        return res.status(400).json({
          success: false,
          message: 'Complete address details (house no, post office, district, pincode, village, taluk) are required'
        });
      }

      // Validate education details
      if (!education || !education.qualification || !education.collegeOrSchool) {
        return res.status(400).json({
          success: false,
          message: 'Education details (qualification, college/school name) are required'
        });
      }

      // Validate work experience if hasExperience is true
      if (workExperience && workExperience.hasExperience) {
        if (!workExperience.companyName || !workExperience.designation) {
          return res.status(400).json({
            success: false,
            message: 'Company name and designation are required when work experience is selected'
          });
        }
      }

      // Validate SHO ID
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Validate ObjectId format for assignedSho
      if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid SHO ID format'
        });
      }

      // Generate a unique username based on email
      const baseUsername = email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      
      // Check if username already exists and generate a unique one
      let existingUsername = await UserService.findByUsername(username);
      while (existingUsername) {
        username = `${baseUsername}${counter}`;
        existingUsername = await UserService.findByUsername(username);
        counter++;
      }

      // Check if email already exists
      const existingEmail = await UserService.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }


      // Set the default password for all students
      const studentData = {
        username: username, // Use generated username
        password: 'hacatechschool', // Default password
        role: 'student',
        email,
        mobileNumber,
        domain,
        dateOfBirth: new Date(dateOfBirth),
        age: parseInt(age),
        gender,
        parentDetails: {
          fatherName: parentDetails.fatherName,
          fatherContact: parentDetails.fatherContact,
          motherName: parentDetails.motherName,
          motherContact: parentDetails.motherContact
        },
        guardianDetails: {
          guardianName: guardianDetails.guardianName,
          guardianRelationship: guardianDetails.guardianRelationship,
          guardianContact: guardianDetails.guardianContact
        },
        address: {
          houseNo: address.houseNo,
          postOffice: address.postOffice,
          district: address.district,
          pincode: address.pincode,
          village: address.village,
          taluk: address.taluk
        },
        education: {
          qualification: education.qualification,
          collegeOrSchool: education.collegeOrSchool
        },
        workExperience: {
          hasExperience: workExperience ? workExperience.hasExperience : false,
          companyName: workExperience && workExperience.hasExperience ? workExperience.companyName : '',
          designation: workExperience && workExperience.hasExperience ? workExperience.designation : ''
        },
        assignedSho: req.user.id, // Assign to the logged-in SHO
        // Legacy field for backward compatibility
        parentName: parentDetails.fatherName,
        // Initialize tracking fields with default values
        pointTracker: {
          week1: 0,
          week2: 0,
          week3: 0,
          week4: 0,
          week5: 0,
          week6: 0,
          week7: 0,
          week8: 0
        },
        review: {
          reviewWeek1: '',
          reviewWeek2: '',
          reviewWeek3: '',
          reviewWeek4: '',
          reviewWeek5: '',
          reviewWeek6: '',
          reviewWeek7: '',
          reviewWeek8: ''
        },
        participation: '',
        linkedinPlanner: {
          profileCreation: '',
          connections: '',
          posts: '',
          networking: ''
        },
        communication: '',
        attendance: '',
        presentation: {
          topic: '',
          score: '',
          feedback: '',
          date: null
        }
      };

      console.log('Student data to be created:', JSON.stringify(studentData, null, 2));
      
      const newStudent = await UserService.create(studentData);

      console.log('Student created successfully:', newStudent._id);

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        student: {
          id: newStudent._id,
          username: newStudent.username,
          email: newStudent.email,
          mobileNumber: newStudent.mobileNumber,
          domain: newStudent.domain,
          dateOfBirth: newStudent.dateOfBirth,
          age: newStudent.age,
          gender: newStudent.gender,
          parentDetails: newStudent.parentDetails,
          guardianDetails: newStudent.guardianDetails,
          address: newStudent.address,
          education: newStudent.education,
          workExperience: newStudent.workExperience,
          assignedSho: newStudent.assignedSho
        }
      });

    } catch (error) {
      console.error('Create student error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
      }
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get all students assigned to the logged-in SHO
  static async getMyStudents(req, res) {
    try {
      console.log('Fetching students for SHO:', req.user.id);

      const students = await UserService.findByAssignedSho(req.user.id);

      // Transform the data to include only necessary fields
      const studentsData = students.map(student => ({
        id: student._id,
        username: student.username,
        fullName: student.fullName,
        email: student.email,
        mobileNumber: student.mobileNumber,
        registerNumber: student.registerNumber,
        course: student.course,
        semester: student.semester,
        batch: student.batch,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        parentName: student.parentName,
        assignedSho: student.assignedSho,
        isActive: student.isActive,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        // Include summary of tracking data
        pointTracker: student.pointTracker,
        attendance: student.attendance,
        participation: student.participation
      }));

      console.log(`Found ${studentsData.length} students for SHO`);

      res.json({
        success: true,
        students: studentsData,
        count: studentsData.length
      });

    } catch (error) {
      console.error('Get my students error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Get detailed information about a specific student
  static async getStudentDetails(req, res) {
    try {
      const { id } = req.params;
      console.log('Fetching student details for ID:', id);

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const student = await UserService.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if the student is assigned to the logged-in SHO
      if (student.assignedSho.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This student is not assigned to you.'
        });
      }

      // Return complete student data, including personal detail sections with safe defaults
      const studentData = {
        id: student._id,
        username: student.username,
        fullName: student.fullName,
        email: student.email,
        mobileNumber: student.mobileNumber,
        photo: student.photo,
        registerNumber: student.registerNumber,
        course: student.course,
        semester: student.semester,
        batch: student.batch,
        domain: student.domain,
        dateOfBirth: student.dateOfBirth,
        age: student.age,
        gender: student.gender,
        address: student.address || { houseNo: '', postOffice: '', district: '', pincode: '', village: '', taluk: '' },
        parentDetails: student.parentDetails || { fatherName: '', fatherContact: '', motherName: '', motherContact: '' },
        guardianDetails: student.guardianDetails || { guardianName: '', guardianRelationship: '', guardianContact: '' },
        education: student.education || { qualification: '', collegeOrSchool: '' },
        workExperience: student.workExperience || { hasExperience: false, companyName: '', designation: '' },
        parentName: student.parentName,
        assignedSho: student.assignedSho,
        isActive: student.isActive,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        // Complete tracking data
        pointTracker: student.pointTracker,
        review: student.review,
        participation: student.participation,
        linkedinPlanner: student.linkedinPlanner,
        communication: student.communication,
        attendance: student.attendance,
        presentation: student.presentation
      };

      res.json({
        success: true,
        student: studentData
      });

    } catch (error) {
      console.error('Get student details error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update student profile information (full profile update)
  static async updateStudent(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log('Updating student profile for ID:', id);
      console.log('Update data:', updateData);

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const student = await UserService.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if the student is assigned to the logged-in SHO
      if (student.assignedSho.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This student is not assigned to you.'
        });
      }

      // Check for duplicate username if username is being updated
      if (updateData.username && updateData.username !== student.username) {
        const existingUsername = await UserService.findByUsername(updateData.username);
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: 'Username already exists'
          });
        }
      }

      // Check for duplicate email if email is being updated
      if (updateData.email && updateData.email !== student.email) {
        const existingEmail = await UserService.findByEmail(updateData.email);
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      // Check for duplicate register number if register number is being updated
      if (updateData.registerNumber && updateData.registerNumber !== student.registerNumber) {
        const existingRegisterNumber = await UserService.findByRegisterNumber(updateData.registerNumber);
        if (existingRegisterNumber) {
          return res.status(400).json({
            success: false,
            message: 'Register number already exists'
          });
        }
      }

      // Convert dateOfBirth to Date object if provided
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }

      // Convert age to number if provided
      if (updateData.age) {
        updateData.age = parseInt(updateData.age);
      }

      // Update the student
      const updatedStudent = await UserService.updateById(id, updateData);

      if (!updatedStudent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update student'
        });
      }

      console.log('Student profile updated successfully');

      res.json({
        success: true,
        message: 'Student profile updated successfully',
        student: {
          id: updatedStudent._id,
          username: updatedStudent.username,
          fullName: updatedStudent.fullName,
          email: updatedStudent.email,
          mobileNumber: updatedStudent.mobileNumber,
          domain: updatedStudent.domain,
          dateOfBirth: updatedStudent.dateOfBirth,
          age: updatedStudent.age,
          gender: updatedStudent.gender,
          photo: updatedStudent.photo,
          parentDetails: updatedStudent.parentDetails,
          guardianDetails: updatedStudent.guardianDetails,
          address: updatedStudent.address,
          education: updatedStudent.education,
          workExperience: updatedStudent.workExperience,
          registerNumber: updatedStudent.registerNumber,
          course: updatedStudent.course,
          semester: updatedStudent.semester,
          batch: updatedStudent.batch,
          updatedAt: updatedStudent.updatedAt
        }
      });

    } catch (error) {
      console.error('Update student profile error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
      }
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Save or update daily attendance for all students of SHO
  static async saveAttendance(req, res) {
    try {
      const { date, records } = req.body; // records: [{ student, status }]

      if (!date || !Array.isArray(records)) {
        return res.status(400).json({ success: false, message: 'date and records are required' });
      }

      const attDate = new Date(date);

      // Upsert attendance by SHO and date
      const doc = await Attendance.findOneAndUpdate(
        { sho: req.user.id, date: attDate },
        { $set: { records } },
        { new: true, upsert: true }
      );

      return res.json({ success: true, message: 'Attendance saved', attendance: doc });
    } catch (error) {
      console.error('Save attendance error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  // Get attendance for a date
  static async getAttendance(req, res) {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ success: false, message: 'date query param is required (YYYY-MM-DD)' });
      }
      const day = new Date(date);
      const start = new Date(day.setHours(0,0,0,0));
      const end = new Date(day.setHours(23,59,59,999));

      const record = await Attendance.findOne({ sho: req.user.id, date: { $gte: start, $lte: end } }).lean();
      return res.json({ success: true, attendance: record || null });
    } catch (error) {
      console.error('Get attendance error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  // Get attendance history for a specific student (all dates for this SHO)
  static async getAttendanceHistory(req, res) {
    try {
      const { id } = req.params; // student id
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid student ID' });
      }

      // Find all attendance docs for this SHO and project the student's record
      const docs = await Attendance.find({ sho: req.user.id }, { date: 1, records: 1 }).lean();
      const history = [];
      for (const doc of docs) {
        const rec = (doc.records || []).find(r => String(r.student) === String(id));
        if (rec) {
          history.push({ date: doc.date, status: rec.status });
        }
      }

      // Sort by date descending
      history.sort((a, b) => new Date(b.date) - new Date(a.date));

      return res.json({ success: true, history });
    } catch (error) {
      console.error('Get attendance history error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  // Delete a student
  static async deleteStudent(req, res) {
    try {
      const { id } = req.params;
      console.log('Deleting student with ID:', id);

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const student = await UserService.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if the student is assigned to the logged-in SHO
      if (student.assignedSho.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This student is not assigned to you.'
        });
      }

      // Delete the student
      const deletedStudent = await UserService.deleteById(id);

      if (!deletedStudent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete student'
        });
      }

      console.log('Student deleted successfully');

      res.json({
        success: true,
        message: 'Student deleted successfully',
        student: {
          id: deletedStudent._id,
          fullName: deletedStudent.fullName,
          username: deletedStudent.username
        }
      });

    } catch (error) {
      console.error('Delete student error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // Update student details (tracking data, reviews, etc.)
  static async updateStudentDetails(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log('Updating student details for ID:', id);
      console.log('Update data:', updateData);

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
      }

      const student = await UserService.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if the student is assigned to the logged-in SHO
      if (student.assignedSho.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This student is not assigned to you.'
        });
      }

      // Define allowed fields for update (only tracking and review data)
      const allowedFields = [
        'pointTracker',
        'review',
        'participation',
        'linkedinPlanner',
        'communication',
        'attendance',
        'presentation',
        'course',
        'semester',
        'batch'
      ];

      // Filter update data to only include allowed fields
      const filteredUpdateData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdateData[key] = updateData[key];
        }
      });

      // Validate point tracker values if provided
      if (filteredUpdateData.pointTracker) {
        const pointTracker = filteredUpdateData.pointTracker;
        Object.keys(pointTracker).forEach(week => {
          const value = pointTracker[week];
          if (value !== null && value !== undefined && (value < 0 || value > 100)) {
            return res.status(400).json({
              success: false,
              message: `Point tracker value for ${week} must be between 0 and 100`
            });
          }
        });
      }

      // Update the student
      const updatedStudent = await UserService.updateById(id, filteredUpdateData);

      if (!updatedStudent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update student'
        });
      }

      console.log('Student updated successfully');

      res.json({
        success: true,
        message: 'Student details updated successfully',
        student: {
          id: updatedStudent._id,
          fullName: updatedStudent.fullName,
          pointTracker: updatedStudent.pointTracker,
          review: updatedStudent.review,
          participation: updatedStudent.participation,
          linkedinPlanner: updatedStudent.linkedinPlanner,
          communication: updatedStudent.communication,
          attendance: updatedStudent.attendance,
          presentation: updatedStudent.presentation,
          course: updatedStudent.course,
          semester: updatedStudent.semester,
          batch: updatedStudent.batch,
          updatedAt: updatedStudent.updatedAt
        }
      });

    } catch (error) {
      console.error('Update student details error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}

module.exports = ShoController;
