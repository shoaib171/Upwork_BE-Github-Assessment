const Integration = require("../models/Integration");
const getToken = async () => {
  const integration = await Integration.findOne({ provider: "github" });
  if (!integration) throw new Error("GitHub integration not found");
  return integration.access_token;
};

module.exports = { getToken };
