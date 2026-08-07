import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'];
const EXPENSE_CATEGORIES = ['Groceries', 'Rent & Utilities', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Software', 'Education', 'Other'];

const AddEditTransactionModal = ({ isOpen, onClose, onSave, transaction, currency }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Completed');

  useEffect(() => {
    if (transaction) {
      setName(transaction.name || '');
      setType(transaction.amount > 0 ? 'income' : 'expense');
      setCategory(transaction.category || '');
      setAmount(Math.abs(transaction.amount).toString() || '');
      // Format date if needed, standard date input expects YYYY-MM-DD
      const rawDate = transaction.rawDate || new Date().toISOString().split('T')[0];
      setDate(rawDate);
      setStatus(transaction.status || 'Completed');
    } else {
      setName('');
      setType('expense');
      setCategory(EXPENSE_CATEGORIES[0]);
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('Completed');
    }
  }, [transaction, isOpen]);

  // Sync category default when type changes
  useEffect(() => {
    if (!transaction) {
      setCategory(type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    }
  }, [type, transaction]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !amount || !category || !date) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    // Format date string for displaying, e.g., "Aug 24, 6:15 PM" or simple relative format,
    // but keep a rawDate timestamp for sorting and charts.
    const dateObj = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;

    const txData = {
      id: transaction?.id || Date.now().toString(),
      name: name.trim(),
      category,
      date: formattedDate,
      rawDate: date, // YYYY-MM-DD
      amount: type === 'income' ? numericAmount : -numericAmount,
      status,
    };

    onSave(txData);
    onClose();
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white/40 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5" htmlFor="tx-name">
              Description / Name
            </label>
            <input
              id="tx-name"
              type="text"
              required
              placeholder="e.g. Grocery Shop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/40 border border-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/60 text-slate-800 transition-all placeholder-slate-400"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-4 rounded-xl font-semibold text-sm transition-all border ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20'
                    : 'bg-white/40 text-slate-600 border-white/30 hover:bg-white/60'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 px-4 rounded-xl font-semibold text-sm transition-all border ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                    : 'bg-white/40 text-slate-600 border-white/30 hover:bg-white/60'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5" htmlFor="tx-amount">
                Amount ({currency})
              </label>
              <input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/40 border border-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/60 text-slate-800 transition-all placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5" htmlFor="tx-category">
                Category
              </label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/40 border border-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/60 text-slate-800 transition-all cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-50 text-slate-800">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5" htmlFor="tx-date">
                Date
              </label>
              <input
                id="tx-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/40 border border-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/60 text-slate-800 transition-all cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5" htmlFor="tx-status">
                Status
              </label>
              <select
                id="tx-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/40 border border-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/60 text-slate-800 transition-all cursor-pointer"
              >
                <option value="Completed" className="bg-slate-50 text-slate-800">Completed</option>
                <option value="Processing" className="bg-slate-50 text-slate-800">Processing</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-white/20 border border-white/30 text-slate-600 rounded-xl font-semibold text-sm hover:bg-white/40 hover:text-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              {transaction ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditTransactionModal;
