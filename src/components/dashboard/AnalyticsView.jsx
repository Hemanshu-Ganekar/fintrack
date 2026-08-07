import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ArrowRightLeft, Percent, PiggyBank } from 'lucide-react';

const CATEGORY_COLORS = {
  'Groceries': '#f59e0b',       // Amber
  'Rent & Utilities': '#3b82f6', // Blue
  'Transport': '#06b6d4',        // Cyan
  'Entertainment': '#ec4899',    // Pink
  'Shopping': '#8b5cf6',         // Purple
  'Health': '#10b981',           // Emerald
  'Software': '#6366f1',         // Indigo
  'Education': '#f43f5e',        // Rose
  'Other': '#94a3b8'             // Slate
};

const AnalyticsView = ({ transactions, currency }) => {
  // 1. Process Monthly Data (Income vs Expense)
  const getMonthlyData = () => {
    const monthlyMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Sort transactions by date ascending
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
    
    sortedTxs.forEach(tx => {
      if (!tx.rawDate) return;
      const dateObj = new Date(tx.rawDate);
      const monthStr = monthNames[dateObj.getMonth()];
      
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { name: monthStr, income: 0, expense: 0 };
      }
      
      if (tx.amount > 0) {
        monthlyMap[monthStr].income += tx.amount;
      } else {
        monthlyMap[monthStr].expense += Math.abs(tx.amount);
      }
    });

    const result = Object.values(monthlyMap);
    
    // If no data, return a default range to keep chart looking nice
    if (result.length === 0) {
      return [
        { name: 'Jan', income: 0, expense: 0 },
        { name: 'Feb', income: 0, expense: 0 },
        { name: 'Mar', income: 0, expense: 0 }
      ];
    }
    
    return result;
  };

  // 2. Process Expense Category Data (for Pie Chart)
  const getCategoryData = () => {
    const categoryMap = {};
    
    transactions.forEach(tx => {
      if (tx.amount < 0) {
        const cat = tx.category || 'Other';
        const amt = Math.abs(tx.amount);
        categoryMap[cat] = (categoryMap[cat] || 0) + amt;
      }
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    })).sort((a, b) => b.value - a.value);
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  // Calculate Key Insights
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  
  const avgTxValue = transactions.length > 0 
    ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length
    : 0;

  const topExpense = categoryData.length > 0 ? categoryData[0] : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Analytics & Insights</h2>
        <p className="text-slate-500 text-sm mt-1">Detailed visual overview of your financial habits</p>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/25 backdrop-blur-md border border-white/35 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-sm font-semibold">Savings Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            {savingsRate.toFixed(1)}%
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            {savingsRate > 0 ? 'Good buffer margin' : 'Deficit this period'}
          </p>
        </div>

        <div className="bg-white/25 backdrop-blur-md border border-white/35 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-sm font-semibold">Net Savings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <PiggyBank size={16} />
            </div>
          </div>
          <h3 className={`text-2xl font-bold tracking-tight ${netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netSavings >= 0 ? '+' : '-'}{currency} {Math.abs(netSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-slate-500 text-xs mt-1">Net accumulated value</p>
        </div>

        <div className="bg-white/25 backdrop-blur-md border border-white/35 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-sm font-semibold">Avg. Trans. Value</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <ArrowRightLeft size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            {currency} {avgTxValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-slate-500 text-xs mt-1">Across all categories</p>
        </div>

        <div className="bg-white/25 backdrop-blur-md border border-white/35 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-500 text-sm font-semibold">Top Expense Category</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight truncate">
            {topExpense ? topExpense.name : 'N/A'}
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            {topExpense ? `${currency} ${topExpense.value.toLocaleString()}` : 'No expense recorded'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-lg">Financial Volume Comparison</h3>
            <p className="text-slate-500 text-xs">Income versus expenses grouped monthly</p>
          </div>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.4)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${currency}${value}`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.2)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.85)', 
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                  formatter={(value) => [`${currency}${value.toLocaleString()}`, undefined]}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Category Pie Chart */}
        <div className="lg:col-span-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-lg">Expense by Category</h3>
            <p className="text-slate-500 text-xs">Distribution of items purchased</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center">
            {categoryData.length > 0 ? (
              <>
                <div className="h-56 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS['Other']} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.85)', 
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.5)',
                        }}
                        formatter={(value) => [`${currency}${value.toLocaleString()}`, undefined]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Labels Legend */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full px-4 text-xs font-semibold">
                  {categoryData.slice(0, 6).map((item, idx) => {
                    const color = CATEGORY_COLORS[item.name] || CATEGORY_COLORS['Other'];
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-slate-700 truncate">{item.name}</span>
                        <span className="text-slate-400 font-normal ml-auto">
                          {totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm py-12">
                <p>No expenses recorded yet.</p>
                <p className="text-xs text-slate-400 mt-1">Add items to visualize distribution.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
