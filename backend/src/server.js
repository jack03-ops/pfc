import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';

// Load model structures
import Admin from './models/Admin.js';
import Plan from './models/Plan.js';

// Load route routers
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Init env setup
dotenv.config();

// Keep the startup promise so a serverless cron invocation can wait for MongoDB.
const databaseConnection = connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Administrative and Plan seeding hooks
const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seeding] Skipping DB seeding (MongoDB not connected).');
      return;
    }
    // 1. Seed Admin credentials
    const adminExists = await Admin.findOne({ username: 'Phoenix03' });
    if (!adminExists) {
      await Admin.create({
        username: 'Phoenix03',
        password: 'PhoenixUlaga03', // encrypted by pre-save hook automatically!
        role: 'admin'
      });
      console.log('[Seeding] Secure Admin credentials created (Username: Phoenix03).');
    }

    // 2. Seed Default Membership Plans
    const plansCount = await Plan.countDocuments();
    if (plansCount === 0) {
      await Plan.insertMany([
        { name: 'Monthly', durationMonths: 1, price: 1000 },
        { name: 'Quarterly', durationMonths: 3, price: 2700 },
        { name: 'Half-Yearly', durationMonths: 6, price: 5000 },
        { name: 'Yearly', durationMonths: 12, price: 9000 }
      ]);
      console.log('[Seeding] Standard gym membership plans configured.');
    }
  } catch (error) {
    console.error(`[Seeding Error] ${error.message}`);
  }
};

// Execute seeding on launch
seedDatabase();

// Initialize automated background scheduler
import { initScheduler, runAutomatedReminders } from './services/scheduler.js';
initScheduler();

// Vercel invokes this endpoint every day. Its Bearer token is CRON_SECRET.
app.get('/api/cron/membership-reminders', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized cron request.' });
  }
  try {
    await databaseConnection;
    const result = await runAutomatedReminders();
    return res.status(200).json({ success: true, dispatched: result.dispatchedCount });
  } catch (error) {
    console.error(`[Cron] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Reminder run failed.' });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Base Status Route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Phoenix Gym Admin API Service is healthy.' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`[Phoenix Server] Telemetry active on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
