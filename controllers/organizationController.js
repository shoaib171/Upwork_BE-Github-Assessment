const Integration = require("../models/Integration");
const { fetchGitHubData } = require("../helpers/githubService");

// Get token helper
const getToken = async () => {
  const integration = await Integration.findOne({ provider: "github" });
  if (!integration) throw new Error("GitHub integration not found");
  return integration.access_token;
};

/** a. Get Organizations */
exports.getOrganizations = async (req, res) => {
  try {
    const token = await getToken();
    const data = await fetchGitHubData("user/orgs?per_page=50", token);
    res.json(data);
  } catch (err) {
    console.error("Error fetching organizations:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** b. Get Org Repos */
exports.getOrgRepos = async (req, res) => {
  try {
    const token = await getToken();
    const { org } = req.params;
    const data = await fetchGitHubData(`orgs/${org}/repos?per_page=50`, token);
    res.json(data);
  } catch (err) {
    console.error("Error fetching org repos:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** c. Get Commits */
exports.getCommits = async (req, res) => {
  try {
    const token = await getToken();
    const { org, repo } = req.params;
    const data = await fetchGitHubData(
      `repos/${org}/${repo}/commits?per_page=50`,
      token
    );
    res.json(data);
  } catch (err) {
    console.error("Error fetching commits:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** d. Get Pull Requests */
exports.getPullRequests = async (req, res) => {
  try {
    const token = await getToken();
    const { org, repo } = req.params;
    const data = await fetchGitHubData(
      `repos/${org}/${repo}/pulls?state=all&per_page=50`,
      token
    );
    res.json(data);
  } catch (err) {
    console.error("Error fetching pulls:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** e. Get Issues */
exports.getIssues = async (req, res) => {
  try {
    const token = await getToken();
    const { org, repo } = req.params;
    const data = await fetchGitHubData(
      `repos/${org}/${repo}/issues?state=all&per_page=50`,
      token
    );
    res.json(data);
  } catch (err) {
    console.error("Error fetching issues:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** f. Get Issue Changelogs (Events) */
exports.getIssueChangelogs = async (req, res) => {
  try {
    const token = await getToken();
    const { org, repo } = req.params;
    const data = await fetchGitHubData(
      `repos/${org}/${repo}/issues/events?per_page=50`,
      token
    );
    res.json(data);
  } catch (err) {
    console.error("Error fetching issue changelogs:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** g. Get Org Users */
exports.getOrgUsers = async (req, res) => {
  try {
    const token = await getToken();
    const { org } = req.params;
    const data = await fetchGitHubData(`orgs/${org}/members?per_page=50`, token);
    res.json(data);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: err.message });
  }
};
