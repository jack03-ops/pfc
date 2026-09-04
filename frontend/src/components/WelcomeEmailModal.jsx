import React, { useState } from 'react';
import { Mail, CheckCircle2, Copy, X, Send, Sparkles, Printer, FileText, ShieldCheck, Download } from 'lucide-react';
import { logWelcomeEmail } from '../db/mockDb';
import phoenixLogo from '../assets/phoenix_logo.png';

export default function WelcomeEmailModal({ member, onClose, onEmailSent }) {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'invoice'
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!member) return null;

  const gymName = "Phoenix Fitness Centre";
  const contactPhone = "+91 9487817301";
  const contactEmail = "phoenixfitnesscentre03@gmail.com";
  const clientEmail = member.email || 'member@gmail.com';
  const clientName = member.fullName || 'Gym Member';
  const clientId = member.id || 'PXM-1001';
  const planName = member.plan || 'Monthly';
  const startDate = member.startDate || new Date().toISOString().split('T')[0];
  const endDate = member.endDate || '2026-10-04';
  const invoiceNo = `PFC-INV-${clientId.replace(/\D/g, '') || '101'}`;
  const amountPaid = member.amountPaid ? Number(member.amountPaid) : 1000;
  const paymentMethod = 'UPI';

  const emailSubject = `🏋️ Welcome to ${gymName} & Official Payment Receipt - ${clientName}!`;

  const emailBodyText = `Hi ${clientName},

Welcome to ${gymName}! 💪 We are thrilled to welcome you to our fitness family.

==================================================
📄 OFFICIAL PAYMENT RECEIPT & TAX INVOICE
==================================================
• Invoice No: ${invoiceNo}
• Status: PAID & VERIFIED
• Date of Issue: ${startDate}
• Billed To: ${clientName} (${clientId})
• Address: ${member.village || 'Rampur'}
• Plan: ${planName} Plan
• Description: Gym Membership Fee (${planName}) - Full equipment & floor access
• Tax / GST: Included (0%)
• Payment Mode: ${paymentMethod}
• TOTAL AMOUNT RECEIVED: ₹${amountPaid.toLocaleString('en-IN')}
• Issued By: Phoenix Admin Desk
==================================================

Your Membership Details:
• Member ID: ${clientId}
• Plan: ${planName}
• Start Date: ${startDate}
• Expiry Date: ${endDate}
• Status: Active

Gym Guidelines & Hours:
• Operating Hours: Monday to Saturday (5:00 AM – 10:00 PM)
• Facility: Strength, Cardio, Crossfit & Free Weights
• Certified Trainers on floor
• Please bring clean workout shoes and a workout towel

Contact & Desk:
• Phone: ${contactPhone}
• Email: ${contactEmail}
• Address: ${gymName}, Near Temple, Rampur

Let's crush your fitness goals together!
Keep pushing your limits!

Best regards,
${gymName} Team`;

  const handleSendEmail = () => {
    // 1. Log to mock database reminders
    logWelcomeEmail(member);
    
    // 2. Open pre-composed email client
    const mailtoUrl = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
    window.open(mailtoUrl, '_blank');

    setSent(true);
    if (onEmailSent) {
      onEmailSent(member);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(emailBodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Tabs */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Welcome Message & Invoice</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] text-zinc-400">
                Onboarding & Payment Receipt for <span className="text-slate-200 font-semibold">{clientName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="bg-zinc-900 p-1 rounded-xl border border-zinc-800 flex text-xs font-semibold">
              <button
                onClick={() => setActiveTab('email')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'email' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Welcome Email</span>
              </button>
              <button
                onClick={() => setActiveTab('invoice')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'invoice' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice PDF</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {sent && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-semibold print:hidden">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Welcome email & invoice dispatched successfully!</span>
            </div>
          )}

          {/* TAB 1: EMAIL PREVIEW */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              {/* Member overview badge */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 text-[11px]">
                <div>
                  <span className="text-zinc-500 block uppercase text-[9px] font-bold">Client</span>
                  <span className="text-white font-semibold truncate block">{clientName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase text-[9px] font-bold">Target Email</span>
                  <span className="text-red-400 font-semibold truncate block">{clientEmail}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase text-[9px] font-bold">Invoice No</span>
                  <span className="text-emerald-400 font-bold block">{invoiceNo}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase text-[9px] font-bold">Amount Paid</span>
                  <span className="text-white font-bold block">₹{amountPaid.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Email Content Box */}
              <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/40">
                <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs flex justify-between items-center text-zinc-400">
                  <span className="truncate pr-2"><strong>Subject:</strong> {emailSubject}</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold shrink-0">
                    From: {contactEmail}
                  </span>
                </div>
                
                <div className="p-4 text-xs text-zinc-300 leading-relaxed space-y-3 max-h-72 overflow-y-auto font-sans">
                  <p className="font-semibold text-white">Hi {clientName},</p>
                  <p>Welcome to <strong>{gymName}</strong>! 💪 We are thrilled to welcome you to our fitness family.</p>
                  
                  {/* Embedded Official Tax Invoice Card */}
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/90 space-y-2">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>OFFICIAL PAYMENT RECEIPT & TAX INVOICE</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        PAID & VERIFIED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <p className="text-zinc-500">Invoice Number: <strong className="text-white">{invoiceNo}</strong></p>
                        <p className="text-zinc-500">Billed To: <strong className="text-white">{clientName}</strong> ({clientId})</p>
                        <p className="text-zinc-500">Payment Date: <strong className="text-white">{startDate}</strong></p>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-500">Payment Mode: <strong className="text-emerald-400 font-bold">{paymentMethod}</strong></p>
                        <p className="text-zinc-500">Plan Duration: <strong className="text-white">{planName} Plan</strong></p>
                        <p className="text-zinc-500">Tax / GST: <strong className="text-emerald-400 font-bold">Included (0%)</strong></p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-2.5 bg-red-500/10 rounded-lg border border-red-500/20 mt-2">
                      <span className="text-[11px] font-bold text-red-400 uppercase">TOTAL AMOUNT RECEIVED</span>
                      <span className="text-sm font-extrabold text-white">₹{amountPaid.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1 text-[11px]">
                    <p>• <strong>Member ID:</strong> {clientId}</p>
                    <p>• <strong>Plan:</strong> {planName}</p>
                    <p>• <strong>Start Date:</strong> {startDate}</p>
                    <p>• <strong>Expiry Date:</strong> {endDate}</p>
                    <p>• <strong>Status:</strong> Active</p>
                  </div>

                  <div className="space-y-1 text-[11px] text-zinc-400">
                    <p className="text-zinc-300 font-semibold">Gym Highlights & Timings:</p>
                    <p>• Operating Hours: Mon – Sat (5:00 AM – 10:00 PM)</p>
                    <p>• Strength, Cardio, Crossfit & Free Weights</p>
                    <p>• Certified Trainers available on floor</p>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    For questions or workout advice, reach our reception desk at {contactPhone}.
                  </p>

                  <p className="font-bold text-red-400 pt-1">
                    Keep pushing your limits!<br />
                    <span className="text-white">{gymName} Team</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRINTABLE OFFICIAL TAX INVOICE */}
          {activeTab === 'invoice' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between text-xs print:hidden">
                <span className="text-red-300 font-semibold">
                  Official Printable Receipt & Tax Invoice for <strong>{clientName}</strong>
                </span>
                <button
                  onClick={handlePrintPdf}
                  className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download PDF / Print</span>
                </button>
              </div>

              {/* Printable Invoice Container */}
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl text-white print:p-0 print:border-none print:bg-white print:text-black" id="printable-invoice">
                <style>{`
                  @media print {
                    body * { visibility: hidden; }
                    #printable-invoice, #printable-invoice * { visibility: visible; }
                    #printable-invoice { 
                      position: absolute; 
                      left: 0; 
                      top: 0; 
                      width: 100%; 
                      padding: 40px; 
                      background: white !important; 
                      color: black !important; 
                    }
                  }
                `}</style>

                {/* Banner */}
                <div className="flex justify-between items-start border-b border-zinc-900 pb-5 mb-5">
                  <div className="flex items-center gap-3">
                    <img src={phoenixLogo} alt="Phoenix Logo" className="w-12 h-12 object-contain" />
                    <div>
                      <h1 className="text-lg font-black text-white tracking-tight uppercase">PHOENIX FITNESS CENTRE</h1>
                      <p className="text-[11px] text-zinc-400 font-semibold">Modern Gym & Personal Fitness Academy</p>
                      <p className="text-[10px] text-zinc-500">Contact: +91 9487817301 | phoenixgym.vkp@gmail.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5">
                      <CheckCircle2 className="w-3 h-3" /> PAID & VERIFIED
                    </span>
                    <p className="text-xs font-bold text-white">{invoiceNo}</p>
                    <p className="text-[10px] text-zinc-400">Date: {startDate}</p>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-4 p-3.5 bg-zinc-900/60 border border-zinc-900 rounded-xl mb-5 text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">BILLED TO MEMBER</p>
                    <h3 className="font-extrabold text-white text-sm">{clientName}</h3>
                    <p className="text-zinc-400">Member ID: <strong className="text-white">{clientId}</strong></p>
                    <p className="text-zinc-400">Address: {member.village || 'Rampur'}</p>
                    <p className="text-zinc-400">Phone: {member.phone || '+91 9487817301'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">PAYMENT METRICS</p>
                    <p className="text-zinc-400">Payment Mode: <strong className="text-emerald-400">{paymentMethod}</strong></p>
                    <p className="text-zinc-400">Billing Period: <strong className="text-white">{planName} Plan</strong></p>
                    <p className="text-zinc-400">Issued By: <strong className="text-white">Phoenix Admin Desk</strong></p>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-zinc-900 rounded-xl overflow-hidden mb-5">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-900/80 border-b border-zinc-900 text-[10px] uppercase font-black text-zinc-400">
                        <th className="p-2.5 pl-3">Description</th>
                        <th className="p-2.5 text-center">Duration</th>
                        <th className="p-2.5 text-center">Tax / GST</th>
                        <th className="p-2.5 pr-3 text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50 text-zinc-300">
                      <tr>
                        <td className="p-3 pl-3 font-bold text-white">
                          Gym Membership Fee ({planName})
                          <span className="block text-[10px] text-zinc-500 font-normal">Full gym floor & equipment access</span>
                        </td>
                        <td className="p-3 text-center">{planName}</td>
                        <td className="p-3 text-center text-emerald-400">Included (0%)</td>
                        <td className="p-3 pr-3 text-right font-extrabold text-white text-sm">₹{amountPaid.toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">TOTAL AMOUNT RECEIVED</span>
                    <span className="text-[9px] text-zinc-400">Non-refundable membership subscription fee</span>
                  </div>
                  <h2 className="text-xl font-black text-white">₹{amountPaid.toLocaleString('en-IN')}</h2>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-zinc-900/80 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyText}
              className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
              title="Download or Print PDF Receipt"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSendEmail}
              className="w-1/2 sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{sent ? 'Send Again' : 'Send Welcome Email'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
