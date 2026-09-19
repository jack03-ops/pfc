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
    phone: "+91 8015552425",
    whatsapp: "+91 8015552425",
    village: "Rampur",
    address: "Near Temple, Rampur",
    gender: "Male",
    dob: "1998-08-15",
    age: 28,
    height: 175,
    weight: 74,
    bmi: 24.2,
    emergencyContact: "+91 8015552425",
    email: "hariramkumar2030@gmail.com",
    purposeOfJoining: "Fitness & Strength",
    gymExperience: "Yes",
    profession: "Software Specialist",
    amountPaid: 1000,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "New",
    joiningDate: "2026-08-08",
    plan: "Monthly",
    startDate: "2026-08-08",
    endDate: "2026-09-07",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Primary registered gym member. 3 days before expiry."
  },
  {
    id: "PXM-1002",
    fullName: "Aravind Swamy",
    phone: "+91 9487817302",
    whatsapp: "+91 9487817302",
    village: "Chandpur",
    address: "West Street, Chandpur",
    gender: "Male",
    dob: "1996-03-12",
    age: 30,
    height: 178,
    weight: 78,
    bmi: 24.6,
    emergencyContact: "+91 9487817300",
    email: "aravindswamy.fit@gmail.com",
    purposeOfJoining: "Weight Loss",
    gymExperience: "No",
    profession: "Business Analyst",
    amountPaid: 1000,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "Renewal",
    joiningDate: "2026-08-06",
    plan: "Monthly",
    startDate: "2026-08-06",
    endDate: "2026-09-05",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Requires urgent 1-day reminder (Expires tomorrow)."
  },
  {
    id: "PXM-1003",
    fullName: "Vijay Sethupathi",
    phone: "+91 9487817303",
    whatsapp: "+91 9487817303",
    village: "Rampur",
    address: "Market Road, Rampur",
    gender: "Male",
    dob: "1992-06-25",
    age: 34,
    height: 172,
    weight: 82,
    bmi: 27.7,
    emergencyContact: "+91 9487817300",
    email: "vijay.fitness03@gmail.com",
    purposeOfJoining: "Bodybuilding",
    gymExperience: "Yes",
    profession: "Accountant",
    amountPaid: 2700,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "Renewal",
    joiningDate: "2026-06-08",
    plan: "Quarterly",
    startDate: "2026-06-08",
    endDate: "2026-09-07",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Quarterly plan ending in 3 days."
  },
  {
    id: "PXM-1004",
    fullName: "Sivakarthikeyan",
    phone: "+91 9487817304",
    whatsapp: "+91 9487817304",
    village: "Sohna",
    address: "Bus Stand Road, Sohna",
    gender: "Male",
    dob: "1997-11-18",
    age: 29,
    height: 180,
    weight: 75,
    bmi: 23.1,
    emergencyContact: "+91 9487817300",
    email: "siva.workout03@gmail.com",
    purposeOfJoining: "Cardio & Stamina",
    gymExperience: "Yes",
    profession: "Teacher",
    amountPaid: 1000,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "New",
    joiningDate: "2026-08-06",
    plan: "Monthly",
    startDate: "2026-08-06",
    endDate: "2026-09-05",
    paymentStatus: "Paid",
    status: "Active",
    notes: "1 day remaining on monthly subscription (Expires tomorrow)."
  },
  {
    id: "PXM-1005",
    fullName: "Karthik Raja",
    phone: "+91 9487817305",
    whatsapp: "+91 9487817305",
    village: "Rampur",
    address: "South Street, Rampur",
    gender: "Male",
    dob: "1999-04-10",
    age: 27,
    height: 174,
    weight: 70,
    bmi: 23.1,
    emergencyContact: "+91 9487817300",
    email: "karthik.pfc@gmail.com",
    purposeOfJoining: "Strength & Powerlifting",
    gymExperience: "Yes",
    profession: "Mechanical Engineer",
    amountPaid: 1000,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "New",
    joiningDate: "2026-08-08",
    plan: "Monthly",
    startDate: "2026-08-08",
    endDate: "2026-09-07",
    paymentStatus: "Paid",
    status: "Active",
    notes: "3 days expiry reminder scheduled."
  },
  {
    id: "PXM-1006",
    fullName: "Priya Dharshini",
    phone: "+91 9487817306",
    whatsapp: "+91 9487817306",
    village: "Chandpur",
    address: "Temple View, Chandpur",
    gender: "Female",
    dob: "2000-07-22",
    age: 26,
    height: 165,
    weight: 58,
    bmi: 21.3,
    emergencyContact: "+91 9487817300",
    email: "priya.fitlife03@gmail.com",
    purposeOfJoining: "General Fitness & Yoga",
    gymExperience: "No",
    profession: "Architect",
    amountPaid: 5000,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "Renewal",
    joiningDate: "2026-03-06",
    plan: "Half-Yearly",
    startDate: "2026-03-06",
    endDate: "2026-09-05",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Half-yearly subscription expiring tomorrow."
  },
  {
    id: "PXM-1007",
    fullName: "Suresh Raina",
    phone: "+91 9487817307",
    whatsapp: "+91 9487817307",
    village: "Rampur",
    address: "Old Colony, Rampur",
    gender: "Male",
    dob: "1995-12-05",
    age: 31,
    height: 176,
    weight: 76,
    bmi: 24.5,
    emergencyContact: "+91 9487817300",
    email: "suresh.pfc2026@gmail.com",
    purposeOfJoining: "Endurance Training",
    gymExperience: "Yes",
    profession: "Cricket Coach",
    amountPaid: 1000,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "New",
    joiningDate: "2026-08-13",
    plan: "Monthly",
    startDate: "2026-08-13",
    endDate: "2026-09-12",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Active regular athlete (8 days left)."
  },
  {
    id: "PXM-1008",
    fullName: "Ananya Ram",
    phone: "+91 9487817308",
    whatsapp: "+91 9487817308",
    village: "Sohna",
    address: "Lake View, Sohna",
    gender: "Female",
    dob: "2002-02-14",
    age: 24,
    height: 168,
    weight: 55,
    bmi: 19.5,
    emergencyContact: "+91 9487817300",
    email: "ananya.crossfit@gmail.com",
    purposeOfJoining: "Crossfit & Mobility",
    gymExperience: "No",
    profession: "Content Creator",
    amountPaid: 9000,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "New",
    joiningDate: "2025-09-20",
    plan: "Yearly",
    startDate: "2025-09-20",
    endDate: "2026-09-20",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Yearly privileged membership (16 days left)."
  },
  {
    id: "PXM-1009",
    fullName: "Dinesh Kumar",
    phone: "+91 9487817309",
    whatsapp: "+91 9487817309",
    village: "Rampur",
    address: "Railway Line Road, Rampur",
    gender: "Male",
    dob: "1994-08-30",
    age: 32,
    height: 177,
    weight: 80,
    bmi: 25.5,
    emergencyContact: "+91 9487817300",
    email: "dinesh.gym03@gmail.com",
    purposeOfJoining: "Hypertrophy",
    gymExperience: "Yes",
    profession: "Pharmacist",
    amountPaid: 1000,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "New",
    joiningDate: "2026-09-04",
    plan: "Monthly",
    startDate: "2026-09-04",
    endDate: "2026-10-04",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Newly enrolled active member (30 days left)."
  },
  {
    id: "PXM-1010",
    fullName: "Surya Prakash",
    phone: "+91 9487817310",
    whatsapp: "+91 9487817310",
    village: "Chandpur",
    address: "Main Highway, Chandpur",
    gender: "Male",
    dob: "1993-10-15",
    age: 33,
    height: 182,
    weight: 88,
    bmi: 26.6,
    emergencyContact: "+91 9487817300",
    email: "surya.powerlifting@gmail.com",
    purposeOfJoining: "Competitive Powerlifting",
    gymExperience: "Yes",
    profession: "Gymnastics Trainer",
    amountPaid: 2700,
    hasMedicalCondition: "No",
    medicalConditionDetails: "",
    membershipType: "Renewal",
    joiningDate: "2026-08-05",
    plan: "Quarterly",
    startDate: "2026-08-05",
    endDate: "2026-11-04",
    paymentStatus: "Paid",
    status: "Active",
    notes: "Long term quarterly powerlifter (61 days left)."
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
  { id: "TXN-101", clientId: "PXM-1001", clientName: "Hari Ram Kumar", amount: 1000, date: "2026-08-08", plan: "Monthly", method: "UPI" },
  { id: "TXN-102", clientId: "PXM-1002", clientName: "Aravind Swamy", amount: 1000, date: "2026-08-06", plan: "Monthly", method: "UPI" },
  { id: "TXN-103", clientId: "PXM-1003", clientName: "Vijay Sethupathi", amount: 2700, date: "2026-06-08", plan: "Quarterly", method: "UPI" },
  { id: "TXN-104", clientId: "PXM-1004", clientName: "Sivakarthikeyan", amount: 1000, date: "2026-08-06", plan: "Monthly", method: "UPI" },
  { id: "TXN-105", clientId: "PXM-1005", clientName: "Karthik Raja", amount: 1000, date: "2026-08-08", plan: "Monthly", method: "UPI" },
  { id: "TXN-106", clientId: "PXM-1006", clientName: "Priya Dharshini", amount: 5000, date: "2026-03-06", plan: "Half-Yearly", method: "UPI" },
  { id: "TXN-107", clientId: "PXM-1007", clientName: "Suresh Raina", amount: 1000, date: "2026-08-13", plan: "Monthly", method: "UPI" },
  { id: "TXN-108", clientId: "PXM-1008", clientName: "Ananya Ram", amount: 9000, date: "2025-09-20", plan: "Yearly", method: "UPI" },
  { id: "TXN-109", clientId: "PXM-1009", clientName: "Dinesh Kumar", amount: 1000, date: "2026-09-04", plan: "Monthly", method: "UPI" },
  { id: "TXN-110", clientId: "PXM-1010", clientName: "Surya Prakash", amount: 2700, date: "2026-08-05", plan: "Quarterly", method: "UPI" }
];

const DEFAULT_REMINDERS = [
  { id: "REM-101", clientName: "Karthik Kumar", phone: "+91 8015552425", date: "2026-05-26", type: "WhatsApp", status: "Sent", message: "Hello Karthik Kumar, your Phoenix Gym membership expires in 1 day(s). Please renew your membership to continue uninterrupted access." }
];

// IndexedDB Async Persistent Storage Layer (eliminates browser 5MB localStorage limits)
const IDB_NAME = 'PhoenixGymDB';
const IDB_VERSION = 1;
const IDB_STORE = 'phoenix_store';

const openIndexedDB = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) return resolve(null);
    try {
      const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
};

export const getIdbData = async (key) => {
  try {
    const db = await openIndexedDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

export const setIdbData = async (key, value) => {
  try {
    const db = await openIndexedDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
};

// Soft-delete and membership query layer
export const getMembers = (includeDeleted = false) => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  let list = DEFAULT_MEMBERS;
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) list = parsed;
    } catch (e) {
      list = DEFAULT_MEMBERS;
    }
  } else {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MEMBERS));
    setIdbData(LOCAL_STORAGE_KEY, DEFAULT_MEMBERS);
  }

  // Also hydrate IDB in background
  setIdbData(LOCAL_STORAGE_KEY, list);

  if (includeDeleted) return list;
  return list.filter(m => !m.isDeleted);
};

// Retrieve soft-deleted members for audit/recovery
export const getDeletedMembers = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.filter(m => m.isDeleted === true) : [];
  } catch (e) {
    return [];
  }
};

// Database-grade soft delete pattern
export const deleteMember = (id) => {
  const all = getMembers(true);
  const nowIso = new Date().toISOString();
  const updated = all.map(m => {
    if (m.id === id) {
      return { ...m, isDeleted: true, deletedAt: nowIso, updatedAt: nowIso };
    }
    return m;
  });
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  setIdbData(LOCAL_STORAGE_KEY, updated);
  localStorage.setItem('phoenix_gym_last_edit_time', String(Date.now()));
  syncToCloud(updated, getPayments());

  return updated.filter(m => !m.isDeleted);
};

// Restore soft-deleted member
export const restoreMember = (id) => {
  const all = getMembers(true);
  const nowIso = new Date().toISOString();
  const updated = all.map(m => {
    if (m.id === id) {
      const { isDeleted, deletedAt, ...rest } = m;
      return { ...rest, isDeleted: false, updatedAt: nowIso };
    }
    return m;
  });

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  setIdbData(LOCAL_STORAGE_KEY, updated);
  localStorage.setItem('phoenix_gym_last_edit_time', String(Date.now()));
  syncToCloud(updated, getPayments());

  return updated.filter(m => !m.isDeleted);
};

// Centralized Cloud Sync URL (Sanitized - no master tokens stored on client)
const CLOUD_SYNC_URL = 'https://5pqzjtksdbperly4.public.blob.vercel-storage.com/phoenix_sync.json';

// Fetch live centralized cloud data (shared across phone, laptop, tablet)
export const fetchFromCloud = async () => {
  try {
    let json = null;
    // Prefer serverless API which has instant in-memory cache and sanitized headers
    try {
      const apiRes = await fetch(`/api/sync?t=${Date.now()}`, { cache: 'no-store' });
      if (apiRes.ok) {
        const body = await apiRes.json();
        json = body && body.data ? body.data : body;
      }
    } catch (_) {}

    // Fallback to public CDN endpoint if API route is starting up
    if (!json || !Array.isArray(json.members)) {
      const blobRes = await fetch(`${CLOUD_SYNC_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (blobRes.ok) {
        json = await blobRes.json();
      }
    }

    if (json && Array.isArray(json.members)) {
      const localAll = getMembers(true);
      const lastLocalEdit = parseInt(localStorage.getItem('phoenix_gym_last_edit_time') || '0', 10);
      const now = Date.now();

      // PROTECT RECENT LOCAL CHANGES (within last 45s):
      // Keep local state authoritative and push up to cloud so cloud matches local
      if (now - lastLocalEdit < 45000) {
        syncToCloud(localAll, getPayments());
        return { members: localAll.filter(m => !m.isDeleted), payments: getPayments() };
      }

      // Optimistic concurrency merge: Merge cloud members with respect to soft deletes & updatedAt
      const mergedMap = new Map();
      localAll.forEach(m => mergedMap.set(m.id, m));
      json.members.forEach(cloudM => {
        const localM = mergedMap.get(cloudM.id);
        if (!localM) {
          mergedMap.set(cloudM.id, cloudM);
        } else {
          // If locally deleted, preserve deletion unless cloud is newer and explicitly not deleted
          if (localM.isDeleted && !cloudM.isDeleted) {
            const localDelTime = new Date(localM.deletedAt || 0).getTime();
            const cloudUpTime = new Date(cloudM.updatedAt || 0).getTime();
            if (localDelTime >= cloudUpTime) {
              mergedMap.set(cloudM.id, localM);
              return;
            }
          }
          // Choose the record with newer updatedAt
          const localTime = new Date(localM.updatedAt || 0).getTime();
          const cloudTime = new Date(cloudM.updatedAt || 0).getTime();
          mergedMap.set(cloudM.id, cloudTime > localTime ? cloudM : localM);
        }
      });

      const mergedMembers = Array.from(mergedMap.values());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedMembers));
      setIdbData(LOCAL_STORAGE_KEY, mergedMembers);

      if (Array.isArray(json.payments)) {
        localStorage.setItem(PAYMENTS_KEY, JSON.stringify(json.payments));
        setIdbData(PAYMENTS_KEY, json.payments);
      }
      return { ...json, members: mergedMembers.filter(m => !m.isDeleted) };
    }
  } catch (err) {
    console.warn('[Cloud Sync Fetch Warning]', err.message);
  }
  return null;
};

// Push live centralized cloud data (shared across phone, laptop, tablet)
export const syncToCloud = async (members, payments) => {
  try {
    const allMembers = members || getMembers(true);
    const payload = {
      members: allMembers,
      payments: payments || getPayments(),
      updatedAt: new Date().toISOString()
    };

    // Dispatch securely to backend endpoint /api/sync
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('[Cloud Sync Push Warning]', err.message);
  }
};

export const saveMembers = (members) => {
  const currentAll = getMembers(true);
  const nowIso = new Date().toISOString();
  
  // Update or insert members with timestamps
  const memberMap = new Map();
  currentAll.forEach(m => memberMap.set(m.id, m));
  members.forEach(m => {
    memberMap.set(m.id, { ...m, updatedAt: nowIso, isDeleted: m.isDeleted || false });
  });

  const fullList = Array.from(memberMap.values());
  localStorage.setItem('phoenix_gym_last_edit_time', String(Date.now()));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullList));
  setIdbData(LOCAL_STORAGE_KEY, fullList);
  syncToCloud(fullList, getPayments());
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
  syncToCloud(getMembers(), payments);
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

// Log welcome email dispatch to reminder ledger
export const logWelcomeEmail = (member) => {
  const reminders = getReminders();
  const today = new Date().toISOString().split('T')[0];
  const newLog = {
    id: `REM-${101 + reminders.length}`,
    clientName: member.fullName,
    phone: member.phone || '',
    email: member.email || '',
    date: today,
    type: 'Email',
    status: 'Sent',
    message: `[Welcome Message] Welcome to Phoenix Fitness Centre sent to ${member.email || member.fullName}`
  };
  const updated = [newLog, ...reminders];
  saveReminders(updated);
  return newLog;
};

// Record sent reminder on member record and log to reminder ledger
export const recordMemberReminder = (memberId, reminderType) => {
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const members = getMembers();
  let targetMember = null;
  const updatedMembers = members.map(m => {
    if (m.id === memberId) {
      targetMember = {
        ...m,
        lastReminderDate: today,
        lastReminderTime: time,
        lastReminderType: reminderType
      };
      return targetMember;
    }
    return m;
  });

  saveMembers(updatedMembers);

  // Also log into reminders ledger
  if (targetMember) {
    const reminders = getReminders();
    const newLog = {
      id: `REM-${101 + reminders.length}`,
      clientName: targetMember.fullName,
      phone: targetMember.phone || '',
      email: targetMember.email || '',
      date: today,
      time: time,
      type: 'Email',
      status: 'Sent',
      message: `[${reminderType}] Notice sent to ${targetMember.email || targetMember.fullName}`
    };
    saveReminders([newLog, ...reminders]);
  }

  return updatedMembers;
};

// Record welcome email on member record
export const recordMemberWelcomeEmail = (memberId) => {
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const members = getMembers();
  let targetMember = null;
  const updatedMembers = members.map(m => {
    if (m.id === memberId) {
      targetMember = {
        ...m,
        welcomeEmailSentDate: today,
        welcomeEmailSentTime: time
      };
      return targetMember;
    }
    return m;
  });

  saveMembers(updatedMembers);

  if (targetMember) {
    const reminders = getReminders();
    const newLog = {
      id: `REM-${101 + reminders.length}`,
      clientName: targetMember.fullName,
      phone: targetMember.phone || '',
      email: targetMember.email || '',
      date: today,
      time: time,
      type: 'Email',
      status: 'Sent',
      message: `[Welcome Email] Welcome to Gym notice sent to ${targetMember.email || targetMember.fullName}`
    };
    saveReminders([newLog, ...reminders]);
  }

  return updatedMembers;
};

// Seed utility to fully initialize all stores on application mount and sync database version
export const initializeDb = () => {
  const currentVersion = localStorage.getItem('phoenix_gym_db_ver');
  if (currentVersion !== 'v5_persistence_indexeddb') {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_MEMBERS));
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(DEFAULT_REMINDERS));
    }
    localStorage.setItem('phoenix_gym_db_ver', 'v5_persistence_indexeddb');
  }
  getMembers();
  getSettings();
  getPayments();
  getReminders();
};

const CLEARED_NOTIFICATIONS_KEY = 'phoenix_gym_cleared_notifications';

export const getClearedNotificationIds = () => {
  try {
    const raw = localStorage.getItem(CLEARED_NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveClearedNotificationIds = (ids) => {
  try {
    localStorage.setItem(CLEARED_NOTIFICATIONS_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error(e);
  }
};

