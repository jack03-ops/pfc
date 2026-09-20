import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Hourglass, 
  CreditCard, 
  UserPlus, 
  CheckCircle2, 
  MessageSquare,
  AlertTriangle,
  Mail,
  Clock,
  Trash2,
  CheckCheck,
  RotateCcw,
  RefreshCw,
  X,
  Search,
  Filter
} from 'lucide-react';

export default function Notifications({ 
  members, 
  payments, 
  clearedIds = [],
  onClearNotification,
  onClearAllNotifications,
  onRestoreNotifications,
  onRefreshFeed,
  onMarkAsPaid, 
  onSendReminderEmail, 
  onSendWhatsAppReminder, 
  onRenewMember,
  setPage 
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Compute alerts dynamically from Mock DB
  const alertsList = useMemo(() => {
    const list = [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const fifteenDaysEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 23, 59, 59, 999);

    // 1. Expiring and Expired memberships
    members.forEach(m => {
      if (m.endDate) {
        const parts = m.endDate.split('-');
        if (parts.length === 3) {
          const end = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59, 999);
          const diffTime = end.getTime() - todayStart.getTime();
          const daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (daysLeft < 0 || m.status === 'Expired') {
            list.push({
              id: `exp-${m.id}`,
              type: 'expiration',
              category: 'expired',
              daysLeft: daysLeft,
              title: '🚨 Membership Expired',
              message: `${m.fullName} (${m.id})'s ${m.plan} plan expired on ${m.endDate}. Renew to reactivate gym access.`,
              member: m,
              severity: 'danger',
              isExpired: true,
              priority: 1
            });
          } else if (end <= fifteenDaysEnd) {
            const isToday = daysLeft === 0;
            const isUrgent = daysLeft === 1;
            const isTwoDay = daysLeft === 2;
            const isThreeDay = daysLeft === 3;

            let alertTitle = `Membership Expiring in ${daysLeft} Days`;
            if (isToday) alertTitle = '⚠️ Membership Expires TODAY!';
            else if (isUrgent) alertTitle = '🚨 Expires Tomorrow (1 Day Left!)';
            else if (isTwoDay) alertTitle = '⏳ Expires in 2 Days';
            else if (isThreeDay) alertTitle = '⏰ Expires in 3 Days';

            list.push({
              id: `exp-${m.id}`,
              type: 'expiration',
              category: 'expiring',
              daysLeft: daysLeft,
              title: alertTitle,
              message: `${m.fullName} (${m.id})'s ${m.plan} plan expires ${isToday ? 'TODAY' : isUrgent ? 'tomorrow' : `in ${daysLeft} days`} on ${m.endDate}.`,
              member: m,
              severity: isToday || isUrgent ? 'danger' : 'warning',
              isExpired: false,
              priority: isToday ? 2 : isUrgent ? 3 : 4
            });
          }
        }
      }
    });

    // 2. Pending dues
    members.forEach(m => {
      if (m.paymentStatus === 'Pending') {
        list.push({
          id: `pend-${m.id}`,
          type: 'payment',
          category: 'dues',
          title: 'Pending Dues Outstanding',
          message: `${m.fullName} (${m.id}) has outstanding fee payments for the ${m.plan} plan.`,
          member: m,
          severity: 'danger',
          priority: 5
        });
      }
    });

    // 3. New registrations (members marked as New or newly enrolled)
    members.forEach(m => {
      if (m.membershipType === 'New') {
        list.push({
          id: `new-${m.id}`,
          type: 'join',
          category: 'new',
          title: 'New Member Registered',
          message: `${m.fullName} (${m.id}) enrolled as a new member from village ${m.village || 'N/A'}.`,
          member: m,
          severity: 'info',
          priority: 6
        });
      }
    });

    // Priority sort: most urgent alerts first
    list.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.daysLeft !== undefined && b.daysLeft !== undefined) return a.daysLeft - b.daysLeft;
      return 0;
    });

    // Return ALL notifications without artificial slicing
    return list;
  }, [members]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter out cleared/dismissed alerts
  const visibleAlerts = useMemo(() => {
    return alertsList.filter(a => !clearedIds?.includes(a.id));
  }, [alertsList, clearedIds]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: visibleAlerts.length,
      expired: visibleAlerts.filter(a => a.category === 'expired').length,
      expiring: visibleAlerts.filter(a => a.category === 'expiring').length,
      dues: visibleAlerts.filter(a => a.category === 'dues').length,
      new: visibleAlerts.filter(a => a.category === 'new').length,
    };
  }, [visibleAlerts]);

  // Filtered by selected category and search term
  const filteredAlerts = useMemo(() => {
    return visibleAlerts.filter(alert => {
      if (selectedCategory !== 'all' && alert.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = alert.member?.fullName?.toLowerCase().includes(q);
        const idMatch = alert.member?.id?.toLowerCase().includes(q);
        const phoneMatch = alert.member?.phone?.toLowerCase().includes(q);
        const villageMatch = alert.member?.village?.toLowerCase().includes(q);
        const titleMatch = alert.title?.toLowerCase().includes(q);
        return nameMatch || idMatch || phoneMatch || villageMatch || titleMatch;
      }
      return true;
    });
  }, [visibleAlerts, selectedCategory, searchQuery]);

  const clearedCount = useMemo(() => {
    return (clearedIds || []).filter(id => alertsList.some(a => a.id === id)).length;
  }, [alertsList, clearedIds]);

  // Separate Refresh handler (does NOT clear alerts)
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefreshFeed) {
      onRefreshFeed();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Separate Clear All handler (clears all visible alerts)
  const handleClearAll = () => {
    if (visibleAlerts.length > 0 && onClearAllNotifications) {
      onClearAllNotifications(visibleAlerts.map(a => a.id));
    }
  };

  const handleWhatsAppAlert = (member, daysLeft) => {
    const rawPhone = member.whatsapp || member.phone || '';
    const cleanPhone = String(rawPhone).replace(/\D/g, '').replace(/^91/, '');
    if (!cleanPhone) {
      alert(`No WhatsApp phone number registered for ${member.fullName}`);
      return;
    }

    let text = '';
    const isExpired = daysLeft < 0 || member.status === 'Expired';
    const isToday = daysLeft === 0;
    const isUrgent = daysLeft === 1;
    const isTwoDay = daysLeft === 2;
    const isThreeDay = daysLeft === 3;
    const renewalAmount = member.amountPaid ? Number(member.amountPaid) : 1000;

    if (isExpired) {
      text = `🚨 *MEMBERSHIP EXPIRED NOTICE - PHOENIX FITNESS ACADEMY* 🚨\n\nHello *${member.fullName}*,\n\nYour *${member.plan}* gym membership with *Phoenix Fitness Academy* has expired on *${member.endDate}*.\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Status: Expired (${member.endDate})\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 8015552425* (UPI ID: phoenixgym.vkp@oksbi).\n\nPlease send your payment screenshot to this WhatsApp (+91 8015552425) to reactivate your gym access immediately.\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Academy*\n📞 +91 8015552425`;
    } else if (isToday) {
      text = `⚠️ *URGENT MEMBERSHIP EXPIRES TODAY - PHOENIX FITNESS ACADEMY* ⚠️\n\nHello *${member.fullName}*,\n\nThis is an urgent reminder from *Phoenix Fitness Academy* that your *${member.plan}* gym membership expires *TODAY (${member.endDate})*!\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Expiry Date: ${member.endDate} (Expires Today)\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 8015552425* (UPI ID: phoenixgym.vkp@oksbi).\n\nPlease send your payment screenshot to this WhatsApp (+91 8015552425) to keep your gym access uninterrupted.\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Academy*\n📞 +91 8015552425`;
    } else if (isUrgent) {
      text = `🚨 *URGENT MEMBERSHIP EXPIRY NOTICE - PHOENIX FITNESS ACADEMY* 🚨\n\nHello *${member.fullName}*,\n\nThis is an urgent reminder from *Phoenix Fitness Academy* that your *${member.plan}* gym membership expires *TOMORROW (${member.endDate})*!\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Expiry Date: ${member.endDate} (Expires Tomorrow - 1 Day Left!)\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 8015552425* (UPI ID: phoenixgym.vkp@oksbi).\n\nPlease send your payment screenshot to this WhatsApp (+91 8015552425) to keep your gym access uninterrupted.\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Academy*\n📞 +91 8015552425`;
    } else if (isTwoDay) {
      text = `⏳ *MEMBERSHIP EXPIRY NOTICE - PHOENIX FITNESS ACADEMY* ⏳\n\nHello *${member.fullName}*,\n\nFriendly reminder from *Phoenix Fitness Academy* that your *${member.plan}* gym membership expires in *2 days* on *${member.endDate}*.\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Expiry Date: ${member.endDate} (2 Days Left)\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 8015552425* (UPI ID: phoenixgym.vkp@oksbi).\n\nSend payment confirmation to this WhatsApp number (+91 8015552425). We look forward to continuing your fitness journey!\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Academy*\n📞 +91 8015552425`;
    } else if (isThreeDay) {
      text = `🏋️ *MEMBERSHIP RENEWAL REMINDER - PHOENIX FITNESS ACADEMY* 🏋️\n\nHello *${member.fullName}*,\n\nFriendly reminder from *Phoenix Fitness Academy* that your *${member.plan}* gym membership expires in *3 days* on *${member.endDate}*.\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Expiry Date: ${member.endDate} (3 Days Left)\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 8015552425* (UPI ID: phoenixgym.vkp@oksbi).\n\nSend payment confirmation to this WhatsApp number (+91 8015552425). We look forward to continuing your fitness journey!\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Academy*\n📞 +91 8015552425`;
    } else {
      text = `Hello *${member.fullName}*, this is a friendly reminder from *Phoenix Fitness Academy* regarding your *${member.plan}* membership ending on *${member.endDate}*. Please renew on time to avoid interruption!\n\nUPI: phoenixgym.vkp@oksbi (+91 8015552425)\n\nThank you,\n*Phoenix Fitness Academy*`;
    }

    const encodedText = encodeURIComponent(text);
    // On laptop/desktop, open web.whatsapp.com directly. On mobile devices, open api.whatsapp.com
    const isDesktop = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const whatsappUrl = isDesktop
      ? `https://web.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedText}`;

    window.open(whatsappUrl, '_blank');

    if (onSendWhatsAppReminder) {
      onSendWhatsAppReminder(member, daysLeft);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      {/* Top Header with Responsive Auto-sizing Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
        <div>
          <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500 shrink-0" />
            <span>Notification Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className="text-white font-bold">{visibleAlerts.length}</span> active notification{visibleAlerts.length === 1 ? '' : 's'}
            {clearedCount > 0 && <span className="text-slate-500"> • {clearedCount} dismissed</span>}
          </p>
        </div>

        {/* Action Buttons: Auto-sized for mobile & desktop */}
        <div className="grid grid-cols-2 sm:flex sm:w-auto w-full gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 text-slate-200 hover:text-white border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Refresh and re-scan notifications feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Clear All Button */}
          {visibleAlerts.length > 0 && onClearAllNotifications && (
            <button
              onClick={handleClearAll}
              className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-1.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-red-950/40"
              title="Clear all active notifications"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          {/* Restore Cleared Button */}
          {clearedCount > 0 && onRestoreNotifications && (
            <button
              onClick={onRestoreNotifications}
              className="col-span-2 sm:col-auto px-3.5 py-2 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-slate-200 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Restore previously cleared notifications"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restore ({clearedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Horizontally scrollable chip filter on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80'
            }`}
          >
            <span>All</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategory === 'all' ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {categoryCounts.all}
            </span>
          </button>

          {categoryCounts.expired > 0 && (
            <button
              onClick={() => setSelectedCategory('expired')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                selectedCategory === 'expired'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'bg-zinc-900 text-rose-400 hover:text-white border border-zinc-800/80'
              }`}
            >
              <span>🚨 Expired</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'expired' ? 'bg-black/30 text-white' : 'bg-rose-950/60 text-rose-300'
              }`}>
                {categoryCounts.expired}
              </span>
            </button>
          )}

          {categoryCounts.expiring > 0 && (
            <button
              onClick={() => setSelectedCategory('expiring')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                selectedCategory === 'expiring'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                  : 'bg-zinc-900 text-amber-400 hover:text-white border border-zinc-800/80'
              }`}
            >
              <span>⏳ Expiring</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'expiring' ? 'bg-black/30 text-white' : 'bg-amber-950/60 text-amber-300'
              }`}>
                {categoryCounts.expiring}
              </span>
            </button>
          )}

          {categoryCounts.dues > 0 && (
            <button
              onClick={() => setSelectedCategory('dues')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                selectedCategory === 'dues'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800/80'
              }`}
            >
              <span>💳 Dues</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'dues' ? 'bg-black/30 text-white' : 'bg-red-950/60 text-red-300'
              }`}>
                {categoryCounts.dues}
              </span>
            </button>
          )}

          {categoryCounts.new > 0 && (
            <button
              onClick={() => setSelectedCategory('new')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                selectedCategory === 'new'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                  : 'bg-zinc-900 text-blue-400 hover:text-white border border-zinc-800/80'
              }`}
            >
              <span>👤 New</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'new' ? 'bg-black/30 text-white' : 'bg-blue-950/60 text-blue-300'
              }`}>
                {categoryCounts.new}
              </span>
            </button>
          )}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search member, ID, village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="glass-panel rounded-2xl border border-zinc-900 divide-y divide-zinc-900/80 shadow-2xl">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const Icon = 
              alert.type === 'expiration' ? Hourglass : 
              alert.type === 'payment' ? CreditCard : 
              UserPlus;
            
            const colorClass = 
              alert.severity === 'danger' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
              alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              'bg-blue-500/10 border-blue-500/30 text-blue-400';

            const todayStr = new Date().toISOString().split('T')[0];
            const isReminderSentToday = alert.member?.lastReminderDate === todayStr;
            const isWhatsAppSentToday = alert.member?.lastReminderDate === todayStr && alert.member?.lastReminderType?.includes('WhatsApp');

            return (
              <div 
                key={alert.id} 
                className={`relative p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 transition-all duration-200 ${
                  isReminderSentToday ? 'bg-emerald-950/15 border-l-4 border-l-emerald-500' : 'hover:bg-zinc-900/20'
                }`}
              >
                {/* Mobile top-right dismiss button for clean thumb-reach */}
                {onClearNotification && (
                  <button
                    onClick={() => onClearNotification(alert.id)}
                    className="absolute top-3 right-3 sm:hidden p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Dismiss this notification"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Left side: Icon + Content details */}
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1 pr-7 sm:pr-0">
                  <div className={`p-2.5 sm:p-3 rounded-xl border shrink-0 self-start ${
                    isReminderSentToday ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : colorClass
                  }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                        {alert.title}
                      </h4>
                      {alert.severity === 'danger' && !isReminderSentToday && (
                        <span className="bg-rose-500/15 text-rose-400 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-black border border-rose-500/25">
                          CRITICAL
                        </span>
                      )}
                      {isReminderSentToday && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{alert.member.lastReminderType || 'Reminder'} Sent Today {alert.member.lastReminderTime ? `(${alert.member.lastReminderTime})` : ''}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed break-words">
                      {alert.message}
                    </p>

                    <div className="text-[10px] sm:text-[11px] text-zinc-400 font-medium mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span>ID: <strong className="text-white font-semibold">{alert.member.id}</strong></span>
                      <span className="text-zinc-600">•</span>
                      <span>Phone: <strong className="text-white font-semibold">{alert.member.phone}</strong></span>
                      {alert.member.village && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span>Village: <strong className="text-zinc-300">{alert.member.village}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operations triggers: Auto-sized for mobile width */}
                <div className="w-full sm:w-auto flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-zinc-900/60 shrink-0">
                  {/* Quick Renewal trigger */}
                  {alert.type === 'expiration' && onRenewMember && (
                    <button
                      onClick={() => onRenewMember(alert.member)}
                      className="flex-1 sm:flex-initial min-w-[100px] sm:min-w-0 px-3.5 py-2 sm:py-1.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-xl sm:rounded-lg text-[11px] sm:text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-950/40"
                      title="Renew membership now"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span>Renew</span>
                    </button>
                  )}

                  {/* Email Reminder prompt */}
                  {alert.type === 'expiration' && alert.member.email && (
                    <button
                      onClick={() => onSendReminderEmail && onSendReminderEmail(alert.member, Math.max(1, alert.daysLeft || 1))}
                      className={`flex-1 sm:flex-initial min-w-[105px] sm:min-w-0 px-3.5 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-[11px] sm:text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        isReminderSentToday
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/40'
                          : alert.daysLeft <= 1
                          ? 'bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/40 shadow-sm'
                          : 'bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white border-amber-500/40 shadow-sm'
                      }`}
                      title={isReminderSentToday ? `Notice sent today at ${alert.member.lastReminderTime || ''}. Click to resend.` : `Send reminder email`}
                    >
                      {isReminderSentToday ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Mail className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate">{isReminderSentToday ? '✓ Sent' : alert.isExpired ? 'Notice' : alert.daysLeft === 0 ? 'Today' : `${alert.daysLeft}d Reminder`}</span>
                    </button>
                  )}

                  {/* WhatsApp prompt */}
                  {alert.type === 'expiration' && (
                    <button
                      onClick={() => handleWhatsAppAlert(alert.member, alert.daysLeft)}
                      className={`flex-1 sm:flex-initial min-w-[105px] sm:min-w-0 px-3.5 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-[11px] sm:text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        isWhatsAppSentToday
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border-emerald-500/25'
                      }`}
                      title="Send alert notice on Web WhatsApp (+91 8015552425)"
                    >
                      {isWhatsAppSentToday ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <MessageSquare className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate">{isWhatsAppSentToday ? '✓ WhatsApp' : 'WhatsApp'}</span>
                    </button>
                  )}

                  {/* Quick Fee collector */}
                  {alert.type === 'payment' && (
                    <button
                      onClick={() => {
                        setPage('payments');
                      }}
                      className="w-full sm:w-auto px-4 py-2 sm:py-1.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-xl sm:rounded-lg text-[11px] sm:text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      <span>Receive Fee</span>
                    </button>
                  )}

                  {/* Desktop Clear / Dismiss Notification button */}
                  {onClearNotification && (
                    <button
                      onClick={() => onClearNotification(alert.id)}
                      className="hidden sm:flex p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer ml-1 shrink-0"
                      title="Dismiss this notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 sm:p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-300">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No matching notifications found' 
                : 'All notifications cleared!'}
            </p>
            <p className="text-[11px] text-slate-500">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search query or selecting a different filter category.'
                : 'No active system alerts or notifications at this time.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
                <span>{isRefreshing ? 'Re-scanning Alerts...' : 'Refresh Feed'}</span>
              </button>
              {clearedCount > 0 && onRestoreNotifications && (
                <button
                  onClick={onRestoreNotifications}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Restore {clearedCount} Cleared</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
