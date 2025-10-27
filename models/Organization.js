const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    orgId: { type: Number, required: true, unique: true },
    login: String,
    name: String,
    description: String,
    avatar_url: String,
    html_url: String,
    repos_url: String,
    blog: String,
    location: String,
    twitter_username: String,
    company: String,
    email: String,
    public_repos: Number,
    followers: Number,
    following: Number,
    created_at: Date,
    updated_at: Date,
    type: { type: String, default: "Organization" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
