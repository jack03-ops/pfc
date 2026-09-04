import nodemailer from 'nodemailer';

const GYM_NAME = process.env.GYM_NAME || 'Phoenix Fitness Centre';
const FROM_EMAIL = process.env.GMAIL_USER || 'phoenixfitnesscentre03@gmail.com';

const escapeHtml = (value = '') => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const formatDate = (date) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date);

const getTransporter = () => {
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) throw new Error('GMAIL_APP_PASSWORD is not configured. Create a Google App Password for the sender account.');
  return nodemailer.createTransport({ service: 'gmail', auth: { user: FROM_EMAIL, pass: appPassword } });
};

export const buildExpiryEmail = (member, daysLeft) => {
  const expiryDate = formatDate(member.endDate);
  const isFinalReminder = daysLeft === 1;
  const subject = isFinalReminder ? 'Final reminder: your Phoenix Fitness membership expires tomorrow' : 'Your Phoenix Fitness membership expires in 3 days';
  const intro = isFinalReminder ? `your membership expires tomorrow, on <strong>${expiryDate}</strong>.` : `your membership expires in <strong>3 days</strong>, on <strong>${expiryDate}</strong>.`;
  const text = `Hi ${member.fullName}, ${isFinalReminder ? 'your membership expires tomorrow' : 'your membership expires in 3 days'} (${expiryDate}). Please renew at Phoenix Fitness Centre to continue your training without interruption.`;
  return { subject, text, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden"><div style="background:#b91c1c;color:#fff;padding:20px 24px"><h2 style="margin:0">${GYM_NAME}</h2></div><div style="padding:24px;line-height:1.6"><p>Hi <strong>${escapeHtml(member.fullName)}</strong>,</p><p>This is a friendly reminder that ${intro}</p><p>Please renew your plan at the reception to keep your fitness routine uninterrupted.</p><p>Thank you,<br><strong>${GYM_NAME}</strong></p></div></div>` };
};

export const sendExpiryEmail = async (member, daysLeft) => {
  if (!member.email || !/^\S+@\S+\.\S+$/.test(member.email)) throw new Error('Member does not have a valid email address.');
  const message = buildExpiryEmail(member, daysLeft);
  const result = await getTransporter().sendMail({ from: `"${GYM_NAME}" <${FROM_EMAIL}>`, to: member.email, subject: message.subject, text: message.text, html: message.html });
  return { success: true, messageId: result.messageId, ...message };
};

export const buildWelcomeEmail = (member) => {
  const expiryDate = member.endDate ? formatDate(new Date(member.endDate)) : 'Upcoming';
  const clientId = member.clientId || member.id || 'PXM-1001';
  const invoiceNo = `PFC-INV-${clientId.replace(/\D/g, '') || '101'}`;
  const amountPaid = member.amountPaid ? Number(member.amountPaid) : 1000;
  const plan = member.plan || 'Monthly';
  const todayFormatted = formatDate(new Date());

  const subject = `🏋️ Welcome to ${GYM_NAME} & Official Payment Receipt - ${member.fullName}!`;
  const text = `Hi ${member.fullName}, welcome to ${GYM_NAME}! Official Invoice ${invoiceNo}: Status PAID & VERIFIED. Plan: ${plan}, Amount Paid: ₹${amountPaid}. Expiry Date: ${expiryDate}. Gym Timings: Mon - Sat 5:00 AM - 10:00 PM. Keep pushing your limits!`;
  
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <!-- Header Banner -->
      <div style="background:#b91c1c;color:#fff;padding:24px;text-align:center">
        <h2 style="margin:0;text-transform:uppercase;letter-spacing:1px">${GYM_NAME}</h2>
        <p style="margin:6px 0 0 0;font-size:13px;opacity:0.9">Official Payment Receipt & Tax Invoice</p>
      </div>

      <div style="padding:24px;line-height:1.6">
        <p>Hi <strong>${escapeHtml(member.fullName)}</strong>,</p>
        <p>Welcome to <strong>${GYM_NAME}</strong>! 💪 We are excited to guide and support you on your fitness journey.</p>
        
        <!-- Official Tax Invoice Card -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin:18px 0">
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:10px;margin-bottom:12px">
            <div>
              <span style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:bold;display:block">INVOICE NO</span>
              <strong style="color:#0f172a;font-size:14px">${invoiceNo}</strong>
            </div>
            <div style="text-align:right">
              <span style="background:#dcfce7;color:#15803d;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:bold">
                ✓ PAID &amp; VERIFIED
              </span>
              <span style="display:block;font-size:11px;color:#64748b;margin-top:2px">Date: ${todayFormatted}</span>
            </div>
          </div>

          <table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:12px">
            <thead>
              <tr style="background:#f1f5f9;color:#475569;text-align:left">
                <th style="padding:8px 10px">Description</th>
                <th style="padding:8px 10px;text-align:center">Duration</th>
                <th style="padding:8px 10px;text-align:center">Tax / GST</th>
                <th style="padding:8px 10px;text-align:right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:10px">
                  <strong>Gym Membership Fee (${plan})</strong><br/>
                  <span style="font-size:10px;color:#64748b">Full gym floor &amp; machine access</span>
                </td>
                <td style="padding:10px;text-align:center">${plan}</td>
                <td style="padding:10px;text-align:center;color:#16a34a;font-weight:bold">Included (0%)</td>
                <td style="padding:10px;text-align:right;font-weight:bold;font-size:13px">₹${amountPaid.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div style="background:#fef2f2;border:1px solid #fecaca;padding:10px 14px;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:11px;font-weight:bold;color:#b91c1c;text-transform:uppercase">TOTAL AMOUNT RECEIVED</span>
            <span style="font-size:16px;font-weight:900;color:#991b1b">₹${amountPaid.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <!-- Membership Guidelines -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-bottom:16px;font-size:12px">
          <p style="margin:0 0 6px 0"><strong>Client ID:</strong> ${clientId}</p>
          <p style="margin:0 0 6px 0"><strong>Membership Expiry:</strong> ${expiryDate}</p>
          <p style="margin:0 0 6px 0"><strong>Gym Timings:</strong> Mon – Sat: 5:00 AM – 10:00 PM</p>
          <p style="margin:0"><strong>Emergency &amp; Desk Contact:</strong> +91 9487817301</p>
        </div>

        <p style="font-size:12px;color:#64748b">Please retain this digital receipt for your subscription records.</p>
        <p style="margin-top:20px">Keep Pushing Your Limits,<br/><strong>${GYM_NAME} Team</strong></p>
      </div>
    </div>
  `;
  return { subject, text, html };
};

export const sendWelcomeEmail = async (member) => {
  if (!member.email || !/^\S+@\S+\.\S+$/.test(member.email)) throw new Error('Member does not have a valid email address.');
  const message = buildWelcomeEmail(member);
  const result = await getTransporter().sendMail({ from: `"${GYM_NAME}" <${FROM_EMAIL}>`, to: member.email, subject: message.subject, text: message.text, html: message.html });
  return { success: true, messageId: result.messageId, ...message };
};
