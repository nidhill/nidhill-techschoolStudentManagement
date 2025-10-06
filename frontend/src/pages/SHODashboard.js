import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getShoStudents, createStudent, changeMyPassword, getAttendanceForDate, saveAttendanceForDate, updateMyProfile as updateMyProfileApi } from '../services/api';
import EmailLinking from '../components/EmailLinking';

const SHODashboard = () => {
  const { user, logout, updateProfile, refreshAuth } = useAuth();
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '' });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const avatarInputRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to logout');
    }
  };

  // Sync profile form with user
  useEffect(() => {
    setProfileForm({ fullName: user?.fullName || '', email: user?.email || '' });
  }, [user]);

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      updateProfile({ photoUrl: url });
      showToastNotification('Profile photo updated', 'success');
    } catch (err) {
      showToastNotification('Failed to update photo', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      await changeMyPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error'); // 'error' or 'success'
  const [showBatchEntryModal, setShowBatchEntryModal] = useState(false);
  const [batchData, setBatchData] = useState('');
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ total: 0, last7: 0, last30: 0 });
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    students: []
  });
  const [attendanceStatus, setAttendanceStatus] = useState('present'); // 'present', 'absent', 'late'
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    email: '',
    mobileNumber: '',
    domain: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    parentDetails: {
      fatherName: '',
      fatherContact: '',
      motherName: '',
      motherContact: ''
    },
    guardianDetails: {
      guardianName: '',
      guardianRelationship: '',
      guardianContact: ''
    },
    address: {
      houseNo: '',
      postOffice: '',
      district: '',
      pincode: '',
      village: '',
      taluk: ''
    },
    education: {
      qualification: '',
      collegeOrSchool: ''
    },
    workExperience: {
      hasExperience: false,
      companyName: '',
      designation: ''
    }
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getShoStudents();
        setStudents(Array.isArray(data) ? data : (data?.students || []));
      } catch (err) {
        setStudents([]);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested object updates
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      mobileNumber: '',
      domain: '',
      dateOfBirth: '',
      age: '',
      gender: '',
      parentDetails: {
        fatherName: '',
        fatherContact: '',
        motherName: '',
        motherContact: ''
      },
      guardianDetails: {
        guardianName: '',
        guardianRelationship: '',
        guardianContact: ''
      },
      address: {
        houseNo: '',
        postOffice: '',
        district: '',
        pincode: '',
        village: '',
        taluk: ''
      },
      education: {
        qualification: '',
        collegeOrSchool: ''
      },
      workExperience: {
        hasExperience: false,
        companyName: '',
        designation: ''
      }
    });
  };

  const openCreateStudentModal = () => {
    resetForm();
    setShowCreateStudentModal(true);
    setError('');
    setSuccess('');
  };

  const openStudentProfile = (student) => {
    setSelectedStudent(student);
    // Generate simple mock attendance for last 60 days
    const history = Array.from({ length: 60 }).map((_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      present: Math.random() > 0.2
    }));
    setStudentAttendance(history);
    const now = new Date();
    const total = history.filter(h => h.present).length;
    const last7 = history.filter(h => (now - h.date) <= 7 * 24 * 60 * 60 * 1000 && h.present).length;
    const last30 = history.filter(h => (now - h.date) <= 30 * 24 * 60 * 60 * 1000 && h.present).length;
    setAttendanceSummary({ total, last7, last30 });
    setShowStudentModal(true);
  };

  const closeStudentProfile = () => {
    setShowStudentModal(false);
    setSelectedStudent(null);
    setStudentAttendance([]);
    setAttendanceSummary({ total: 0, last7: 0, last30: 0 });
  };

  const closeCreateStudentModal = () => {
    setShowCreateStudentModal(false);
    resetForm();
    setError('');
    setSuccess('');
  };

  const openBatchEntryModal = () => {
    setShowBatchEntryModal(true);
    setBatchData('');
    setError('');
    setSuccess('');
  };

  const closeBatchEntryModal = () => {
    setShowBatchEntryModal(false);
    setBatchData('');
    setError('');
    setSuccess('');
  };

  const handleBatchEntry = async (e) => {
    e.preventDefault();
    setBatchProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Parse CSV-like data
      const lines = batchData.trim().split('\n');
      const students = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Expected format: Email,Mobile,Domain,Batch,FullName,RegisterNumber,Gender,DateOfBirth
        const parts = line.split(',').map(part => part.trim());
        
        if (parts.length < 8) {
          throw new Error(`Line ${i + 1}: Insufficient data. Expected format: Email,Mobile,Domain,Batch,FullName,RegisterNumber,Gender,DateOfBirth`);
        }
        
        const [email, mobile, domain, batch, fullName, registerNumber, gender, dateOfBirth] = parts;
        
        // Validate email
        if (!email.includes('@')) {
          throw new Error(`Line ${i + 1}: Invalid email format`);
        }
        
        // Validate mobile (10 digits)
        if (!/^\d{10}$/.test(mobile)) {
          throw new Error(`Line ${i + 1}: Mobile number must be 10 digits`);
        }
        
        // Calculate age from date of birth
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        const studentData = {
          email,
          mobileNumber: mobile,
          domain,
          batch,
          fullName,
          registerNumber,
          gender,
          dateOfBirth,
          age,
          isActive: true,
          // Set default values for required fields
          parentDetails: {
            fatherName: 'Not Provided',
            fatherContact: mobile,
            motherName: 'Not Provided',
            motherContact: mobile
          },
          guardianDetails: {
            guardianName: 'Not Provided',
            guardianRelationship: 'Parent',
            guardianContact: mobile
          },
          address: {
            houseNo: 'Not Provided',
            postOffice: 'Not Provided',
            district: 'Not Provided',
            pincode: '000000',
            village: 'Not Provided',
            taluk: 'Not Provided'
          },
          education: {
            qualification: 'Not Provided',
            collegeOrSchool: 'Not Provided'
          },
          workExperience: {
            hasExperience: false,
            companyName: '',
            designation: ''
          }
        };
        
        students.push(studentData);
      }
      
      // Create students one by one
      let successCount = 0;
      let errorCount = 0;
      
      for (const studentData of students) {
        try {
          await createStudent(studentData);
          successCount++;
        } catch (error) {
          console.error('Error creating student:', error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        setSuccess(`Successfully created ${successCount} students${errorCount > 0 ? `. ${errorCount} students failed.` : ''}`);
        closeBatchEntryModal();
        // Refresh student list
        window.location.reload();
      } else {
        setError('Failed to create any students. Please check the data format.');
      }
      
    } catch (error) {
      setError(error.message || 'Failed to process batch entry');
    } finally {
      setBatchProcessing(false);
    }
  };
  
  // Render student profile modal with attendance summary
  const renderStudentModal = () => {
    if (!showStudentModal || !selectedStudent) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.fullName || selectedStudent.name}</h3>
            <button onClick={closeStudentProfile} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600">Total Present (60 days)</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceSummary.total}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600">Present (Last 7 days)</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceSummary.last7}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600">Present (Last 30 days)</p>
              <p className="text-2xl font-semibold text-gray-900">{attendanceSummary.last30}</p>
            </div>
          </div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Recent Attendance</h4>
            <div className="grid grid-cols-7 gap-2">
              {studentAttendance.slice(0, 28).map((d, idx) => (
                <div key={idx} className={`h-6 rounded ${d.present ? 'bg-green-500' : 'bg-red-400'}`}></div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Green = Present, Red = Absent (last 28 days)</p>
          </div>
        </div>
      </div>
    );
  };

  // Attendance marking functions
  const openAttendanceModal = async () => {
    const selectedDate = new Date().toISOString().split('T')[0];
    const studentsWithDefault = students.map(student => ({ ...student, attendanceStatus: 'present' }));
    setAttendanceData({ date: selectedDate, students: studentsWithDefault });
    setShowAttendanceModal(true);

    try {
      const res = await getAttendanceForDate(selectedDate);
      const records = res?.attendance?.records || [];
      if (records.length > 0) {
        const statusMap = new Map(records.map(r => [String(r.student), r.status]));
        setAttendanceData(prev => ({
          ...prev,
          students: prev.students.map(s => ({
            ...s,
            attendanceStatus: statusMap.get(String(s.id)) || 'present'
          }))
        }));
      }
    } catch (e) {
      // ignore if none
    }
  };

  const closeAttendanceModal = () => {
    setShowAttendanceModal(false);
    setAttendanceData({
      date: new Date().toISOString().split('T')[0],
      students: []
    });
  };

  const updateStudentAttendance = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      students: prev.students.map(student => 
        student.id === studentId ? { ...student, attendanceStatus: status } : student
      )
    }));
  };

  const markAllPresent = () => {
    setAttendanceData(prev => ({
      ...prev,
      students: prev.students.map(student => ({ ...student, attendanceStatus: 'present' }))
    }));
  };

  const markAllAbsent = () => {
    setAttendanceData(prev => ({
      ...prev,
      students: prev.students.map(student => ({ ...student, attendanceStatus: 'absent' }))
    }));
  };

  const saveAttendance = async () => {
    try {
      setLoading(true);
      const payload = {
        date: attendanceData.date,
        records: attendanceData.students.map(s => ({ student: s.id, status: s.attendanceStatus || 'present' }))
      };
      const res = await saveAttendanceForDate(payload);
      if (!res?.success) throw new Error(res?.message || 'Failed');
      const presentCount = attendanceData.students.filter(s => s.attendanceStatus === 'present').length;
      const absentCount = attendanceData.students.filter(s => s.attendanceStatus === 'absent').length;
      const lateCount = attendanceData.students.filter(s => s.attendanceStatus === 'late').length;
      setSuccess(`Attendance saved! Present: ${presentCount}, Absent: ${absentCount}, Late: ${lateCount}`);
      showToastNotification('Attendance saved successfully', 'success');
      closeAttendanceModal();
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to save attendance. Please try again.');
      showToastNotification('Failed to save attendance. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search students
  const filteredStudents = students && Array.isArray(students) ? students.filter(student => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      (student.name || student.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.registerNumber || student.regNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Domain filter
    const matchesDomain = domainFilter === 'all' || 
      (student.domain || '').toLowerCase().includes(domainFilter.toLowerCase());

    // Batch filter
    const matchesBatch = batchFilter === 'all' || 
      (student.batch || '').toLowerCase().includes(batchFilter.toLowerCase());

    return matchesSearch && matchesDomain && matchesBatch;
  }) : [];

  // Get unique values for filter options
  const uniqueDomains = students && Array.isArray(students) ? 
    [...new Set(students.map(student => student.domain).filter(Boolean))] : [];
  
  const uniqueBatches = students && Array.isArray(students) ? 
    [...new Set(students.map(student => student.batch).filter(Boolean))] : [];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDomainFilter('all');
    setBatchFilter('all');
  };


  // Helper function to check if a field is empty
  const isFieldEmpty = (field) => {
    return !formData[field] || formData[field] === '';
  };


  // Toast notification function
  const showToastNotification = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation with helpful field names
    const fieldLabels = {
      'email': 'Email Id',
      'mobileNumber': 'Mobile No',
      'domain': 'Domain',
      'dateOfBirth': 'Date of Birth',
      'age': 'Age',
      'gender': 'Gender'
    };
    
    const requiredFields = [
      'email', 'mobileNumber', 'domain', 
      'dateOfBirth', 'age', 'gender'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      const missingFieldLabels = missingFields.map(field => fieldLabels[field] || field);
      const errorMsg = `Please fill in these required fields: ${missingFieldLabels.join(', ')}`;
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    // Validate nested objects with specific field names
    const parentFields = [];
    if (!formData.parentDetails?.fatherName || formData.parentDetails.fatherName.trim() === '') parentFields.push('Father\'s Name');
    if (!formData.parentDetails?.fatherContact || formData.parentDetails.fatherContact.trim() === '') parentFields.push('Father\'s Contact');
    if (!formData.parentDetails?.motherName || formData.parentDetails.motherName.trim() === '') parentFields.push('Mother\'s Name');
    if (!formData.parentDetails?.motherContact || formData.parentDetails.motherContact.trim() === '') parentFields.push('Mother\'s Contact');
    
    if (parentFields.length > 0) {
      const errorMsg = `Please fill in these parent details: ${parentFields.join(', ')}`;
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    const guardianFields = [];
    if (!formData.guardianDetails?.guardianName || formData.guardianDetails.guardianName.trim() === '') guardianFields.push('Guardian\'s Name');
    if (!formData.guardianDetails?.guardianRelationship || formData.guardianDetails.guardianRelationship.trim() === '') guardianFields.push('Guardian\'s Relationship');
    if (!formData.guardianDetails?.guardianContact || formData.guardianDetails.guardianContact.trim() === '') guardianFields.push('Guardian\'s Contact');
    
    if (guardianFields.length > 0) {
      const errorMsg = `Please fill in these guardian details: ${guardianFields.join(', ')}`;
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    const addressFields = [];
    if (!formData.address?.houseNo || formData.address.houseNo.trim() === '') addressFields.push('House Number');
    if (!formData.address?.postOffice || formData.address.postOffice.trim() === '') addressFields.push('Post Office');
    if (!formData.address?.district || formData.address.district.trim() === '') addressFields.push('District');
    if (!formData.address?.pincode || formData.address.pincode.trim() === '') addressFields.push('Pincode');
    if (!formData.address?.village || formData.address.village.trim() === '') addressFields.push('Village');
    if (!formData.address?.taluk || formData.address.taluk.trim() === '') addressFields.push('Taluk');
    
    if (addressFields.length > 0) {
      const errorMsg = `Please fill in these address details: ${addressFields.join(', ')}`;
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    const educationFields = [];
    if (!formData.education?.qualification || formData.education.qualification.trim() === '') educationFields.push('Highest Qualification');
    if (!formData.education?.collegeOrSchool || formData.education.collegeOrSchool.trim() === '') educationFields.push('College/School Name');
    
    if (educationFields.length > 0) {
      const errorMsg = `Please fill in these education details: ${educationFields.join(', ')}`;
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    // Additional format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      const errorMsg = 'Please enter a valid 10-digit mobile number (without +91, spaces, or dashes)';
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    // Validate parent contact numbers
    const parentContactRegex = /^[0-9]{10}$/;
    if (!parentContactRegex.test(formData.parentDetails.fatherContact)) {
      const errorMsg = 'Please enter a valid 10-digit father\'s contact number';
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }
    if (!parentContactRegex.test(formData.parentDetails.motherContact)) {
      const errorMsg = 'Please enter a valid 10-digit mother\'s contact number';
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    // Validate guardian contact number
    if (!parentContactRegex.test(formData.guardianDetails.guardianContact)) {
      const errorMsg = 'Please enter a valid 10-digit guardian\'s contact number';
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    // Validate pincode
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(formData.address.pincode)) {
      const errorMsg = 'Please enter a valid 6-digit pincode';
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    // Basic age validation (only check if it's a number)
    if (isNaN(formData.age)) {
      const errorMsg = 'Please enter a valid age';
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting student data:', formData);
      const result = await createStudent(formData);
      
      if (result.success) {
        const successMsg = 'Student created successfully!';
        setSuccess(successMsg);
        showToastNotification(successMsg, 'success');
        closeCreateStudentModal();
        // Refresh the students list
        const studentsData = await getShoStudents();
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } else {
        const errorMsg = result.message || 'Failed to create student';
        setError(errorMsg);
        showToastNotification(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMsg;
      if (error.response?.data?.message === 'registerNumber already exists') {
        errorMsg = `Register number "${formData.registerNumber}" is already assigned to another student. Please use a different register number.`;
      } else {
        errorMsg = error.response?.data?.message || 'Failed to create student';
      }
      
      setError(errorMsg);
      showToastNotification(errorMsg, 'error');
      
      // Focus the register number field if it's a duplicate
      if (error.response?.data?.message === 'registerNumber already exists') {
        const registerNumberInput = document.getElementById('registerNumber');
        if (registerNumberInput) {
          registerNumberInput.focus();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-6 right-6 z-[9999] max-w-sm w-full bg-white rounded-xl shadow-2xl border-l-4 ${
          toastType === 'error' ? 'border-red-500' : 'border-green-500'
        }`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toastType === 'error' ? (
                  <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className={`text-base font-semibold ${
                  toastType === 'error' ? 'text-red-800' : 'text-green-800'
                }`}>
                  {toastMessage}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowToast(false)}
                  className={`inline-flex rounded-md p-2 ${
                    toastType === 'error' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 shadow-lg p-6">
        {/* Branding */}
        <div className="mb-12">
          <div className="flex items-center space-x-3">
            <img src="https://i.postimg.cc/qqGCCxTY/Gemini-Generated-Image-fjxk9ifjxk9ifjxk.png" alt="Tech School" className="h-10 w-auto" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white border-l-4 border-blue-500'
                : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
            <span className="text-lg font-medium">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white border-l-4 border-blue-500'
                : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-lg font-medium">Students</span>
          </button>
          
          {/* Profile & Settings moved to header avatar */}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <div className="flex justify-end items-center mb-8">
          {/* Profile menu on avatar */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu((v) => !v)}
              className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-haspopup="true"
              aria-expanded={showProfileMenu}
            >
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              ) : (
              <span className="text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'S'}
              </span>
              )}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Profile
                </button>
                <button
                  onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Settings
                </button>
                <button
                  onClick={() => { setActiveTab('email'); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Email Settings
                </button>
                <button
                  onClick={() => { avatarInputRef.current?.click(); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                >
                  Change Photo
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
                >
                  Logout
                </button>
            </div>
            )}
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <div 
            className="h-48 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: '#3B82F6'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-blue-700/80"></div>
            <div className="relative h-full flex flex-col justify-center items-start p-8">
              <h2 className="text-4xl font-bold text-white mb-2">SHO Dashboard</h2>
              <p className="text-xl text-white/90">
                Manage student activities and information efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Overview</h3>
            <p className="text-gray-600 mb-6">Manage student activities and track their progress.</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-800">{students.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Students</p>
                    <p className="text-2xl font-semibold text-gray-800">{students.filter(s => s.isActive !== false).length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                    <p className="text-2xl font-semibold text-gray-800">85%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => setActiveTab('students')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Manage Students
              </button>
            </div>
          </div>
        )}


        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center space-x-3 shadow-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center space-x-3 shadow-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Students Management Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Management</h1>
                <p className="text-gray-600">Manage and track your assigned students</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={openAttendanceModal}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>Mark Attendance</span>
                </button>
              <button
                onClick={openCreateStudentModal}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Student</span>
              </button>
              
              {/* Batch Entry button removed as requested */}
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Domain Filter */}
                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Domains</option>
                  {uniqueDomains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>

                {/* Batch Filter */}
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Batches</option>
                  {uniqueBatches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>

              {/* Filter Summary and Clear Button */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {filteredStudents.length} of {students?.length || 0} students
                  {(searchTerm || domainFilter !== 'all' || batchFilter !== 'all') && (
                    <span className="ml-2 text-blue-600">
                      (filtered)
                    </span>
                  )}
                </div>
                {(searchTerm || domainFilter !== 'all' || batchFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* Students Grid */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              {!students || !Array.isArray(students) || students.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                    <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg">No students assigned yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Add Student" to get started.</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                    <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg">No students match your search criteria.</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredStudents.map((student, index) => (
                    <Link
                      key={student.id || index}
                      to={`/sho/student/${student.id || index}`}
                      className="group bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                    >
                      {/* Photo and Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-300">
                          {student.photo ? (
                            <img 
                              src={student.photo} 
                              alt={student.fullName || 'Student'} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('Image failed to load:', student.photo);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600"
                            style={{ display: student.photo ? 'none' : 'flex' }}
                          >
                            {(student.name || student.fullName || 'S').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              student.isActive !== false 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            student.isActive !== false ? 'bg-green-600' : 'bg-red-600'
                          }`}></span>
                              {student.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                      </div>

                      {/* Name and Email */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {student.name || student.fullName || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{student.email || 'N/A'}</p>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{student.registerNumber || student.regNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>{student.course || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                          Click to view details
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit functionality
                            }}
                            className="p-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Delete functionality
                            }}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile Management</h1>
              <p className="text-gray-600">Manage your SHO profile information and settings</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    {user?.photoUrl ? (
                      <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-xl">{user?.username?.charAt(0).toUpperCase() || 'S'}</span>
                    )}
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs flex items-center justify-center"
                    title="Change photo"
                  >
                    Change
                  </button>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">{user?.fullName || user?.username}</h4>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500">Student Happiness Officer</p>
                </div>
              </div>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e)=>e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e)=>setProfileForm(prev=>({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e)=>setProfileForm(prev=>({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value="Student Happiness Officer"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
              <div className="mt-6">
                <button 
                  type="button" 
                  onClick={async()=>{ 
                    try{ 
                      setLoading(true); 
                      const res = await updateMyProfileApi({ fullName: profileForm.fullName, email: profileForm.email }); 
                      if (res?.success) {
                        updateProfile({ fullName: res.user?.fullName || profileForm.fullName, email: res.user?.email || profileForm.email });
                        refreshAuth(); 
                        setSuccess(res?.message || 'Profile updated successfully'); 
                        showToastNotification('Profile updated successfully', 'success');
                      } else {
                        throw new Error(res?.message || 'Failed to update profile');
                      }
                    } catch(err){ 
                      const msg = err?.response?.data?.message || err?.message || 'Failed to update profile';
                      setError(msg); 
                      showToastNotification(msg, 'error');
                    } finally{ 
                      setLoading(false);
                    } 
                  }} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors" 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="mt-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
              <p className="text-gray-600">Configure your dashboard preferences and account settings</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 font-medium">Email Notifications</p>
                      <p className="text-gray-600 text-sm">Receive email updates about student activities</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 font-medium">Dark Mode</p>
                      <p className="text-gray-600 text-sm">Use dark theme for the interface</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Security</h4>
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Change Password
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Marking Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Mark Attendance</h3>
              <div className="flex items-center space-x-4">
                {/* Date Selection */}
                <input
                  type="date"
                  value={attendanceData.date}
                  onChange={(e) => setAttendanceData(prev => ({ ...prev, date: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={closeAttendanceModal}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex space-x-3 mb-6">
              <button
                onClick={markAllPresent}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Mark All Present</span>
              </button>
              <button
                onClick={markAllAbsent}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Mark All Absent</span>
              </button>
              <button
                onClick={() => {
                  setAttendanceData(prev => ({
                    ...prev,
                    students: prev.students.map(student => ({ ...student, attendanceStatus: 'late' }))
                  }));
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Mark All Late</span>
              </button>
            </div>

            {/* Students Grid - Pinterest Style */}
            <div className="mb-6">
              <div className="grid grid-cols-5 gap-4">
                {attendanceData.students.map((student, index) => (
                  <div key={student.id || index} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                    {/* Profile Picture */}
                    <div className="flex justify-center mb-3">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 overflow-hidden">
                        {student.photo ? (
                          <img 
                            src={student.photo} 
                            alt={student.fullName || 'Student'} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('Attendance modal - Image failed to load:', student.photo);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span 
                          className="text-xl font-bold text-gray-600"
                          style={{ display: student.photo ? 'none' : 'flex' }}
                        >
                          {(student.name || student.fullName || 'S').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Student Name */}
                    <div className="text-center mb-3">
                      <h4 className="font-medium text-gray-800 text-sm leading-tight">
                        {student.name || student.fullName || 'Unknown'}
                      </h4>
                    </div>
                    
                    {/* P/A/L Status Indicators */}
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => updateStudentAttendance(student.id || index, 'present')}
                        className={`w-8 h-8 rounded-full border-2 transition-colors flex items-center justify-center text-xs font-bold ${
                          student.attendanceStatus === 'present'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-green-100 hover:border-green-300'
                        }`}
                        title="Present"
                      >
                        P
                      </button>
                      <button
                        onClick={() => updateStudentAttendance(student.id || index, 'absent')}
                        className={`w-8 h-8 rounded-full border-2 transition-colors flex items-center justify-center text-xs font-bold ${
                          student.attendanceStatus === 'absent'
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-red-100 hover:border-red-300'
                        }`}
                        title="Absent"
                      >
                        A
                      </button>
                      <button
                        onClick={() => updateStudentAttendance(student.id || index, 'late')}
                        className={`w-8 h-8 rounded-full border-2 transition-colors flex items-center justify-center text-xs font-bold ${
                          student.attendanceStatus === 'late'
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-orange-100 hover:border-orange-300'
                        }`}
                        title="Late"
                      >
                        L
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceData.students.filter(s => s.attendanceStatus === 'present').length}
                    </div>
                    <div className="text-sm text-gray-600">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {attendanceData.students.filter(s => s.attendanceStatus === 'absent').length}
                    </div>
                    <div className="text-sm text-gray-600">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {attendanceData.students.filter(s => s.attendanceStatus === 'late').length}
                    </div>
                    <div className="text-sm text-gray-600">Late</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {attendanceData.students.length}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeAttendanceModal}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAttendance}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                )}
                <span>Save Attendance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setError('');
                }}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-3 shadow-sm">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                disabled={loading}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {showCreateStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Student</h3>
              <button
                onClick={closeCreateStudentModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Assign to SHO (display only for SHO portal) */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Assign to SHO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selected SHO</label>
                    <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                      <option value={user?.id}>{user?.fullName || user?.username || 'You'}</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Students will be assigned to this SHO.</p>
                  </div>
                </div>
              </div>
              {/* Form Instructions removed as requested */}

              {/* Success Message */}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    <div>
                      <strong>Success:</strong> {success}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    <div>
                      <strong>Error:</strong> {error}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Personal Details Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Id *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile No *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isFieldEmpty('mobileNumber') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domain *
                    </label>
                    <select
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Domain</option>
                      <option value="MERN Stack">MERN Stack</option>
                      <option value="Flutter">Flutter</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java</option>
                      <option value="React Native">React Native</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="DevOps">DevOps</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Family Details Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Family Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's Name *
                    </label>
                    <input
                      type="text"
                      name="parentDetails.fatherName"
                      value={formData.parentDetails.fatherName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Father's Contact *
                    </label>
                    <input
                      type="tel"
                      name="parentDetails.fatherContact"
                      value={formData.parentDetails.fatherContact}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mother's Name *
                    </label>
                    <input
                      type="text"
                      name="parentDetails.motherName"
                      value={formData.parentDetails.motherName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mother's Contact *
                    </label>
                    <input
                      type="tel"
                      name="parentDetails.motherContact"
                      value={formData.parentDetails.motherContact}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Guardian Details Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Guardian Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guardian's Name *
                    </label>
                    <input
                      type="text"
                      name="guardianDetails.guardianName"
                      value={formData.guardianDetails.guardianName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship *
                    </label>
                    <input
                      type="text"
                      name="guardianDetails.guardianRelationship"
                      value={formData.guardianDetails.guardianRelationship}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Uncle, Aunt, Brother"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guardian's Contact *
                    </label>
                    <input
                      type="tel"
                      name="guardianDetails.guardianContact"
                      value={formData.guardianDetails.guardianContact}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Address for Communication</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      House No *
                    </label>
                    <input
                      type="text"
                      name="address.houseNo"
                      value={formData.address.houseNo}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Post Office *
                    </label>
                    <input
                      type="text"
                      name="address.postOffice"
                      value={formData.address.postOffice}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District *
                    </label>
                    <input
                      type="text"
                      name="address.district"
                      value={formData.address.district}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{6}"
                      placeholder="123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Village *
                    </label>
                    <input
                      type="text"
                      name="address.village"
                      value={formData.address.village}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taluk *
                    </label>
                    <input
                      type="text"
                      name="address.taluk"
                      value={formData.address.taluk}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                      </div>

              {/* Educational Background Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Educational Background</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Highest Qualification *
                    </label>
                    <input
                      type="text"
                      name="education.qualification"
                      value={formData.education.qualification}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., B.Tech, B.Sc, Diploma"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                      </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name of College/School *
                    </label>
                    <input
                      type="text"
                      name="education.collegeOrSchool"
                      value={formData.education.collegeOrSchool}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>
                  </div>
                </div>

              {/* Work Experience Section */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h4>
                <div className="space-y-4">
                    <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="workExperience.hasExperience"
                      checked={formData.workExperience.hasExperience}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Any Work Experience?
                    </label>
                  </div>

                  {formData.workExperience.hasExperience && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          name="workExperience.companyName"
                          value={formData.workExperience.companyName}
                          onChange={handleInputChange}
                          required={formData.workExperience.hasExperience}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Designation *
                        </label>
                        <input
                          type="text"
                          name="workExperience.designation"
                          value={formData.workExperience.designation}
                          onChange={handleInputChange}
                          required={formData.workExperience.hasExperience}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeCreateStudentModal}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Creating Student...' : 'Create Student'}
                </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Settings Tab */}
        {activeTab === 'email' && (
          <div className="mt-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Email Settings</h1>
              <p className="text-gray-600">Link email address to your account for password reset</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <EmailLinking 
                user={user} 
                onEmailLinked={(email) => {
                  setSuccess(`Email ${email} linked successfully! Please check your email for verification.`);
                }}
              />
            </div>
          </div>
        )}

      {/* Batch Entry Modal removed as requested */}

      {renderStudentModal()}
    </div>
  );
};

export default SHODashboard;