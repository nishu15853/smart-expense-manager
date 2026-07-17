const Expense = require("../models/Expense");

// ADD NEW EXPENSE
const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    const expense = await Expense.create({
      user: req.userId,
      title,
      amount,
      category,
      date,
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense,
    });

  } catch (error) {
    console.log("Add Expense Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET ALL EXPENSES OF LOGGED-IN USER
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Expenses fetched successfully",
      expenses,
    });

  } catch (error) {
    console.log("Get Expenses Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  addExpense,
  getExpenses,
};