const Expense = require("../models/Expense");

/**
 * Check candidate imported transactions against user's existing transactions in MongoDB.
 * Also checks within the candidate list itself for duplicates.
 *
 * @param {Array} items - Parsed candidate transactions
 * @param {String} userId - Logged-in User ID
 * @returns {Promise<Array>} Array of candidate items with isDuplicate & duplicateReason fields
 */
async function detectDuplicates(items, userId) {
  if (!items || items.length === 0) return [];

  // Fetch all existing expenses for this user
  const existingExpenses = await Expense.find({ user: userId }).lean();

  // Create fast lookup structures
  const existingUpiRefs = new Set();
  const existingKeySet = new Set();

  for (const exp of existingExpenses) {
    if (exp.upiRef && exp.upiRef.trim()) {
      existingUpiRefs.add(exp.upiRef.trim().toLowerCase());
    }
    const dateStr = exp.date ? new Date(exp.date).toISOString().split("T")[0] : "";
    const titleNorm = exp.title ? exp.title.trim().toLowerCase() : "";
    const key = `${exp.amount}_${dateStr}_${titleNorm}`;
    existingKeySet.add(key);
  }

  // Seen sets within current batch
  const batchUpiRefs = new Set();
  const batchKeySet = new Set();

  return items.map((item) => {
    const upiRefNorm = item.upiRef ? item.upiRef.trim().toLowerCase() : "";
    const dateStr = item.date ? new Date(item.date).toISOString().split("T")[0] : "";
    const merchantNorm = (item.merchant || item.title || "").trim().toLowerCase();
    const itemKey = `${item.amount}_${dateStr}_${merchantNorm}`;

    let isDuplicate = false;
    let duplicateReason = "";

    // 1. UPI Ref match
    if (upiRefNorm) {
      if (existingUpiRefs.has(upiRefNorm)) {
        isDuplicate = true;
        duplicateReason = `UPI Ref ${item.upiRef} already imported in database.`;
      } else if (batchUpiRefs.has(upiRefNorm)) {
        isDuplicate = true;
        duplicateReason = `Duplicate UPI Ref ${item.upiRef} in current import batch.`;
      }
    }

    // 2. Amount + Date + Merchant match
    if (!isDuplicate && itemKey) {
      if (existingKeySet.has(itemKey)) {
        isDuplicate = true;
        duplicateReason = `Matching transaction (₹${item.amount} on ${dateStr} for ${item.merchant || item.title}) exists in database.`;
      } else if (batchKeySet.has(itemKey)) {
        isDuplicate = true;
        duplicateReason = `Duplicate transaction in current import batch.`;
      }
    }

    // Record in batch seen sets
    if (upiRefNorm) batchUpiRefs.add(upiRefNorm);
    batchKeySet.add(itemKey);

    return {
      ...item,
      isDuplicate,
      duplicateReason,
      // Default auto-select to true unless it's a duplicate
      selected: !isDuplicate,
    };
  });
}

module.exports = {
  detectDuplicates,
};
