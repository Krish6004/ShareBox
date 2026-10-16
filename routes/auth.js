const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

// Public Auth Endpoints
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", authController.logout);

// Protected Auth Endpoints
router.get("/me", protect, authController.getMe);
router.put("/profile", protect, authController.updateProfile);

module.exports = router;
