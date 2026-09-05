import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  IndianRupee, 
  Search, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Receipt,
  X,
  User,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { getSettings } from '../db/mockDb';
import ReceiptModal from '../components/ReceiptModal';

export default function Payments({ members, payments, onAddPayment, onMarkAsPaid }) {
  const settings = getSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [newPayment, setNewPayment] = useState({
    clientId: '',
    amount: '',
    method: 'UPI',
    plan: 'Monthly'
  });
  
  // Pending members compute
  const pendingMembers = useMemo(() => {
    return members.filter(m => m.paymentStatus === 'Pending');
  }, [members]);

  // Total summary calculations
  const stats = useMemo(() => {
    const totalCollected = payments.reduce((acc, curr) => acc + curr.amount, 0);
    
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

  // Filter transaction list
  const filteredPayments = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return payments;
    return payments.filter(p => 
      p.clientName.toLowerCase().includes(query) || 
      p.clientId.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query)
    );
  }, [payments, searchTerm]);

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
      plan: newPayment.plan
    });

    setNewPayment({
      clientId: '',
      amount: '',
      method: 'UPI',
      plan: 'Monthly'
    });
    setShowAddForm(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Collected Card */}
        <div className="card-premium p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Fees Collected</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-2 tracking-tight">
                ₹{stats.collected.toLocaleString()}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
            <span>{payments.length} successful transactions</span>
            <span className="text-emerald-400 font-medium">All Time</span>
          </div>
        </div>

        {/* Pending Dues Card */}
        <div className="card-premium p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estimated Pending Dues</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2 tracking-tight">
                ₹{stats.pendingAmount.toLocaleString()}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <span className="text-zinc-400">{stats.pendingCount} members pending</span>
            <span className="text-amber-400 font-semibold">{stats.pendingCount > 0 ? 'Requires Action' : 'Settled'}</span>
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="card-premium p-5 sm:p-6 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Record Operations</p>
            <p className="text-xs text-zinc-400 mt-1">Generate a manual receipt or record offline cash/UPI payments</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mt-4 w-full py-2.5 px-4 btn-primary flex items-center justify-center gap-2 cursor-pointer font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Close Billing Form' : 'Manual Billing Receipt'}
          </button>
        </div>
      </div>

      {/* Manual invoice form panel */}
      {showAddForm && (
        <form onSubmit={handleAddPaymentSubmit} className="card-premium p-5 sm:p-7 space-y-4 max-w-2xl border border-red-500/30 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Bill Payment Receipt</h3>
              <p className="text-xs text-zinc-400">Manually issue an official tax invoice receipt</p>
            </div>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Select Gym Client *</label>
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
                className="input-premium w-full text-sm"
              >
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName} ({m.id}) - {m.plan} plan</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Fees Amount (₹) *</label>
              <input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                required
                className="input-premium w-full text-sm"
                placeholder="2700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Payment Method *</label>
              <select
                value={newPayment.method}
                onChange={(e) => setNewPayment(prev => ({ ...prev, method: e.target.value }))}
                className="input-premium w-full text-sm"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash Handover</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-secondary px-4 py-2 text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm cursor-pointer"
            >
              Register & Save Bill
            </button>
          </div>
        </form>
      )}

      {/* Grid of Pending payments & Transaction log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending list */}
        <div className="card-premium p-5 sm:p-6 flex flex-col h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Pending Dues</h4>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {pendingMembers.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {pendingMembers.length > 0 ? (
              pendingMembers.map((m) => {
                const planPrice = settings.membershipPlans.find(p => p.name === m.plan)?.price || 1000;
                return (
                  <div key={m.id} className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-3 text-xs hover:border-zinc-700 transition-colors">
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-100 truncate">{m.fullName}</p>
                      <p className="text-[11px] text-zinc-400 font-medium">{m.id} • {m.plan}</p>
                      <p className="text-xs text-rose-400 font-bold mt-1">Due: ₹{planPrice}</p>
                    </div>
                    <button
                      onClick={() => onMarkAsPaid(m.id, planPrice, m.plan)}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/25 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Receive Fee
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center flex flex-col items-center justify-center text-zinc-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-2" />
                <p className="text-xs font-medium text-zinc-400">All memberships are settled!</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">No pending fees right now</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed list / Receipt Ledgers */}
        <div className="card-premium p-5 sm:p-6 lg:col-span-2 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-zinc-800 mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-500" />
              <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Receipt Ledgers</h4>
              <span className="text-xs text-zinc-500">({filteredPayments.length})</span>
            </div>
            
            {/* Search filter transactions */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name, ID, or receipt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium w-full pl-9 pr-8 py-1.5 text-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/40 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-3 pl-4">INVOICE</th>
                  <th className="p-3">Receipt ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3 text-center">Plan</th>
                  <th className="p-3 text-center">Method</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 pr-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-xs text-zinc-300">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-3 pl-4">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 rounded-lg transition-all cursor-pointer border border-red-500/20 shadow-sm inline-flex items-center justify-center group"
                          title="View & Print Official PDF Receipt"
                        >
                          <Receipt className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </td>
                      <td className="p-3 font-mono text-zinc-400 text-[11px]">{p.id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-zinc-100">{p.clientName}</div>
                        <div className="text-[10px] text-zinc-500">{p.clientId}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/60 rounded font-medium text-[10px] uppercase text-zinc-300">
                          {p.plan}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.method}
                        </span>
                      </td>
                      <td className="p-3 text-right font-extrabold text-zinc-100">₹{p.amount.toLocaleString()}</td>
                      <td className="p-3 pr-4 text-right text-zinc-400 font-mono text-[11px]">{p.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-zinc-500">
                      {searchTerm ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <p className="text-xs">No receipts matching "{searchTerm}"</p>
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-xs text-red-400 hover:underline cursor-pointer"
                          >
                            Clear Search Filter
                          </button>
                        </div>
                      ) : (
                        'No payment receipts logged yet.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((p) => (
                <div key={p.id} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-zinc-100 text-sm">{p.clientName}</div>
                      <div className="text-xs text-zinc-400 font-mono">{p.clientId} • {p.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-zinc-100">₹{p.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500">{p.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] uppercase font-medium text-zinc-300">
                        {p.plan}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.method}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="px-3 py-1.5 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      View Receipt PDF
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500">
                {searchTerm ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-xs">No receipts matching "{searchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                ) : (
                  <p className="text-xs">No payment receipts logged yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Official Tax Invoice & PDF Printable Modal */}
      {selectedReceipt && (
        <ReceiptModal 
          receipt={selectedReceipt} 
          member={members.find(m => m.id === selectedReceipt.clientId)} 
          onClose={() => setSelectedReceipt(null)} 
        />
      )}
    </div>
  );
}
