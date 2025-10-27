const mongoose = require("mongoose");

const orgUserSchema = new mongoose.Schema(
  {
    userId: { type: Number, unique: true },
    login: String,
    name: String,
    avatar_url: String,
    html_url: String,
    type: String,
    email: String,
    company: String,
    location: String,
    bio: String,
    followers: Number,
    following: Number,
    public_repos: Number,
    orgName: String,
    orgId: Number,
  },
  { timestamps: true }
);

orgUserSchema.index({ orgName: 1, userId: 1 });

module.exports = mongoose.model("OrgUser", orgUserSchema);
