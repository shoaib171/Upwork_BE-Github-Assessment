const Integration = require("../models/Integration");
const Repo = require("../models/Repo");
const Commit = require("../models/Commit");
const Issue = require("../models/Issue");
const Pull = require("../models/Pull");
const Organization = require("../models/Organization");
const { fetchGitHubData } = require("../helpers/githubService");

exports.syncGitHubData = async (req, res) => {
  try {
    const integration = await Integration.findOne({
      provider: "github",
    }).populate("user");
    if (!integration)
      return res.status(404).json({ error: "GitHub integration not found" });
    const token = integration.access_token;
    // --- Fetch Repositories ---
    const repos = await fetchGitHubData("user/repos?per_page=50", token);
    await Repo.deleteMany({});
    await Repo.insertMany(
      repos.map((r) => ({
        repoId: r.id,
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description,
        language: r.language,
        private: r.private,
        owner: r.owner,
      }))
    );

    // --- Fetch Issues ---
    const issues = await fetchGitHubData(
      "issues?filter=all&per_page=50",
      token
    );
    await Issue.deleteMany({});
    await Issue.insertMany(
      issues.map((i) => ({
        issueId: i.id,
        title: i.title,
        state: i.state,
        user: i.user,
        repoName: i.repository?.name,
        html_url: i.html_url,
      }))
    );

    // --- Fetch Pull Requests ---
    const allPulls = [];
    for (const repo of repos.slice(0, 5)) {
      // limit for API safety
      try {
        const pulls = await fetchGitHubData(
          `repos/${repo.owner.login}/${repo.name}/pulls?state=all&per_page=20`,
          token
        );
        allPulls.push(
          ...pulls.map((p) => ({
            pullId: p.id,
            title: p.title,
            state: p.state,
            user: p.user,
            repoName: repo.name,
            html_url: p.html_url,
          }))
        );
      } catch (pullErr) {
        console.warn(`Pulls fetch failed for ${repo.name}: ${pullErr.message}`);
      }
    }
    await Pull.deleteMany({});
    await Pull.insertMany(allPulls);

    // --- Fetch Organizations ---
    const orgs = await fetchGitHubData("user/orgs?per_page=50", token);

    await Organization.deleteMany({});
    await Organization.insertMany(
      orgs.map((o) => ({
        orgId: o.id,
        login: o.login,
        name: o.name || o.login,
        description: o.description || "",
        avatar_url: o.avatar_url,
        html_url: o.url,
        repos_count: o.public_repos,
      }))
    );

    // --- Fetch Commits ---
    const allCommits = [];
    for (const repo of repos.slice(0, 5)) {
      try {
        const commits = await fetchGitHubData(
          `repos/${repo.owner.login}/${repo.name}/commits?per_page=20`,
          token
        );
        allCommits.push(
          ...commits.map((c) => ({
            sha: c.sha,
            message: c.commit.message,
            author: c.commit.author,
            url: c.html_url,
            repoName: repo.name,
          }))
        );
      } catch (commitErr) {
        console.warn(
          `Commits fetch failed for ${repo.name}: ${commitErr.message}`
        );
      }
    }
    await Commit.deleteMany({});
    await Commit.insertMany(allCommits);

    // ✅ Send Final Response
    res.status(200).json({
      message: "GitHub data synced successfully",
      repos: repos.length,
      issues: issues.length,
      pulls: allPulls.length, // ✅ FIXED
      commits: allCommits.length,
      orgs: orgs.length,
    });
  } catch (err) {
    console.error("Sync error:", err.message);
    res.status(500).json({ error: "GitHub sync failed" });
  }
};


// ------------------------------
//  REMOVE GITHUB INTEGRATION
// ------------------------------
exports.removeGitHubIntegration = async (req, res) => {
  try {
    const integration = await Integration.findOne({ provider: "github" });
    if (!integration)
      return res.status(404).json({ error: "GitHub integration not found" });

    await Integration.deleteOne({ _id: integration._id });

    if (req.query.clean === "true") {
      await Repo.deleteMany({});
      await Commit.deleteMany({});
      await Pull.deleteMany({});
      await Issue.deleteMany({});
      await Organization.deleteMany({});
    }

    res.json({ message: "GitHub integration removed successfully" });
  } catch (err) {
    console.error("Remove integration error:", err.message);
    res.status(500).json({ error: "Failed to remove integration" });
  }
};
