const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // CHECK REQUIRED FIELDS
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // PASSWORD VALIDATION
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // CHECK IF USER ALREADY EXISTS
    const existingUser = await User.findOne({ email });

    if (existingUser) {
  return res.status(409).json({
    message:
      "An account with this email already exists. Please log in instead.",
  });
}

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // CREATE JWT TOKEN
const token = generateToken(user._id);

    // SEND RESPONSE WITHOUT PASSWORD
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Register Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // CHECK REQUIRED FIELDS
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // FIND USER
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // CHECK PASSWORD
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // CREATE JWT TOKEN
   const token = generateToken(user._id);

    // SEND RESPONSE WITHOUT PASSWORD
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Login Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// REDIRECT TO GOOGLE OAUTH
const redirectToGoogle = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
  
  if (!clientId || !redirectUri) {
    return res.status(500).json({
      message: "Google OAuth configuration is missing on the server",
    });
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=profile%20email`;

  res.redirect(authUrl);
};

// HANDLE GOOGLE CALLBACK
const handleGoogleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Authorization code is missing" });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Exchange authorization code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return res.status(400).json({ message: "Failed to exchange authorization code" });
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch user info from Google
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      return res.status(400).json({ message: "Failed to fetch user profile from Google" });
    }

    const profile = await profileResponse.json();
    const googleId = profile.sub;
    const email = profile.email;
    const name = profile.name;

    if (!email) {
      return res.status(400).json({ message: "Email not provided by Google account" });
    }

    // 1. Search by googleId (Scenario B: Existing Google User)
    let user = await User.findOne({ googleId });

    if (user) {
      const token = generateToken(user._id);
      const userObj = { id: user._id, name: user.name, email: user.email };
      return res.redirect(
        `${frontendUrl}/dashboard?token=${token}&user=${encodeURIComponent(
          JSON.stringify(userObj)
        )}`
      );
    }

    // 2. Search by email (Scenario C: Existing Email/Password User)
    user = await User.findOne({ email });

    if (user) {
      user.googleId = googleId;
      await user.save();

      const token = generateToken(user._id);
      const userObj = { id: user._id, name: user.name, email: user.email };
      return res.redirect(
        `${frontendUrl}/dashboard?token=${token}&user=${encodeURIComponent(
          JSON.stringify(userObj)
        )}`
      );
    }

    // 3. Scenario A: New User
    user = await User.create({
      name,
      email,
      googleId,
    });

    const token = generateToken(user._id);
    const userObj = { id: user._id, name: user.name, email: user.email };
    return res.redirect(
      `${frontendUrl}/dashboard?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userObj)
      )}`
    );
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(500).json({ message: "Internal Server Error during Google Auth" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  redirectToGoogle,
  handleGoogleCallback,
};