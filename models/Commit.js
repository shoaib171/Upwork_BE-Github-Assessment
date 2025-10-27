const mongoose = require("mongoose");

const commitSchema = new mongoose.Schema(
  {
    sha: { type: String, unique: true },
    message: String,
    author: Object,
    committer: Object,
    url: String,
    html_url: String,
    repoName: String,
    repoId: Number,
    timestamp: Date,
  },
  { timestamps: true }
);

commitSchema.index({ repoName: 1, timestamp: -1 });

module.exports = mongoose.model("Commit", commitSchema);
