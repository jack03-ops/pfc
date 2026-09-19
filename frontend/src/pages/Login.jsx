import React, { useState } from 'react';
import { Lock, Mail, Dumbbell, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import phoenixLogo from '../assets/phoenix_logo.png';

export default function Login({ onLoginSuccess, logoutReason }) {
  const [email, setEmail] = useState('phoenixgym.vkp@gmail.com');
  const [password, setPassword] = useState('phoenix fitness academy');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();

      const isOfficialAdmin = (trimmedEmail === 'phoenixgym.vkp@gmail.com' || trimmedEmail === 'phoenixfitnesscentre03@gmail.com') && (password === 'phoenix fitness academy' || password === 'phoenix fitness centre');
      const isDemoAdmin = trimmedEmail === 'admin@phoenixgym.com' && (password === 'admin123' || password === 'phoenix fitness academy');

      if (isOfficialAdmin || isDemoAdmin) {
        onLoginSuccess({ email: email.trim(), name: 'Phoenix Gym Admin', role: 'admin' });
      } else {
        setError('Invalid Administrator credentials. Please check your Administrator email and password.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-600/10 blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[150px] animate-pulse-glow" />

      <div className="w-full max-w-md">
        {/* Gym Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-1.5 bg-zinc-950 border border-red-500/30 rounded-3xl mb-4 shadow-xl shadow-red-950/20">
            <img src={phoenixLogo} alt="Phoenix Logo" className="w-16 h-16 object-contain animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Phoenix Fitness Academy</h2>
          <p className="text-zinc-400 text-sm mt-1">Management Portal & Telemetry Console</p>
        </div>

        {/* Inactivity Logout Alert (if triggered) */}
        {logoutReason && (
          <div className="mb-4 p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <div className="text-left">
              <span className="font-bold block text-white uppercase text-[10px]">Session Security Notice</span>
              <span>{logoutReason}</span>
            </div>
          </div>
        )}

        {/* Card Panel */}
        <div className="glass-panel p-5 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-zinc-900">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-rose-600 to-cyan-500" />
          
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Administrator Sign In</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Enter admin credentials to manage gym operations</p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border bg-red-500/15 text-red-400 border-red-500/30 shrink-0">
              👑 Admin Only
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 transition-all placeholder:text-zinc-650"
                  placeholder="phoenixgym.vkp@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Admin Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500 transition-all placeholder:text-zinc-650"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 text-white font-semibold rounded-xl text-xs transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 shadow-red-950/40"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Security & auto-logout notice */}
          <div className="mt-5 p-3 bg-zinc-950 border border-zinc-900 rounded-2xl flex gap-3 items-center">
            <div className="p-2 rounded-xl shrink-0 bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-[10px] text-zinc-400 leading-tight">
              <span className="text-zinc-300 font-bold block mb-0.5">Session Security Protection</span>
              <span>Inactive sessions automatically log out after 20 minutes to prevent unauthorized access.</span>
            </div>
          </div>

          {/* Credentials helper box */}
          <div className="mt-3 p-3 bg-zinc-950 border border-zinc-900 rounded-2xl flex gap-3 items-center">
            <div className="p-2 rounded-xl shrink-0 bg-red-500/10 text-red-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="text-[10px] text-zinc-400 leading-tight">
              <p className="font-bold text-zinc-200 uppercase">Administrator Credentials</p>
              <p className="mt-1">Email: <code className="text-red-400 font-mono">phoenixgym.vkp@gmail.com</code></p>
              <p className="mt-0.5">Password: <code className="text-emerald-400 font-mono">phoenix fitness academy</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
