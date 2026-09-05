import React, { useMemo, useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Hourglass, 
  AlertTriangle, 
  TrendingUp, 
  IndianRupee,
  Plus,
  RefreshCw,
  Send,
  BarChart3,
  BellRing,
  CheckCircle2,
  XCircle,
  Clock,
  Dumbbell
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { 
  MembershipGrowthChart, 
  MemberDistributionChart 
} from '../components/Charts';
import { getReminders, saveReminders } from '../db/mockDb';

export default function Dashboard({ members, payments, setPage }) {
  const [reminders, setReminders] = useState(() => getReminders());
  const [triggerStatus, setTriggerStatus] = useState('');

  // 1. Compute summary metrics dynamically based on real-time current date
  const metrics = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'Active').length;
    
    // Expiring soon: ending date is within the next 15 days, and member is active
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fifteenDaysFromNow = new Date(today);
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    const todayStr = today.toISOString().split('T')[0];
    
    const expiringSoon = members.filter(m => {
      if (m.status !== 'Active') return false;
      const endDate = new Date(m.endDate);
      return endDate >= today && endDate <= fifteenDaysFromNow;
    }).length;

    // Pending payments
    const pendingPayments = members.filter(m => m.paymentStatus === 'Pending').length;

    // Today's Renewals: members whose membership ends today or has been registered/renewed today
    const todaysRenewals = members.filter(m => {
      return (m.startDate === todayStr || m.endDate === todayStr) && m.paymentStatus === 'Paid';
    }).length;

    // Total Revenue
    const revenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      total,
      active,
      expiringSoon,
      pendingPayments,
      todaysRenewals,
      revenue
    };
  }, [members, payments]);

  // 2. Compute Reminder Statistics
  const reminderStats = useMemo(() => {
    const sent = reminders.filter(r => r.status === 'Sent').length;
    const failed = reminders.filter(r => r.status === 'Failed').length;
    const pending = reminders.filter(r => r.status === 'Pending').length;
    return { sent, failed, pending };
  }, [reminders]);

  // 3. Automated Expiry Reminders Scheduling Action (Scans 1, 3, and 5 days before expiry)
  const handleTriggerReminders = () => {
    setTriggerStatus('Scanning database for expiring memberships...');
    
    setTimeout(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      const currentList = [...reminders];
      let newDispatches = 0;
      let duplicatesSkipped = 0;

      // Scan day intervals: 1, 3, 5 days before expiry
      const targetIntervals = [1, 3, 5];

      members.forEach(member => {
        if (member.status !== 'Active') return;

        const endDate = new Date(member.endDate);
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (targetIntervals.includes(diffDays)) {
          const channels = ['WhatsApp', 'SMS'];
          
          channels.forEach(channel => {
            const alreadySentToday = currentList.some(r => 
              (r.phone === member.phone || r.phone === "+91 9487817301") && 
              r.date === todayStr && 
              r.type === channel &&
              r.message.includes(member.fullName) &&
              (r.message.includes(`expires in 5 day(s)`) || r.message.includes(`expires in 3 day(s)`) || r.message.includes(`expires in 1 day(s)`))
            );

            if (alreadySentToday) {
              duplicatesSkipped++;
              return;
            }

            let reminderMessage = '';
            if (diffDays === 5) {
              reminderMessage = `Hello ${member.fullName}, your Phoenix Gym membership expires in 5 day(s). Please renew your membership to continue uninterrupted access. Don't break your workout streak!`;
            } else if (diffDays === 3) {
              reminderMessage = `Hello ${member.fullName}, your Phoenix Gym membership expires in 3 day(s). Please renew your membership to continue uninterrupted access. Early renewals keep your fitness routine on track!`;
            } else {
              reminderMessage = `Hello ${member.fullName}, your Phoenix Gym membership expires in 1 day(s). Please renew your membership to continue uninterrupted access. Secure your slot to avoid lockout!`;
            }

            const newLog = {
              id: `REM-${101 + currentList.length}`,
              clientName: member.fullName,
              phone: member.phone || "+91 9487817301",
              date: todayStr,
              type: channel,
              status: "Sent",
              message: reminderMessage
            };

            currentList.unshift(newLog);
            newDispatches++;
          });
        }
      });

      if (newDispatches > 0) {
        setReminders(currentList);
        saveReminders(currentList);
        setTriggerStatus(`Dispatched ${newDispatches} alerts (WhatsApp & SMS) successfully!`);
      } else if (duplicatesSkipped > 0) {
        setTriggerStatus(`All reminders for today were already sent. (${duplicatesSkipped} checks skipped to prevent duplicates)`);
      } else {
        setTriggerStatus('No members found expiring in exactly 1, 3, or 5 days.');
      }

      setTimeout(() => setTriggerStatus(''), 4000);
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Real-time Dashboard Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Active Members" 
          value={metrics.active} 
          icon={UserCheck} 
          trend="+12%" 
          trendType="up"
          glowColor="red"
          onClick={() => setPage('members')}
        />
        <StatCard 
          title="Expiring Soon" 
          value={metrics.expiringSoon} 
          icon={Hourglass} 
          trend="15 Days Horizon" 
          trendType={metrics.expiringSoon > 0 ? "down" : "up"}
          glowColor="default"
          onClick={() => setPage('notifications')}
        />
        <StatCard 
          title="Payments Pending" 
          value={metrics.pendingPayments} 
          icon={AlertTriangle} 
          trend={metrics.pendingPayments > 0 ? "Action Required" : "All Settled"} 
          trendType={metrics.pendingPayments > 0 ? "down" : "up"}
          glowColor="default"
          onClick={() => setPage('payments')}
        />
        <StatCard 
          title="Today's Renewals" 
          value={metrics.todaysRenewals} 
          icon={RefreshCw} 
          trend="Live Subscriptions" 
          trendType="up"
          glowColor="cyan"
          onClick={() => setPage('members')}
        />
      </div>

      {/* Quick Action buttons panel */}
      <div className="card-premium p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick Actions Console</h3>
          <span className="text-[11px] text-zinc-500 font-medium">Common Operations</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setPage('add-member')}
            className="card-interactive p-4 flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white">Enroll Member</span>
            <span className="text-[10px] text-zinc-500 mt-0.5 hidden sm:block">Add new client</span>
          </button>

          <button
            onClick={() => setPage('payments')}
            className="card-interactive p-4 flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all mb-2">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white">Receive Fee</span>
            <span className="text-[10px] text-zinc-500 mt-0.5 hidden sm:block">Record manual bill</span>
          </button>

          <button
            onClick={handleTriggerReminders}
            className="card-interactive p-4 flex flex-col items-center justify-center text-center cursor-pointer group relative overflow-hidden"
          >
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all mb-2">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white">Send Reminders</span>
            <span className="text-[10px] text-zinc-500 mt-0.5 hidden sm:block">WhatsApp auto-scan</span>
          </button>

          <button
            onClick={() => setPage('reports')}
            className="card-interactive p-4 flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all mb-2">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-white">View Analytics</span>
            <span className="text-[10px] text-zinc-500 mt-0.5 hidden sm:block">Growth & breakdown</span>
          </button>
        </div>
        {triggerStatus && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold animate-pulse text-center">
            {triggerStatus}
          </div>
        )}
      </div>

      {/* Reminder Dispatch Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reminder Stats widgets */}
        <div className="card-premium p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Reminder Logs Monitor</h4>
            <p className="text-xs text-zinc-400">Total automated expiration warnings stats</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-black/40 border border-white/[0.06] rounded-xl text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1.5" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Sent</span>
              <h5 className="text-lg font-extrabold text-white mt-0.5">{reminderStats.sent}</h5>
            </div>
            <div className="p-3 bg-black/40 border border-white/[0.06] rounded-xl text-center">
              <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1.5" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Pending</span>
              <h5 className="text-lg font-extrabold text-white mt-0.5">{reminderStats.pending}</h5>
            </div>
            <div className="p-3 bg-black/40 border border-white/[0.06] rounded-xl text-center">
              <XCircle className="w-4 h-4 text-rose-500 mx-auto mb-1.5" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Failed</span>
              <h5 className="text-lg font-extrabold text-white mt-0.5">{reminderStats.failed}</h5>
            </div>
          </div>

          <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl">
            <span className="text-xs font-bold text-red-400 block mb-1">Admin Dispatch Channel</span>
            <p className="text-xs text-zinc-400 leading-normal">
              Active WhatsApp Web line: <code className="text-white font-bold">+91 9487817301</code>
            </p>
          </div>
        </div>

        {/* Recent Reminder Logs Table */}
        <div className="card-premium p-5 sm:p-6 lg:col-span-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-white/[0.06] pb-3 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-red-500" />
            Recent WhatsApp Dispatches Logs
          </h4>
          <div className="overflow-y-auto max-h-[220px] space-y-2.5 pr-1">
            {reminders.length > 0 ? (
              reminders.map((log) => (
                <div key={log.id} className="p-3 bg-black/40 border border-white/[0.06] rounded-xl flex items-center justify-between gap-4 text-xs hover:border-white/10 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white flex items-center gap-2">
                      {log.clientName}
                      <span className="text-[11px] text-zinc-400 font-normal">{log.phone}</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{log.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {log.status}
                    </span>
                    <p className="text-[10px] text-zinc-400 font-medium mt-1">{log.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-400">All member reminders are currently up to date.</p>
                <p className="text-[11px] text-zinc-500">Scan database to send automated 1-day or 3-day WhatsApp reminders.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-premium p-5 sm:p-6 lg:col-span-2">
          <MembershipGrowthChart />
        </div>

        <div className="card-premium p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Member Distribution</h4>
            <p className="text-xs text-zinc-400 mb-4">Ratio of active vs inactive members</p>
          </div>
          <MemberDistributionChart activeCount={metrics.active} inactiveCount={members.length - metrics.active} />
        </div>
      </div>
    </div>
  );
}
