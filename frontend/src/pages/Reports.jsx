import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  UserMinus,
  UserPlus,
  Map, 
  Calendar,
  Layers,
  ArrowUpRight,
  FileSpreadsheet,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  MembershipGrowthChart, 
  RevenueChart, 
  MemberDistributionChart 
} from '../components/Charts';
import TimeframeSelector from '../components/TimeframeSelector';
import { downloadReportCsv } from '../utils/pdfGenerator';

export default function Reports({ members = [], payments = [], userRole = 'admin' }) {
  const [cycleTimeframe, setCycleTimeframe] = useState('1M'); // 1D, 1W, 1M, 3M, 6M, 12M

  // Precise Time-Window Calculation (Daily / Weekly / Monthly / Multi-Month)
  const stats = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let priorStartDate = new Date();
    let daysInPeriod = 30;

    if (cycleTimeframe === '1D') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      priorStartDate = new Date(startDate.getTime() - 86400000);
      daysInPeriod = 1;
    } else if (cycleTimeframe === '1W') {
      startDate = new Date(now.getTime() - 7 * 86400000);
      priorStartDate = new Date(now.getTime() - 14 * 86400000);
      daysInPeriod = 7;
    } else if (cycleTimeframe === '1M') {
      startDate = new Date(now.getTime() - 30 * 86400000);
      priorStartDate = new Date(now.getTime() - 60 * 86400000);
      daysInPeriod = 30;
    } else if (cycleTimeframe === '3M') {
      startDate = new Date(now.getTime() - 90 * 86400000);
      priorStartDate = new Date(now.getTime() - 180 * 86400000);
      daysInPeriod = 90;
    } else if (cycleTimeframe === '6M') {
      startDate = new Date(now.getTime() - 180 * 86400000);
      priorStartDate = new Date(now.getTime() - 360 * 86400000);
      daysInPeriod = 180;
    } else if (cycleTimeframe === '12M') {
      startDate = new Date(now.getTime() - 365 * 86400000);
      priorStartDate = new Date(now.getTime() - 730 * 86400000);
      daysInPeriod = 365;
    }

    const startIso = startDate.toISOString().split('T')[0];
    const priorIso = priorStartDate.toISOString().split('T')[0];

    // 1. Exact Payments in this period & prior period
    const filteredPayments = payments.filter(p => (p.date || '') >= startIso);
    const priorPayments = payments.filter(p => (p.date || '') >= priorIso && (p.date || '') < startIso);

    const revenue = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const priorRevenue = priorPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    
    // Revenue Growth Calculation
    const revDiff = revenue - priorRevenue;
    const revGrowthPercent = priorRevenue > 0 
      ? ((revDiff / priorRevenue) * 100).toFixed(1) 
      : (revenue > 0 ? '+100.0' : '0.0');

    // 2. Active Members Calculation
    const activeMembers = members.filter(m => m.status === 'Active' && !m.isDeleted);
    const activeCount = activeMembers.length;

    // 3. New Joins in Period
    const newJoinsList = members.filter(m => (m.joiningDate || '') >= startIso && !m.isDeleted);
    const newJoinsCount = newJoinsList.length;

    // 4. Churned Members (Members whose endDate expired in this period and are not renewed/active)
    const churnedList = members.filter(m => {
      if (m.isDeleted) return true;
      if (!m.endDate) return false;
      const isExpiredInPeriod = m.endDate >= startIso && m.endDate <= now.toISOString().split('T')[0];
      return isExpiredInPeriod && (m.status === 'Expired' || m.status === 'Inactive');
    });
    const churnedCount = churnedList.length;

    // Churn Rate Formula: (Churned Members / Base Active Members) * 100
    const baseCount = Math.max(activeCount + churnedCount, 1);
    const churnRateNum = Math.min(100, Math.max(0, (churnedCount / baseCount) * 100));
    const churnRate = `${churnRateNum.toFixed(1)}%`;
    const retentionRate = `${(100 - churnRateNum).toFixed(1)}%`;
    const netGrowth = newJoinsCount - churnedCount;

    // 5. Financial Unit Economics
    const arpu = activeCount > 0 ? Math.round(revenue / activeCount) : 0;
    const averageTxn = filteredPayments.length > 0 ? Math.round(revenue / filteredPayments.length) : 0;

    // 6. Payment Mode Breakdown
    const methodCounts = { UPI: 0, Cash: 0, Card: 0, "Net Banking": 0 };
    filteredPayments.forEach(p => {
      const m = p.method || 'UPI';
      if (methodCounts[m] !== undefined) {
        methodCounts[m] += Number(p.amount) || 0;
      } else {
        methodCounts['UPI'] += Number(p.amount) || 0;
      }
    });

    // 7. Village Geographic Hotspots
    const villageCounts = {};
    members.filter(m => !m.isDeleted).forEach(m => {
      if (m.village) {
        villageCounts[m.village] = (villageCounts[m.village] || 0) + 1;
      }
    });
    const topVillages = Object.entries(villageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      revenue,
      priorRevenue,
      revGrowthPercent,
      filteredPayments,
      activeMembers: activeCount,
      newJoins: newJoinsCount,
      churnedCount,
      churnRate,
      retentionRate,
      netGrowth,
      arpu,
      averageTxn,
      methodCounts,
      topVillages,
      daysInPeriod
    };
  }, [members, payments, cycleTimeframe]);

  // Download Handlers
  const handleExportCsv = () => {
    downloadReportCsv({
      cycle: cycleTimeframe,
      stats: stats,
      payments: stats.filteredPayments,
      members: members
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-[calc(100vh-80px)]">
      
      {/* Header bar with Role Indicator, Exports, and Timeframe Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-500" />
            Revenue & Growth Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial audits, churn intelligence, and unit economics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export Excel / CSV Button */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Download CSV for Microsoft Excel and Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel / CSV</span>
          </button>

          {/* Timeframe Switcher */}
          <TimeframeSelector selectedId={cycleTimeframe} onChange={setCycleTimeframe} />
        </div>
      </div>

      {/* RBAC Notice if viewing as Trainer */}
      {userRole !== 'admin' && (
        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Logged in as <strong>{userRole.toUpperCase()}</strong>. Financial metrics are managed by Administrator.</span>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Real Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Period Revenue</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><DollarSign className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">₹{stats.revenue.toLocaleString()}</h3>
          <div className="flex items-center gap-1.5 text-xs font-bold mt-3">
            {Number(stats.revGrowthPercent) >= 0 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +{stats.revGrowthPercent}% vs prior
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                {stats.revGrowthPercent}% vs prior
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Avg transaction: ₹{stats.averageTxn}</p>
        </div>

        {/* Metric 2: New Members Enrolled */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Enrollments</span>
            <span className="p-2 bg-red-500/10 text-red-400 rounded-lg"><UserPlus className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">+{stats.newJoins} Joins</h3>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-3">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Net Growth: {stats.netGrowth >= 0 ? `+${stats.netGrowth}` : stats.netGrowth}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Active base: {stats.activeMembers} members</p>
        </div>

        {/* Metric 3: Churn Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Period Churn Rate</span>
            <span className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><UserMinus className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-extrabold text-rose-400">{stats.churnRate}</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mt-3">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{stats.churnedCount} lapsed subscriptions</span>
          </div>
          <p className="text-[10px] text-emerald-400 mt-1">Retention: {stats.retentionRate}</p>
        </div>

        {/* Metric 4: ARPU (Average Revenue Per User) */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit ARPU</span>
            <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><Percent className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">₹{stats.arpu.toLocaleString()}</h3>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold mt-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Per active member</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{stats.daysInPeriod}-day scope tier</p>
        </div>

      </div>

      {/* Main performance charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
          <MembershipGrowthChart />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
          <RevenueChart />
        </div>
      </div>

      {/* Payment methods allocations & Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Member Distribution</h4>
            <p className="text-xs text-slate-400 mb-6">Active vs Inactive subscriptions overview</p>
          </div>
          <MemberDistributionChart 
            activeCount={stats.activeMembers} 
            inactiveCount={members.filter(m => m.status === 'Inactive' || m.status === 'Expired').length} 
          />
        </div>

        {/* Payment allocations breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 lg:col-span-2 space-y-6">
          <h4 className="text-sm font-bold text-white border-b border-zinc-900 pb-3 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            Payment Category Allocation Breakdown ({cycleTimeframe})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.methodCounts).map(([method, amount]) => (
              <div key={method} className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{method}</p>
                <h5 className="text-base font-extrabold text-white mt-1">₹{amount.toLocaleString()}</h5>
                <span className="text-[9px] text-slate-400 font-semibold block mt-2">
                  {stats.revenue > 0 ? ((amount / stats.revenue) * 100).toFixed(1) : 0}% share
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h5 className="text-xs font-bold text-white mb-1">Top Village Cohorts</h5>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {stats.topVillages.map(([village, count], idx) => (
                  <span key={village} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-slate-300">
                    {idx + 1}. {village} <strong className="text-cyan-400 ml-1">({count})</strong>
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
              Localized enrollment campaigns show strong retention in these core regions.
            </p>
          </div>
        </div>
      </div>

      {/* Period Transaction Ledger Table */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Transactions in Selected Cycle ({stats.filteredPayments.length} records)
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            Total: <strong className="text-emerald-400 font-extrabold">₹{stats.revenue.toLocaleString()}</strong>
          </span>
        </div>

        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/45 text-slate-500 text-[9px] uppercase font-black tracking-wider">
                <th className="p-2.5 pl-4">Receipt</th>
                <th className="p-2.5">Client ID</th>
                <th className="p-2.5">Member Name</th>
                <th className="p-2.5 text-center">Plan</th>
                <th className="p-2.5 text-center">Method</th>
                <th className="p-2.5 text-center">Amount</th>
                <th className="p-2.5 pr-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40 text-[11px] text-slate-300">
              {stats.filteredPayments.length > 0 ? (
                stats.filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/20">
                    <td className="p-2.5 pl-4 font-mono text-zinc-400">{p.id}</td>
                    <td className="p-2.5 font-mono text-zinc-500">{p.clientId}</td>
                    <td className="p-2.5 font-semibold text-white">{p.clientName}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 bg-zinc-800 rounded font-semibold text-[9px] uppercase text-slate-400">
                        {p.plan}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-bold text-emerald-400">{p.method}</td>
                    <td className="p-2.5 text-center font-extrabold text-white">₹{p.amount}</td>
                    <td className="p-2.5 pr-4 text-right text-slate-500 font-semibold">{p.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 text-xs">
                    No transactions recorded within this timeframe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
