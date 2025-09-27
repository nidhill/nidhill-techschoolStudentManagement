import React from 'react';

const Sidebar = ({ activeTab, onTabChange }) => {

  // Add safety check for onTabChange
  const handleTabClick = (tab) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tab);
    } else {
      console.error('onTabChange is not a function:', typeof onTabChange);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
        </svg>
      ),
      tab: 'dashboard',
      active: activeTab === 'dashboard'
    },
    {
      name: 'SHO Management',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      tab: 'shos',
      active: activeTab === 'shos'
    },
  ];

  return (
    <div className="w-64 bg-white min-h-screen flex flex-col border-r border-gray-200 shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img src="/logo-techschool.png" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo-techschool.svg'; }} alt="Tech School" className="h-6" />
          <span className="text-xl font-bold text-gray-800">Tech School Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleTabClick(item.tab)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                  item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
