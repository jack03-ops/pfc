// Phoenix Gym Mock Database Layer

const LOCAL_STORAGE_KEY = 'phoenix_gym_members';
const SETTINGS_KEY = 'phoenix_gym_settings';
const PAYMENTS_KEY = 'phoenix_gym_payments';
const REMINDERS_KEY = 'phoenix_gym_reminders';

// Calculate test dates relative to current date (2026-05-27)
const getRelativeDateStr = (daysAhead) => {
  const date = new Date('2026-05-27');
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
};

const DEFAULT_MEMBERS = [
  {
    id: "PXM-1001",
    fullName: "Hari Ram Kumar",
    phone: "+91 9487817301",
    whatsapp: "+91 9487817301",
    village: "Rampur",
    address: "Near Temple, Rampur",
    gender: "Male",
    dob: "1998-08-15",
    age: 28,
    height: 175,
    weight: 74,
    bmi: 24.2,
    emergencyContact: "+91 9487817301",
    email: "hariramkumar2030@gmail.com",
    purposeOfJoining: "Fitness & Strength",
    gymExperience: "Yes",
    profession: "Software Specialist",
    amountPaid: 1000,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "New",
    joiningDate: "2026-09-03",
    plan: "Monthly",
    startDate: "2026-09-03",
    endDate: "2026-09-06",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Primary registered gym member profile."
  },
  {
    id: "PXM-1006",
    fullName: "Simran Kaur",
    phone: "8877665544",
    whatsapp: "8877665544",
    village: "Sohna",
    address: "Main Market, Sohna",
    gender: "Female",
    dob: "2001-09-05",
    age: 25,
    height: 165,
    weight: 60,
    bmi: 22.0,
    emergencyContact: "+91 8877660000",
    email: "simran.kaur@gmail.com",
    purposeOfJoining: "Fitness",
    gymExperience: "No",
    profession: "Designer",
    amountPaid: 1000,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "New",
    joiningDate: "2026-05-01",
    plan: "Monthly",
    startDate: "2026-05-01",
    endDate: "2026-06-01",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Joined with friend Suresh."
  }
];

const DEFAULT_SETTINGS = {
  gymName: "Phoenix Fitness Gym",
  currency: "INR",
  membershipPlans: [
    { name: "Monthly", durationMonths: 1, price: 1000 },
    { name: "Quarterly", durationMonths: 3, price: 2700 },
    { name: "Half-Yearly", durationMonths: 6, price: 5000 },
    { name: "Yearly", durationMonths: 12, price: 9000 }
  ]
};

const DEFAULT_PAYMENTS = [
  { id: "TXN-101", clientId: "PXM-1001", clientName: "Hari Ram Kumar", amount: 1000, date: "2026-09-03", plan: "Monthly", method: "UPI" }
];

const DEFAULT_REMINDERS = [
  { id: "REM-101", clientName: "Karthik Kumar", phone: "+91 9487817301", date: "2026-05-26", type: "WhatsApp", status: "Sent", message: "Hello Karthik Kumar, your Phoenix Gym membership expires in 1 day(s). Please renew your membership to continue uninterrupted access." }
];

export const getMembers = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MEMBERS));
    return DEFAULT_MEMBERS;
  }
  return JSON.parse(data);
};

export const saveMembers = (members) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
};

export const getSettings = () => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(data);
};

export const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getPayments = () => {
  const data = localStorage.getItem(PAYMENTS_KEY);
  if (!data) {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
    return DEFAULT_PAYMENTS;
  }
  return JSON.parse(data);
};

export const savePayments = (payments) => {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
};

export const getReminders = () => {
  const data = localStorage.getItem(REMINDERS_KEY);
  if (!data) {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(DEFAULT_REMINDERS));
    return DEFAULT_REMINDERS;
  }
  return JSON.parse(data);
};

export const saveReminders = (reminders) => {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
};

// Seed utility to fully initialize all stores on application mount and sync database version
export const initializeDb = () => {
  const currentVersion = localStorage.getItem('phoenix_gym_db_ver');
  if (currentVersion !== 'v3_single_user') {
    // Override old cached local storage to ensure 100% parity across mobile and desktop
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MEMBERS));
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(DEFAULT_REMINDERS));
    localStorage.setItem('phoenix_gym_db_ver', 'v3_single_user');
  }
  getMembers();
  getSettings();
  getPayments();
  getReminders();
};
