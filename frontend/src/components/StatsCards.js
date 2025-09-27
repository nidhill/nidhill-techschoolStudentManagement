import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../services/api';

const StatsCards = () => {
  const [stats, setStats] = useState({ shoCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getAdminStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculate additional stats based on fetched data
  const statsData = {
    totalShos: stats.shoCount,
    activeShos: stats.shoCount, // Assuming all SHOs are active for now
    totalShosChange: '+10%', // Static for now
    activeShosChange: '-5%' // Static for now
  };

  const cards = [
    {
      title: 'Total SHOs',
      value: loading ? 'Loading...' : statsData.totalShos,
      change: statsData.totalShosChange,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      )
    },
    {
      title: 'Active SHOs',
      value: loading ? 'Loading...' : statsData.activeShos,
      change: statsData.activeShosChange,
      changeType: 'negative',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-sm font-medium ${
              card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {card.change} this month
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
