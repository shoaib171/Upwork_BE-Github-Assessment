const mongoose = require("mongoose");
const { Schema } = mongoose;

const integrationSchema = new Schema(
  {
    provider: { type: String, required: true },
    access_token: { type: String, required: true },
    scope: String,
    token_type: String,
    connected_at: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "integrations" }
);

module.exports = mongoose.model("Integration", integrationSchema);
