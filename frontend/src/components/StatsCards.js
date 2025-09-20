import React from 'react';

const StatsCards = ({ stats }) => {
  // Handle both Stats object and plain object formats
  const statsData = stats && typeof stats === 'object' ? {
    totalShos: stats.totalShos || 0,
    activeShos: stats.activeShos || 0,
    recentAdded: stats.recentAdded || 0,
    totalShosChange: stats.totalShosChange || '+10%',
    activeShosChange: stats.activeShosChange || '-5%',
    recentAddedChange: stats.recentAddedChange || '+20%'
  } : {
    totalShos: 0,
    activeShos: 0,
    recentAdded: 0,
    totalShosChange: '+10%',
    activeShosChange: '-5%',
    recentAddedChange: '+20%'
  };

  const cards = [
    {
      title: 'Total SHOs',
      value: statsData.totalShos,
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
      value: statsData.activeShos,
      change: statsData.activeShosChange,
      changeType: 'negative',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Recent Added',
      value: statsData.recentAdded,
      change: statsData.recentAddedChange,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
              {card.icon}
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-sm font-medium ${
              card.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
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
