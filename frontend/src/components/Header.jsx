import React from 'react';
import { Bell, User, Plus, Dumbbell } from 'lucide-react';

export default function Header({ title, user, setPage }) {
  return (
    <header className="h-20 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md px-8 flex items-center justify-between">
      {/* Title / Greetings */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-red-500" />
          {title}
        </h2>
        <p className="text-xs text-zinc-400">Welcome back, {user?.name || 'Admin'}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Prominent + Add Member Button (Styled matching the mockup screenshot) */}
        <button
          onClick={() => setPage('add-member')}
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-bold rounded-full transition-all shadow-lg hover:shadow-red-600/30 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 font-extrabold" />
          <span>Add Member</span>
        </button>

        {/* Notifications Indicator */}
        <button 
          onClick={() => setPage('notifications')}
          className="relative p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 rounded-xl transition-all cursor-pointer"
          title="Alert Center Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
