const express = require("express");

const {
  addExpense,
  getExpenses,
  getExpenseSummary,
  getSingleExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ADD EXPENSE
router.post("/", protect, addExpense);

// GET ALL EXPENSES
router.get("/", protect, getExpenses);

// GET EXPENSE SUMMARY
// Ye /:id se PEHLE rehna chahiye
router.get("/summary", protect, getExpenseSummary);

// GET SINGLE EXPENSE
router.get("/:id", protect, getSingleExpense);

// UPDATE EXPENSE
router.put("/:id", protect, updateExpense);

// DELETE EXPENSE
router.delete("/:id", protect, deleteExpense);

module.exports = router;