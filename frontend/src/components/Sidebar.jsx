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
  Plus,
  Lock,
  ShieldCheck,
  UserCheck,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import phoenixLogo from '../assets/phoenix_logo.png';

export default function Sidebar({ currentPage, setCurrentPage, onLogout, alertsCount = 0, user, onRoleChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const userRole = user?.role || 'admin';

  // State for Switch Role Authentication Modal
  const [switchTargetRole, setSwitchTargetRole] = useState(null); // 'admin' | 'trainer' | null
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members List', icon: Users },
    { id: 'add-member', label: 'Add Member', icon: UserPlus },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (userRole === 'trainer') {
      return ['dashboard', 'members', 'notifications'].includes(item.id);
    }
    return true;
  });

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setMobileOpen(false);
  };

  const handleRoleButtonClick = (targetId) => {
    if (targetId === userRole) return;
    setSwitchTargetRole(targetId);
    setAuthUsername(targetId === 'admin' ? 'phoenixgym.vkp@gmail.com' : 'trainer@phoenixgym.com');
    setAuthPassword('');
    setAuthError('');
  };

  const handleAuthenticateAndSwitch = (e) => {
    e.preventDefault();
    setAuthError('');
    const trimmedUser = authUsername.trim().toLowerCase();

    if (switchTargetRole === 'admin') {
      const isOfficialAdmin = (trimmedUser === 'phoenixgym.vkp@gmail.com' || trimmedUser === 'phoenixfitnesscentre03@gmail.com' || trimmedUser === 'admin@phoenixgym.com') && (authPassword === 'phoenix fitness centre' || authPassword === 'admin123');
      if (isOfficialAdmin) {
        onRoleChange('admin', { email: authUsername.trim(), name: 'Phoenix Gym Admin', role: 'admin' });
        setSwitchTargetRole(null);
        setMobileOpen(false);
      } else {
        setAuthError('Invalid Administrator password. Please check your credentials.');
      }
    } else if (switchTargetRole === 'trainer') {
      const isTrainer = (trimmedUser === 'trainer@phoenixgym.com' || trimmedUser === 'trainer03' || trimmedUser === 'phoenix_trainer') && (authPassword === 'trainer fitness centre' || authPassword === 'trainer123');
      if (isTrainer) {
        onRoleChange('trainer', { email: authUsername.trim(), name: 'Phoenix Gym Coach', role: 'trainer' });
        setSwitchTargetRole(null);
        setMobileOpen(false);
      } else {
        setAuthError('Invalid Trainer password. Please check your credentials.');
      }
    }
  };

  return (
    <>
      {/* Mobile Top Navigation Bar (Visible only on screens < md) */}
      <header className="md:hidden sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-xl border border-red-500/40 bg-zinc-950 shrink-0">
            <img src={phoenixLogo} alt="Phoenix Logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white leading-tight">Phoenix Fitness</h1>
            <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">Centre Core</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Add Member button on Mobile header (Admin only) */}
          {userRole !== 'trainer' && (
            <button
              onClick={() => handleNavClick('add-member')}
              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[11px] font-bold rounded-full shadow-md flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-zinc-300 hover:text-white bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer"
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
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container (Desktop: Pinned sidebar | Mobile: Slide-out drawer) */}
      <aside className={`
        fixed md:static top-0 left-0 z-50 h-full w-64 min-h-screen bg-zinc-950/95 md:bg-zinc-950/65 backdrop-blur-xl border-r border-zinc-900 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Gym Logo / Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-2xl border border-red-500/40 bg-zinc-950/90 shrink-0 shadow-md shadow-red-950/40">
                <img src={phoenixLogo} alt="Phoenix Fitness Centre Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white m-0 leading-tight">Phoenix Fitness</h1>
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block mt-0.5">Centre Core</span>
              </div>
            </div>

            {/* Mobile drawer close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-950/30 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 font-medium'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span className="text-sm">{item.label}</span>
                  {item.id === 'notifications' && alertsCount > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {alertsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Role Badge and Switcher */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/60">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Active Role</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
              userRole === 'admin' 
                ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              {userRole === 'admin' ? '👑 Admin' : '💪 Trainer'}
            </span>
          </div>

          {/* Secure Role Switcher Buttons */}
          {onRoleChange && (
            <div className="mb-3 space-y-1">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-zinc-400" />
                <span>Switch Account (Auth Req)</span>
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'admin', label: '👑 Admin' },
                  { id: 'trainer', label: '💪 Trainer' }
                ].map(r => {
                  const isCurrent = userRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRoleButtonClick(r.id)}
                      className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-zinc-800 border-red-500/80 text-white shadow-sm'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                      title={isCurrent ? 'Current Active Role' : `Click to enter password & switch to ${r.label}`}
                    >
                      <span>{r.label}</span>
                      {!isCurrent && <KeyRound className="w-2.5 h-2.5 text-amber-400/80 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Logout button */}
          <button
            onClick={() => {
              setMobileOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 cursor-pointer font-semibold text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Role Switch Security Authentication Modal */}
      {switchTargetRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                {switchTargetRole === 'admin' ? (
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                ) : (
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                )}
                <h3 className="text-sm font-bold text-white">
                  Switch to {switchTargetRole === 'admin' ? 'Administrator' : 'Trainer'} Account
                </h3>
              </div>
              <button
                onClick={() => setSwitchTargetRole(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Please enter the security password to authenticate as <strong>{switchTargetRole.toUpperCase()}</strong>.
            </p>

            {authError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthenticateAndSwitch} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  {switchTargetRole === 'admin' ? 'Admin Email' : 'Trainer Username / Email'}
                </label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  {switchTargetRole === 'admin' ? 'Admin Security Password' : 'Trainer Password'}
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  autoFocus
                  required
                />
              </div>

              {/* Reference credentials card */}
              <div className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-[10px] text-zinc-400">
                <p className="font-bold text-zinc-300 uppercase">{switchTargetRole.toUpperCase()} Credentials</p>
                <p className="mt-0.5">User: <code className="text-red-400 font-mono">{switchTargetRole === 'admin' ? 'phoenixgym.vkp@gmail.com' : 'trainer@phoenixgym.com'}</code></p>
                <p className="mt-0.5">Pass: <code className="text-emerald-400 font-mono">{switchTargetRole === 'admin' ? 'phoenix fitness centre' : 'trainer fitness centre'}</code></p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSwitchTargetRole(null)}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5 ${
                    switchTargetRole === 'admin'
                      ? 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify &amp; Switch Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
