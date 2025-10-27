// controllers/dataController.js
const mongoose = require("mongoose");

const modelMap = {
  organizations: require("../models/Organization"),
  repos: require("../models/Repo"),
  commits: require("../models/Commit"),
  issues: require("../models/Issue"),
  pulls: require("../models/Pull"),
  users: require("../models/OrgUser"),
  changelogs: require("../models/Changelog"),
};

// List all collections
exports.listCollections = async (req, res) => {
  try {
    const collections = Object.keys(modelMap);
    res.json(collections);
  } catch (err) {
    console.error("Error listing collections:", err.message);
    res.status(500).json({ error: "Failed to list collections" });
  }
};

// Get schema of a collection
exports.getCollectionSchema = async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = modelMap[collection];

    if (!Model) {
      return res.status(400).json({ error: "Invalid collection" });
    }

    const schema = Model.schema;
    const fields = [];

    schema.eachPath((path) => {
      if (path === "_id" || path === "__v") return;

      const schemaType = schema.path(path);
      const fieldInfo = {
        name: path,
        type: schemaType.instance,
        required: schemaType.isRequired,
        description: path
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .trim(),
      };
      fields.push(fieldInfo);
    });

    res.json({
      collection,
      totalFields: fields.length,
      fields,
    });
  } catch (err) {
    console.error("Error getting collection schema:", err.message);
    res.status(500).json({ error: "Failed to get schema" });
  }
};

// Query collection with advanced features
exports.queryCollection = async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = modelMap[collection];

    if (!Model) {
      return res.status(400).json({ error: "Invalid collection" });
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(parseInt(req.query.limit || "50"), 1000);
    const skip = (page - 1) * limit;

    // Build filter
    let filter = {};

    // JSON filter
    if (req.query.filter) {
      try {
        filter = JSON.parse(req.query.filter);
      } catch (e) {
        return res.status(400).json({ error: "Invalid filter JSON" });
      }
    }

    // Global search - search all text fields
    if (req.query.q) {
      const q = req.query.q;
      const schema = Model.schema;
      const textFields = [];

      // Collect all string/text fields
      schema.eachPath((path) => {
        if (path === "_id" || path === "__v") return;
        const schemaType = schema.path(path);
        if (
          schemaType.instance === "String" ||
          schemaType.instance === "Array"
        ) {
          textFields.push({ [path]: { $regex: q, $options: "i" } });
        }
      });

      if (textFields.length > 0) {
        filter.$or = textFields;
      }
    }

    // Sorting
    let sort = {};
    if (req.query.sort) {
      const [field, direction] = req.query.sort.split(":");
      if (field) {
        sort[field] = direction === "desc" ? -1 : 1;
      }
    } else {
      sort = { createdAt: -1 };
    }

    // Execute query
    const total = await Model.countDocuments(filter);
    const docs = await Model.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      collection,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      docs,
      hasMore: skip + limit < total,
    });
  } catch (err) {
    console.error("Error querying collection:", err.message);
    res
      .status(500)
      .json({ error: "Failed to query collection", details: err.message });
  }
};

// Get single document by ID
exports.getDocument = async (req, res) => {
  try {
    const { collection, id } = req.params;
    const Model = modelMap[collection];

    if (!Model) {
      return res.status(400).json({ error: "Invalid collection" });
    }

    const doc = await Model.findById(id).lean();

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(doc);
  } catch (err) {
    console.error("Error getting document:", err.message);
    res.status(500).json({ error: "Failed to get document" });
  }
};

// Global search across all collections
exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const limit = Math.min(parseInt(req.query.limit || "10"), 100);

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query required" });
    }

    const results = {};
    const searchPromises = [];

    for (const [collectionName, Model] of Object.entries(modelMap)) {
      searchPromises.push(
        (async () => {
          try {
            const schema = Model.schema;
            const searchFields = [];

            schema.eachPath((path) => {
              if (path === "_id" || path === "__v") return;
              const schemaType = schema.path(path);
              if (schemaType.instance === "String") {
                searchFields.push(path);
              }
            });

            if (searchFields.length === 0) return;

            const filter = {
              $or: searchFields.map((field) => ({
                [field]: { $regex: q, $options: "i" },
              })),
            };

            const docs = await Model.find(filter).limit(limit).lean();
            results[collectionName] = {
              count: docs.length,
              docs: docs,
            };
          } catch (err) {
            console.warn(`Search error in ${collectionName}:`, err.message);
            results[collectionName] = {
              count: 0,
              docs: [],
              error: err.message,
            };
          }
        })()
      );
    }

    await Promise.all(searchPromises);

    res.json({
      query: q,
      results,
      totalResults: Object.values(results).reduce((sum, r) => sum + r.count, 0),
    });
  } catch (err) {
    console.error("Error in global search:", err.message);
    res.status(500).json({ error: "Global search failed" });
  }
};

// Get collection statistics
exports.getCollectionStats = async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = modelMap[collection];

    if (!Model) {
      return res.status(400).json({ error: "Invalid collection" });
    }

    const total = await Model.countDocuments({});
    const stats = {
      collection,
      total,
    };

    res.json(stats);
  } catch (err) {
    console.error("Error getting collection stats:", err.message);
    res.status(500).json({ error: "Failed to get collection stats" });
  }
};
