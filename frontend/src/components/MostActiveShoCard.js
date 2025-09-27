import React, { useState, useEffect } from 'react';
import { getMostActiveSho } from '../services/api';

const MostActiveShoCard = () => {
  const [mostActiveSho, setMostActiveSho] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostActiveSho = async () => {
      try {
        setLoading(true);
        const response = await getMostActiveSho();
        if (response.success) {
          setMostActiveSho(response.data);
        }
      } catch (error) {
        console.error('Error fetching most active SHO:', error);
        setMostActiveSho(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMostActiveSho();
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Top Performing SHO</h2>
        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : mostActiveSho ? (
        <div className="flex items-center space-x-4">
          {/* SHO Photo */}
          <div className="flex-shrink-0">
            {mostActiveSho.photoUrl ? (
              <img
                src={mostActiveSho.photoUrl}
                alt={mostActiveSho.fullName}
                className="h-16 w-16 rounded-full object-cover border-2 border-yellow-400"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-yellow-400">
                <span className="text-gray-600 text-xl font-bold">
                  {mostActiveSho.fullName ? mostActiveSho.fullName.charAt(0).toUpperCase() : 'S'}
                </span>
              </div>
            )}
          </div>

          {/* SHO Details */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {mostActiveSho.fullName}
            </h3>
            <p className="text-gray-600 mb-2">{mostActiveSho.email}</p>
            
            {/* Activity Stats */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">
                  {mostActiveSho.loginCount || 0} logins
                </span>
              </div>
              
              {mostActiveSho.lastLogin && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">
                    Last: {new Date(mostActiveSho.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Performance Badge */}
          <div className="flex-shrink-0">
            <div className="bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
              <span className="text-yellow-700 text-sm font-medium">Most Active</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600">No activity data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MostActiveShoCard;
