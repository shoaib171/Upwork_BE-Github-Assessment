const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
  {
    repoId: { type: Number, required: true, unique: true },
    name: String,
    full_name: String,
    html_url: String,
    description: String,
    language: String,
    private: Boolean,
    owner: Object,
    stargazers_count: Number,
    watchers_count: Number,
    forks_count: Number,
    open_issues_count: Number,
    created_at: Date,
    updated_at: Date,
    pushed_at: Date,
    size: Number,
    default_branch: String,
    topics: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repo", repoSchema);
