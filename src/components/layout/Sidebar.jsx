import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  LogOut,
  Bot,
  ScanLine,
  Wallet
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      id: 'dashboard',
    },
    {
      icon: Receipt,
      label: 'Transactions',
      id: 'transactions',
    },
    {
      icon: ScanLine,
      label: 'Scan Receipt',
      id: 'ocr',
    },
    {
      icon: PieChart,
      label: 'Analytics',
      id: 'analytics',
    },
    {
      icon: Bot,
      label: 'AI Assistant',
      id: 'ai-assistant',
    },{
      icon:Wallet,
      label: 'Investment',
      id:'investment'
    },
    {
      icon: Settings,
      label: 'Settings',
      id: 'settings',
    }
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col">

      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200/50">
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <span className="text-white font-bold text-lg">
              F
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              FinTrack
            </h1>

            <p className="text-xs text-slate-400">
              Personal Finance
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
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

                {/* Hover Background */}
                {!isActive && (
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                {/* Icon */}
                <Icon
                  size={20}
                  className={`relative z-10 transition-transform duration-300 ${
                    isActive
                      ? 'text-indigo-100 scale-110'
                      : 'group-hover:scale-110'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Label */}
                <span className="relative z-10">
                  {item.label}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}

              </button>
            );
          })}

        </nav>
      </div>

      {/* Logout Section */}
      <div className="p-6 border-t border-slate-200/50 bg-slate-50/50">

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 transition-all duration-300 cursor-pointer font-semibold group"
        >

          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-rose-100 transition-colors">

            <LogOut
              size={18}
              className="group-hover:text-rose-600 transition-colors"
            />

          </div>

          <span>
            Logout Account
          </span>

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;