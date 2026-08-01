const Expense = require("../models/Expense");
const ImportLog = require("../models/ImportLog");
const { getGmailAuthUrl, getTokensFromCode, fetchBankEmails } = require("../services/gmailService");
const { parseCSVStatement, parsePDFStatement } = require("../services/statementParserService");
const { detectDuplicates } = require("../services/duplicateDetector");

/**
 * GET /api/import/gmail/auth-url
 */
exports.getGmailAuthUrl = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const authUrl = getGmailAuthUrl(userId);
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error("Auth URL Error:", error);
    res.status(500).json({ message: error.message || "Failed to generate Google Auth URL" });
  }
};

/**
 * GET /api/import/gmail/callback
 */
exports.gmailCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Authorization code missing");
    }

    const tokens = await getTokensFromCode(code);
    
    // Pass tokens back to frontend via query string or HTML postMessage script
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const encodedTokens = encodeURIComponent(JSON.stringify(tokens));

    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Gmail Connected</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #f8fafc;">
          <h2>✅ Gmail Connection Successful!</h2>
          <p>You can close this window now or you will be redirected automatically.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GMAIL_CONNECTED', tokens: ${JSON.stringify(tokens)} }, '*');
              window.close();
            } else {
              window.location.href = '${clientUrl}/dashboard?gmail_tokens=${encodedTokens}';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Gmail Callback Error:", error);
    res.status(500).send("Failed to connect Gmail. Please try again.");
  }
};

/**
 * POST /api/import/gmail/fetch
 */
exports.fetchGmailTransactions = async (req, res) => {
  try {
    const { tokens } = req.body;
    if (!tokens) {
      return res.status(400).json({ message: "Gmail access tokens are required." });
    }

    const userId = req.userId || req.user?._id;
    const rawTransactions = await fetchBankEmails(tokens);
    const checkedTransactions = await detectDuplicates(rawTransactions, userId);

    res.json({
      success: true,
      count: checkedTransactions.length,
      transactions: checkedTransactions,
    });
  } catch (error) {
    console.error("Fetch Gmail Txns Error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch transactions from Gmail" });
  }
};

/**
 * POST /api/import/upload-statement
 */
exports.uploadBankStatement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No statement file uploaded" });
    }

    const file = req.file;
    let rawTransactions = [];

    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      rawTransactions = parseCSVStatement(file.buffer);
    } else if (file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf")) {
      rawTransactions = await parsePDFStatement(file.buffer);
    } else {
      return res.status(400).json({ message: "Unsupported file format. Please upload PDF or CSV." });
    }

    const userId = req.userId || req.user?._id;
    const checkedTransactions = await detectDuplicates(rawTransactions, userId);

    res.json({
      success: true,
      filename: file.originalname,
      count: checkedTransactions.length,
      transactions: checkedTransactions,
    });
  } catch (error) {
    console.error("Statement Upload Error:", error);
    res.status(500).json({ message: "Failed to parse bank statement" });
  }
};

/**
 * POST /api/import/save-batch
 */
exports.saveImportedBatch = async (req, res) => {
  try {
    const { transactions, source, duplicatesSkipped } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ message: "No transactions selected for import." });
    }

    const userId = req.userId || req.user?._id;

    // Prepare docs to insert into Expense collection
    const docsToInsert = transactions.map((t) => ({
      user: userId,
      title: t.title || t.merchant || "Imported Transaction",
      amount: Number(t.amount),
      category: t.category || "Others",
      type: t.type === "Income" ? "Income" : "Expense",
      date: t.date ? new Date(t.date) : new Date(),
      source: source.includes("Gmail") ? "Gmail" : "Bank Statement",
      upiRef: t.upiRef || "",
      accountLast4: t.accountLast4 || "",
      description: t.description || "",
    }));

    const createdExpenses = await Expense.insertMany(docsToInsert);

    // Save Audit History Record
    await ImportLog.create({
      user: userId,
      source: source || "Bank Statement (CSV)",
      importedCount: createdExpenses.length,
      duplicatesCount: Number(duplicatesSkipped) || 0,
      status: "Success",
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdExpenses.length} transactions!`,
      importedCount: createdExpenses.length,
      duplicatesSkipped: Number(duplicatesSkipped) || 0,
    });
  } catch (error) {
    console.error("Save Batch Error:", error);

    // Log failure in history
    try {
      const userId = req.userId || req.user?._id;
      await ImportLog.create({
        user: userId,
        source: req.body.source || "Bank Statement",
        importedCount: 0,
        duplicatesCount: 0,
        status: "Failed",
        errorMessage: error.message,
      });
    } catch (e) {
      // ignore
    }

    res.status(500).json({ message: error.message || "Failed to save imported transactions." });
  }
};

/**
 * GET /api/import/history
 */
exports.getImportHistory = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const logs = await ImportLog.find({ user: userId }).sort({ importedAt: -1 }).lean();
    res.json({ success: true, logs });
  } catch (error) {
    console.error("Fetch Import History Error:", error);
    res.status(500).json({ message: "Failed to fetch import history" });
  }
};
