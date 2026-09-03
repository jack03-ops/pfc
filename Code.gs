/**
 * ==============================================================================
 * PHOENIX FITNESS CENTRE - DUAL AUTOMATED EMAIL + WHATSAPP REMINDER SYSTEM
 * ==============================================================================
 * Stack: Google Sheets + Google Apps Script + Gmail + WhatsApp API
 * Target Admin Email: phoenixfitnesscentre03@gmail.com
 * Timezone: Asia/Kolkata (IST)
 */

// ==============================================================================
// CONFIGURATION
// ==============================================================================
const CONFIG = {
  GYM_NAME: 'Phoenix Fitness Centre',
  ADMIN_EMAIL: 'phoenixfitnesscentre03@gmail.com', // Target Email in TEST_MODE
  TEST_MODE: true,                            // Set to FALSE when going LIVE
  ENABLE_EMAIL: true,                         // Enable/Disable Gmail Email Reminders
  ENABLE_WHATSAPP: true,                      // Enable/Disable WhatsApp Reminders
  SHEET_NAME: 'Sheet1',
  TIMEZONE: 'Asia/Kolkata',

  // WHATSAPP API CONFIGURATION (UltraMsg / Instance Gateway Example)
  WHATSAPP_API: {
    INSTANCE_ID: 'instance12345',
    TOKEN: 'your_ultramsg_token_here',
    ENDPOINT: 'https://api.ultramsg.com/instance12345/messages/chat'
  }
};

// Column Mappings (1-indexed for Sheet APIs)
const COL = {
  CLIENT_NAME: 1,
  EMAIL: 2,
  PHONE: 3,
  START_DATE: 4,
  EXPIRY_DATE: 5,
  STATUS: 6,
  REMINDER_7DAY: 7,
  REMINDER_3DAY: 8,
  REMINDER_1DAY: 9,
  REMINDER_EXPIRY: 10,
  LAST_SENT_TIME: 11,
  LAST_SENT_CHANNEL: 12,
  LOG_STATUS: 13
};

// ==============================================================================
// MAIN DUAL AUTOMATION ENGINE
// ==============================================================================
function runDualReminders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    Logger.log('ERROR: Sheet "' + CONFIG.SHEET_NAME + '" not found.');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('No records found.');
    return;
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 13).getValues();
  const today = getNormalizedToday();

  let processed = 0, emailsSent = 0, waSent = 0, errors = 0;

  Logger.log('=== STARTING DUAL REMINDER DISPATCH (IST) ===');
  Logger.log('Today: ' + formatDate(today) + ' | TEST_MODE: ' + CONFIG.TEST_MODE);

  for (let i = 0; i < values.length; i++) {
    const rowIndex = i + 2;
    const row = values[i];

    const name = String(row[COL.CLIENT_NAME - 1]).trim();
    const email = String(row[COL.EMAIL - 1]).trim();
    const phone = cleanPhone(String(row[COL.PHONE - 1]));
    const expiryRaw = row[COL.EXPIRY_DATE - 1];

    if (!name && !email && !expiryRaw) continue;
    processed++;

    const expiryDate = parseDate(expiryRaw);
    if (!expiryDate) {
      sheet.getRange(rowIndex, COL.LOG_STATUS).setValue('ERROR: Invalid Date Format');
      errors++;
      continue;
    }

    const daysLeft = calculateDaysDifference(today, expiryDate);
    const reminderType = getReminderType(daysLeft, row);

    if (!reminderType) {
      sheet.getRange(rowIndex, COL.LOG_STATUS).setValue('OK: No Action Needed (' + daysLeft + ' days left)');
      continue;
    }

    let emailStatus = 'Disabled', waStatus = 'Disabled';
    const recipientEmail = CONFIG.TEST_MODE ? CONFIG.ADMIN_EMAIL : email;

    // 1. Dispatch Gmail Email Reminder
    if (CONFIG.ENABLE_EMAIL && validateEmail(email)) {
      try {
        const mailObj = generateEmailTemplate(reminderType, name, expiryDate);
        sendGmail(recipientEmail, mailObj.subject, mailObj.htmlBody);
        emailStatus = 'Sent';
        emailsSent++;
      } catch (err) {
        emailStatus = 'Failed: ' + err.toString();
        errors++;
      }
    }

    // 2. Dispatch WhatsApp Reminder
    if (CONFIG.ENABLE_WHATSAPP && phone) {
      try {
        const waMsg = generateWhatsAppText(reminderType, name, expiryDate);
        sendWhatsApp(phone, waMsg);
        waStatus = 'Sent';
        waSent++;
      } catch (err) {
        waStatus = 'Failed: ' + err.toString();
        errors++;
      }
    }

    // 3. Update Sheet tracking flags & timestamp
    updateSheetFlags(sheet, rowIndex, reminderType, emailStatus, waStatus);
    Logger.log('SUCCESS Row ' + rowIndex + ' (' + name + '): Email=' + emailStatus + ' | WA=' + waStatus);
  }

  Logger.log('=== SUMMARY: Processed=' + processed + ' | Emails=' + emailsSent + ' | WhatsApp=' + waSent + ' | Errors=' + errors + ' ===');
}

// ==============================================================================
// REMINDER RULES & DUPLICATE PREVENTION
// ==============================================================================
function getReminderType(daysLeft, row) {
  const sent7 = isTrue(row[COL.REMINDER_7DAY - 1]);
  const sent3 = isTrue(row[COL.REMINDER_3DAY - 1]);
  const sent1 = isTrue(row[COL.REMINDER_1DAY - 1]);
  const sentExp = isTrue(row[COL.REMINDER_EXPIRY - 1]);

  if (daysLeft === 7 && !sent7) return '7-Day Reminder';
  if (daysLeft === 3 && !sent3) return '3-Day Reminder';
  if (daysLeft === 1 && !sent1) return '1-Day Reminder';
  if (daysLeft <= 0 && !sentExp) return 'Expiry Email';
  return null;
}

function updateSheetFlags(sheet, rowIndex, reminderType, emailStatus, waStatus) {
  const timestamp = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

  if (reminderType === '7-Day Reminder') sheet.getRange(rowIndex, COL.REMINDER_7DAY).setValue(true);
  else if (reminderType === '3-Day Reminder') sheet.getRange(rowIndex, COL.REMINDER_3DAY).setValue(true);
  else if (reminderType === '1-Day Reminder') sheet.getRange(rowIndex, COL.REMINDER_1DAY).setValue(true);
  else if (reminderType === 'Expiry Email') {
    sheet.getRange(rowIndex, COL.REMINDER_EXPIRY).setValue(true);
    sheet.getRange(rowIndex, COL.STATUS).setValue('Expired');
  }

  const channelText = 'Email (' + emailStatus + ') + WhatsApp (' + waStatus + ')';
  sheet.getRange(rowIndex, COL.LAST_SENT_TIME).setValue(timestamp);
  sheet.getRange(rowIndex, COL.LAST_SENT_CHANNEL).setValue(channelText);
  sheet.getRange(rowIndex, COL.LOG_STATUS).setValue('SUCCESS: ' + reminderType + ' (' + timestamp + ')');
}

// ==============================================================================
// GMAIL & WHATSAPP SENDERS
// ==============================================================================
function sendGmail(toEmail, subject, htmlBody) {
  GmailApp.sendEmail(toEmail, subject, 'Please view in an HTML email client.', {
    htmlBody: htmlBody,
    name: CONFIG.GYM_NAME
  });
}

function sendWhatsApp(phone, textMessage) {
  if (CONFIG.WHATSAPP_API.TOKEN === 'your_ultramsg_token_here') {
    Logger.log('[WhatsApp Simulation Mode] Message to ' + phone + ': ' + textMessage);
    return;
  }

  const payload = {
    token: CONFIG.WHATSAPP_API.TOKEN,
    to: phone,
    body: textMessage
  };

  const options = {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: payload,
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(CONFIG.WHATSAPP_API.ENDPOINT, options);
  Logger.log('[WhatsApp API Response] ' + response.getContentText());
}

// ==============================================================================
// MESSAGING TEMPLATES
// ==============================================================================
function generateWhatsAppText(reminderType, name, expiryDate) {
  const dateStr = formatDate(expiryDate);
  if (reminderType === '7-Day Reminder') {
    return `🏋️ *${CONFIG.GYM_NAME}*\n\nHi *${name}*,\nYour gym membership expires in *7 days* on *${dateStr}*.\n\nPlease visit the reception to renew your plan and keep training! 💪`;
  } else if (reminderType === '3-Day Reminder') {
    return `⚠️ *${CONFIG.GYM_NAME}*\n\nHi *${name}*,\nYour membership expires in *3 days* (*${dateStr}*).\n\nDon't break your fitness streak! Renew today at the desk. 🏃‍♂️`;
  } else if (reminderType === '1-Day Reminder') {
    return `🚨 *FINAL NOTICE - ${CONFIG.GYM_NAME}*\n\nHi *${name}*,\nYour membership expires *TOMORROW (${dateStr})*.\n\nRenew now to avoid access card lockout! 🔑`;
  } else {
    return `🔴 *MEMBERSHIP EXPIRED - ${CONFIG.GYM_NAME}*\n\nHi *${name}*,\nYour membership expired on *${dateStr}*.\n\nWe miss you! Reply to this message to pick your renewal plan. 🔥`;
  }
}

function generateEmailTemplate(reminderType, name, expiryDate) {
  const formattedExpiry = formatDate(expiryDate);
  let subject = '', content = '';

  if (reminderType === '7-Day Reminder') {
    subject = '⏰ 7 Days Left on Your Phoenix Gym Membership';
    content = `<p>Hi <strong>${name}</strong>,</p><p>Your gym membership at <strong>${CONFIG.GYM_NAME}</strong> expires in <strong>7 days</strong> on <strong>${formattedExpiry}</strong>. Please renew at the reception desk to keep your workout slot!</p>`;
  } else if (reminderType === '3-Day Reminder') {
    subject = '⚠️ 3 Days Remaining! Renew Your Phoenix Gym Membership';
    content = `<p>Hi <strong>${name}</strong>,</p><p>Your membership expires in <strong>3 days</strong> on <strong>${formattedExpiry}</strong>. Don't break your fitness streak!</p>`;
  } else if (reminderType === '1-Day Reminder') {
    subject = '🚨 Final Notice: Your Membership Expires Tomorrow!';
    content = `<p>Hi <strong>${name}</strong>,</p><p>Your membership expires <strong>tomorrow (${formattedExpiry})</strong>. Please renew today to prevent card lockout.</p>`;
  } else {
    subject = '🔴 Your Phoenix Gym Membership Has Expired';
    content = `<p>Hi <strong>${name}</strong>,</p><p>Your membership expired on <strong>${formattedExpiry}</strong>. We miss you! Reply to this email or visit reception to pick a new plan.</p>`;
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #dc2626; padding: 20px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0;">${CONFIG.GYM_NAME}</h2>
      </div>
      <div style="padding: 24px; color: #333333; line-height: 1.6;">
        ${content}
      </div>
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
        © 2026 ${CONFIG.GYM_NAME}. Admin: ${CONFIG.ADMIN_EMAIL}
      </div>
    </div>
  `;

  return { subject: subject, htmlBody: htmlBody };
}

// ==============================================================================
// UTILITIES
// ==============================================================================
function isTrue(val) { return val === true || String(val).toUpperCase() === 'TRUE'; }
function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function cleanPhone(p) {
  let cleaned = String(p).replace(/\D/g, '');
  if (cleaned.length === 10) cleaned = '91' + cleaned;
  return cleaned.length >= 10 ? cleaned : '';
}
function parseDate(d) { return d instanceof Date && !isNaN(d) ? d : new Date(d); }
function getNormalizedToday() {
  const parts = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd').split('-');
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
}
function calculateDaysDifference(today, exp) {
  const parts = Utilities.formatDate(exp, CONFIG.TIMEZONE, 'yyyy-MM-dd').split('-');
  const expNorm = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
  return Math.round((expNorm.getTime() - today.getTime()) / (1000 * 3600 * 24));
}
function formatDate(d) { return Utilities.formatDate(d, CONFIG.TIMEZONE, 'dd MMM yyyy'); }

function testDualReminders() {
  CONFIG.TEST_MODE = true;
  runDualReminders();
}
