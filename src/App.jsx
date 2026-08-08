import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import SummaryCards from './components/dashboard/SummaryCards';
import MonthlyChart from './components/dashboard/MonthlyChart';
import TransactionList from './components/dashboard/TransactionList';
import AddEditTransactionModal from './components/dashboard/AddEditTransactionModal';
import AnalyticsView from './components/dashboard/AnalyticsView';
import SettingsView from './components/dashboard/SettingsView';
import AIAssistantView from './components/dashboard/AIAssistantView';
import Login from './components/auth/Login';
import OCRView from './components/dashboard/AutoTransaction';
import AutoTransaction from './components/dashboard/AutoTransaction';
import InvestmentPlanner from './components/dashboard/InvestmentPlanner';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('fintrack_token'));
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState('');
  const [currency, setCurrency] = useState('Rs.');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbConnected, setDbConnected] = useState(true);
  const base_url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'; // Fallback to localhost if not set
  // Helper to attach JWT token
  const fetchWithAuth = async (url, options = {}) => {
    const token = sessionStorage.getItem('fintrack_token');
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    return fetch(url, { ...options, headers });
  };

  // Fetch DB Connection Status
  const checkDbStatus = async () => {
    try {
      const res = await fetch(`${base_url}/api/db-status`);
      if (res.ok) {
        const data = await res.json();
        setDbConnected(data.connected);
        return data.connected;
      }
      setDbConnected(false);
      return false;
    } catch {
      setDbConnected(false);
      return false;
    }
  };

  // Fetch Transactions and Settings
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const isConnected = await checkDbStatus();
      if (!isConnected) {
        setError("Unable to connect to server. Please try again in a moment.");
        setLoading(false);
        return;
      }

      // Parallel fetch settings and transactions
      const [txRes, settingsRes] = await Promise.all([
        fetchWithAuth(`${base_url}/api/transactions`),
        fetchWithAuth(`${base_url}/api/settings`)
      ]);

      if (txRes.status === 401 || settingsRes.status === 401) {
        sessionStorage.removeItem('fintrack_token');
        localStorage.removeItem('fintrack_token');
        setIsLoggedIn(false);
        return;
      }

      if (!txRes.ok || !settingsRes.ok) {
        throw new Error("Failed to load data from server");
      }

      const txData = await txRes.json();
      const settingsData = await settingsRes.json();

      setTransactions(txData);
      setUserName(settingsData.username || '');
      setCurrency(settingsData.currency || 'Rs.');
    } catch (err) {
      setError(err.message);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      // Poll DB status every 5 seconds to show real-time changes
      const interval = setInterval(checkDbStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Derived Calculations
  const currentYear = new Date().getFullYear().toString();
  const availableYears = [...new Set([
    currentYear,
    ...transactions.map(tx => new Date(tx.rawDate || tx.date).getFullYear().toString())
  ])].sort((a, b) => b - a);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredTransactions = transactions.filter(tx => {
    const d = new Date(tx.rawDate || tx.date);
    const txYear = d.getFullYear().toString();
    const txMonth = d.toLocaleString('default', { month: 'long' });
    
    if (selectedYear === 'All') return true;
    if (selectedYear !== txYear) return false;
    
    if (selectedMonth === 'All') return true;
    return txMonth === selectedMonth;
  });

  const totalIncome = filteredTransactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  // Smart Notifications Generator
  const generateNotifications = () => {
    const notifs = [];
    if (transactions.length === 0) return notifs;

    // Calculate overall balance
    const overallIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const overallExpense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const overallBalance = overallIncome - overallExpense;

    if (overallBalance < 5000) {
      notifs.push({
        id: 'low-balance',
        type: 'warning',
        title: 'Low Balance Warning',
        message: `Your total balance is running low (${currency} ${overallBalance.toLocaleString()}).`,
        time: 'Just now'
      });
    }

    // Check for recent large expenses (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLargeExpenses = transactions.filter(t => {
      const txDate = new Date(t.rawDate || t.date);
      return t.amount < -5000 && txDate >= sevenDaysAgo;
    });

    if (recentLargeExpenses.length > 0) {
      notifs.push({
        id: 'large-expense',
        type: 'alert',
        title: 'Large Expenses Detected',
        message: `You have ${recentLargeExpenses.length} expense(s) over ${currency} 5,000 in the last 7 days.`,
        time: 'Recent'
      });
    }

    // Check for recent income
    const recentIncome = transactions.filter(t => {
      const txDate = new Date(t.rawDate || t.date);
      return t.amount > 0 && txDate >= sevenDaysAgo;
    });

    if (recentIncome.length > 0) {
      notifs.push({
        id: 'recent-income',
        type: 'success',
        title: 'Income Received',
        message: `Awesome! You recorded ${recentIncome.length} income(s) in the last 7 days.`,
        time: 'Recent'
      });
    }

    return notifs;
  };

  const notifications = generateNotifications();

  // Handlers
  const handleSaveTransaction = async (tx) => {
    try {
      let url = `${base_url}/api/transactions`;
      let method = 'POST';

      if (editingTransaction) {
        url = `${base_url}/api/transactions/${editingTransaction.id}`;
        method = 'PUT';
      }

      // Prepare payload (removing frontend-generated temporary ID if creating)
      const payload = { ...tx };
      if (!editingTransaction) {
        delete payload.id;
      }

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save transaction');
      }

      await fetchData(); // reload fresh list
      setEditingTransaction(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetchWithAuth(`${base_url}/api/transactions/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Failed to delete transaction');
      }
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleClearData = async () => {
    if (!window.confirm('CRITICAL WARNING: This will permanently delete all your transaction history. Proceed?')) return;
    try {
      const res = await fetchWithAuth(`${base_url}/api/transactions/clear`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to clear data');
      setTransactions([]);
    } catch (err) {
      alert(err.message);
    }
  };


  const handleUpdateUserName = async (name) => {
    try {
      setUserName(name);
      await fetchWithAuth(`${base_url}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCurrency = async (curr) => {
    try {
      setCurrency(curr);
      await fetchWithAuth(`${base_url}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: curr })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your profile? This will reset your name and currency preferences to default.')) return;
    try {
      setUserName('User');
      setCurrency('Rs.');
      await fetchWithAuth(`${base_url}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'User', currency: 'Rs.' })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Render Views dynamically based on active tab
  const renderContent = () => {
    if (loading && transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-semibold text-lg animate-pulse">Connecting to server...</p>
        </div>
      );
    }

    if (error && !dbConnected) {
      return (
        <div className="bg-white/80 border border-red-200 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-4 shadow-xl shadow-red-500/5">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500 border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Connection Offline</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            FinTrack could not establish a connection with the server. Please check your internet connection or try refreshing the page.
          </p>
          <button 
            onClick={fetchData}
            className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all cursor-pointer mt-4"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-600">{userName}</span>! 👋</h1>
                <p className="text-slate-500 mt-1">
                  Here's a snapshot of your finances for <span className="font-semibold text-slate-700">
                    {selectedYear === 'All' ? 'all time' : (selectedMonth === 'All' ? selectedYear : `${selectedMonth} ${selectedYear}`)}
                  </span>.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-slate-200/60 p-1.5 rounded-2xl shadow-sm">
                
                {/* Year Selector */}
                <select 
                  value={selectedYear} 
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    if (e.target.value === 'All') setSelectedMonth('All');
                  }}
                  className="bg-white border border-slate-200/80 text-slate-800 font-semibold text-sm rounded-xl py-2 px-3 pr-7 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .5rem top 50%', backgroundSize: '.65rem auto' }}
                >
                  <option value="All">All Years</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>

                {/* Month Selector */}
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={selectedYear === 'All'}
                  className={`bg-white border border-slate-200/80 font-semibold text-sm rounded-xl py-2 px-3 pr-7 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors shadow-sm appearance-none ${selectedYear === 'All' ? 'text-slate-400 bg-slate-50 cursor-not-allowed' : 'text-slate-800 cursor-pointer hover:bg-slate-50'}`}
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .5rem top 50%', backgroundSize: '.65rem auto' }}
                >
                  <option value="All">All Months</option>
                  {months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <SummaryCards 
              totalBalance={totalBalance} 
              totalIncome={totalIncome} 
              totalExpenses={totalExpenses} 
              currency={currency} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-full">
                <MonthlyChart transactions={filteredTransactions} currency={currency} />
              </div>
              <div className="lg:col-span-1 h-full">
                <TransactionList 
                  transactions={filteredTransactions} 
                  currency={currency} 
                  onEdit={handleEditClick} 
                  onDelete={handleDeleteTransaction} 
                  onAddClick={handleOpenAddModal}
                  viewMode="dashboard"
                  onViewAllClick={() => setActiveTab('transactions')}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          </>
        );
      case 'transactions':
        return (
          <TransactionList 
            transactions={transactions} 
            currency={currency} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteTransaction} 
            onAddClick={handleOpenAddModal}
            viewMode="full"
            searchQuery={searchQuery}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView transactions={transactions} currency={currency} />
        );
      case 'ocr':
        return (
          <AutoTransaction/>
        )
      case 'investment':
        return(
        <InvestmentPlanner/>
    )
      case 'settings':
        return (
          <SettingsView 
            userName={userName} 
            setUserName={handleUpdateUserName} 
            currency={currency} 
            setCurrency={handleUpdateCurrency} 
            onClearData={handleClearData}
            onDeleteProfile={handleDeleteProfile}
          />
        );
      case 'ai-assistant':
        return <AIAssistantView transactions={transactions} currency={currency} />;
      default:
        return <div>Tab view not found</div>;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery} 
      userName={userName}
      dbConnected={dbConnected}
      onLogout={() => {
        sessionStorage.removeItem('fintrack_token');
        localStorage.removeItem('fintrack_token');
        setIsLoggedIn(false);
      }}
      notifications={notifications}
    >
      {renderContent()}

      <AddEditTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }} 
        onSave={handleSaveTransaction} 
        transaction={editingTransaction} 
        currency={currency}
      />
    </DashboardLayout>
  );
}

export default App;
