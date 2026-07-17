const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // Authorization header se token lena
    const authHeader = req.headers.authorization;

    // Check token exists or not
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    // "Bearer TOKEN" me se sirf token nikalna
    const token = authHeader.split(" ")[1];

    // Token verify karna
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // User ID request me store karna
    req.userId = decoded.userId;

    // Next controller ko request bhejna
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = protect;