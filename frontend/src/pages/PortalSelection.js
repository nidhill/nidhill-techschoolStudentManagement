import React from 'react';
import { useNavigate } from 'react-router-dom';

const PortalSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Tech School Dashboard
          </h2>
          <p className="text-gray-300 text-sm">Choose your portal</p>
        </div>

        {/* Portal Selection Card */}
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Select Portal
          </h3>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/login?portal=admin')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200 flex items-center justify-center space-x-3"
            >
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Admin Portal</span>
            </button>

            <button
              onClick={() => navigate('/login?portal=sho')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200 flex items-center justify-center space-x-3"
            >
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <span>SHO Portal</span>
            </button>

            <button
              onClick={() => navigate('/login?portal=student')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200 flex items-center justify-center space-x-3"
            >
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Student Portal</span>
            </button>
          </div>

          {/* Test Accounts Info */}
          <div className="mt-6 bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-300 mb-2">Test Accounts:</h3>
            <div className="text-xs text-blue-200">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>SHO:</strong> Created via Admin panel</p>
              <p><strong>Student:</strong> student / student123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;
