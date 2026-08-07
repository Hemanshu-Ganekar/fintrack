import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const SummaryCards = ({ totalBalance, totalIncome, totalExpenses, currency }) => {
  const cards = [
    {
      title: 'Total Balance',
      amount: `${totalBalance < 0 ? '-' : ''}${currency} ${Math.abs(totalBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Net available funds',
      isPositive: totalBalance >= 0,
      icon: Wallet,
      gradient: 'from-indigo-500 via-purple-500 to-indigo-600',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
      subTextColor: 'text-indigo-100',
      badgeBg: 'bg-white/20 text-white border-white/20',
      glow: 'shadow-[0_8px_30px_rgb(99,102,241,0.4)]'
    },
    {
      title: 'Total Income',
      amount: `${currency} ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Gross earnings',
      isPositive: true,
      icon: TrendingUp,
      gradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-100/80 text-emerald-600',
      textColor: 'text-slate-800',
      subTextColor: 'text-slate-500',
      badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      glow: 'shadow-[0_8px_30px_rgb(16,185,129,0.1)] border border-emerald-100/50'
    },
    {
      title: 'Total Expenses',
      amount: `${currency} ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Accumulated spending',
      isPositive: false,
      icon: TrendingDown,
      gradient: 'from-rose-50 to-orange-50',
      iconBg: 'bg-rose-100/80 text-rose-600',
      textColor: 'text-slate-800',
      subTextColor: 'text-slate-500',
      badgeBg: 'bg-rose-100 text-rose-700 border-rose-200',
      glow: 'shadow-[0_8px_30px_rgb(244,63,94,0.1)] border border-rose-100/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPrimary = index === 0;
        
        return (
          <div
            key={index}
            className={`relative rounded-3xl p-7 hover:-translate-y-2 transition-all duration-500 overflow-hidden group ${card.glow} ${isPrimary ? 'bg-gradient-to-br ' + card.gradient : 'bg-gradient-to-br ' + card.gradient + ' backdrop-blur-xl'}`}
          >
            {/* Ambient background decoration */}
            {isPrimary && (
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            )}
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <p className={`${card.subTextColor} font-semibold text-sm mb-1.5 tracking-wide uppercase`}>{card.title}</p>
                <h3 className={`text-2xl font-extrabold tracking-tight ${card.textColor}`}>{card.amount}</h3>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.iconBg} backdrop-blur-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm`}>
                <Icon size={28} strokeWidth={2.5} className={isPrimary ? 'text-white' : ''} />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-2 relative z-10">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${card.badgeBg} shadow-sm flex items-center gap-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPrimary ? 'bg-white' : (card.isPositive ? 'bg-emerald-500' : 'bg-rose-500')} animate-pulse`}></span>
                Active
              </span>
              <span className={`${card.subTextColor} text-sm font-medium`}>{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
