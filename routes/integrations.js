// routes/integrations.js
const express = require("express");
const router = express.Router();
const integrationController = require("../controllers/integrationController");

/**
 * @route   GET /api/integrations/status
 * @desc    Get GitHub integration status
 * @access  Public
 */
router.get("/status", integrationController.getIntegrationStatus);

/**
 * @route   GET /api/integrations/sync
 * @desc    Sync GitHub data
 * @access  Public
 */
router.get("/sync", integrationController.syncGitHubData);

/**
 * @route   DELETE /api/integrations/remove
 * @desc    Remove GitHub integration
 * @access  Public
 */
router.delete("/remove", integrationController.removeGitHubIntegration);

/**
 * @route   GET /api/integrations/stats
 * @desc    Get sync statistics
 * @access  Public
 */
router.get("/stats", integrationController.getSyncStats);

module.exports = router;
