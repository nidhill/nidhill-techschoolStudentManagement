import React, { useState } from 'react';

const LoginDetails = ({ sho, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!sho) return null;

  const loginStatus = sho.getLoginStatus();
  const recentSummary = sho.getRecentLoginSummary();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Login Details - {sho.getDisplayName()}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login History
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">{sho.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{sho.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mobile:</span>
                    <span className="font-medium">{sho.mobileNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${sho.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {sho.getStatusText()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Login Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Login Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <span className={`font-medium ${loginStatus.color}`}>
                      {loginStatus.text}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium">{sho.getLastLoginText()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Logins:</span>
                    <span className="font-medium">{sho.loginCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">Recent Activity Summary</h4>
              {typeof recentSummary === 'string' ? (
                <p className="text-gray-600">{recentSummary}</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{recentSummary.total}</div>
                    <div className="text-sm text-gray-600">Total Attempts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{recentSummary.successful}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{recentSummary.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-800">
                      {recentSummary.lastAttempt ? 
                        new Date(recentSummary.lastAttempt).toLocaleDateString() : 
                        'N/A'
                      }
                    </div>
                    <div className="text-sm text-gray-600">Last Attempt</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Recent Login History</h4>
            {!sho.recentLogins || sho.recentLogins.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No login history available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Agent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sho.recentLogins.map((login, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(login.loginTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            login.success 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {login.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {login.ipAddress || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                          {login.userAgent || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h4 className="font-semibold text-gray-800">Login Statistics</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Logins */}
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{sho.loginCount}</div>
                <div className="text-sm text-green-800 font-medium">Total Successful Logins</div>
              </div>

              {/* Last Login */}
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600 mb-2">
                  {sho.lastLogin ? 
                    new Date(sho.lastLogin).toLocaleDateString() : 
                    'Never'
                  }
                </div>
                <div className="text-sm text-blue-800 font-medium">Last Login Date</div>
              </div>

              {/* Account Age */}
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <div className="text-lg font-bold text-purple-600 mb-2">
                  {sho.createdAt ? 
                    Math.floor((new Date() - new Date(sho.createdAt)) / (1000 * 60 * 60 * 24)) : 
                    0
                  } days
                </div>
                <div className="text-sm text-purple-800 font-medium">Account Age</div>
              </div>
            </div>

            {/* Activity Chart Placeholder */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-4">Activity Timeline</h5>
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📊</div>
                <p>Activity chart would be displayed here</p>
                <p className="text-sm">(Chart implementation can be added later)</p>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginDetails;

