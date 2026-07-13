const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Smart Expense Manager Backend is Running!");
});

module.exports = app;