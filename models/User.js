const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    githubId: { type: String, required: true, unique: true },
    username: String,
    name: String,
    email: String,
    avatarUrl: String,
    profileUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
