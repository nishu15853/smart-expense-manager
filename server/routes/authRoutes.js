const express = require("express");

const {
  registerUser,
  loginUser,
  redirectToGoogle,
  handleGoogleCallback
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

// Google OAuth Routes
router.get("/google", redirectToGoogle);
router.get("/google/callback", handleGoogleCallback);

// Protected Test Route
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    userId: req.userId
  });
});

module.exports = router;