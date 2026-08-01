const express = require("express");
const multer = require("multer");
const protect = require("../middleware/authMiddleware");
const {
  getGmailAuthUrl,
  gmailCallback,
  fetchGmailTransactions,
  uploadBankStatement,
  saveImportedBatch,
  getImportHistory,
} = require("../controllers/importController");

const router = express.Router();

// Memory storage for Multer file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Gmail OAuth routes
router.get("/gmail/auth-url", protect, getGmailAuthUrl);
router.get("/gmail/callback", gmailCallback);
router.post("/gmail/fetch", protect, fetchGmailTransactions);

// Statement upload route (PDF / CSV)
router.post("/upload-statement", protect, upload.single("statement"), uploadBankStatement);

// Batch save & History
router.post("/save-batch", protect, saveImportedBatch);
router.get("/history", protect, getImportHistory);

module.exports = router;
