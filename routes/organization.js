const express = require("express");
const router = express.Router();
const orgController = require("../controllers/organizationController");

// Define routes
router.get("/", orgController.getOrganizations);
router.get("/:org/repos", orgController.getOrgRepos);
router.get("/:org/repos/:repo/commits", orgController.getCommits);
router.get("/:org/repos/:repo/pulls", orgController.getPullRequests);
router.get("/:org/repos/:repo/issues", orgController.getIssues);
router.get(
  "/:org/repos/:repo/issues/changelogs",
  orgController.getIssueChangelogs
);
router.get("/:org/users", orgController.getOrgUsers);

module.exports = router;
