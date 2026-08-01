const Goal = require("../models/Goal");

// CREATE GOAL
const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline } = req.body;

    const goal = await Goal.create({
      user: req.userId,
      title,
      targetAmount,
      deadline,
    });

    res.status(201).json({
      message: "Goal created successfully",
      goal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET ALL GOALS
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.userId,
    });

    res.status(200).json({
      goals,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// UPDATE SAVED AMOUNT
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { savedAmount } = req.body;

    const goal = await Goal.findOne({
      _id: id,
      user: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    goal.savedAmount = savedAmount;

    if (goal.savedAmount >= goal.targetAmount) {
      goal.completed = true;
    }

    await goal.save();

    res.status(200).json({
      message: "Goal updated successfully",
      goal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

// DELETE GOAL
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.status(200).json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
};