const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "sharebox_super_secret_jwt_key_2026_secure_random_key_99";
const COOKIE_NAME = "sharebox_token";

/**
 * Generate a signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Set HTTP-only authentication cookie
 */
const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

/**
 * Clear the authentication cookie
 */
const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
    path: "/",
  });
};

module.exports = {
  JWT_SECRET,
  COOKIE_NAME,
  generateToken,
  setTokenCookie,
  clearTokenCookie,
};
