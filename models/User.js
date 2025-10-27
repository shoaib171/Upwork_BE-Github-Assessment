const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    githubId: { type: String, required: true, unique: true },
    username: String,
    name: String,
    email: String,
    avatarUrl: String,
    profileUrl: String,
    bio: String,
    location: String,
    company: String,
    blog: String,
    twitter_username: String,
    followers: Number,
    following: Number,
    public_repos: Number,
    public_gists: Number,
    type: { type: String, enum: ["User", "Organization"], default: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
