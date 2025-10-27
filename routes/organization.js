// routes/organization.js
const express = require("express");
const router = express.Router();
const orgController = require("../controllers/organizationController");

/**
 * @route   GET /api/organizations
 * @desc    Get all organizations
 * @access  Public
 */
router.get("/", orgController.getOrganizations);

/**
 * @route   GET /api/organizations/:org/repos
 * @desc    Get organization repositories
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   per_page - Items per page (default: 50, max: 100)
 */
router.get("/:org/repos", orgController.getOrgRepos);

/**
 * @route   GET /api/organizations/:org/repos/:repo/commits
 * @desc    Get repository commits
 * @access  Public
 * @query   page - Page number
 * @query   per_page - Items per page
 */
router.get("/:org/repos/:repo/commits", orgController.getCommits);

/**
 * @route   GET /api/organizations/:org/repos/:repo/pulls
 * @desc    Get repository pull requests
 * @access  Public
 * @query   state - PR state (all, open, closed)
 * @query   page - Page number
 * @query   per_page - Items per page
 */
router.get("/:org/repos/:repo/pulls", orgController.getPullRequests);

/**
 * @route   GET /api/organizations/:org/repos/:repo/issues
 * @desc    Get repository issues
 * @access  Public
 * @query   state - Issue state (all, open, closed)
 * @query   page - Page number
 * @query   per_page - Items per page
 */
router.get("/:org/repos/:repo/issues", orgController.getIssues);

/**
 * @route   GET /api/organizations/:org/repos/:repo/issues/changelogs
 * @desc    Get issue changelogs/events
 * @access  Public
 * @query   page - Page number
 * @query   per_page - Items per page
 */
router.get(
  "/:org/repos/:repo/issues/changelogs",
  orgController.getIssueChangelogs
);

/**
 * @route   GET /api/organizations/:org/users
 * @desc    Get organization members/users
 * @access  Public
 * @query   page - Page number
 * @query   per_page - Items per page
 */
router.get("/:org/users", orgController.getOrgUsers);

/**
 * @route   GET /api/organizations/:org/repos/:repo/branches
 * @desc    Get repository branches
 * @access  Public
 * @query   page - Page number
 * @query   per_page - Items per page
 */
router.get("/:org/repos/:repo/branches", orgController.getRepoBranches);

/**
 * @route   GET /api/organizations/:org/repos/:repo/contributors
 * @desc    Get repository contributors
 * @access  Public
 * @query   page - Page number
 * @query   per_page - Items per page
 */
router.get("/:org/repos/:repo/contributors", orgController.getRepoContributors);

/**
 * @route   GET /api/organizations/:org/repos/:repo/releases
 * @desc    Get repository releases
 * @access  Public
 * @query   page - Page number
 * @query   per_page - Items per page
 */
router.get("/:org/repos/:repo/releases", orgController.getRepoReleases);

module.exports = router;
