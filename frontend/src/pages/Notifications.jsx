import React, { useMemo } from 'react';
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
  X
} from 'lucide-react';

export default function Notifications({ 
  members, 
  payments, 
  clearedIds = [],
  onClearNotification,
  onClearAllNotifications,
  onRestoreNotifications,
  onMarkAsPaid, 
  onSendReminderEmail, 
  onSendWhatsAppReminder, 
  onRenewMember,
  setPage 
}) {
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
              daysLeft: daysLeft,
              title: '🚨 Membership Expired',
              message: `${m.fullName} (${m.id})'s ${m.plan} plan expired on ${m.endDate}. Renew to reactivate gym access.`,
              member: m,
              severity: 'danger',
              isExpired: true
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
              daysLeft: daysLeft,
              title: alertTitle,
              message: `${m.fullName} (${m.id})'s ${m.plan} plan expires ${isToday ? 'TODAY' : isUrgent ? 'tomorrow' : `in ${daysLeft} days`} on ${m.endDate}.`,
              member: m,
              severity: isToday || isUrgent ? 'danger' : 'warning',
              isExpired: false
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
          title: 'Pending Dues Outstanding',
          message: `${m.fullName} (${m.id}) has outstanding fee payments for the ${m.plan} plan.`,
          member: m,
          severity: 'danger'
        });
      }
    });

    // 3. New registrations (past 5 days)
    members.forEach(m => {
      list.push({
        id: `new-${m.id}`,
        type: 'join',
        title: 'New Member Registered',
        message: `${m.fullName} enrolled into the system from village ${m.village}.`,
        member: m,
        severity: 'info'
      });
    });

    return list.slice(0, 10); // Top relevant notifications
  }, [members]);

  // Filter out cleared/dismissed alerts
  const visibleAlerts = useMemo(() => {
    return alertsList.filter(a => !clearedIds?.includes(a.id));
  }, [alertsList, clearedIds]);

  const clearedCount = useMemo(() => {
    return (clearedIds || []).filter(id => alertsList.some(a => a.id === id)).length;
  }, [alertsList, clearedIds]);

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
      text = `🚨 *MEMBERSHIP EXPIRED NOTICE - PHOENIX FITNESS CENTRE* 🚨\n\nHello *${member.fullName}*,\n\nYour *${member.plan}* gym membership with *Phoenix Fitness Centre* has expired on *${member.endDate}*.\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Status: Expired (${member.endDate})\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 8015552425* (UPI ID: phoenixgym.vkp@oksbi).\n\nPlease send your payment screenshot to this WhatsApp (+91 8015552425) to reactivate your gym access immediately.\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Centre*\n📞 +91 8015552425`;
    } else if (isToday) {
      text = `⚠️ *URGENT MEMBERSHIP EXPIRES TODAY - PHOENIX FITNESS CENTRE* ⚠️\n\nHello *${member.fullName}*,\n\nThis is an urgent reminder from *Phoenix Fitness Centre* that your *${member.plan}* gym membership expires *TODAY (${member.endDate})*!\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Expiry Date: ${member.endDate} (Expires Today)\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 8015552425* (UPI ID: phoenixgym.vkp@oksbi).\n\nPlease send your payment screenshot to this WhatsApp (+91 8015552425) to keep your gym access uninterrupted.\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Centre*\n📞 +91 8015552425`;
    } else if (isUrgent) {
      text = `🚨 *URGENT MEMBERSHIP EXPIRY NOTICE - PHOENIX FITNESS CENTRE* 🚨\n\nHello *${member.fullName}*,\n\nThis is an urgent reminder from *Phoenix Fitness Centre* that your *${member.plan}* gym membership expires *TOMORROW (${member.endDate})*!\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Expiry Date: ${member.endDate} (Expires Tomorrow - 1 Day Left!)\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 8015552425* (UPI ID: phoenixgym.vkp@oksbi).\n\nPlease send your payment screenshot to this WhatsApp (+91 8015552425) to keep your gym access uninterrupted.\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Centre*\n📞 +91 8015552425`;
    } else if (isTwoDay) {
      text = `⏳ *MEMBERSHIP EXPIRY NOTICE - PHOENIX FITNESS CENTRE* ⏳\n\nHello *${member.fullName}*,\n\nFriendly reminder from *Phoenix Fitness Centre* that your *${member.plan}* gym membership expires in *2 days* on *${member.endDate}*.\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Expiry Date: ${member.endDate} (2 Days Left)\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 8015552425* (UPI ID: phoenixgym.vkp@oksbi).\n\nSend payment confirmation to this WhatsApp number (+91 8015552425). We look forward to continuing your fitness journey!\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Centre*\n📞 +91 8015552425`;
    } else if (isThreeDay) {
      text = `🏋️ *MEMBERSHIP RENEWAL REMINDER - PHOENIX FITNESS CENTRE* 🏋️\n\nHello *${member.fullName}*,\n\nFriendly reminder from *Phoenix Fitness Centre* that your *${member.plan}* gym membership expires in *3 days* on *${member.endDate}*.\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Expiry Date: ${member.endDate} (3 Days Left)\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 8015552425* (UPI ID: phoenixgym.vkp@oksbi).\n\nSend payment confirmation to this WhatsApp number (+91 8015552425). We look forward to continuing your fitness journey!\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Centre*\n📞 +91 8015552425`;
    } else {
      text = `Hello *${member.fullName}*, this is a friendly reminder from *Phoenix Fitness Centre* regarding your *${member.plan}* membership ending on *${member.endDate}*. Please renew on time to avoid interruption!\n\nUPI: phoenixgym.vkp@oksbi (+91 8015552425)\n\nThank you,\n*Phoenix Fitness Centre*`;
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-[calc(100vh-80px)]">
      {/* Top Header with Clear All & Restore controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-4xl pb-2 border-b border-zinc-900">
        <div>
          <h2 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            Notification Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {visibleAlerts.length} active notification{visibleAlerts.length === 1 ? '' : 's'}
            {clearedCount > 0 && <span className="text-slate-500"> • {clearedCount} cleared</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {visibleAlerts.length > 0 && onClearAllNotifications && (
            <button
              onClick={() => onClearAllNotifications(visibleAlerts.map(a => a.id))}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white border border-zinc-800 hover:border-red-500/40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Clear all active notifications"
            >
              <CheckCheck className="w-3.5 h-3.5 text-red-500" />
              <span>Clear Notifications</span>
            </button>
          )}

          {clearedCount > 0 && onRestoreNotifications && (
            <button
              onClick={onRestoreNotifications}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-slate-200 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Restore previously cleared notifications"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restore Cleared ({clearedCount})</span>
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-zinc-900 divide-y divide-zinc-900/80 shadow-2xl max-w-4xl">
        {visibleAlerts.length > 0 ? (
          visibleAlerts.map((alert) => {
            const Icon = 
              alert.type === 'expiration' ? Hourglass : 
              alert.type === 'payment' ? CreditCard : 
              UserPlus;
            
            const colorClass = 
              alert.severity === 'danger' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
              alert.severity === 'warning' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
              'bg-blue-500/10 border-blue-500/30 text-blue-400';

            const todayStr = new Date().toISOString().split('T')[0];
            const isReminderSentToday = alert.member?.lastReminderDate === todayStr;
            const isWhatsAppSentToday = alert.member?.lastReminderDate === todayStr && alert.member?.lastReminderType?.includes('WhatsApp');

            return (
              <div key={alert.id} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                isReminderSentToday ? 'bg-emerald-950/10 border-l-4 border-l-emerald-500' : 'hover:bg-zinc-900/10'
              }`}>
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl border shrink-0 ${
                    isReminderSentToday ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : colorClass
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                        {alert.title}
                        {alert.severity === 'danger' && !isReminderSentToday && (
                          <span className="bg-rose-500/15 text-rose-400 text-[8px] px-1.5 py-0.5 rounded font-black">CRITICAL</span>
                        )}
                      </h4>
                      {isReminderSentToday && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {alert.member.lastReminderType || 'Reminder'} Sent Today {alert.member.lastReminderTime ? `(${alert.member.lastReminderTime})` : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{alert.message}</p>
                    <p className="text-[10px] text-slate-600 font-medium mt-1">Contact: {alert.member.phone} • Village: {alert.member.village}</p>
                  </div>
                </div>

                {/* Operations triggers */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {/* Quick Renewal trigger */}
                  {alert.type === 'expiration' && onRenewMember && (
                    <button
                      onClick={() => onRenewMember(alert.member)}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:shadow-red-500/20"
                      title="Renew membership now"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Renew</span>
                    </button>
                  )}

                  {/* Email Reminder prompt with attached PDF */}
                  {alert.type === 'expiration' && alert.member.email && (
                    <button
                      onClick={() => onSendReminderEmail && onSendReminderEmail(alert.member, Math.max(1, alert.daysLeft || 1))}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border ${
                        isReminderSentToday
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/40'
                          : alert.daysLeft <= 1
                          ? 'bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/40 shadow-sm'
                          : 'bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white border-amber-500/40 shadow-sm'
                      }`}
                      title={isReminderSentToday ? `Notice sent today at ${alert.member.lastReminderTime || ''}. Click to resend.` : `Send reminder email & PDF invoice`}
                    >
                      {isReminderSentToday ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5" />}
                      <span>{isReminderSentToday ? '✓ Sent (Resend)' : alert.isExpired ? 'Expired Notice' : alert.daysLeft === 0 ? 'Today Notice' : `${alert.daysLeft}-Day Reminder`}</span>
                    </button>
                  )}

                  {/* WhatsApp prompt */}
                  <button
                    onClick={() => handleWhatsAppAlert(alert.member, alert.daysLeft)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border ${
                      isWhatsAppSentToday
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border-emerald-500/25'
                    }`}
                    title="Send alert notice on Web WhatsApp (+91 8015552425)"
                  >
                    {isWhatsAppSentToday ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <MessageSquare className="w-3.5 h-3.5" />}
                    <span>{isWhatsAppSentToday ? '✓ WhatsApp (Resend)' : 'Web WhatsApp'}</span>
                  </button>

                  {/* Quick Fee collector */}
                  {alert.type === 'payment' && (
                    <button
                      onClick={() => {
                        setPage('payments');
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                    >
                      Receive Fee
                    </button>
                  )}

                  {/* Individual Clear / Dismiss Notification button */}
                  {onClearNotification && (
                    <button
                      onClick={() => onClearNotification(alert.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer ml-1"
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
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-300">All notifications cleared!</p>
            <p className="text-[11px] text-slate-500">No active system alerts or notifications at this time.</p>
            {clearedCount > 0 && onRestoreNotifications && (
              <button
                onClick={onRestoreNotifications}
                className="mt-2 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore {clearedCount} Cleared Notification{clearedCount === 1 ? '' : 's'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
