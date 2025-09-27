import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShoById } from '../services/api';

const ShoDetailPage = () => {
  const { shoId } = useParams();
  const navigate = useNavigate();
  const [sho, setSho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShoDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getShoById(shoId);
        
        if (response.success) {
          setSho(response.data);
        } else {
          setError(response.message || 'Failed to fetch SHO details');
        }
      } catch (err) {
        console.error('Error fetching SHO details:', err);
        setError(err.response?.data?.message || 'Failed to fetch SHO details');
      } finally {
        setLoading(false);
      }
    };

    if (shoId) {
      fetchShoDetails();
    }
  }, [shoId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatLoginDate = (loginEntry) => {
    if (!loginEntry || !loginEntry.timestamp) return 'N/A';
    return new Date(loginEntry.timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-4 text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span>Loading SHO details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading SHO Details</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!sho) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">SHO Not Found</h2>
          <p className="text-gray-600 mb-6">The requested SHO could not be found.</p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">SHO Details</h1>
                <p className="text-gray-600">View detailed information about {sho.fullName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                sho.isActive 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  sho.isActive ? 'bg-green-600' : 'bg-red-600'
                }`}></span>
                {sho.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-300">
                  {sho.photoUrl ? (
                    <img
                      src={sho.photoUrl}
                      alt={sho.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-600">
                      {sho.fullName?.charAt(0) || 'S'}
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{sho.fullName}</h2>
                <p className="text-blue-600 mb-4">@{sho.username}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{sho.email}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{sho.mobileNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                  <p className="text-gray-800">{sho.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                  <p className="text-gray-800">@{sho.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="text-gray-800">{sho.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
                  <p className="text-gray-800">{sho.mobileNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                  <p className="text-gray-800 capitalize">{sho.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Account Created</label>
                  <p className="text-gray-800">{formatDate(sho.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Login Statistics */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Login Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{sho.loginCount}</div>
                  <div className="text-sm text-gray-600">Total Logins</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {sho.lastLogin ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-600">Has Logged In</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {sho.recentLogins?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Recent Sessions</div>
                </div>
              </div>
              {sho.lastLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Login</label>
                  <p className="text-gray-800">{formatDate(sho.lastLogin)}</p>
                </div>
              )}
            </div>

            {/* Recent Login History */}
            {sho.recentLogins && sho.recentLogins.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Login History
                </h3>
                <div className="space-y-3">
                  {sho.recentLogins.slice(0, 5).map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          login.success ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-gray-800">
                          {login.success ? 'Successful Login' : 'Failed Login'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatLoginDate(login)}
                      </div>
                    </div>
                  ))}
                </div>
                {sho.recentLogins.length > 5 && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Showing last 5 logins out of {sho.recentLogins.length} total
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoDetailPage;
