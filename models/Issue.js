const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    issueId: { type: Number, unique: true },
    number: Number,
    title: String,
    body: String,
    state: String,
    user: Object,
    assignee: Object,
    assignees: [Object],
    labels: [Object],
    milestone: Object,
    repoName: String,
    repoId: Number,
    html_url: String,
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    comments: Number,
    pull_request: Object,
  },
  { timestamps: true }
);

issueSchema.index({ repoName: 1, state: 1 });

module.exports = mongoose.model("Issue", issueSchema);
