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
  Clock
} from 'lucide-react';

export default function Notifications({ members, payments, onMarkAsPaid, onSendReminderEmail, onSendWhatsAppReminder, setPage }) {
  // Compute alerts dynamically from Mock DB
  const alertsList = useMemo(() => {
    const list = [];
    const today = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);

    // 1. Expiring memberships
    members.forEach(m => {
      if (m.status === 'Active') {
        const endDate = new Date(m.endDate);
        if (endDate >= today && endDate <= fifteenDaysFromNow) {
          const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          const isUrgent = daysLeft === 1;
          const isThreeDay = daysLeft === 3;
          list.push({
            id: `exp-${m.id}`,
            type: 'expiration',
            daysLeft: daysLeft,
            title: isUrgent ? '🚨 Expires Tomorrow (1 Day Left!)' : isThreeDay ? '⏰ Expires in 3 Days' : `Membership Expiring in ${daysLeft} Days`,
            message: `${m.fullName} (${m.id})'s ${m.plan} plan expires ${isUrgent ? 'tomorrow' : `in ${daysLeft} days`} on ${m.endDate}.`,
            member: m,
            severity: isUrgent ? 'danger' : 'warning'
          });
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

    return list.slice(0, 8); // Top 8 relevant notifications
  }, [members]);

  const handleWhatsAppAlert = (member, daysLeft) => {
    const rawPhone = member.whatsapp || member.phone || '';
    const cleanPhone = String(rawPhone).replace(/\D/g, '').replace(/^91/, '');
    if (!cleanPhone) {
      alert(`No WhatsApp phone number registered for ${member.fullName}`);
      return;
    }

    let text = '';
    const isFinal = daysLeft === 1;
    const isThreeDay = daysLeft === 3;
    const renewalAmount = member.amountPaid ? Number(member.amountPaid) : 1000;

    if (isFinal) {
      text = `🚨 *URGENT MEMBERSHIP EXPIRY NOTICE - PHOENIX FITNESS CENTRE* 🚨\n\nHello *${member.fullName}*,\n\nThis is an urgent reminder from *Phoenix Fitness Centre* that your *${member.plan}* gym membership expires *TOMORROW (${member.endDate})*!\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Expiry Date: ${member.endDate} (Expires Tomorrow)\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 9487817301* (UPI ID: phoenixgym.vkp@oksbi).\n\nPlease send your payment screenshot to this WhatsApp (+91 9487817301) to keep your gym access uninterrupted.\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Centre*\n📞 +91 9487817301`;
    } else if (isThreeDay) {
      text = `🏋️ *MEMBERSHIP RENEWAL REMINDER - PHOENIX FITNESS CENTRE* 🏋️\n\nHello *${member.fullName}*,\n\nFriendly reminder from *Phoenix Fitness Centre* that your *${member.plan}* gym membership expires in *3 days* on *${member.endDate}*.\n\n📋 *Membership Summary:*\n• Member ID: ${member.id}\n• Plan: ${member.plan}\n• Expiry Date: ${member.endDate} (3 Days Left)\n• Renewal Fee Due: ₹${renewalAmount.toLocaleString('en-IN')}\n\n💳 *Quick UPI Renewal:*\nPay via GooglePay / PhonePe / Paytm to *+91 9487817301* (UPI ID: phoenixgym.vkp@oksbi).\n\nSend payment confirmation to this WhatsApp number (+91 9487817301). We look forward to continuing your fitness journey!\n\nKeep pushing your limits! 💪\n*Phoenix Fitness Centre*\n📞 +91 9487817301`;
    } else {
      text = `Hello *${member.fullName}*, this is a friendly reminder from *Phoenix Fitness Centre* regarding your *${member.plan}* membership ending on *${member.endDate}*. Please renew on time to avoid interruption!\n\nUPI: phoenixgym.vkp@oksbi (+91 9487817301)\n\nThank you,\n*Phoenix Fitness Centre*`;
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

  // Metrics for the header summary
  const summaryCounts = useMemo(() => {
    return {
      urgent: alertsList.filter(a => a.severity === 'danger' && a.type === 'expiration').length,
      expiring: alertsList.filter(a => a.type === 'expiration').length,
      pending: alertsList.filter(a => a.type === 'payment').length,
      total: alertsList.length
    };
  }, [alertsList]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & Summary Pill Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Notification Center</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Live membership alerts, renewal reminders, and payment notifications</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-zinc-700/60">
            {summaryCounts.total} Total Alerts
          </span>
          {summaryCounts.urgent > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              {summaryCounts.urgent} Urgent (1-Day)
            </span>
          )}
          {summaryCounts.pending > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
              {summaryCounts.pending} Pending Dues
            </span>
          )}
        </div>
      </div>

      {/* Notifications List Container */}
      <div className="card-premium divide-y divide-zinc-800/80 overflow-hidden">
        {alertsList.length > 0 ? (
          alertsList.map((alert) => {
            const Icon = 
              alert.type === 'expiration' ? Hourglass : 
              alert.type === 'payment' ? CreditCard : 
              UserPlus;

            const todayStr = new Date().toISOString().split('T')[0];
            const isReminderSentToday = alert.member?.lastReminderDate === todayStr;
            const isWhatsAppSentToday = alert.member?.lastReminderDate === todayStr && alert.member?.lastReminderType?.includes('WhatsApp');

            // Severity border & badge
            const isUrgent = alert.daysLeft === 1;
            const isThreeDay = alert.daysLeft === 3;
            const borderAccent = isReminderSentToday 
              ? 'border-l-4 border-l-emerald-500' 
              : isUrgent 
              ? 'border-l-4 border-l-rose-500' 
              : isThreeDay 
              ? 'border-l-4 border-l-amber-500' 
              : alert.type === 'payment'
              ? 'border-l-4 border-l-rose-500'
              : 'border-l-4 border-l-blue-500';

            const iconClass = isReminderSentToday
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : isUrgent || alert.type === 'payment'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : isThreeDay
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400';

            return (
              <div 
                key={alert.id} 
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${borderAccent} ${
                  isReminderSentToday ? 'bg-emerald-950/5' : 'hover:bg-zinc-800/30'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${iconClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                        {alert.title}
                      </h4>
                      {isUrgent && !isReminderSentToday && (
                        <span className="bg-rose-500/15 text-rose-400 text-[9px] px-2 py-0.5 rounded font-black border border-rose-500/30">
                          URGENT
                        </span>
                      )}
                      {isReminderSentToday && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {alert.member.lastReminderType || 'Reminder'} Sent Today {alert.member.lastReminderTime ? `(${alert.member.lastReminderTime})` : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">{alert.message}</p>
                    <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                      Phone: {alert.member.phone} • Village: {alert.member.village}
                    </p>
                  </div>
                </div>

                {/* Operations triggers */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0 pt-2 sm:pt-0">
                  {/* Email Reminder prompt with attached PDF */}
                  {alert.type === 'expiration' && alert.member.email && (
                    <button
                      onClick={() => onSendReminderEmail && onSendReminderEmail(alert.member, alert.daysLeft)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isReminderSentToday
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : isUrgent
                          ? 'bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/30'
                          : 'bg-amber-500/15 hover:bg-amber-600 text-amber-300 hover:text-white border-amber-500/30'
                      }`}
                      title={isReminderSentToday ? `Notice sent today at ${alert.member.lastReminderTime || ''}. Click to resend.` : `Send ${alert.daysLeft}-day reminder email & PDF invoice`}
                    >
                      {isReminderSentToday ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5" />}
                      <span>{isReminderSentToday ? '✓ Sent (Resend)' : isUrgent ? '1-Day Email' : '3-Day Email'}</span>
                    </button>
                  )}

                  {/* WhatsApp prompt */}
                  <button
                    onClick={() => handleWhatsAppAlert(alert.member, alert.daysLeft)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isWhatsAppSentToday
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/20'
                    }`}
                    title="Send alert notice on Web WhatsApp (+91 9487817301)"
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
                      className="btn-primary px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    >
                      Receive Fee
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center text-zinc-500">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-200">All caught up!</p>
            <p className="text-xs text-zinc-500 mt-1">No pending notifications or membership alerts found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
