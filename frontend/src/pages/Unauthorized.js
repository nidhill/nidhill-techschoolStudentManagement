import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 border border-red-500 mb-4">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            You don't have permission to access this page.
          </p>
          {user && (
            <p className="mt-1 text-xs text-gray-400">
              Current role: {user.role}
            </p>
          )}
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={() => {
              // Navigate to appropriate login page based on user role or default to admin
              if (user?.role === 'sho') {
                navigate('/loginsho');
              } else if (user?.role === 'student') {
                navigate('/loginstudent');
              } else {
                navigate('/loginadmin');
              }
            }}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition duration-200"
          >
            Go to Login
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition duration-200"
          >
            Go Back
          </button>
          
          <button
            onClick={() => {
              logout();
              navigate('/loginadmin');
            }}
            className="group relative w-full flex justify-center py-3 px-4 border border-red-600 text-sm font-medium rounded-lg text-red-300 bg-red-700 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 transition duration-200"
          >
            Logout & Clear Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

