import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Auth state:', { user, loading, isAuthenticated, requiredRole });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: Not authenticated, redirecting to unified login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    console.log('ProtectedRoute: Role mismatch', { 
      userRole: user.role, 
      requiredRole, 
      user: user 
    });
    return <Navigate to="/unauthorized" replace />;
  }

  // Access granted
  console.log('ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;

