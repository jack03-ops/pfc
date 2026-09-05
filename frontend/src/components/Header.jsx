import React from 'react';
import { Bell, Plus, Dumbbell, Cloud, ShieldCheck } from 'lucide-react';

export default function Header({ title, user, setPage, alertsCount = 0 }) {
  return (
    <header className="hidden md:flex h-16 border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-md px-6 lg:px-8 items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Title / Context */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
          <Dumbbell className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm lg:text-base font-bold text-white tracking-tight leading-tight">
            {title || 'Dashboard'}
          </h2>
          <p className="text-[11px] text-zinc-400 font-medium">Phoenix Fitness Academy Operations</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Cloud Sync Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Cloud className="w-3.5 h-3.5 text-zinc-500" />
          <span>Cloud Sync Active</span>
        </div>

        {/* Primary CTA: Add Member */}
        <button
          onClick={() => setPage('add-member')}
          className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>

        {/* Notifications Button */}
        <button 
          onClick={() => setPage('notifications')}
          className="relative p-2.5 text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-all cursor-pointer"
          title="Alert Center Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {alertsCount > 0 && (
            <>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white font-bold text-[9px] flex items-center justify-center rounded-full shadow-sm">
                {alertsCount > 9 ? '9+' : alertsCount}
              </span>
            </>
          )}
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'Admin Manager'}</p>
            <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Authorized Staff
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
