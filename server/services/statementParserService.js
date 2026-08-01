const pdfParse = require("pdf-parse");
const { categorizeTransaction } = require("./aiCategorizer");

/**
 * Parse CSV Statement Buffer
 * @param {Buffer} buffer
 * @returns {Array} List of extracted transactions
 */
function parseCSVStatement(buffer) {
  const content = buffer.toString("utf8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  // Detect delimiter (, or ;)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(";") ? ";" : ",";

  // Helper to split CSV row handling quotes
  const parseCSVRow = (text) => {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result.map((col) => col.replace(/^"(.*)"$/, "$1").trim());
  };

  const headers = parseCSVRow(lines[0]).map((h) => h.toLowerCase());

  // Helper to find column index
  const findIndex = (keywords) => {
    return headers.findIndex((h) => keywords.some((kw) => h.includes(kw)));
  };

  const dateIdx = findIndex(["date", "txn date", "transaction date", "value date"]);
  const descIdx = findIndex(["description", "narration", "particulars", "details", "remarks"]);
  const refIdx = findIndex(["ref", "upi ref", "chq", "cheque", "reference"]);
  const debitIdx = findIndex(["debit", "withdrawal", "dr"]);
  const creditIdx = findIndex(["credit", "deposit", "cr"]);
  const amountIdx = findIndex(["amount", "txn amount"]);
  const typeIdx = findIndex(["type", "txn type"]);

  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row.length < 2) continue;

    const rawDate = dateIdx >= 0 ? row[dateIdx] : "";
    const rawDesc = descIdx >= 0 ? row[descIdx] : row.join(" ");
    const rawRef = refIdx >= 0 ? row[refIdx] : "";

    let amount = 0;
    let type = "Expense";

    if (debitIdx >= 0 && row[debitIdx] && parseFloat(row[debitIdx].replace(/,/g, "")) > 0) {
      amount = parseFloat(row[debitIdx].replace(/,/g, ""));
      type = "Expense";
    } else if (creditIdx >= 0 && row[creditIdx] && parseFloat(row[creditIdx].replace(/,/g, "")) > 0) {
      amount = parseFloat(row[creditIdx].replace(/,/g, ""));
      type = "Income";
    } else if (amountIdx >= 0 && row[amountIdx]) {
      const rawAmt = row[amountIdx].replace(/,/g, "");
      amount = Math.abs(parseFloat(rawAmt));
      if (typeIdx >= 0 && row[typeIdx]) {
        const tStr = row[typeIdx].toLowerCase();
        type = tStr.includes("cr") || tStr.includes("income") || tStr.includes("credit") ? "Income" : "Expense";
      } else if (rawAmt.includes("-") || (descIdx >= 0 && row[descIdx]?.toLowerCase().includes("dr"))) {
        type = "Expense";
      } else if (rawAmt.includes("+") || (descIdx >= 0 && row[descIdx]?.toLowerCase().includes("cr"))) {
        type = "Income";
      }
    }

    if (!amount || isNaN(amount) || amount <= 0) continue;

    const parsedDate = parseDate(rawDate);
    const upiRef = extractUpiRef(`${rawDesc} ${rawRef}`);
    const merchant = extractMerchant(rawDesc);
    const category = categorizeTransaction({ title: merchant, merchant, description: rawDesc, type });

    transactions.push({
      title: merchant || rawDesc.substring(0, 40),
      merchant: merchant || rawDesc.substring(0, 40),
      amount,
      type,
      category,
      date: parsedDate,
      upiRef: upiRef || rawRef || "",
      description: rawDesc,
      source: "Bank Statement",
    });
  }

  return transactions;
}

/**
 * Parse PDF Statement Buffer
 * @param {Buffer} buffer
 * @returns {Promise<Array>} List of extracted transactions
 */
async function parsePDFStatement(buffer) {
  try {
    const data = await pdfParse(buffer);
    const text = data.text || "";
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

    const transactions = [];

    // Common regex patterns for bank statements:
    // Date format: 01/08/2026, 01-08-2026, 01 Aug 2026, 2026-08-01
    const datePattern = /(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(?:\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const dateMatch = line.match(datePattern);

      if (!dateMatch) continue;

      // Check if line contains monetary amount
      const amountMatches = line.match(/(?:₹|Rs\.?|INR)?\s*([\d,]+\.\d{2})/g);
      if (!amountMatches || amountMatches.length === 0) continue;

      // Extract last matching amount as transaction amount
      const lastAmtStr = amountMatches[amountMatches.length - 1].replace(/[^\d.]/g, "");
      const amount = parseFloat(lastAmtStr);

      if (!amount || isNaN(amount)) continue;

      let type = "Expense";
      if (/credit|cr\b|deposit|\+₹|\+Rs/i.test(line)) {
        type = "Income";
      } else if (/debit|dr\b|withdrawal|-₹|-Rs/i.test(line)) {
        type = "Expense";
      }

      const rawDate = dateMatch[0];
      const parsedDate = parseDate(rawDate);
      const narration = line.replace(dateMatch[0], "").trim();
      const upiRef = extractUpiRef(narration);
      const merchant = extractMerchant(narration);
      const category = categorizeTransaction({ title: merchant, merchant, description: narration, type });

      transactions.push({
        title: merchant || narration.substring(0, 40) || "Bank Transaction",
        merchant: merchant || narration.substring(0, 40) || "Bank Transaction",
        amount,
        type,
        category,
        date: parsedDate,
        upiRef: upiRef || "",
        description: narration,
        source: "Bank Statement",
      });
    }

    return transactions;
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    return [];
  }
}

/**
 * Extract UPI Ref Number from text
 */
function extractUpiRef(text) {
  if (!text) return "";
  const match = text.match(/(?:UPI|Ref|Txn|RRn)[/\s:-]*([0-9]{9,14})/i) || text.match(/\b([0-9]{12})\b/);
  return match ? match[1] : "";
}

/**
 * Extract clean Merchant Name from text / narration
 */
function extractMerchant(text) {
  if (!text) return "Bank Transaction";
  
  // Clean UPI text: UPI/P2A/123456789/SWIGGY/PAYTM...
  let cleaned = text
    .replace(/^UPI\/[A-Z0-9]+\/[0-9]+\//i, "")
    .replace(/^(POS|INF|NEFT|IMPS|RTGS|TRANSFER|PG|BIL|PAYMENT TO|PAID TO)\s+/i, "")
    .replace(/\/[0-9]{10,}\/@?[a-z0-9]+/i, "")
    .trim();

  const parts = cleaned.split(/[\/\s\-_]+/);
  if (parts.length > 0 && parts[0].length > 2) {
    // Return formatted word
    return parts.slice(0, 3).join(" ").substring(0, 35);
  }

  return text.substring(0, 35).trim();
}

/**
 * Helper to parse various string date formats into standard YYYY-MM-DD
 */
function parseDate(rawDate) {
  if (!rawDate) return new Date().toISOString().split("T")[0];

  try {
    const cleanStr = rawDate.replace(/[^\w\s\/\-]/g, "").trim();
    // Check format DD/MM/YYYY or DD-MM-YYYY
    const parts = cleanStr.split(/[\/\-\s]+/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  } catch (e) {
    // fallback
  }

  return new Date().toISOString().split("T")[0];
}

module.exports = {
  parseCSVStatement,
  parsePDFStatement,
};
