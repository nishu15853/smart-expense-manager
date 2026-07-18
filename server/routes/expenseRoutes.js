const express = require("express");

const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add Expense
router.post("/", protect, addExpense);

// Get All Expenses
router.get("/", protect, getExpenses);

// Update Expense
router.put("/:id", protect, updateExpense);

// Delete Expense
router.delete("/:id", protect, deleteExpense);

module.exports = router;