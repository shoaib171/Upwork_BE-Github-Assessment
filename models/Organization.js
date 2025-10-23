const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    orgId: { type: Number, required: true, unique: true },
    login: String,
    name: String,
    description: String,
    avatar_url: String,
    html_url: String,
    repos_count: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
