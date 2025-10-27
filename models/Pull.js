const mongoose = require("mongoose");

const pullSchema = new mongoose.Schema(
  {
    pullId: { type: Number, unique: true },
    number: Number,
    title: String,
    body: String,
    state: String,
    user: Object,
    assignee: Object,
    assignees: [Object],
    labels: [Object],
    repoName: String,
    repoId: Number,
    html_url: String,
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    merged_at: Date,
    merged: Boolean,
    additions: Number,
    deletions: Number,
    changed_files: Number,
    commits: Number,
    comments: Number,
  },
  { timestamps: true }
);

pullSchema.index({ repoName: 1, state: 1 });

module.exports = mongoose.model("Pull", pullSchema);
