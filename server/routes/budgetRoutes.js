const express = require("express");

const {
  setBudget,
  getBudget,
  getBudgetSummary,
  getDailyLimit,
} = require("../controllers/budgetController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create / Update Budget
router.post("/", protect, setBudget);

// Get Budget
router.get("/", protect, getBudget);

// Budget Summary
router.get("/summary", protect, getBudgetSummary);

// Daily Spending Limit
router.get("/daily-limit", protect, getDailyLimit);

module.exports = router;