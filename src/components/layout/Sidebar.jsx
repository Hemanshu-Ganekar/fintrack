import React from 'react';
import { LayoutDashboard, Receipt, PieChart, Settings, LogOut, Bot } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Receipt, label: 'Transactions', id: 'transactions' },
    { icon: PieChart, label: 'Analytics', id: 'analytics' },
    { icon: Settings, label: 'Settings', id: 'settings' },
    { icon: Bot, label: 'AI Assistant', id: 'ai-assistant' },
  ];

  return (
    <aside className="w-72 bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 flex flex-col justify-between hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="flex-1 flex flex-col pt-8 px-6 overflow-y-auto custom-scrollbar">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/30">
            F
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-800">
            Fin<span className="text-indigo-600">Track</span>
          </span>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                  }`}
                >
                  {/* Subtle hover effect background for inactive tabs */}
                  {!isActive && <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                  
                  <Icon size={20} className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-indigo-100 scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="relative z-10">{item.label}</span>
                  
                  {/* Active indicator dot on the right */}
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout Section */}
      <div className="p-6 border-t border-slate-200/50 bg-slate-50/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all duration-300 cursor-pointer font-semibold group"
        >
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-rose-100 transition-colors">
            <LogOut size={18} className="group-hover:text-rose-600 transition-colors" />
          </div>
          <span>Logout Account</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
