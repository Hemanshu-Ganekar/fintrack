import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNavbar from './MobileNavbar';

const DashboardLayout = ({ children, activeTab, setActiveTab, searchQuery, setSearchQuery, userName, onLogout, notifications = [] }) => {
  return (
    <div className="flex h-screen overflow-hidden text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          userName={userName} 
          activeTab={activeTab} 
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
        <MobileNavbar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      </div>
    </div>
  );
};

export default DashboardLayout;
