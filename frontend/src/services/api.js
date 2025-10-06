import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not a login request
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      console.log('API Interceptor: 401 error, clearing storage and redirecting');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Function to fetch students for a logged-in SHO
export const getShoStudents = async () => {
  try {
    const response = await api.get('/sho/students');
    // Backend returns { success: true, students: [...], count: number }
    return response.data.students || [];
  } catch (error) {
    console.error('Error fetching SHO students:', error);
    throw error;
  }
};

// Function to fetch admin dashboard statistics
export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Function to fetch most active SHO details
export const getMostActiveSho = async () => {
  try {
    const response = await api.get('/admin/shos/most-active');
    return response.data;
  } catch (error) {
    console.error('Error fetching most active SHO:', error);
    throw error;
  }
};

// Function to update admin profile
export const updateMyProfile = async (profileData) => {
  try {
    const response = await api.put('/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Function to change admin password
export const changeMyPassword = async (passwordData) => {
  try {
    const response = await api.put('/profile/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Function to create a new SHO
export const createSho = async (shoData) => {
  try {
    const formData = new FormData();
    formData.append('fullName', shoData.fullName);
    formData.append('email', shoData.email);
    formData.append('mobileNumber', shoData.mobileNumber);
    if (shoData.username) formData.append('username', shoData.username);
    if (shoData.password) formData.append('password', shoData.password);
    if (shoData.photo) formData.append('photo', shoData.photo);

    const response = await api.post('/admin/shos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating SHO:', error);
    throw error;
  }
};

// Function to update an SHO
export const updateSho = async (id, shoData) => {
  try {
    const formData = new FormData();
    formData.append('fullName', shoData.fullName);
    formData.append('email', shoData.email);
    formData.append('mobileNumber', shoData.mobileNumber);
    if (shoData.username) formData.append('username', shoData.username);
    if (shoData.password) formData.append('password', shoData.password);
    if (shoData.photo) formData.append('photo', shoData.photo);

    const response = await api.put(`/admin/shos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating SHO:', error);
    throw error;
  }
};

// Function to delete an SHO
export const deleteSho = async (id) => {
  try {
    const response = await api.delete(`/admin/shos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting SHO:', error);
    throw error;
  }
};

// Function to get all SHOs
export const getAllShos = async () => {
  try {
    const response = await api.get('/admin/shos');
    return response.data;
  } catch (error) {
    console.error('Error fetching SHOs:', error);
    throw error;
  }
};

// Function to get students for a specific SHO
export const getStudentsForSho = async (shoId) => {
  try {
    const response = await api.get(`/admin/shos/${shoId}/students`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students for SHO:', error);
    throw error;
  }
};

// Admin: create a student for a chosen SHO
export const adminCreateStudentForSho = async (payload) => {
  const response = await api.post('/admin/students', payload);
  return response.data;
};

// Admin: batch create students for a chosen SHO
export const adminCreateStudentsBatchForSho = async (payload) => {
  const response = await api.post('/admin/students/batch', payload);
  return response.data;
};

// Function to get single SHO by ID
export const getShoById = async (shoId) => {
  try {
    const response = await api.get(`/admin/shos/${shoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching SHO by ID:', error);
    throw error;
  }
};

// SHO Student Management API functions
export const createStudent = async (studentData) => {
  try {
    const response = await api.post('/sho/students', studentData);
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

export const getStudentDetails = async (studentId) => {
  try {
    const response = await api.get(`/sho/students/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};

export const updateStudentDetails = async (studentId, updateData) => {
  try {
    const response = await api.put(`/sho/students/${studentId}/details`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating student details:', error);
    throw error;
  }
};

// Update student profile (full profile update)
export const updateStudent = async (studentId, studentData) => {
  try {
    const response = await api.put(`/sho/students/${studentId}`, studentData);
    return response.data;
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

// Delete student
export const deleteStudent = async (studentId) => {
  try {
    const response = await api.delete(`/sho/students/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

// Attendance APIs (SHO)
export const getAttendanceForDate = async (dateStr) => {
  const response = await api.get(`/sho/attendance`, { params: { date: dateStr } });
  return response.data;
};

export const saveAttendanceForDate = async (payload) => {
  const response = await api.post('/sho/attendance', payload);
  return response.data;
};

export const getStudentAttendanceHistory = async (studentId) => {
  const response = await api.get(`/sho/students/${studentId}/attendance`);
  return response.data;
};

// Get SHO monitoring data
export const getShoMonitoringData = async () => {
  try {
    const response = await api.get('/admin/shos/monitoring');
    return response.data;
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    throw error;
  }
};

// Get all students (Admin only)
export const getAllStudents = async () => {
  try {
    const response = await api.get('/admin/students/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all students:', error);
    throw error;
  }
};

// Send email verification link for updating email
export const sendEmailVerification = async (payload) => {
  try {
    const response = await api.post('/auth/send-email-verification', payload);
    return response.data;
  } catch (error) {
    console.error('Error sending email verification:', error);
    throw error;
  }
};

// Send OTP for password reset
export const sendOTPReset = async (email) => {
  try {
    const response = await api.post('/auth/send-otp-reset', { email });
    return response.data;
  } catch (error) {
    console.error('Error sending OTP reset:', error);
    throw error;
  }
};

// Verify OTP and reset password
export const verifyOTPReset = async (email, otp, newPassword) => {
  try {
    const response = await api.post('/auth/verify-otp-reset', { email, otp, newPassword });
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP reset:', error);
    throw error;
  }
};

// Link email to account
export const linkEmail = async (email, password) => {
  try {
    const response = await api.post('/auth/link-email', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error linking email:', error);
    throw error;
  }
};

export default api;

