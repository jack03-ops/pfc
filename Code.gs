/**
 * ==============================================================================
 * PHOENIX FITNESS CENTRE - AUTOMATED MEMBERSHIP EMAIL REMINDER SYSTEM
 * ==============================================================================
 * Stack: Google Sheets + Google Apps Script + Gmail
 * Admin Email: phoenixgym.vkp@gmail.com
 * Timezone: Asia/Kolkata (IST)
 */

// ==============================================================================
// CONFIGURATION SETTINGS
// ==============================================================================
const CONFIG = {
  GYM_NAME: 'Phoenix Fitness Centre',
  ADMIN_EMAIL: 'hariramkumar2030@gmail.com', // Pre-configured Target Email
  TEST_MODE: true,                            // Set to FALSE when going LIVE
  SHEET_NAME: 'Sheet1',
  TIMEZONE: 'Asia/Kolkata',
  DEFAULT_SENDER_NAME: 'Phoenix Fitness Centre Team'
};

// Column Index Mappings (1-indexed for Sheet APIs)
const COL = {
  CLIENT_NAME: 1,
  EMAIL: 2,
  START_DATE: 3,
  EXPIRY_DATE: 4,
  STATUS: 5,
  REMINDER_7DAY: 6,
  REMINDER_3DAY: 7,
  REMINDER_1DAY: 8,
  REMINDER_EXPIRY: 9,
  LAST_SENT_DATE: 10,
  LAST_SENT_TYPE: 11,
  ERROR_STATUS: 12
};

// ==============================================================================
// MAIN AUTOMATION ENGINE
// ==============================================================================
/**
 * Main function called daily by time-driven trigger.
 * Scans all rows, evaluates expiry dates, and dispatches reminders.
 */
function sendMembershipReminders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    Logger.log('ERROR: Sheet with name "' + CONFIG.SHEET_NAME + '" not found.');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('No client records found to process.');
    return;
  }

  // Fetch all client data (Rows 2 to End, Columns 1 to 12)
  const range = sheet.getRange(2, 1, lastRow - 1, 12);
  const values = range.getValues();
  const today = getNormalizedToday();

  let totalProcessed = 0;
  let emailsSent = 0;
  let errorsCount = 0;

  Logger.log('--- STARTING REMINDER EXECUTION ---');
  Logger.log('Today Date (IST): ' + formatDate(today));
  Logger.log('TEST_MODE Active: ' + CONFIG.TEST_MODE);

  for (let i = 0; i < values.length; i++) {
    const rowIndex = i + 2; // Actual row number in Google Sheet
    const row = values[i];

    const clientName = String(row[COL.CLIENT_NAME - 1]).trim();
    const email = String(row[COL.EMAIL - 1]).trim();
    const expiryRaw = row[COL.EXPIRY_DATE - 1];
    const status = String(row[COL.STATUS - 1]).trim();

    // 1. Skip completely blank rows
    if (!clientName && !email && !expiryRaw) {
      continue;
    }

    totalProcessed++;

    // 2. Validate Email Address
    if (!validateEmail(email)) {
      sheet.getRange(rowIndex, COL.ERROR_STATUS).setValue('ERROR: Invalid Email (' + email + ')');
      errorsCount++;
      continue;
    }

    // 3. Validate Expiry Date
    const expiryDate = parseDate(expiryRaw);
    if (!expiryDate) {
      sheet.getRange(rowIndex, COL.ERROR_STATUS).setValue('ERROR: Invalid Date Format');
      errorsCount++;
      continue;
    }

    // 4. Calculate Days Remaining until Expiry
    const daysRemaining = calculateDaysDifference(today, expiryDate);

    // 5. Determine required reminder type
    const reminderType = getReminderType(daysRemaining, row);

    if (!reminderType) {
      // No email needed for today
      sheet.getRange(rowIndex, COL.ERROR_STATUS).setValue('OK: No Action Needed (' + daysRemaining + ' days left)');
      continue;
    }

    // 6. Target Email Destination
    const recipientEmail = CONFIG.TEST_MODE ? CONFIG.ADMIN_EMAIL : email;

    // 7. Generate Template & Send Email
    try {
      const emailContent = generateEmailTemplate(reminderType, clientName, expiryDate);
      
      sendReminderEmail(recipientEmail, emailContent.subject, emailContent.htmlBody, clientName);

      // 8. Update Sheet tracking flags
      updateSheetAfterSend(sheet, rowIndex, reminderType, daysRemaining);
      emailsSent++;
      Logger.log('SUCCESS: Sent ' + reminderType + ' to ' + recipientEmail + ' (Client: ' + clientName + ')');

    } catch (err) {
      const errorMsg = 'ERROR Sending: ' + err.toString();
      sheet.getRange(rowIndex, COL.ERROR_STATUS).setValue(errorMsg);
      Logger.log('FAILED row ' + rowIndex + ': ' + errorMsg);
      errorsCount++;
    }
  }

  Logger.log('--- EXECUTION SUMMARY ---');
  Logger.log('Total Processed: ' + totalProcessed);
  Logger.log('Emails Sent: ' + emailsSent);
  Logger.log('Errors/Warnings: ' + errorsCount);
}

// ==============================================================================
// BUSINESS LOGIC & DUPLICATE PREVENTION
// ==============================================================================
/**
 * Evaluates days remaining and row flags to prevent duplicate emails.
 */
function getReminderType(daysRemaining, row) {
  const sent7Day = row[COL.REMINDER_7DAY - 1] === true || String(row[COL.REMINDER_7DAY - 1]).toUpperCase() === 'TRUE';
  const sent3Day = row[COL.REMINDER_3DAY - 1] === true || String(row[COL.REMINDER_3DAY - 1]).toUpperCase() === 'TRUE';
  const sent1Day = row[COL.REMINDER_1DAY - 1] === true || String(row[COL.REMINDER_1DAY - 1]).toUpperCase() === 'TRUE';
  const sentExpiry = row[COL.REMINDER_EXPIRY - 1] === true || String(row[COL.REMINDER_EXPIRY - 1]).toUpperCase() === 'TRUE';

  // 7 Days Remaining Rule
  if (daysRemaining === 7 && !sent7Day) {
    return '7-Day Reminder';
  }

  // 3 Days Remaining Rule
  if (daysRemaining === 3 && !sent3Day) {
    return '3-Day Reminder';
  }

  // 1 Day Remaining Rule
  if (daysRemaining === 1 && !sent1Day) {
    return '1-Day Reminder';
  }

  // Expiry Day Rule (0 Days remaining or overdue)
  if (daysRemaining <= 0 && !sentExpiry) {
    return 'Expiry Email';
  }

  return null;
}

/**
 * Updates tracking flags in Sheet to prevent re-sending on repeated daily executions.
 */
function updateSheetAfterSend(sheet, rowIndex, reminderType, daysRemaining) {
  const timestamp = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

  if (reminderType === '7-Day Reminder') {
    sheet.getRange(rowIndex, COL.REMINDER_7DAY).setValue(true);
  } else if (reminderType === '3-Day Reminder') {
    sheet.getRange(rowIndex, COL.REMINDER_3DAY).setValue(true);
  } else if (reminderType === '1-Day Reminder') {
    sheet.getRange(rowIndex, COL.REMINDER_1DAY).setValue(true);
  } else if (reminderType === 'Expiry Email') {
    sheet.getRange(rowIndex, COL.REMINDER_EXPIRY).setValue(true);
    sheet.getRange(rowIndex, COL.STATUS).setValue('Expired');
  }

  sheet.getRange(rowIndex, COL.LAST_SENT_DATE).setValue(timestamp);
  sheet.getRange(rowIndex, COL.LAST_SENT_TYPE).setValue(reminderType);
  sheet.getRange(rowIndex, COL.ERROR_STATUS).setValue('SUCCESS: Sent ' + reminderType + ' (' + timestamp + ')');
}

// ==============================================================================
// GMAIL EMAIL DISPATCH
// ==============================================================================
/**
 * Sends HTML Email via GmailApp service.
 */
function sendReminderEmail(toEmail, subject, htmlBody, clientName) {
  GmailApp.sendEmail(toEmail, subject, 'Please view this email in an HTML-compatible client.', {
    htmlBody: htmlBody,
    name: CONFIG.DEFAULT_SENDER_NAME
  });
}

// ==============================================================================
// EMAIL TEMPLATES GENERATOR
// ==============================================================================
function generateEmailTemplate(reminderType, clientName, expiryDate) {
  const formattedExpiry = formatDate(expiryDate);
  let subject = '';
  let bodyContent = '';

  const headerBg = '#dc2626'; // Phoenix Red

  if (reminderType === '7-Day Reminder') {
    subject = '⏰ 7 Days Left on Your ' + CONFIG.GYM_NAME + ' Membership';
    bodyContent = `
      <p style="font-size: 16px; color: #333333;">Hi <strong>${clientName}</strong>,</p>
      <p style="font-size: 15px; color: #555555; line-height: 1.6;">
        We hope you are having an amazing workout week! This is a friendly reminder that your gym membership at 
        <strong>${CONFIG.GYM_NAME}</strong> is set to expire in <strong>7 days</strong> on <strong>${formattedExpiry}</strong>.
      </p>
      <p style="font-size: 15px; color: #555555; line-height: 1.6;">
        To ensure uninterrupted access to your fitness sessions, equipment, and personal training slots, please stop by the front desk or renew your membership online.
      </p>
    `;
  } else if (reminderType === '3-Day Reminder') {
    subject = '⚠️ 3 Days Remaining! Renew Your ' + CONFIG.GYM_NAME + ' Membership';
    bodyContent = `
      <p style="font-size: 16px; color: #333333;">Hi <strong>${clientName}</strong>,</p>
      <p style="font-size: 15px; color: #555555; line-height: 1.6;">
        Your membership at <strong>${CONFIG.GYM_NAME}</strong> will expire in just <strong>3 days</strong> on <strong>${formattedExpiry}</strong>.
      </p>
      <p style="font-size: 15px; color: #555555; line-height: 1.6;">
        Don't break your fitness streak! Renew your plan today to keep crushing your goals with us.
      </p>
    `;
  } else if (reminderType === '1-Day Reminder') {
    subject = '🚨 Final Notice: Your Membership Expires Tomorrow!';
    bodyContent = `
      <p style="font-size: 16px; color: #333333;">Hi <strong>${clientName}</strong>,</p>
      <p style="font-size: 15px; color: #555555; line-height: 1.6;">
        Your membership at <strong>${CONFIG.GYM_NAME}</strong> expires <strong>tomorrow (${formattedExpiry})</strong>.
      </p>
      <p style="font-size: 15px; color: #555555; line-height: 1.6;">
        Please renew today so your gym access card remains active without pause.
      </p>
    `;
  } else if (reminderType === 'Expiry Email') {
    subject = '🔴 Your ' + CONFIG.GYM_NAME + ' Membership Has Expired';
    bodyContent = `
      <p style="font-size: 16px; color: #333333;">Hi <strong>${clientName}</strong>,</p>
      <p style="font-size: 15px; color: #555555; line-height: 1.6;">
        Your membership at <strong>${CONFIG.GYM_NAME}</strong> has officially expired on <strong>${formattedExpiry}</strong>.
      </p>
      <p style="font-size: 15px; color: #555555; line-height: 1.6;">
        We miss seeing you on the floor! Please visit the gym reception or reply to this email to pick your renewal plan and restart your training.
      </p>
    `;
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: ${headerBg}; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; tracking-letter: 1px;">${CONFIG.GYM_NAME}</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Membership Renewal Notification</p>
      </div>
      <div style="padding: 28px;">
        ${bodyContent}
        <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-left: 4px solid ${headerBg}; border-radius: 4px;">
          <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Expiry Date:</strong> ${formattedExpiry}</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;"><strong>Gym Contact:</strong> Reception Desk / Reply to this email</p>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        © ${new Date().getFullYear()} ${CONFIG.GYM_NAME}. All rights reserved.
      </div>
    </div>
  `;

  return { subject: subject, htmlBody: htmlBody };
}

// ==============================================================================
// UTILITIES & HELPER FUNCTIONS
// ==============================================================================
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function parseDate(dateVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date && !isNaN(dateVal)) {
    return dateVal;
  }
  const parsed = new Date(dateVal);
  return !isNaN(parsed) ? parsed : null;
}

function getNormalizedToday() {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const parts = dateStr.split('-');
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
}

function calculateDaysDifference(todayDate, expiryDate) {
  const expStr = Utilities.formatDate(expiryDate, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  const parts = expStr.split('-');
  const expNormalized = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);

  const diffTime = expNormalized.getTime() - todayDate.getTime();
  return Math.round(diffTime / (1000 * 3600 * 24));
}

function formatDate(dateObj) {
  return Utilities.formatDate(dateObj, CONFIG.TIMEZONE, 'dd MMM yyyy');
}

// ==============================================================================
// MANUAL TESTING FUNCTION
// ==============================================================================
/**
 * Test function to trigger email dispatch directly from Apps Script Editor.
 */
function testReminder() {
  Logger.log('--- MANUAL TEST START ---');
  CONFIG.TEST_MODE = true; // Safety enforce test mode
  sendMembershipReminders();
  Logger.log('--- MANUAL TEST END ---');
}
