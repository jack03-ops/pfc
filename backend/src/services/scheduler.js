import mongoose from 'mongoose';
import Member from '../models/Member.js';
import Notification from '../models/Notification.js';
import { buildExpiryEmail, sendExpiryEmail } from './emailService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfUtcDay = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

// The delivery log makes the job idempotent when Vercel retries a cron request.
export const runAutomatedReminders = async () => {
  if (mongoose.connection.readyState !== 1) throw new Error('MongoDB is not connected.');

  const today = startOfUtcDay(new Date());
  let dispatchedCount = 0;
  const logs = [];

  for (const daysLeft of [3, 1]) {
    const targetDate = new Date(today.getTime() + daysLeft * DAY_MS);
    const nextDate = new Date(targetDate.getTime() + DAY_MS);
    const members = await Member.find({ activeStatus: true, endDate: { $gte: targetDate, $lt: nextDate } });

    for (const member of members) {
      const existing = await Notification.findOne({
        memberId: member._id,
        type: 'Email',
        createdAt: { $gte: today, $lt: new Date(today.getTime() + DAY_MS) },
        message: { $regex: `\\[expiry-${daysLeft}-day\\]` }
      });
      if (existing) continue;

      const emailContent = buildExpiryEmail(member, daysLeft);
      let status = 'Sent';
      try {
        await sendExpiryEmail(member, daysLeft);
      } catch (error) {
        status = 'Failed';
        console.error(`[Email Reminder] ${member.clientId}: ${error.message}`);
      }

      const notification = await Notification.create({
        memberId: member._id,
        clientName: member.fullName,
        email: member.email || '',
        type: 'Email',
        message: `[expiry-${daysLeft}-day] ${emailContent.text}`,
        status
      });
      logs.push(notification);
      dispatchedCount += 1;
    }
  }
  return { dispatchedCount, logs };
};

// Locally, keep the convenient daily scan. Vercel uses its cron endpoint.
export const initScheduler = () => {
  if (process.env.VERCEL) return;
  setTimeout(() => runAutomatedReminders().catch(error => console.error(`[Scheduler] ${error.message}`)), 5000);
  setInterval(() => runAutomatedReminders().catch(error => console.error(`[Scheduler] ${error.message}`)), DAY_MS);
};
