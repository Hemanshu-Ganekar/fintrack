import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, AlertTriangle, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery, userName, activeTab, notifications = [] }) => {
  const showSearch = activeTab === 'dashboard' || activeTab === 'transactions';
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'alert': return <TrendingDown size={18} className="text-rose-500" />;
      case 'success': return <TrendingUp size={18} className="text-emerald-500" />;
      default: return <Bell size={18} className="text-blue-500" />;
    }
  };

  const getNotifBg = (type) => {
    switch (type) {
      case 'warning': return 'bg-amber-100/50';
      case 'alert': return 'bg-rose-100/50';
      case 'success': return 'bg-emerald-100/50';
      default: return 'bg-blue-100/50';
    }
  };

  return (
    <header className="h-16 md:h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center text-slate-800">
        <h1 className="text-lg sm:text-2xl font-extrabold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-900 drop-shadow-sm">
          {activeTab}
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {showSearch && (
          <div className="relative group w-36 sm:w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm placeholder-slate-400"
            />
          </div>
        )}

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 rounded-full transition-colors border ${isNotifOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent hover:border-slate-200'}`}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-indigo-500/10 rounded-2xl overflow-hidden z-50 transform origin-top-right transition-all">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Notifications</h3>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  {notifications.length} New
                </span>
              </div>
              
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notif, idx) => (
                      <div key={idx} className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer group">
                        <div className="flex gap-3 items-start">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getNotifBg(notif.type)} group-hover:scale-105 transition-transform`}>
                            {getNotifIcon(notif.type)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight mb-0.5">{notif.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-2">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center border border-indigo-200 shadow-sm text-white font-bold text-lg">
            {userName ? userName.charAt(0).toUpperCase() : <User size={18} />}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-slate-800 leading-tight">{userName || 'Loading...'}</p>
            <p className="text-xs text-indigo-600 font-medium">FinTrack User</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
