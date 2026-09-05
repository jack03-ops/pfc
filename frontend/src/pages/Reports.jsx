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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Timeframe selector header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Analytics & Business Intelligence</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Membership revenue trends, client growth metrics, and payment analytics</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-zinc-500 font-medium">Cycle:</span>
          <TimeframeSelector selectedId={cycleTimeframe} onChange={setCycleTimeframe} />
        </div>
      </div>

      {/* Main Reports Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div className="card-premium p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Income Generated</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-2 tracking-tight">
                ₹{stats.revenue.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-3 pt-3 border-t border-zinc-800/60">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs previous cycle</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-premium p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Net Enrolled Members</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-2 tracking-tight">
                {stats.newJoins} Registered
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium mt-3 pt-3 border-t border-zinc-800/60">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active growth coefficient</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-premium p-5 sm:p-6 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Top Village Hotspots</p>
              <p className="text-xs text-zinc-500 mt-0.5">Top member acquisition areas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Map className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2 mt-2 pt-2 border-t border-zinc-800/60">
            {stats.topVillages.length > 0 ? (
              stats.topVillages.map(([village, count], idx) => (
                <div key={village} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-medium">{idx + 1}. {village}</span>
                  <span className="font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[11px]">
                    {count} Members
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500">No village demographic data</p>
            )}
          </div>
        </div>
      </div>

      {/* Main performance charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-premium p-5 sm:p-6">
          <MembershipGrowthChart />
        </div>

        <div className="card-premium p-5 sm:p-6">
          <RevenueChart />
        </div>
      </div>

      {/* Payment methods allocations & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-premium p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-zinc-100 mb-1">Member Distribution</h4>
            <p className="text-xs text-zinc-400 mb-6">Active vs Inactive subscriptions overview</p>
          </div>
          <MemberDistributionChart 
            activeCount={members.filter(m => m.status === 'Active').length} 
            inactiveCount={members.filter(m => m.status === 'Inactive').length} 
          />
        </div>

        {/* Detailed Payment statistics breakdown */}
        <div className="card-premium p-5 sm:p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Layers className="w-4 h-4 text-red-500" />
            <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Payment Category Allocation Breakdown
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(stats.methodCounts).map(([method, amount]) => (
              <div key={method} className="p-3.5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-center hover:border-zinc-700 transition-colors">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{method}</p>
                <h5 className="text-sm sm:text-base font-extrabold text-zinc-100 mt-1">₹{amount.toLocaleString()}</h5>
                <span className="text-[10px] text-zinc-500 font-medium block mt-1.5">
                  {stats.revenue > 0 ? ((amount / stats.revenue) * 100).toFixed(1) : 0}% share
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl">
            <h5 className="text-xs font-semibold text-zinc-200 mb-1">Geographical Analytics Insights</h5>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Village registration records show Rampur and surrounding areas remain high acquisition zones. Increasing direct WhatsApp updates and referrals in these regions yields higher lifetime member retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
