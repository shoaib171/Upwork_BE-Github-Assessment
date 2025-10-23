const mongoose = require("mongoose");

const commitSchema = new mongoose.Schema(
  {
    sha: { type: String, unique: true },
    message: String,
    author: Object,
    url: String,
    repoName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Commit", commitSchema);
