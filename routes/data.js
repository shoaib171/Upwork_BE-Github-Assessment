const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

/**
 * @route   GET /api/data/collections
 * @desc    List all collections
 * @access  Public
 */
router.get("/collections", dataController.listCollections);

/**
 * @route   GET /api/data/search
 * @desc    Global search across all collections
 * @access  Public
 */
router.get("/search", dataController.globalSearch);

/**
 * @route   GET /api/data/:collection/schema
 * @desc    Get schema of a collection
 * @access  Public
 */
router.get("/:collection/schema", dataController.getCollectionSchema);

/**
 * @route   GET /api/data/:collection/stats
 * @desc    Get collection statistics
 * @access  Public
 */
router.get("/:collection/stats", dataController.getCollectionStats);

/**
 * @route   GET /api/data/:collection
 * @desc    Query collection with pagination, filtering, sorting, search
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 50, max: 1000)
 * @query   q - Search query
 * @query   sort - Sort field:direction (e.g., name:asc)
 * @query   filter - JSON filter object
 */
router.get("/:collection", dataController.queryCollection);

/**
 * @route   GET /api/data/:collection/:id
 * @desc    Get single document by ID
 * @access  Public
 */
router.get("/:collection/:id", dataController.getDocument);

module.exports = router;
