const mongoose = require("mongoose");

const changelogSchema = new mongoose.Schema(
  {
    eventId: { type: String, unique: true },
    event: String,
    action: String,
    issue: Object,
    actor: Object,
    repository: Object,
    created_at: Date,
    url: String,
    repoName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Changelog", changelogSchema);
