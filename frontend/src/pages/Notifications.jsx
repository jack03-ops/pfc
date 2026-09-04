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

export default function Notifications({ members, payments, onMarkAsPaid, onSendReminderEmail, setPage }) {
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

  const handleWhatsAppAlert = (member) => {
    const text = `Hello ${member.fullName}, this is a friendly reminder from Phoenix Gym that your membership plan (${member.plan}) ends on ${member.endDate}. Please renew on time to avoid interruption!`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${member.phone}&text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-[calc(100vh-80px)]">
      <div className="glass-panel rounded-2xl border border-zinc-900 divide-y divide-zinc-900/80 shadow-2xl max-w-4xl">
        {alertsList.length > 0 ? (
          alertsList.map((alert) => {
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
                  {/* Email Reminder prompt with attached PDF */}
                  {alert.type === 'expiration' && alert.member.email && (
                    <button
                      onClick={() => onSendReminderEmail && onSendReminderEmail(alert.member, alert.daysLeft)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border ${
                        isReminderSentToday
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/40'
                          : alert.daysLeft === 1
                          ? 'bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/40 shadow-sm'
                          : 'bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white border-amber-500/40 shadow-sm'
                      }`}
                      title={isReminderSentToday ? `Notice sent today at ${alert.member.lastReminderTime || ''}. Click to resend.` : `Send ${alert.daysLeft}-day reminder email & PDF invoice`}
                    >
                      {isReminderSentToday ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Mail className="w-3.5 h-3.5" />}
                      <span>{isReminderSentToday ? '✓ Sent (Resend)' : alert.daysLeft === 1 ? '1-Day Reminder' : '3-Day Reminder'}</span>
                    </button>
                  )}

                  {/* WhatsApp prompt */}
                  <button
                    onClick={() => handleWhatsAppAlert(alert.member)}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/25 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                    title="Send alert notice on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
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
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            No system notifications or pending alerts found. All clear!
          </div>
        )}
      </div>
    </div>
  );
}
