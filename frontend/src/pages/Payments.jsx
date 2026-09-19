import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  IndianRupee, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Copy
} from 'lucide-react';
import { getSettings } from '../db/mockDb';

export default function Payments({ members, payments, onAddPayment, onMarkAsPaid, userRole = 'admin' }) {
  const settings = getSettings();
  const [showAddForm, setShowAddForm] = useState(false);
  const [utrRef, setUtrRef] = useState('');
  const [newPayment, setNewPayment] = useState({
    clientId: '',
    amount: '',
    method: 'UPI',
    plan: 'Monthly'
  });

  const upiTxnRef = useMemo(() => `TXN-${Date.now().toString().slice(-6)}`, [newPayment.clientId, newPayment.amount]);
  const dynamicUpiUrl = useMemo(() => {
    const fee = Number(newPayment.amount) || 1000;
    const cid = newPayment.clientId || 'PFM';
    return `upi://pay?pa=phoenixgym.vkp@oksbi&pn=Phoenix%20Fitness%20Academy&am=${fee}&tr=${upiTxnRef}&tn=Fee_${cid}&cu=INR`;
  }, [newPayment.amount, newPayment.clientId, upiTxnRef]);
  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(dynamicUpiUrl)}`;
  }, [dynamicUpiUrl]);
  
  // Pending members compute: Members with direct pending dues OR expired memberships requiring renewal fee
  const pendingMembers = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    return members.filter(m => {
      if (m.paymentStatus === 'Pending') return true;
      if (m.status === 'Expired') return true;
      if (m.endDate) {
        const parts = m.endDate.split('-');
        if (parts.length === 3) {
          const end = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59, 999);
          if (end.getTime() < todayStart.getTime()) {
            return true;
          }
        }
      }
      return false;
    }).map(m => {
      const parts = (m.endDate || '').split('-');
      let isPastExpiry = false;
      if (parts.length === 3) {
        const end = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59, 999);
        isPastExpiry = end.getTime() < todayStart.getTime();
      }
      const isExpired = m.status === 'Expired' || isPastExpiry;
      const dueReason = m.paymentStatus === 'Pending' 
        ? 'Pending Fee Due' 
        : isExpired 
        ? `Expired on ${m.endDate} (Renewal Due)` 
        : 'Due';
      return {
        ...m,
        isExpiredDue: isExpired,
        dueReason
      };
    });
  }, [members]);

  // Total summary calculations
  const stats = useMemo(() => {
    const totalCollected = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
    // Total pending amount estimation
    const estimatedPending = pendingMembers.reduce((acc, curr) => {
      const planConfig = settings.membershipPlans.find(p => p.name === curr.plan);
      return acc + (planConfig ? planConfig.price : 1000);
    }, 0);

    return {
      collected: totalCollected,
      pendingCount: pendingMembers.length,
      pendingAmount: estimatedPending
    };
  }, [payments, pendingMembers, settings]);

  const handleAddPaymentSubmit = (e) => {
    e.preventDefault();
    if (!newPayment.clientId || !newPayment.amount) return;

    const memberObj = members.find(m => m.id === newPayment.clientId);
    if (!memberObj) {
      alert('Invalid Client ID. Please select a valid gym member.');
      return;
    }

    onAddPayment({
      clientId: newPayment.clientId,
      clientName: memberObj.fullName,
      amount: Number(newPayment.amount),
      method: newPayment.method,
      plan: newPayment.plan,
      notes: utrRef ? `UTR: ${utrRef}` : 'Manual fee collection'
    });

    setNewPayment({
      clientId: '',
      amount: '',
      method: 'UPI',
      plan: 'Monthly'
    });
    setUtrRef('');
    setShowAddForm(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-[calc(100vh-80px)]">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel-glow-cyan p-6 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fees Collected</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">₹{stats.collected.toLocaleString()}</h3>
            </div>
            <div className="bg-cyan-500/10 p-3 rounded-xl text-cyan-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-4 uppercase">Across all historical terms</p>
        </div>

        <div className="glass-panel-glow-red p-6 rounded-2xl border border-zinc-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Pending Dues</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">₹{stats.pendingAmount.toLocaleString()}</h3>
            </div>
            <div className="bg-red-500/10 p-3 rounded-xl text-red-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] text-red-400 font-bold mt-4 uppercase">{stats.pendingCount} members pending payment</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-900 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Record Operations</h4>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Manual Billing Receipt
          </button>
        </div>
      </div>

      {/* Manual invoice form panel */}
      {showAddForm && (
        <form onSubmit={handleAddPaymentSubmit} className="glass-panel p-6 rounded-2xl border border-zinc-900 space-y-4 max-w-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-zinc-900 pb-3">Bill Payment Receipt</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Gym Client</label>
              <select
                value={newPayment.clientId}
                onChange={(e) => {
                  const m = members.find(item => item.id === e.target.value);
                  const planPrice = settings.membershipPlans.find(p => p.name === m?.plan)?.price || '';
                  setNewPayment(prev => ({ 
                    ...prev, 
                    clientId: e.target.value,
                    plan: m?.plan || 'Monthly',
                    amount: planPrice
                  }));
                }}
                required
                className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.id}) - {m.plan}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fees Amount (₹)</label>
              <input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                placeholder="2700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment Method</label>
              <select
                value={newPayment.method}
                onChange={(e) => setNewPayment(prev => ({ ...prev, method: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="UPI">UPI (PhonePe/GPay)</option>
                <option value="Cash">Cash Handover</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            {/* Dynamic UPI QR Code for instant desk scanning */}
            {newPayment.method === 'UPI' && (
              <div className="md:col-span-2 p-3.5 bg-zinc-950 border border-red-500/30 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">Dynamic QR Code</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-red-950/60 text-red-300 border border-red-500/30 rounded">
                    Ref: {upiTxnRef}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-1.5 bg-white rounded-lg shadow shrink-0">
                    <img src={qrCodeUrl} alt="UPI QR" className="w-20 h-20 object-contain" />
                  </div>
                  <div className="flex-1 space-y-1 text-[11px]">
                    <p className="text-zinc-400">VPA: <strong className="text-white font-mono">phoenixgym.vkp@oksbi</strong></p>
                    <p className="text-zinc-400">Amount: <strong className="text-emerald-400 font-bold">₹{newPayment.amount || 1000}</strong></p>
                    <input
                      type="text"
                      value={utrRef}
                      onChange={(e) => setUtrRef(e.target.value)}
                      placeholder="Enter 12-digit UTR from GPay / PhonePe"
                      className="w-full mt-1 px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-[10px] text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2 md:col-span-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-1/2 py-2 bg-zinc-900 border border-zinc-900 text-slate-400 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer"
              >
                Register Bill
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Pending Member Dues Section */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-900">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
          <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" />
            Pending Member Dues
          </h4>
          {pendingMembers.length > 0 && (
            <span className="bg-red-500/15 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-500/30">
              {pendingMembers.length} Due
            </span>
          )}
        </div>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {pendingMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingMembers.map((m) => {
                const planPrice = settings.membershipPlans.find(p => p.name === m.plan)?.price || 1000;
                return (
                  <div key={m.id} className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl flex flex-col justify-between gap-3 text-xs hover:border-zinc-700 transition-all">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate text-sm">{m.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{m.id} • {m.plan} plan</p>
                      <p className="text-[10px] text-amber-400 font-medium mt-0.5 truncate">{m.dueReason}</p>
                      <p className="text-xs text-rose-400 font-extrabold mt-1">Dues: ₹{planPrice.toLocaleString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => onMarkAsPaid(m.id, planPrice, m.plan)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      title="Mark fee paid"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Receive Fee</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">All gym memberships are fully paid!</p>
          )}
        </div>
      </div>
    </div>
  );
}
