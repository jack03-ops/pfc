import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend, trendType, glowColor, onClick }) {
  const glowClasses = {
    red: 'glass-panel-glow-red hover:shadow-red-950/40 hover:border-red-500/40',
    cyan: 'glass-panel-glow-cyan hover:shadow-cyan-950/40 hover:border-cyan-500/40',
    default: 'glass-panel hover:bg-zinc-900/60 hover:border-zinc-800'
  };

  const selectedGlow = glowClasses[glowColor] || glowClasses.default;

  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl transition-all duration-300 ${selectedGlow} ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] group' : ''}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${
          glowColor === 'red' ? 'bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white' : 
          glowColor === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white' : 
          'bg-zinc-800 text-zinc-300 group-hover:bg-red-600 group-hover:text-white'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              trendType === 'up' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
            }`}>
              {trend}
            </span>
            <span className="text-[10px] font-medium text-slate-400">vs last month</span>
          </div>
          {onClick && (
            <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-wider">
              View →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
