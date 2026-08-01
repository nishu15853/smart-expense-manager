const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
    type: String,
    enum: ["Income", "Expense"],
     required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    source: {
      type: String,
      enum: ["Manual", "Gmail", "Bank Statement"],
      default: "Manual",
    },

    upiRef: {
      type: String,
      default: "",
      trim: true,
    },

    accountLast4: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;