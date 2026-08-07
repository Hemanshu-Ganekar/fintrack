import React, { useState } from 'react';
import { User, Wallet, RotateCcw, AlertTriangle, Check } from 'lucide-react';

const SettingsView = ({ userName, setUserName, currency, setCurrency, onClearData, onDeleteProfile }) => {
  const [nameInput, setNameInput] = useState(userName);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Configure your personal finance tracker preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Profile Preferences</h3>
              <p className="text-slate-500 text-xs">Customize how the application greets you</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5" htmlFor="settings-name">
                Your Name
              </label>
              <input
                id="settings-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/40 border border-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/60 text-slate-800 transition-all"
                placeholder="e.g. Alex Doe"
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={onDeleteProfile}
                  className="py-2.5 px-5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-200 font-semibold text-sm rounded-xl transition-all"
                >
                  Delete Profile
                </button>
              </div>
              {showSavedMsg && (
                <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1 animate-fade-in">
                  <Check size={16} /> Saved!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Currency & Localization */}
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Currency Settings</h3>
              <p className="text-slate-500 text-xs">Set preferred currency prefix for formatting</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5" htmlFor="settings-currency">
                Currency Symbol / Text
              </label>
              <select
                id="settings-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/40 border border-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/60 text-slate-800 transition-all cursor-pointer"
              >
                <option value="Rs." className="bg-slate-50 text-slate-800">Rs. (Sri Lankan Rupee / Indian Rupee)</option>
                <option value="$" className="bg-slate-50 text-slate-800">$ (US Dollar)</option>
                <option value="€" className="bg-slate-50 text-slate-800">€ (Euro)</option>
                <option value="£" className="bg-slate-50 text-slate-800">£ (British Pound)</option>
                <option value="¥" className="bg-slate-50 text-slate-800">¥ (Yen / Yuan)</option>
              </select>
            </div>
            <p className="text-slate-500 text-xs leading-normal">
              Changing this value will update all transactions, summary statistics cards, and chart axis prefixes across the application.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone / Data Management */}
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">System Data Management</h3>
            <p className="text-slate-500 text-xs">Clear records or populate sample transactions</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            onClick={onClearData}
            className="flex-1 py-3 px-4 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-200 text-rose-700 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <AlertTriangle size={16} /> Clear All Transactions
          </button>
        </div>
        
        <p className="text-slate-500 text-xs leading-normal">
          <strong>Warning:</strong> Clearing transactions cannot be undone. All data stored in your browser's local storage for FinTrack will be erased.
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
