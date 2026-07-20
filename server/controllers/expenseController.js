const Expense = require("../models/Expense");

// ADD NEW EXPENSE
const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    // INPUT VALIDATION
    if (!title || amount === undefined || !category) {
      return res.status(400).json({
        message: "Title, amount and category are required",
      });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be a number greater than 0",
      });
    }

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

// GET ALL EXPENSES + CATEGORY + DATE FILTER
const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;

    const filter = {
      user: req.userId,
    };

    // CATEGORY FILTER
    if (category) {
      filter.category = category;
    }

    // DATE RANGE FILTER
    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    const expenses = await Expense.find(filter).sort({
      date: -1,
    });

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

// GET EXPENSE SUMMARY
const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.userId,
    });

    const totalExpenses = expenses.length;

    const totalAmount = expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    const categorySummary = {};

    expenses.forEach((expense) => {
      if (categorySummary[expense.category]) {
        categorySummary[expense.category] += expense.amount;
      } else {
        categorySummary[expense.category] = expense.amount;
      }
    });

    res.status(200).json({
      message: "Expense summary fetched successfully",
      summary: {
        totalExpenses,
        totalAmount,
        categorySummary,
      },
    });
  } catch (error) {
    console.log("Expense Summary Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// GET SINGLE EXPENSE
const getSingleExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense fetched successfully",
      expense,
    });
  } catch (error) {
    console.log("Get Single Expense Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    // VALIDATE AMOUNT IF USER IS UPDATING IT
    if (
      amount !== undefined &&
      (typeof amount !== "number" || amount <= 0)
    ) {
      return res.status(400).json({
        message: "Amount must be a number greater than 0",
      });
    }

    // VALIDATE TITLE IF USER IS UPDATING IT
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        message: "Title cannot be empty",
      });
    }

    // VALIDATE CATEGORY IF USER IS UPDATING IT
    if (category !== undefined && !category.trim()) {
      return res.status(400).json({
        message: "Category cannot be empty",
      });
    }

    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.log("Update Expense Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.log("Delete Expense Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  getExpenseSummary,
  getSingleExpense,
  updateExpense,
  deleteExpense,
};