const express = require("express");

const {
  addExpense,
  getExpenses,
} = require("../controllers/expenseController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add Expense
router.post("/", protect, addExpense);

// Get All Expenses
router.get("/", protect, getExpenses);

module.exports = router;