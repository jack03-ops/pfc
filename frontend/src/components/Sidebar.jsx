import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CreditCard, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  Flame
} from 'lucide-react';
import phoenixLogo from '../assets/phoenix_logo.png';

export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members List', icon: Users },
    { id: 'add-member', label: 'Add Member', icon: UserPlus },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 min-h-screen bg-zinc-950/65 backdrop-blur-xl border-r border-zinc-900 flex flex-col justify-between shrink-0">
      <div>
        {/* Gym Logo / Brand */}
        <div className="p-5 flex items-center gap-3 border-b border-zinc-900">
          <div className="p-1.5 rounded-2xl border border-red-500/40 bg-zinc-950/90 shrink-0 shadow-md shadow-red-950/40">
            <img src={phoenixLogo} alt="Phoenix Fitness Centre Logo" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white m-0 leading-tight">Phoenix Fitness</h1>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block mt-0.5">Centre Core</span>
          </div>
        </div>


        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-red-650 to-red-500 text-white shadow-lg shadow-red-950/30 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span className="text-sm">{item.label}</span>
                {item.id === 'notifications' && (
                  <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-zinc-900">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </aside>

  );
}
