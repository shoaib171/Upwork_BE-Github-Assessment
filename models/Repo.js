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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repo", repoSchema);
