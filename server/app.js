const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

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

module.exports = app;