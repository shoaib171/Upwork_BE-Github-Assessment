const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * @route   GET /api/auth/github
 * @desc    Redirect to GitHub OAuth
 * @access  Public
 */
router.get("/github", authController.githubRedirect);

/**
 * @route   GET /api/auth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.get("/github/callback", authController.githubCallback);

/**
 * @route   GET /api/auth/user
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/user", authController.getCurrentUser);

module.exports = router;
