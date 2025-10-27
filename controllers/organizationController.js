// controllers/organizationController.js
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
    const data = await fetchGitHubData("user/orgs?per_page=100", token);
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
    const page = req.query.page || 1;
    const per_page = Math.min(parseInt(req.query.per_page || 50), 100);

    const data = await fetchGitHubData(
      `orgs/${org}/repos?per_page=${per_page}&page=${page}&sort=updated`,
      token
    );
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
    const page = req.query.page || 1;
    const per_page = Math.min(parseInt(req.query.per_page || 50), 100);

    const data = await fetchGitHubData(
      `repos/${org}/${repo}/commits?per_page=${per_page}&page=${page}`,
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
    const state = req.query.state || "all";
    const page = req.query.page || 1;
    const per_page = Math.min(parseInt(req.query.per_page || 50), 100);

    const data = await fetchGitHubData(
      `repos/${org}/${repo}/pulls?state=${state}&per_page=${per_page}&page=${page}`,
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
    const state = req.query.state || "all";
    const page = req.query.page || 1;
    const per_page = Math.min(parseInt(req.query.per_page || 50), 100);

    const data = await fetchGitHubData(
      `repos/${org}/${repo}/issues?state=${state}&per_page=${per_page}&page=${page}`,
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
    const page = req.query.page || 1;
    const per_page = Math.min(parseInt(req.query.per_page || 50), 100);

    const data = await fetchGitHubData(
      `repos/${org}/${repo}/issues/events?per_page=${per_page}&page=${page}`,
      token
    );
    res.json(data);
  } catch (err) {
    console.error("Error fetching issue changelogs:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** g. Get Org Users/Members */
exports.getOrgUsers = async (req, res) => {
  try {
    const token = await getToken();
    const { org } = req.params;
    const page = req.query.page || 1;
    const per_page = Math.min(parseInt(req.query.per_page || 50), 100);

    const data = await fetchGitHubData(
      `orgs/${org}/members?per_page=${per_page}&page=${page}`,
      token
    );
    res.json(data);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** Get all branches for a repo */
exports.getRepoBranches = async (req, res) => {
  try {
    const token = await getToken();
    const { org, repo } = req.params;
    const page = req.query.page || 1;
    const per_page = Math.min(parseInt(req.query.per_page || 50), 100);

    const data = await fetchGitHubData(
      `repos/${org}/${repo}/branches?per_page=${per_page}&page=${page}`,
      token
    );
    res.json(data);
  } catch (err) {
    console.error("Error fetching branches:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** Get repo contributors */
exports.getRepoContributors = async (req, res) => {
  try {
    const token = await getToken();
    const { org, repo } = req.params;
    const page = req.query.page || 1;
    const per_page = Math.min(parseInt(req.query.per_page || 50), 100);

    const data = await fetchGitHubData(
      `repos/${org}/${repo}/contributors?per_page=${per_page}&page=${page}`,
      token
    );
    res.json(data);
  } catch (err) {
    console.error("Error fetching contributors:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/** Get repo releases */
exports.getRepoReleases = async (req, res) => {
  try {
    const token = await getToken();
    const { org, repo } = req.params;
    const page = req.query.page || 1;
    const per_page = Math.min(parseInt(req.query.per_page || 50), 100);

    const data = await fetchGitHubData(
      `repos/${org}/${repo}/releases?per_page=${per_page}&page=${page}`,
      token
    );
    res.json(data);
  } catch (err) {
    console.error("Error fetching releases:", err.message);
    res.status(500).json({ error: err.message });
  }
};
