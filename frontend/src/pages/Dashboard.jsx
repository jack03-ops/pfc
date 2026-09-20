import React, { useMemo } from 'react';
import { 
  UserCheck, 
  Hourglass, 
  AlertTriangle, 
  RefreshCw
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard({ members, payments, setPage }) {
  // 1. Compute summary metrics dynamically based on live members state and real-time dates
  const metrics = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const fifteenDaysEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 23, 59, 59, 999);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const total = members.length;
    const active = members.filter(m => m.status === 'Active').length;
    
    // Tab 1: Expiring soon: ending date is within the next 15 days, and member is active
    const expiringSoon = members.filter(m => {
      if (m.status !== 'Active' || !m.endDate) return false;
      const parts = m.endDate.split('-');
      if (parts.length !== 3) return false;
      const end = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59, 999);
      return end >= todayStart && end <= fifteenDaysEnd;
    }).length;

    // Tab 2: Pending payments
    const pendingPayments = members.filter(m => m.paymentStatus === 'Pending').length;

    // Tab 3: Today's Renewals: members whose membership ends today or has been renewed today
    const todaysRenewals = members.filter(m => {
      const isDueToday = m.endDate === todayStr && m.status === 'Active';
      const renewedToday = (m.startDate === todayStr || m.joiningDate === todayStr) && (m.membershipType === 'Renewal' || m.paymentStatus === 'Paid');
      return isDueToday || renewedToday;
    }).length;

    // Total Revenue
    const revenue = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return {
      total,
      active,
      expiringSoon,
      pendingPayments,
      todaysRenewals,
      revenue
    };
  }, [members, payments]);

  return (
    <div className="w-full max-w-full p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-60px)] md:max-h-[calc(100vh-80px)] bg-[#030303]">
      {/* Real-time Dashboard Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          trend="Action Required" 
          trendType="down"
          glowColor="default"
          onClick={() => setPage('notifications')}
        />
        <StatCard 
          title="Payments Pending" 
          value={metrics.pendingPayments} 
          icon={AlertTriangle} 
          trend="Invoices Outstanding" 
          trendType="down"
          glowColor="default"
          onClick={() => setPage('payments')}
        />
        <StatCard 
          title="Today's Renewals" 
          value={metrics.todaysRenewals} 
          icon={RefreshCw} 
          trend="Active Subscriptions" 
          trendType="up"
          glowColor="cyan"
          onClick={() => setPage('members')}
        />
      </div>
    </div>
  );
}
