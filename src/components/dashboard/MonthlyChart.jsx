import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonthlyChart = ({ transactions, currency }) => {
  const [filterRange, setFilterRange] = useState('Last 6 Months');

  const getChartData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentYear = now.getFullYear();

    // Group transactions by month
    const grouped = {};

    // Sort transactions by date ascending
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

    sortedTxs.forEach((tx) => {
      if (!tx.rawDate) return;
      const date = new Date(tx.rawDate);
      const year = date.getFullYear();
      const monthIdx = date.getMonth();
      const monthName = monthNames[monthIdx];

      // Apply range filters
      if (filterRange === 'This Year' && year !== currentYear) {
        return;
      }
      if (filterRange === 'Last 6 Months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        if (date < sixMonthsAgo) {
          return;
        }
      }

      // Grouping key: we can combine year and month or just month
      const key = `${monthName}`;
      
      if (!grouped[key]) {
        grouped[key] = { name: monthName, income: 0, expense: 0, sortKey: date.getTime() };
      }

      if (tx.amount > 0) {
        grouped[key].income += tx.amount;
      } else {
        grouped[key].expense += Math.abs(tx.amount);
      }
    });

    const dataList = Object.values(grouped).sort((a, b) => a.sortKey - b.sortKey);

    // If empty, return a nice default placeholder range
    if (dataList.length === 0) {
      return [
        { name: 'Jan', income: 0, expense: 0 },
        { name: 'Feb', income: 0, expense: 0 },
        { name: 'Mar', income: 0, expense: 0 },
        { name: 'Apr', income: 0, expense: 0 },
        { name: 'May', income: 0, expense: 0 },
        { name: 'Jun', income: 0, expense: 0 },
      ].slice(0, filterRange === 'Last 6 Months' ? 6 : 12);
    }

    return dataList;
  };

  const chartData = getChartData();

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Financial Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Income vs Expenses (Monthly)</p>
        </div>
        <select 
          value={filterRange}
          onChange={(e) => setFilterRange(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm cursor-pointer"
        >
          <option>Last 6 Months</option>
          <option>This Year</option>
          <option>All Time</option>
        </select>
      </div>
      
      <div className="h-80 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              tickFormatter={(value) => `${currency}${value}`}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                color: '#1e293b'
              }}
              itemStyle={{ color: '#475569' }}
              formatter={(value) => [`${currency}${value.toLocaleString()}`, undefined]}
            />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyChart;
