const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET, COOKIE_NAME } = require("../utils/token");
const connectDB = require("../db");

/**
 * Protect routes: Requires valid JWT token via HTTP-only cookie or Authorization header
 */
const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    // Fallback support for Authorization Bearer header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Authentication required. Please sign in to continue." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Invalid session token. Please sign in again." });
    }

    await connectDB();
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User associated with this token no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Your session has expired. Please log in again." });
    }
    return res.status(401).json({ error: "Not authorized, token verification failed." });
  }
};

/**
 * Optional Auth: Attaches user if logged in, but proceeds even if anonymous
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
          await connectDB();
          const user = await User.findById(decoded.id).select("-password");
          if (user) {
            req.user = user;
          }
        }
      } catch (tokenErr) {
        // Token invalid/expired - continue as anonymous
      }
    }
    next();
  } catch (err) {
    next();
  }
};

module.exports = {
  protect,
  optionalAuth,
};
