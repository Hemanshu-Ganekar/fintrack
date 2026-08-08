import { useState, useMemo } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ============================================================
// MOCK DATA — frontend only, no backend/API involved
// ============================================================

const ASSET_TYPES = ['Stocks', 'Mutual Funds', 'ETFs', 'Gold', 'Crypto', 'Bonds'];

const ASSET_COLORS = {
  Stocks: '#2563eb',
  'Mutual Funds': '#7c3aed',
  ETFs: '#0d9488',
  Gold: '#d97706',
  Crypto: '#ea580c',
  Bonds: '#475569'
};

const INITIAL_HOLDINGS = [
  { id: 1, name: 'HDFC Bank Ltd', type: 'Stocks', qty: 40, invested: 68000, current: 79200 },
  { id: 2, name: 'Reliance Industries', type: 'Stocks', qty: 15, invested: 42000, current: 39750 },
  { id: 3, name: 'Axis Bluechip Fund', type: 'Mutual Funds', qty: 320, invested: 32000, current: 37440 },
  { id: 4, name: 'Nippon Small Cap Fund', type: 'Mutual Funds', qty: 210, invested: 21000, current: 24990 },
  { id: 5, name: 'Nifty 50 ETF', type: 'ETFs', qty: 80, invested: 16800, current: 18240 },
  { id: 6, name: 'Digital Gold', type: 'Gold', qty: 12, invested: 68400, current: 74160 },
  { id: 7, name: 'Bitcoin', type: 'Crypto', qty: 0.05, invested: 150000, current: 172500 },
  { id: 8, name: 'Ethereum', type: 'Crypto', qty: 0.8, invested: 96000, current: 87360 },
  { id: 9, name: 'Govt. Bond 2032', type: 'Bonds', qty: 10, invested: 100000, current: 106500 }
];

const PERFORMANCE_DATA = [
  { month: 'Mar', value: 480000 },
  { month: 'Apr', value: 495000 },
  { month: 'May', value: 512000 },
  { month: 'Jun', value: 508000 },
  { month: 'Jul', value: 531000 },
  { month: 'Aug', value: 540140 }
];

const RECENT_TRANSACTIONS = [
  { id: 1, name: 'HDFC Bank Ltd', type: 'Buy', assetType: 'Stocks', amount: 12000, date: '05 Aug 2026' },
  { id: 2, name: 'Bitcoin', type: 'Buy', assetType: 'Crypto', amount: 25000, date: '02 Aug 2026' },
  { id: 3, name: 'Axis Bluechip Fund', type: 'SIP', assetType: 'Mutual Funds', amount: 5000, date: '01 Aug 2026' },
  { id: 4, name: 'Ethereum', type: 'Sell', assetType: 'Crypto', amount: 18000, date: '28 Jul 2026' },
  { id: 5, name: 'Digital Gold', type: 'Buy', assetType: 'Gold', amount: 10000, date: '22 Jul 2026' }
];

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (num) =>
  `Rs. ${Math.round(num).toLocaleString('en-IN')}`;

const formatCompact = (num) => {
  if (num >= 100000) return `Rs. ${(num / 100000).toFixed(2)}L`;
  return `Rs. ${num.toLocaleString('en-IN')}`;
};

// ============================================================
// ADD INVESTMENT MODAL (frontend-only, no persistence beyond local state)
// ============================================================

const AddInvestmentModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '',
    type: 'Stocks',
    qty: '',
    invested: ''
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.qty || !form.invested) return;

    onAdd({
      id: Date.now(),
      name: form.name,
      type: form.type,
      qty: parseFloat(form.qty),
      invested: parseFloat(form.invested),
      // mock current value: assume a small mock gain/loss for realism
      current: parseFloat(form.invested) * (0.92 + Math.random() * 0.25)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Add Investment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Asset Name</label>
            <input
              type="text"
              placeholder="e.g. Tata Motors"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full mt-1 border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Asset Type</label>
            <select
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full mt-1 border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={form.qty}
                onChange={(e) => handleChange('qty', e.target.value)}
                className="w-full mt-1 border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Invested (Rs.)</label>
              <input
                type="number"
                min="0"
                placeholder="0.00"
                value={form.invested}
                onChange={(e) => handleChange('invested', e.target.value)}
                className="w-full mt-1 border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Investment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================

const InvestmentManager = () => {
  const [holdings, setHoldings] = useState(INITIAL_HOLDINGS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState('All');

  const handleAddInvestment = (newHolding) => {
    setHoldings((prev) => [newHolding, ...prev]);
  };

  // ---- Derived totals ----
  const totals = useMemo(() => {
    const invested = holdings.reduce((sum, h) => sum + h.invested, 0);
    const current = holdings.reduce((sum, h) => sum + h.current, 0);
    const profitLoss = current - invested;
    const returnPct = invested > 0 ? (profitLoss / invested) * 100 : 0;
    return { invested, current, profitLoss, returnPct };
  }, [holdings]);

  // ---- Asset allocation for pie chart ----
  const allocationData = useMemo(() => {
    const byType = {};
    holdings.forEach((h) => {
      byType[h.type] = (byType[h.type] || 0) + h.current;
    });
    return Object.entries(byType).map(([type, value]) => ({ name: type, value }));
  }, [holdings]);

  const filteredHoldings = useMemo(() => {
    if (filterType === 'All') return holdings;
    return holdings.filter((h) => h.type === filterType);
  }, [holdings, filterType]);

  const isPositive = totals.profitLoss >= 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your portfolio in one place</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md"
        >
          + Add Investment
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Portfolio Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totals.current)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Invested</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totals.invested)}</p>
        </div>
        <div className={`rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow ${isPositive ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
            Total Profit / Loss
          </p>
          <p className={`text-2xl font-bold mt-2 ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
            {isPositive ? '+' : ''}{formatCurrency(totals.profitLoss)}
          </p>
        </div>
        <div className={`rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow ${isPositive ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
            Overall Return
          </p>
          <p className={`text-2xl font-bold mt-2 ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
            {isPositive ? '+' : ''}{totals.returnPct.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Chart row: performance + allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={PERFORMANCE_DATA}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCompact(v)}
                width={70}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Portfolio Value']}
                contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13 }}
              />
              <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} fill="url(#portfolioGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={allocationData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
              >
                {allocationData.map((entry) => (
                  <Cell key={entry.name} fill={ASSET_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {allocationData.map((entry) => {
              const pct = ((entry.value / totals.current) * 100).toFixed(1);
              return (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: ASSET_COLORS[entry.name] || '#94a3b8' }}
                    />
                    {entry.name}
                  </span>
                  <span className="font-medium text-gray-900">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="font-semibold text-gray-900">Holdings</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterType === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {ASSET_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium text-right">Qty</th>
                <th className="pb-3 font-medium text-right">Invested</th>
                <th className="pb-3 font-medium text-right">Current Value</th>
                <th className="pb-3 font-medium text-right">P/L</th>
              </tr>
            </thead>
            <tbody>
              {filteredHoldings.map((h) => {
                const pl = h.current - h.invested;
                const plPct = h.invested > 0 ? (pl / h.invested) * 100 : 0;
                const positive = pl >= 0;
                return (
                  <tr key={h.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{h.name}</td>
                    <td className="py-3">
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${ASSET_COLORS[h.type]}15`,
                          color: ASSET_COLORS[h.type]
                        }}
                      >
                        {h.type}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-600">{h.qty}</td>
                    <td className="py-3 text-right text-gray-600">{formatCurrency(h.invested)}</td>
                    <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(h.current)}</td>
                    <td className={`py-3 text-right font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
                      {positive ? '+' : ''}{formatCurrency(pl)}
                      <span className="block text-xs font-normal">
                        {positive ? '+' : ''}{plPct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredHoldings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                    No holdings in this category yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="divide-y divide-gray-50">
          {RECENT_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 hover:bg-gray-50/60 transition-colors rounded-lg px-2 -mx-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: `${ASSET_COLORS[tx.assetType]}15`,
                    color: ASSET_COLORS[tx.assetType]
                  }}
                >
                  {tx.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{tx.name}</p>
                  <p className="text-xs text-gray-500">{tx.type} • {tx.assetType} • {tx.date}</p>
                </div>
              </div>
              <p className={`font-semibold text-sm ${tx.type === 'Sell' ? 'text-red-600' : 'text-gray-900'}`}>
                {tx.type === 'Sell' ? '-' : '+'}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddInvestmentModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddInvestment}
        />
      )}
    </div>
  );
};

export default InvestmentManager; 