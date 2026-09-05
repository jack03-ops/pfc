import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CreditCard, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  Plus
} from 'lucide-react';
import phoenixLogo from '../assets/phoenix_logo.png';

export default function Sidebar({ currentPage, setCurrentPage, onLogout, alertsCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members Directory', icon: Users },
    { id: 'add-member', label: 'Enroll Member', icon: UserPlus },
    { id: 'payments', label: 'Billing & Payments', icon: CreditCard },
    { id: 'reports', label: 'Business Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Alerts & Reminders', icon: Bell, badge: alertsCount },
    { id: 'settings', label: 'Gym Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Bar (Visible only on screens < md) */}
      <header className="md:hidden sticky top-0 z-40 w-full bg-[#09090b]/90 backdrop-blur-md border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-xl border border-red-500/30 bg-black shrink-0">
            <img src={phoenixLogo} alt="Phoenix Logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white leading-tight">Phoenix Fitness</h1>
            <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">Admin Desk</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Add Member button on Mobile header */}
          <button
            onClick={() => handleNavClick('add-member')}
            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[11px] font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/[0.08] cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Backdrop overlay for Mobile Drawer */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          className="md:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
        />
      )}

      {/* Sidebar Container (Desktop: Pinned sidebar | Mobile: Slide-out drawer) */}
      <aside className={`
        fixed md:static top-0 left-0 z-50 h-full w-64 min-h-screen bg-[#09090b] border-r border-white/[0.08] flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Gym Logo / Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-2xl border border-red-500/30 bg-black shrink-0 shadow-md">
                <img src={phoenixLogo} alt="Phoenix Fitness Centre Logo" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white m-0 leading-tight">Phoenix Fitness</h1>
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block mt-0.5">Centre Core</span>
              </div>
            </div>

            {/* Mobile drawer close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04]"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3.5 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-950/40 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] font-medium'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span className="text-xs">{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-red-600 text-white shadow-sm'
                    }`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-white/[0.08]">
          <button
            onClick={() => {
              setMobileOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 cursor-pointer font-medium text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
