const User = require("../models/User");
const { generateToken, setTokenCookie, clearTokenCookie } = require("../utils/token");
const connectDB = require("../db");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, issue JWT token in HTTP-only cookie
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email address is required." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists. Please sign in." });
    }

    // Default dynamic initials avatar
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=6366f1,06b6d4`;

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      avatar,
      storageUsed: 0,
      uploads: 0,
      downloads: 0,
    });

    await user.save();

    // Generate JWT & set cookie
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(201).json({
      message: "Account created successfully.",
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & set JWT HTTP-only cookie
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.json({
      message: "Signed in successfully.",
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Clear session cookie
 * @access  Public
 */
const logout = async (req, res) => {
  clearTokenCookie(res);
  return res.json({ message: "Signed out successfully." });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private
 */
const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update profile name, avatar, or password
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, currentPassword, newPassword } = req.body;
    await connectDB();

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (avatar && avatar.trim()) {
      user.avatar = avatar.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to change password." });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: "Incorrect current password." });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters." });
      }
      user.password = newPassword;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully.",
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
};
