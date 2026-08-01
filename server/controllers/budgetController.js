const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// SET OR UPDATE BUDGET
const setBudget = async (req, res) => {
  try {
    const { monthlyBudget, month, year } = req.body;

    let budget = await Budget.findOne({
      user: req.userId,
      month,
      year,
    });

    if (budget) {
      budget.monthlyBudget = monthlyBudget;
      await budget.save();

      return res.status(200).json({
        message: "Budget updated successfully",
        budget,
      });
    }

    budget = await Budget.create({
      user: req.userId,
      monthlyBudget,
      month,
      year,
    });

    res.status(201).json({
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET BUDGET
const getBudget = async (req, res) => {
  try {
    const { month, year } = req.query;

    const budget = await Budget.findOne({
      user: req.userId,
      month,
      year,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.status(200).json({
      budget,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// BUDGET SUMMARY
const getBudgetSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    const budget = await Budget.findOne({
      user: req.userId,
      month,
      year,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    const expenses = await Expense.find({
      user: req.userId,
    });

    let spent = 0;

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);

      if (
        expenseDate.getMonth() + 1 == month &&
        expenseDate.getFullYear() == year
      ) {
        spent += expense.amount;
      }
    });

    const remaining = budget.monthlyBudget - spent;

    const percentage = (
      (spent / budget.monthlyBudget) *
      100
    ).toFixed(2);

    res.status(200).json({
      budget: budget.monthlyBudget,
      spent,
      remaining,
      percentage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// DAILY SPENDING LIMIT
const getDailyLimit = async (req, res) => {
  try {
    const today = new Date();

    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const budget = await Budget.findOne({
      user: req.userId,
      month,
      year,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    const expenses = await Expense.find({
      user: req.userId,
    });

    let todaySpent = 0;

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);

      if (
        expenseDate.getDate() === today.getDate() &&
        expenseDate.getMonth() === today.getMonth() &&
        expenseDate.getFullYear() === today.getFullYear()
      ) {
        todaySpent += expense.amount;
      }
    });

    const daysInMonth = new Date(year, month, 0).getDate();

    const dailyLimit = budget.monthlyBudget / daysInMonth;

    res.status(200).json({
      dailyLimit: Number(dailyLimit.toFixed(2)),
      todaySpent,
      remainingToday: Number((dailyLimit - todaySpent).toFixed(2)),
      status:
        todaySpent > dailyLimit
          ? "Limit Exceeded"
          : "Within Limit",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  setBudget,
  getBudget,
  getBudgetSummary,
  getDailyLimit,
};