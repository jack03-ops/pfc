import React, { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Copy, 
  X, 
  Send, 
  Sparkles, 
  Printer, 
  FileText, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Phone
} from 'lucide-react';
import { recordMemberWelcome } from '../db/mockDb';
import phoenixLogo from '../assets/phoenix_logo.png';

export default function WelcomeEmailModal({ member, onClose, onEmailSent }) {
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'email' | 'invoice'
  const [emailSent, setEmailSent] = useState(false);
  const [whatsAppSent, setWhatsAppSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendingServer, setSendingServer] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);

  if (!member) return null;

  const gymName = "Phoenix Fitness Centre";
  const contactPhone = "+91 8015552425";
  const contactEmail = "phoenixgym.vkp@gmail.com";
  const clientEmail = member.email || 'member@gmail.com';
  const clientName = member.fullName || 'Gym Member';
  const clientId = member.id || 'PXM-1001';
  const clientPhone = member.whatsapp || member.phone || '+91 8015552425';
  const planName = member.plan || 'Monthly';
  const startDate = member.startDate || new Date().toISOString().split('T')[0];
  const endDate = member.endDate || '2026-10-04';
  const invoiceNo = `PFC-INV-${clientId.replace(/\D/g, '') || '101'}`;
  const amountPaid = member.amountPaid ? Number(member.amountPaid) : 1000;
  const paymentMethod = 'UPI';

  // 1. WhatsApp Template
  const whatsappWelcomeText = `🏋️ *WELCOME TO PHOENIX FITNESS CENTRE!* 🏋️

Hello *${clientName}*,

Welcome to the Phoenix Fitness family! 💪 We are thrilled to partner with you on your fitness journey.

📋 *YOUR MEMBERSHIP DETAILS:*
• Member ID: *${clientId}*
• Plan: *${planName} Plan*
• Start Date: ${startDate}
• Expiry Date: ${endDate}
• Status: *Active & Verified*

💳 *PAYMENT RECEIPT:*
• Invoice Ref: ${invoiceNo}
• Total Amount Paid: ₹${amountPaid.toLocaleString('en-IN')}
• Payment Mode: ${paymentMethod}
• Status: *PAID & VERIFIED*

⏰ *GYM GUIDELINES & HOURS:*
• Monday – Saturday: 5:00 AM – 10:00 PM
• Strength, Cardio, Crossfit & Free Weights
• Certified Floor Trainers available
• Please bring clean workout shoes and a towel

📍 *CONTACT & DESK:*
• Phone: ${contactPhone}
• Email: ${contactEmail}
• Address: ${gymName}, Near Temple, Rampur

Let's crush your fitness goals together! Keep pushing your limits! 💪🔥
*${gymName} Team*`;

  // 2. Email Subject & Body
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

  // Handler: Send via WhatsApp
  const handleSendWhatsApp = () => {
    const rawPhone = member.whatsapp || member.phone || '';
    const cleanPhone = String(rawPhone).replace(/\D/g, '').replace(/^91/, '');
    
    // Log to mock database as WhatsApp Welcome
    recordMemberWelcome(member.id, 'WhatsApp');

    const encodedText = encodeURIComponent(whatsappWelcomeText);
    const isDesktop = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const whatsappUrl = isDesktop
      ? `https://web.whatsapp.com/send?phone=91${cleanPhone || '8015552425'}&text=${encodedText}`
      : `https://api.whatsapp.com/send?phone=91${cleanPhone || '8015552425'}&text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
    setWhatsAppSent(true);

    if (onEmailSent) {
      onEmailSent(member, 'WhatsApp');
    }
  };

  // Handler: Send Welcome Email
  const handleSendEmail = async () => {
    setSendingServer(true);
    setServerStatus(null);
    try {
      const res = await fetch('/api/sync/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member)
      });
      const data = await res.json();
      if (data.success) {
        setServerStatus({ ok: true, msg: `Official welcome notice emailed to ${clientEmail}!` });
        setEmailSent(true);
        recordMemberWelcome(member.id, 'Email');
        if (onEmailSent) onEmailSent(member, 'Email');
      } else {
        throw new Error(data.message || 'SMTP offline');
      }
    } catch (err) {
      // Fallback: Open pre-composed email client
      const mailtoUrl = `mailto:${encodeURIComponent(clientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
      window.open(mailtoUrl, '_blank');
      setServerStatus({
        ok: true,
        msg: `Pre-composed email opened ready to send to ${clientEmail}!`
      });
      setEmailSent(true);
      recordMemberWelcome(member.id, 'Email');
      if (onEmailSent) onEmailSent(member, 'Email');
    } finally {
      setSendingServer(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = activeTab === 'whatsapp' ? whatsappWelcomeText : emailBodyText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Tabs */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Welcome Member — WhatsApp &amp; Email Dispatch</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Onboarding message for <span className="text-slate-200 font-semibold">{clientName}</span> ({clientPhone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="bg-zinc-900 p-1 rounded-xl border border-zinc-800 flex text-xs font-semibold">
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'email' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
              <button
                onClick={() => setActiveTab('invoice')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'invoice' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Receipt</span>
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
          {/* Member overview badge */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 text-[11px] print:hidden">
            <div>
              <span className="text-zinc-500 block uppercase text-[9px] font-bold">Client</span>
              <span className="text-white font-semibold truncate block">{clientName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase text-[9px] font-bold">Plan</span>
              <span className="text-white font-semibold block">{planName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase text-[9px] font-bold">Amount Paid</span>
              <span className="text-emerald-400 font-bold block">₹{amountPaid.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase text-[9px] font-bold">Invoice Ref</span>
              <span className="text-white font-bold block">{invoiceNo}</span>
            </div>
          </div>

          {/* Feedback Status */}
          {serverStatus && (
            <div className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-semibold print:hidden animate-in fade-in ${
              serverStatus.ok ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              {serverStatus.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              <span>{serverStatus.msg}</span>
            </div>
          )}

          {/* TAB 1: WHATSAPP MESSAGE PREVIEW */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Target WhatsApp: <strong>{clientPhone}</strong></span>
                </div>
                <button
                  onClick={handleSendWhatsApp}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{whatsAppSent ? '✓ Sent (Resend)' : 'Open Web WhatsApp'}</span>
                </button>
              </div>

              {/* Chat Bubble Card */}
              <div className="border border-emerald-900/40 rounded-2xl overflow-hidden bg-zinc-950">
                <div className="px-4 py-2 bg-emerald-950/50 border-b border-emerald-900/40 text-xs flex justify-between items-center text-emerald-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    WhatsApp Pre-formatted Message
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Official Notice
                  </span>
                </div>

                <div className="p-4 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap max-h-72 overflow-y-auto bg-zinc-900/40">
                  {whatsappWelcomeText}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL PREVIEW */}
          {activeTab === 'email' && (
            <div className="space-y-3">
              <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/40">
                <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs flex justify-between items-center text-zinc-400">
                  <span className="truncate pr-2"><strong>Subject:</strong> {emailSubject}</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold shrink-0">
                    To: {clientEmail}
                  </span>
                </div>
                
                <div className="p-4 text-xs text-zinc-300 leading-relaxed space-y-3 max-h-72 overflow-y-auto font-sans">
                  <p className="font-semibold text-white">Hi {clientName},</p>
                  <p>Welcome to <strong>{gymName}</strong>! 💪 We are excited to partner with you on your fitness journey.</p>

                  {/* Embedded Receipt Card */}
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/90 space-y-2">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>PAYMENT RECEIPT &amp; TAX INVOICE</span>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        PAID &amp; VERIFIED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <p className="text-zinc-500">Invoice No: <strong className="text-white">{invoiceNo}</strong></p>
                        <p className="text-zinc-500">Date: <strong className="text-white">{startDate}</strong></p>
                        <p className="text-zinc-500">Billed To: <strong className="text-white">{clientName}</strong> ({clientId})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-500">Payment Mode: <strong className="text-emerald-400 font-bold">{paymentMethod}</strong></p>
                        <p className="text-zinc-500">Tax / GST: <strong className="text-emerald-400 font-bold">Included (0%)</strong></p>
                        <p className="text-zinc-500">Subscription: <strong className="text-white">{planName} Plan</strong></p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-2.5 bg-red-500/10 rounded-lg border border-red-500/20 mt-2">
                      <span className="text-[11px] font-bold text-red-400 uppercase">TOTAL AMOUNT RECEIVED</span>
                      <span className="text-sm font-extrabold text-white">₹{amountPaid.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <p className="font-bold text-red-400 pt-1">
                    Keep pushing your limits!<br />
                    <span className="text-white">{gymName} Team</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRINTABLE INVOICE VIEW */}
          {activeTab === 'invoice' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between text-xs print:hidden">
                <span className="text-red-300 font-semibold">
                  Official Document Reference: <strong>{invoiceNo}</strong>
                </span>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
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
                      <p className="text-[11px] text-zinc-400 font-semibold">Modern Gym &amp; Personal Fitness Academy</p>
                      <p className="text-[10px] text-zinc-500">Contact: +91 8015552425 | phoenixgym.vkp@gmail.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5">
                      <ShieldCheck className="w-3 h-3" /> PAID &amp; VERIFIED
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
                    <p className="text-zinc-400">Phone: {member.phone || '+91 8015552425'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">PAYMENT METRICS</p>
                    <p className="text-zinc-400">Mode: <strong className="text-emerald-400">{paymentMethod}</strong></p>
                    <p className="text-zinc-400">Plan: <strong className="text-white">{planName} Plan</strong></p>
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
                          <span className="block text-[10px] text-zinc-500 font-normal">Full gym floor &amp; equipment access</span>
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
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>

            {/* 1-Click WhatsApp Button */}
            <button
              onClick={handleSendWhatsApp}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Open WhatsApp Web to send welcome greeting"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{whatsAppSent ? 'WhatsApp Sent' : 'Send WhatsApp'}</span>
            </button>

            {/* 1-Click Email Button */}
            <button
              onClick={handleSendEmail}
              disabled={sendingServer}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {sendingServer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{sendingServer ? 'Sending...' : emailSent ? 'Email Sent' : 'Send Email'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
