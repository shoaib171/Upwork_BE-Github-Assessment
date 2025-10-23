const mongoose = require("mongoose");

const pullSchema = new mongoose.Schema(
  {
    pullId: { type: Number, unique: true },
    title: String,
    state: String,
    user: Object,
    repoName: String,
    html_url: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pull", pullSchema);
