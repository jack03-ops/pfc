import React, { useState } from 'react';
import { Mail, CheckCircle2, Copy, X, Send, Sparkles, Dumbbell, ShieldCheck, Clock, MapPin, Phone } from 'lucide-react';
import { logWelcomeEmail } from '../db/mockDb';

export default function WelcomeEmailModal({ member, onClose, onEmailSent }) {
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

  const emailSubject = `🏋️ Welcome to ${gymName} - ${clientName}!`;

  const emailBodyText = `Hi ${clientName},

Welcome to ${gymName}! 💪 We are thrilled to welcome you to our fitness family.

Your Membership Details:
• Member ID: ${clientId}
• Plan: ${planName}
• Start Date: ${startDate}
• Expiry Date: ${endDate}
• Status: Active

Gym Guidelines & Hours:
• Timings: Monday to Saturday (5:00 AM – 10:00 PM)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Welcome to Gym Message</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] text-zinc-400">
                Official onboarding notice for <span className="text-slate-200 font-semibold">{clientName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {sent && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Welcome email triggered successfully & logged to Alert Center!</span>
            </div>
          )}

          {/* Member badge */}
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
              <span className="text-zinc-500 block uppercase text-[9px] font-bold">Plan</span>
              <span className="text-white font-semibold block">{planName}</span>
            </div>
            <div>
              <span className="text-zinc-500 block uppercase text-[9px] font-bold">Expiry Date</span>
              <span className="text-emerald-400 font-semibold block">{endDate}</span>
            </div>
          </div>

          {/* Email Preview Card */}
          <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/40">
            <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs flex justify-between items-center text-zinc-400">
              <span className="truncate pr-2"><strong>Subject:</strong> {emailSubject}</span>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold shrink-0">
                From: {contactEmail}
              </span>
            </div>
            <div className="p-4 text-xs text-zinc-300 leading-relaxed space-y-3 max-h-56 overflow-y-auto font-sans">
              <p className="font-semibold text-white">Hi {clientName},</p>
              <p>Welcome to <strong>{gymName}</strong>! 💪 We are thrilled to welcome you to our fitness family.</p>
              
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
                <p>• Please bring clean workout shoes and a towel</p>
              </div>

              <p className="text-[11px] text-slate-400">
                For questions or workout advice, reach our trainers at {contactPhone}.
              </p>

              <p className="font-bold text-red-400 pt-1">
                Keep pushing your limits!<br />
                <span className="text-white">{gymName} Team</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-zinc-900/80 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleCopyText}
            className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Email Text'}</span>
          </button>

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
