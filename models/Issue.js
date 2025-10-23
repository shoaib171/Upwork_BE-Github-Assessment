const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    issueId: { type: Number, unique: true },
    title: String,
    state: String,
    user: Object,
    repoName: String,
    html_url: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);
