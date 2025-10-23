const express = require("express");
const router = express.Router();
const {
  githubRedirect,
  githubCallback,
} = require("../controllers/authController");
const { syncGitHubData } = require("../controllers/integrationController");

router.get("/github", githubRedirect);
router.get("/github/callback", githubCallback);
router.get("/sync", syncGitHubData);

module.exports = router;
