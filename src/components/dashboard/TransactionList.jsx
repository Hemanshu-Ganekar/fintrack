import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2, Edit2, Plus, Calendar, Filter, ArrowUpDown } from 'lucide-react';

const CATEGORIES = ['All', 'Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Groceries', 'Rent & Utilities', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Software', 'Education', 'Other'];

const TransactionList = ({ 
  transactions, 
  currency, 
  onEdit, 
  onDelete, 
  onAddClick, 
  viewMode = 'dashboard', 
  onViewAllClick,
  searchQuery = ''
}) => {
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'

  // Apply filters and sorting
  const getProcessedTransactions = () => {
    let list = [...transactions];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        tx => tx.name.toLowerCase().includes(query) || 
              tx.category.toLowerCase().includes(query)
      );
    }

    // 2. Type Filter
    if (typeFilter === 'income') {
      list = list.filter(tx => tx.amount > 0);
    } else if (typeFilter === 'expense') {
      list = list.filter(tx => tx.amount < 0);
    }

    // 3. Category Filter
    if (categoryFilter !== 'All') {
      list = list.filter(tx => tx.category === categoryFilter);
    }

    // 4. Sort
    list.sort((a, b) => {
      const dateA = new Date(a.rawDate || 0);
      const dateB = new Date(b.rawDate || 0);
      
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'highest') return Math.abs(b.amount) - Math.abs(a.amount);
      if (sortBy === 'lowest') return Math.abs(a.amount) - Math.abs(b.amount);
      return 0;
    });

    // 5. Limit for dashboard
    if (viewMode === 'dashboard') {
      return list.slice(0, 5);
    }

    return list;
  };

  const processedList = getProcessedTransactions();
  const isDashboard = viewMode === 'dashboard';

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header section */}
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {isDashboard ? 'Recent Transactions' : 'Transaction Manager'}
          </h2>
          {!isDashboard && (
            <p className="text-slate-500 text-xs mt-0.5">Manage, filter, and review all payments</p>
          )}
        </div>
        
        {isDashboard ? (
          <button 
            onClick={onViewAllClick}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-slate-200"
          >
            View All
          </button>
        ) : (
          <button
            onClick={onAddClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl px-4 py-2.5 shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={16} /> Add Transaction
          </button>
        )}
      </div>

      {/* Filter Toolbar (Only in Full view mode) */}
      {!isDashboard && (
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat} Category</option>
              ))}
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-slate-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>
      )}

      {/* Table section */}
      <div className="overflow-x-auto flex-1">
        {processedList.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Transaction</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedList.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                        tx.amount > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <span className="font-semibold text-slate-800 break-words">{tx.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-xs">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{tx.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-semibold text-sm ${tx.amount > 0 ? 'text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'text-slate-700'}`}>
                      {tx.amount > 0 ? '+' : '-'}{currency} {Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      tx.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onEdit(tx)}
                        className="text-indigo-500 hover:text-indigo-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
                        title="Edit Transaction"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        onClick={() => onDelete(tx.id)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                        title="Delete Transaction"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 text-slate-500 bg-slate-50/50">
            <p className="font-semibold text-lg text-slate-700">No transactions found</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {searchQuery || typeFilter !== 'all' || categoryFilter !== 'All' 
                ? 'Try adjusting your filters or search terms to find what you are looking for.' 
                : 'Get started by creating your first income or expense transaction.'}
            </p>
            {isDashboard ? (
              <button
                onClick={onViewAllClick}
                className="mt-4 px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
              >
                Go to Transactions Manager
              </button>
            ) : (
              <button
                onClick={onAddClick}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Transaction
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
