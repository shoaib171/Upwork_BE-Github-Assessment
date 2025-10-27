const mongoose = require("mongoose");
const { Schema } = mongoose;

const integrationSchema = new Schema(
  {
    provider: { type: String, required: true, enum: ["github"] },
    access_token: { type: String, required: true },
    scope: String,
    token_type: String,
    connected_at: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    last_synced_at: { type: Date, nullable: true },
    sync_status: {
      type: String,
      enum: ["pending", "syncing", "success", "failed"],
      default: "pending",
    },
    data_counts: {
      organizations: { type: Number, default: 0 },
      repos: { type: Number, default: 0 },
      commits: { type: Number, default: 0 },
      issues: { type: Number, default: 0 },
      pulls: { type: Number, default: 0 },
      users: { type: Number, default: 0 },
      changelogs: { type: Number, default: 0 },
    },
  },
  { timestamps: true, collection: "integrations" }
);

module.exports = mongoose.model("Integration", integrationSchema);
