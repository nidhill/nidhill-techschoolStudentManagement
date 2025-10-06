import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UnifiedLogin from './pages/UnifiedLogin';
import ForgotPassword from './pages/ForgotPassword';
import PasswordReset from './pages/PasswordReset';
import OTPPasswordReset from './pages/OTPPasswordReset';
import EmailVerification from './pages/EmailVerification';
import AdminDashboard from './pages/AdminDashboard';
import SHODashboard from './pages/SHODashboard';
import StudentDetailPage from './pages/StudentDetailPage';
import ShoDetailPage from './pages/ShoDetailPage';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<UnifiedLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<PasswordReset />} />
            <Route path="/otp-reset" element={<OTPPasswordReset />} />
            <Route path="/verify-email/:token" element={<EmailVerification />} />
            
            {/* Legacy Route Redirects */}
            <Route path="/loginadmin" element={<Navigate to="/login" replace />} />
            <Route path="/loginsho" element={<Navigate to="/login" replace />} />
            <Route path="/loginstudent" element={<Navigate to="/login" replace />} />
            <Route path="/admin" element={<Navigate to="/login" replace />} />
            <Route path="/sho" element={<Navigate to="/login" replace />} />
            <Route path="/student" element={<Navigate to="/login" replace />} />
            
            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/sho/:shoId" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ShoDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sho/dashboard" 
              element={
                <ProtectedRoute requiredRole="sho">
                  <SHODashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sho/student/:studentId" 
              element={
                <ProtectedRoute requiredRole="sho">
                  <StudentDetailPage />
                </ProtectedRoute>
              }
            />
            
            {/* Root and Catch-all Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

