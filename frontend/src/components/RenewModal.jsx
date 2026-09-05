import React, { useState, useMemo } from 'react';
import { 
  X, 
  RotateCcw, 
  Calendar, 
  CheckCircle2, 
  CreditCard, 
  IndianRupee, 
  User, 
  Clock, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

const PLAN_PRESETS = [
  { name: 'Monthly', months: 1, defaultFee: 1000 },
  { name: 'Quarterly', months: 3, defaultFee: 2500 },
  { name: 'Half-Yearly', months: 6, defaultFee: 4500 },
  { name: 'Yearly', months: 12, defaultFee: 8000 }
];

export default function RenewModal({ member, allMembers = [], onClose, onConfirmRenew }) {
  // If member is provided directly use it, else allow selecting from all members
  const [selectedMemberId, setSelectedMemberId] = useState(member?.id || (allMembers[0]?.id || ''));
  
  const currentMember = useMemo(() => {
    if (member) return member;
    return allMembers.find(m => m.id === selectedMemberId) || null;
  }, [member, allMembers, selectedMemberId]);

  const [selectedPlan, setSelectedPlan] = useState(currentMember?.plan || 'Monthly');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [renewalAmount, setRenewalAmount] = useState(() => {
    if (currentMember?.amountPaid) return Number(currentMember.amountPaid);
    const preset = PLAN_PRESETS.find(p => p.name === (currentMember?.plan || 'Monthly'));
    return preset ? preset.defaultFee : 1000;
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When current member changes (e.g. dropdown selection), update plan & fee
  React.useEffect(() => {
    if (currentMember) {
      const planName = currentMember.plan || 'Monthly';
      setSelectedPlan(planName);
      const preset = PLAN_PRESETS.find(p => p.name === planName);
      if (currentMember.amountPaid) {
        setRenewalAmount(Number(currentMember.amountPaid));
      } else if (preset) {
        setRenewalAmount(preset.defaultFee);
      }
    }
  }, [currentMember]);

  // Dynamic Date calculation
  const { newStartDateStr, newEndDateStr, isCurrentlyExpired } = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    if (!currentMember || !currentMember.endDate) {
      const future = new Date(now);
      future.setMonth(future.getMonth() + 1);
      const endStr = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;
      return { newStartDateStr: todayStr, newEndDateStr: endStr, isCurrentlyExpired: false };
    }

    const parts = currentMember.endDate.split('-');
    const currentEnd = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59);
    const isExpired = currentEnd.getTime() < now.getTime() || currentMember.status === 'Expired';

    // How many months to add
    const preset = PLAN_PRESETS.find(p => p.name === selectedPlan);
    const monthsToAdd = preset ? preset.months : 1;

    // If expired, start from today. If still active, extend seamlessly from current expiry date.
    const baseDate = isExpired ? new Date(now) : new Date(currentEnd);
    
    // Calculate new end date
    const targetEnd = new Date(baseDate);
    targetEnd.setMonth(targetEnd.getMonth() + monthsToAdd);

    const formatYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return {
      newStartDateStr: todayStr,
      newEndDateStr: formatYMD(targetEnd),
      isCurrentlyExpired: isExpired
    };
  }, [currentMember, selectedPlan]);

  const handlePlanChange = (planName) => {
    setSelectedPlan(planName);
    const preset = PLAN_PRESETS.find(p => p.name === planName);
    if (preset) {
      setRenewalAmount(preset.defaultFee);
    }
  };

  const handleConfirm = () => {
    if (!currentMember) return;
    setIsSubmitting(true);

    onConfirmRenew({
      memberId: currentMember.id,
      plan: selectedPlan,
      amount: Number(renewalAmount) || 1000,
      paymentMethod: paymentMethod,
      newStartDate: newStartDateStr,
      newEndDate: newEndDateStr,
      notes: notes
    });

    setIsSubmitting(false);
    onClose();
  };

  if (!currentMember && allMembers.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950/40 to-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/15 border border-red-500/30 rounded-xl text-red-500">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                Renew Membership Subscription
                <span className="px-2 py-0.5 text-[9px] bg-red-500/20 text-red-300 font-bold rounded-full border border-red-500/30">
                  Instant Auto-Update
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Extends membership end date, updates active status, and logs payment transaction.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-zinc-300">
          
          {/* Member Selection if opened without a preselected member */}
          {!member && allMembers.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Select Member to Renew
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-red-500"
              >
                {allMembers.map(m => {
                  const isExp = m.status === 'Expired' || (m.endDate && new Date(m.endDate) < new Date());
                  return (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.id}) — {m.plan} Plan {isExp ? '[EXPIRED]' : `[Ends: ${m.endDate}]`}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Current Member Status Card */}
          {currentMember && (
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-xs">
                    {currentMember.fullName ? currentMember.fullName.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{currentMember.fullName}</h4>
                    <p className="text-[10px] text-zinc-400">{currentMember.id} • {currentMember.phone} • {currentMember.village}</p>
                  </div>
                </div>

                <div>
                  {isCurrentlyExpired ? (
                    <span className="px-2.5 py-1 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Expired
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-[10px]">
                <div>
                  <span className="text-zinc-500 block">Current Plan:</span>
                  <span className="text-white font-bold">{currentMember.plan || 'Monthly'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Current Expiry:</span>
                  <span className={`font-bold ${isCurrentlyExpired ? 'text-rose-400' : 'text-zinc-300'}`}>
                    {currentMember.endDate || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Current Payment:</span>
                  <span className="text-emerald-400 font-bold">{currentMember.paymentStatus || 'Paid'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Select Renewal Plan Duration */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Choose Renewal Plan Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PLAN_PRESETS.map((preset) => {
                const isSelected = selectedPlan === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePlanChange(preset.name)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected 
                        ? 'bg-red-600/15 border-red-500 text-white shadow-sm shadow-red-950/50' 
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="font-extrabold text-xs">{preset.name}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">{preset.months} Month{preset.months > 1 ? 's' : ''}</span>
                    <span className="text-xs font-bold text-red-400 mt-1">₹{preset.defaultFee}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Expiry Extension Preview */}
          <div className="p-4 bg-emerald-950/15 border border-emerald-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Calculated Extension Timeline</span>
            </div>
            
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-[10px] text-zinc-400 block">Renewal Start Date:</span>
                <span className="text-white font-bold">{newStartDateStr} (Today)</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block">New Extended Expiry Date:</span>
                <span className="text-emerald-400 font-extrabold text-sm">{newEndDateStr}</span>
              </div>
            </div>
            
            <p className="text-[10px] text-zinc-400 pt-1 border-t border-emerald-900/40">
              {isCurrentlyExpired 
                ? '⚡ Member was expired. Renewal will reset their status to Active and extend from today.' 
                : '✨ Member was active. Expiry date extended smoothly from their current plan duration.'}
            </p>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Renewal Fee Amount (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="number"
                  value={renewalAmount}
                  onChange={(e) => setRenewalAmount(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-red-500"
                  placeholder="1000"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['UPI', 'Cash', 'Card'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMethod(mode)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === mode
                        ? 'bg-zinc-800 border-red-500 text-white'
                        : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Renewal Notes */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Renewal Notes / Reference (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. GPay Ref #123456, In-person cash at desk..."
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || !currentMember}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Renewal & Reactivate</span>
          </button>
        </div>

      </div>
    </div>
  );
}
