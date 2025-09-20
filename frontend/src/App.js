import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import SHODashboard from './pages/SHODashboard';
import StudentDashboard from './pages/StudentDashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            {/* Public Login Routes */}
            <Route path="/loginadmin" element={<Login portalType="admin" />} />
            <Route path="/loginsho" element={<Login portalType="sho" />} />
            <Route path="/loginstudent" element={<Login portalType="student" />} />
            
            {/* Legacy Route Redirects */}
            <Route path="/admin" element={<Navigate to="/loginadmin" replace />} />
            <Route path="/sho" element={<Navigate to="/loginsho" replace />} />
            <Route path="/student" element={<Navigate to="/loginstudent" replace />} />
            <Route path="/login" element={<Navigate to="/loginadmin" replace />} />
            
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
              path="/sho/dashboard" 
              element={
                <ProtectedRoute requiredRole="sho">
                  <SHODashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Root and Catch-all Routes */}
            <Route path="/" element={<Navigate to="/loginadmin" replace />} />
            <Route path="*" element={<Navigate to="/loginadmin" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

