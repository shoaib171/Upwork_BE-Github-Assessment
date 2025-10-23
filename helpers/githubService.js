const axios = require("axios");

exports.fetchGitHubData = async (endpoint, token) => {
  try {
    const resp = await axios.get(`https://api.github.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    return resp.data;
  } catch (err) {
    console.error(
      `GitHub API error at ${endpoint}:`,
      err.response?.data || err.message
    );
    throw new Error("GitHub API fetch failed");
  }
};
