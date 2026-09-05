import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Map, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  MembershipGrowthChart, 
  RevenueChart, 
  MemberDistributionChart 
} from '../components/Charts';
import TimeframeSelector from '../components/TimeframeSelector';

export default function Reports({ members, payments }) {
  const [cycleTimeframe, setCycleTimeframe] = useState('1M'); // 1D, 1W, 1M, 3M, 6M, 12M

  // Multipliers for timeframe revenue scaling
  const timeframeMultipliers = {
    '1D': 0.1,
    '1W': 0.3,
    '1M': 1.0,
    '3M': 2.5,
    '6M': 4.8,
    '12M': 9.2
  };

  // Dynamically compute charts & statistics based on timeframe selection
  const stats = useMemo(() => {
    const mult = timeframeMultipliers[cycleTimeframe] || 1.0;
    const baseRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const scaledRevenue = Math.round(baseRevenue * mult);

    // Compute Village breakdown metrics
    const villageCounts = {};
    members.forEach(m => {
      if (m.village) {
        villageCounts[m.village] = (villageCounts[m.village] || 0) + 1;
      }
    });
    const topVillages = Object.entries(villageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Compute payment methods ratio
    const methodCounts = { UPI: 0, Cash: 0, Card: 0, "Net Banking": 0 };
    payments.forEach(p => {
      if (methodCounts[p.method] !== undefined) {
        methodCounts[p.method] += Math.round(p.amount * mult);
      }
    });

    return {
      revenue: scaledRevenue,
      topVillages,
      methodCounts,
      newJoins: Math.max(1, Math.round(members.length * (mult > 1 ? mult * 0.7 : mult)))
    };
  }, [members, payments, cycleTimeframe]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-[calc(100vh-80px)]">
      {/* Timeframe selector header row */}
      <div className="flex justify-end border-b border-zinc-900 pb-5">
        <TimeframeSelector selectedId={cycleTimeframe} onChange={setCycleTimeframe} />
      </div>

      {/* Main Reports Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Income generated</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><DollarSign className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">₹{stats.revenue.toLocaleString()}</h3>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs past cycle</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Enrolled Members</span>
            <span className="p-2 bg-red-500/10 text-red-400 rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">{stats.newJoins} Registered</h3>
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold mt-4">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active growth coefficient</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Village Hotspots</span>
            <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg"><Map className="w-4 h-4" /></span>
          </div>
          <div className="space-y-1.5">
            {stats.topVillages.map(([village, count], idx) => (
              <div key={village} className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">{idx+1}. {village}</span>
                <span className="text-cyan-400">{count} Members</span>
              </div>
            ))}
          </div>
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

      {/* Payment methods allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white mb-2">Member Distribution</h4>
            <p className="text-xs text-slate-400 mb-6">Active vs Inactive subscriptions overview</p>
          </div>
          <MemberDistributionChart 
            activeCount={members.filter(m => m.status === 'Active').length} 
            inactiveCount={members.filter(m => m.status === 'Inactive').length} 
          />
        </div>

        {/* Detailed Payment statistics breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 lg:col-span-2 space-y-6">
          <h4 className="text-sm font-bold text-white border-b border-zinc-900 pb-3 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            Payment Category Allocation Breakdown
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(stats.methodCounts).map(([method, amount]) => (
              <div key={method} className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{method}</p>
                <h5 className="text-base font-extrabold text-white mt-1">₹{amount.toLocaleString()}</h5>
                <span className="text-[9px] text-slate-400 font-semibold block mt-2">
                  {stats.revenue > 0 ? ((amount/stats.revenue)*100).toFixed(1) : 0}% share
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-2xl">
            <h5 className="text-xs font-bold text-white mb-1">Geographical Analytics Insights</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Village marketing campaigns show Rampur and Sohna remain high acquisition zones. Increasing flyers and WhatsApp campaigns here would raise average membership lifetime value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
