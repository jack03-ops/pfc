import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend, trendType, glowColor, onClick }) {
  const iconColors = {
    red: 'bg-red-500/10 text-red-500 border-red-500/20 group-hover:bg-red-500 group-hover:text-white',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white',
    default: 'bg-white/[0.05] text-zinc-300 border-white/[0.08] group-hover:bg-red-600 group-hover:text-white'
  };

  const selectedIconStyle = iconColors[glowColor] || iconColors.default;

  return (
    <div 
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`card-premium p-5 sm:p-6 transition-all duration-200 ${
        onClick 
          ? 'cursor-pointer hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0 group select-none' 
          : ''
      }`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300 transition-colors">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-2xl border transition-all duration-200 shrink-0 ${selectedIconStyle}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              trendType === 'up' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {trend}
            </span>
            <span className="text-[11px] font-medium text-zinc-400">vs last month</span>
          </div>
          {onClick && (
            <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">
              View →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
