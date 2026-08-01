const { google } = require("googleapis");
const { categorizeTransaction } = require("./aiCategorizer");

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

/**
 * Get OAuth2 Client
 */
function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5000/api/auth/google/callback";

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generate Auth URL for Gmail access
 */
function getGmailAuthUrl(userId) {
  const oauth2Client = getOAuth2Client();
  const statePayload = JSON.stringify({
    userId: userId ? userId.toString() : "",
    mode: "gmail_import",
  });

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state: statePayload,
  });
}

/**
 * Exchange Authorization Code for Tokens
 */
async function getTokensFromCode(code) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Fetch and parse bank transaction emails from Gmail
 * @param {Object} tokens - User's OAuth tokens
 * @returns {Promise<Array>} Extracted transactions list
 */
async function fetchBankEmails(tokens) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Search query focusing on Indian bank transaction alerts
  const query = "subject:(debited OR credited OR paid OR received OR SBI OR HDFC OR ICICI OR Axis OR Paytm OR PhonePe OR Kotak OR IDFC OR Baroda OR PNB)";

  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 35,
  });

  const messages = res.data.messages || [];
  const transactions = [];

  for (const msg of messages) {
    try {
      const email = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });

      const parsedTxn = parseEmailMessage(email.data);
      if (parsedTxn) {
        transactions.push(parsedTxn);
      }
    } catch (err) {
      console.error(`Error processing email ${msg.id}:`, err.message);
    }
  }

  return transactions;
}

/**
 * Parse an individual Gmail message object into a transaction
 */
function parseEmailMessage(messageData) {
  const payload = messageData.payload || {};
  const headers = payload.headers || [];

  const subjectHeader = headers.find((h) => h.name.toLowerCase() === "subject");
  const dateHeader = headers.find((h) => h.name.toLowerCase() === "date");

  const subject = subjectHeader ? subjectHeader.value : "";
  const emailDate = dateHeader ? new Date(dateHeader.value) : new Date();

  const snippet = messageData.snippet || "";
  const bodyText = getEmailBody(payload) || snippet;
  const fullText = `${subject} ${bodyText}`;

  // Filter out promotional, spam, OTPs, newsletters
  if (/otp|verification code|one time password|sale live|discount|offer|cashback offer/i.test(subject)) {
    return null;
  }

  // Must contain an amount indication
  const amountMatch = fullText.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i);
  if (!amountMatch) return null;

  const rawAmt = amountMatch[1].replace(/,/g, "");
  const amount = parseFloat(rawAmt);
  if (!amount || isNaN(amount) || amount <= 0) return null;

  // Determine Debit vs Credit
  let type = "Expense";
  if (/(?:credited|received|added|refund|deposited|\+₹|\+Rs)/i.test(fullText)) {
    type = "Income";
  } else if (/(?:debited|paid|spent|sent|withdrawn|deducted|-₹|-Rs)/i.test(fullText)) {
    type = "Expense";
  }

  // Extract Merchant
  const merchantMatch =
    fullText.match(/(?:to|at|paid to|spent on)\s+([A-Za-z0-9\s&\.]{2,30}?)(?:\s+on|\s+via|\s+ref|\s+using|\s+a\/c|\.|$)/i) ||
    fullText.match(/(?:from|received from)\s+([A-Za-z0-9\s&\.]{2,30}?)(?:\s+on|\s+via|\s+ref|\s+in|\.|$)/i);

  const merchant = merchantMatch ? merchantMatch[1].trim() : extractBankName(subject) || "Transaction Alert";

  // Extract UPI Reference Number
  const upiMatch = fullText.match(/(?:UPI|Ref|RRn|Txn)\s*(?:No\.?|Id\.?)?\s*:?\s*([0-9]{9,14})/i) || fullText.match(/\b([0-9]{12})\b/);
  const upiRef = upiMatch ? upiMatch[1] : "";

  // Extract Last 4 digits
  const cardAccMatch = fullText.match(/(?:a\/c|card|account)\s*(?:no\.?|ending)?\s*\*?([0-9]{4})/i);
  const accountLast4 = cardAccMatch ? cardAccMatch[1] : "";

  // Date YYYY-MM-DD
  const dateStr = !isNaN(emailDate.getTime())
    ? emailDate.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const category = categorizeTransaction({
    title: merchant,
    merchant,
    description: snippet || subject,
    type,
  });

  return {
    title: merchant,
    merchant,
    amount,
    type,
    category,
    date: dateStr,
    upiRef,
    accountLast4,
    description: snippet || subject,
    source: "Gmail",
  };
}

/**
 * Get body string from Gmail payload
 */
function getEmailBody(payload) {
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body && part.body.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }
  }
  return "";
}

/**
 * Extract Bank Name from Subject
 */
function extractBankName(subject) {
  const banks = ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "IDFC", "Paytm", "PhonePe", "FamPay", "PNB", "Bank of Baroda"];
  for (const bank of banks) {
    if (new RegExp(bank, "i").test(subject)) {
      return `${bank} Alert`;
    }
  }
  return "";
}

module.exports = {
  getGmailAuthUrl,
  getTokensFromCode,
  fetchBankEmails,
};
