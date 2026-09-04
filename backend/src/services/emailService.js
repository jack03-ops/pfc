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
  const subject = `🏋️ Welcome to ${GYM_NAME} - ${member.fullName}!`;
  const text = `Hi ${member.fullName}, welcome to ${GYM_NAME}! We are thrilled to welcome you to our fitness family. Your membership (Plan: ${member.plan || 'Monthly'}, Expiry: ${expiryDate}) is now active. Operating Hours: Mon - Sat 5:00 AM - 10:00 PM. Keep pushing your limits!`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#b91c1c;color:#fff;padding:24px;text-align:center">
        <h2 style="margin:0;text-transform:uppercase">${GYM_NAME}</h2>
        <p style="margin:6px 0 0 0;font-size:13px;opacity:0.9">Welcome to the Fitness Community!</p>
      </div>
      <div style="padding:24px;line-height:1.6">
        <p>Hi <strong>${escapeHtml(member.fullName)}</strong>,</p>
        <p>Welcome to <strong>${GYM_NAME}</strong>! 💪 We are excited to guide and support you on your fitness journey.</p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0 0 6px 0"><strong>Client ID:</strong> ${member.clientId || member.id || 'PXM-1001'}</p>
          <p style="margin:0 0 6px 0"><strong>Plan:</strong> ${member.plan || 'Monthly'}</p>
          <p style="margin:0 0 6px 0"><strong>Expiry Date:</strong> ${expiryDate}</p>
          <p style="margin:0"><strong>Gym Timings:</strong> Mon – Sat: 5:00 AM – 10:00 PM</p>
        </div>
        <p>If you have any questions or need trainer assistance, please visit the reception desk or call us at <strong>+91 9487817301</strong>.</p>
        <p style="margin-top:24px">Keep Pushing Your Limits,<br><strong>${GYM_NAME} Team</strong></p>
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
