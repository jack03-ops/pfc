import React from 'react';
import { Printer, Download, X, CheckCircle2, Dumbbell, ShieldCheck } from 'lucide-react';
import phoenixLogo from '../assets/phoenix_logo.png';

export default function ReceiptModal({ receipt, member, onClose }) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `PFC-INV-${receipt.id.replace(/\D/g, '') || '101'}`;
  const clientName = receipt.clientName || member?.fullName || 'Gym Member';
  const clientId = receipt.clientId || member?.id || 'PXM-1001';
  const village = member?.village || 'Rampur';
  const phone = member?.phone || '+91 9487817301';
  const plan = receipt.plan || 'Monthly';
  const method = receipt.method || 'UPI';
  const amount = receipt.amount || 1000;
  const date = receipt.date || new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Bar (Non-printable) */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Official Payment Receipt & Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF / Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Body */}
        <div className="p-8 overflow-y-auto bg-zinc-950 text-white print:p-0 print:bg-white print:text-black" id="printable-receipt">
          {/* Print specific CSS styling */}
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #printable-receipt, #printable-receipt * { visibility: visible; }
              #printable-receipt { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                padding: 40px; 
                background: white !important; 
                color: black !important; 
              }
              .print-dark-text { color: black !important; }
              .print-subtext { color: #555 !important; }
              .print-border { border-color: #ddd !important; }
              .print-bg { background-color: #f8f9fa !important; }
              .print-badge { background-color: #d1fae5 !important; color: #065f46 !important; }
            }
          `}</style>

          {/* Receipt Header Banner */}
          <div className="flex justify-between items-start border-b border-zinc-900 print:border-gray-200 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <img src={phoenixLogo} alt="Phoenix Logo" className="w-14 h-14 object-contain" />
              <div>
                <h1 className="text-xl font-black text-white print:text-black tracking-tight uppercase">PHOENIX FITNESS CENTRE</h1>
                <p className="text-[11px] text-zinc-400 print:text-gray-600 font-semibold mt-0.5">Modern Gym & Personal Fitness Academy</p>
                <p className="text-[10px] text-zinc-500 print:text-gray-500">Contact: +91 9487817301 | phoenixgym.vkp@gmail.com</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 print-badge rounded-full text-xs font-black uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PAID & VERIFIED
              </span>
              <p className="text-xs font-bold text-white print:text-black">{invoiceNo}</p>
              <p className="text-[11px] text-zinc-400 print:text-gray-600 font-medium">Date: {date}</p>
            </div>
          </div>

          {/* Bill To & Details Grid */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-zinc-900/60 print:bg-gray-50 border border-zinc-900 print:border-gray-200 rounded-2xl mb-6">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 print:text-gray-500 uppercase tracking-wider mb-1">BILLED TO MEMBER</p>
              <h3 className="text-base font-extrabold text-white print:text-black">{clientName}</h3>
              <p className="text-xs text-zinc-400 print:text-gray-600 font-medium">Member ID: <span className="text-white print:text-black font-bold">{clientId}</span></p>
              <p className="text-xs text-zinc-400 print:text-gray-600 font-medium">Address: {village}</p>
              <p className="text-xs text-zinc-400 print:text-gray-600 font-medium">Phone: {phone}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-500 print:text-gray-500 uppercase tracking-wider mb-1">PAYMENT METRICS</p>
              <p className="text-xs text-zinc-400 print:text-gray-600 font-medium">Payment Mode: <span className="text-emerald-400 print:text-emerald-700 font-bold uppercase">{method}</span></p>
              <p className="text-xs text-zinc-400 print:text-gray-600 font-medium">Billing Period: <span className="text-white print:text-black font-bold">{plan} Plan</span></p>
              <p className="text-xs text-zinc-400 print:text-gray-600 font-medium">Issued By: <span className="text-white print:text-black font-bold">Phoenix Admin Desk</span></p>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="border border-zinc-900 print:border-gray-200 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/80 print:bg-gray-100 border-b border-zinc-900 print:border-gray-200 text-[10px] uppercase font-black tracking-wider text-zinc-400 print:text-gray-600">
                  <th className="p-3 pl-4">Description</th>
                  <th className="p-3 text-center">Subscription Duration</th>
                  <th className="p-3 text-center">Tax / GST</th>
                  <th className="p-3 pr-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50 print:divide-gray-200 text-xs text-zinc-300 print:text-gray-800">
                <tr>
                  <td className="p-3.5 pl-4 font-bold text-white print:text-black">
                    Gym Membership Fee ({plan})
                    <span className="block text-[10px] text-zinc-500 print:text-gray-500 font-normal">Full access to gym equipment, cardio & powerlifting facilities</span>
                  </td>
                  <td className="p-3.5 text-center font-medium">{plan}</td>
                  <td className="p-3.5 text-center font-medium text-emerald-400 print:text-emerald-700">Included (0%)</td>
                  <td className="p-3.5 pr-4 text-right font-extrabold text-white print:text-black text-sm">₹{amount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Summary Row */}
          <div className="flex justify-between items-center p-4 bg-red-500/10 print:bg-red-50 border border-red-500/20 print:border-red-200 rounded-2xl mb-8">
            <div>
              <span className="text-xs font-bold text-red-400 print:text-red-700 uppercase tracking-wider block">TOTAL AMOUNT RECEIVED</span>
              <span className="text-[10px] text-zinc-400 print:text-gray-600">Non-refundable membership subscription fee</span>
            </div>
            <h2 className="text-2xl font-black text-white print:text-black">₹{amount.toLocaleString()}</h2>
          </div>

          {/* Footer & Signature Stamp */}
          <div className="pt-6 border-t border-zinc-900 print:border-gray-200 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-zinc-500 print:text-gray-500 font-semibold">Thank you for training with Phoenix Fitness Centre!</p>
              <p className="text-[9px] text-zinc-600 print:text-gray-400 mt-0.5">Computer-generated official receipt. No signature required.</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-zinc-800 print:border-gray-400 mb-1"></div>
              <p className="text-[10px] font-bold text-zinc-400 print:text-gray-600 uppercase tracking-wider">Authorized Stamp</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
