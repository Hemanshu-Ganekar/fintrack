import React from 'react';
import { LayoutDashboard, Receipt, PieChart, Settings, Bot, LogOut } from 'lucide-react';

const MobileNavbar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Home', id: 'dashboard' },
    { icon: Receipt, label: 'History', id: 'transactions' },
    { icon: PieChart, label: 'Analytics', id: 'analytics' },
    { icon: Bot, label: 'AI', id: 'ai-assistant' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-2 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-300 relative ${
                isActive
                  ? 'text-indigo-600 scale-105'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/30 -translate-y-1'
                    : 'bg-transparent'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-semibold tracking-tight mt-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Logout button in bottom navbar for mobile */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-slate-400 hover:text-rose-600 transition-all duration-300"
          title="Logout"
        >
          <div className="p-2 rounded-xl bg-slate-100/80 hover:bg-rose-100 transition-colors">
            <LogOut size={20} className="text-slate-500 hover:text-rose-600 transition-colors" />
          </div>
          <span className="text-[11px] font-semibold tracking-tight mt-0.5 text-slate-500">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavbar;
