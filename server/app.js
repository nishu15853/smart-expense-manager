const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const goalRoutes = require("./routes/goalRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Smart Expense Manager Backend is Running!");
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Expense Routes
app.use("/api/expenses", expenseRoutes);

// Budget Routes
app.use("/api/budget", budgetRoutes);

//Goal Routes
app.use("/api/goals", goalRoutes);

// Transaction Import Routes
const importRoutes = require("./routes/importRoutes");
app.use("/api/import", importRoutes);

module.exports = app;