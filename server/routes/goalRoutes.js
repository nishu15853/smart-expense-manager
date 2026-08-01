const express = require("express");

const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Goal
router.post("/", protect, createGoal);

// Get All Goals
router.get("/", protect, getGoals);

// Update Goal
router.put("/:id", protect, updateGoal);

// Delete Goal
router.delete("/:id", protect, deleteGoal);

module.exports = router;