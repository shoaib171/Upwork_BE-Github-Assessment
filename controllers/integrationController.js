const Integration = require("../models/Integration");
const User = require("../models/User");
const Repo = require("../models/Repo");
const Commit = require("../models/Commit");
const Issue = require("../models/Issue");
const Pull = require("../models/Pull");
const Organization = require("../models/Organization");
const Changelog = require("../models/Changelog");
const OrgUser = require("../models/OrgUser");
const { fetchGitHubData } = require("../helpers/githubService");

// Get integration status
exports.getIntegrationStatus = async (req, res) => {
  try {
    const integration = await Integration.findOne({
      provider: "github",
    }).populate("user");

    if (!integration) {
      return res.json({
        connected: false,
        connectedAt: null,
        user: null,
        lastSyncedAt: null,
        syncStatus: "pending",
        dataCounts: null,
      });
    }

    res.json({
      connected: true,
      connectedAt: integration.connected_at,
      user: integration.user
        ? {
            username: integration.user.username,
            name: integration.user.name,
            avatarUrl: integration.user.avatarUrl,
            email: integration.user.email,
          }
        : null,
      lastSyncedAt: integration.last_synced_at,
      syncStatus: integration.sync_status,
      dataCounts: integration.data_counts,
    });
  } catch (err) {
    console.error("Error getting integration status:", err.message);
    res.status(500).json({ error: "Failed to get integration status" });
  }
};

// Sync GitHub data
exports.syncGitHubData = async (req, res) => {
  try {
    const integration = await Integration.findOne({
      provider: "github",
    }).populate("user");

    if (!integration) {
      return res.status(404).json({ error: "GitHub integration not found" });
    }
    const token = integration.access_token;
    // Update sync status
    integration.sync_status = "syncing";
    await integration.save();
    let syncResults = {
      organizations: 0,
      repos: 0,
      commits: 0,
      issues: 0,
      pulls: 0,
      users: 0,
      changelogs: 0,
    };

    try {
      // --- Fetch Organizations ---
      console.log("Fetching organizations...");
      const orgs = await fetchGitHubData("user/orgs?per_page=100", token);
      await Organization.deleteMany({});
      const orgDocs = orgs.map((o) => ({
        orgId: o.id,
        login: o.login,
        name: o.name || o.login,
        description: o.description || "",
        avatar_url: o.avatar_url,
        html_url: o.html_url || o.url,
        repos_url: o.repos_url,
        blog: o.blog,
        location: o.location,
        twitter_username: o.twitter_username,
        company: o.company,
        email: o.email,
        public_repos: o.public_repos,
        followers: o.followers,
        following: o.following,
        created_at: o.created_at,
        updated_at: o.updated_at,
        type: "Organization",
      }));
      if (orgDocs.length > 0) {
        await Organization.insertMany(orgDocs);
      }
      syncResults.organizations = orgDocs.length;

      // --- Fetch User Repos ---
      console.log("Fetching repositories...");
      const repos = await fetchGitHubData(
        "user/repos?per_page=100&sort=updated",
        token
      );
      await Repo.deleteMany({});
      const repoDocs = repos.map((r) => ({
        repoId: r.id,
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description,
        language: r.language,
        private: r.private,
        owner: r.owner,
        stargazers_count: r.stargazers_count,
        watchers_count: r.watchers_count,
        forks_count: r.forks_count,
        open_issues_count: r.open_issues_count,
        created_at: r.created_at,
        updated_at: r.updated_at,
        pushed_at: r.pushed_at,
        size: r.size,
        default_branch: r.default_branch,
        topics: r.topics || [],
      }));
      if (repoDocs.length > 0) {
        await Repo.insertMany(repoDocs);
      }
      syncResults.repos = repoDocs.length;

      // --- Fetch Issues (from all repos) ---
      console.log("Fetching issues...");
      const allIssues = [];
      for (const repo of repos.slice(0, 10)) {
        try {
          const issues = await fetchGitHubData(
            `repos/${repo.owner.login}/${repo.name}/issues?state=all&per_page=100`,
            token
          );
          allIssues.push(
            ...issues.map((i) => ({
              issueId: i.id,
              number: i.number,
              title: i.title,
              body: i.body,
              state: i.state,
              user: i.user,
              assignee: i.assignee,
              assignees: i.assignees,
              labels: i.labels,
              milestone: i.milestone,
              repoName: repo.name,
              repoId: repo.id,
              html_url: i.html_url,
              created_at: i.created_at,
              updated_at: i.updated_at,
              closed_at: i.closed_at,
              comments: i.comments,
              pull_request: i.pull_request,
            }))
          );
        } catch (err) {
          console.warn(`Issues fetch failed for ${repo.name}: ${err.message}`);
        }
      }
      await Issue.deleteMany({});
      if (allIssues.length > 0) {
        await Issue.insertMany(allIssues);
      }
      syncResults.issues = allIssues.length;

      // --- Fetch Pull Requests (from all repos) ---
      console.log("Fetching pull requests...");
      const allPulls = [];
      for (const repo of repos.slice(0, 10)) {
        try {
          const pulls = await fetchGitHubData(
            `repos/${repo.owner.login}/${repo.name}/pulls?state=all&per_page=100`,
            token
          );
          allPulls.push(
            ...pulls.map((p) => ({
              pullId: p.id,
              number: p.number,
              title: p.title,
              body: p.body,
              state: p.state,
              user: p.user,
              assignee: p.assignee,
              assignees: p.assignees,
              labels: p.labels,
              repoName: repo.name,
              repoId: repo.id,
              html_url: p.html_url,
              created_at: p.created_at,
              updated_at: p.updated_at,
              closed_at: p.closed_at,
              merged_at: p.merged_at,
              merged: p.merged,
              additions: p.additions,
              deletions: p.deletions,
              changed_files: p.changed_files,
              commits: p.commits,
              comments: p.comments,
            }))
          );
        } catch (err) {
          console.warn(`Pulls fetch failed for ${repo.name}: ${err.message}`);
        }
      }
      await Pull.deleteMany({});
      if (allPulls.length > 0) {
        await Pull.insertMany(allPulls);
      }
      syncResults.pulls = allPulls.length;

      // --- Fetch Commits (from repos with pagination handling) ---
      console.log("Fetching commits...");
      const allCommits = [];
      const reposToSync = repos.slice(0, 10);
      for (const repo of reposToSync) {
        try {
          let page = 1;
          let hasMore = true;
          let commitCount = 0;
          while (hasMore) {
            try {
              const commits = await fetchGitHubData(
                `repos/${repo.owner.login}/${repo.name}/commits?per_page=100&page=${page}`,
                token
              );

              if (commits.length === 0) {
                hasMore = false;
                break;
              }

              allCommits.push(
                ...commits.map((c) => ({
                  sha: c.sha,
                  message: c.commit.message,
                  author: c.commit.author,
                  committer: c.commit.committer,
                  url: c.url,
                  html_url: c.html_url,
                  repoName: repo.name,
                  repoId: repo.id,
                  timestamp: new Date(c.commit.author.date),
                }))
              );

              commitCount += commits.length;
              page++;
            } catch (pageErr) {
              console.warn(
                `Commits page ${page} failed for ${repo.name}: ${pageErr.message}`
              );
              hasMore = false;
            }
          }
        } catch (err) {
          console.warn(`Commits fetch failed for ${repo.name}: ${err.message}`);
        }
      }
      await Commit.deleteMany({});
      if (allCommits.length > 0) {
        await Commit.insertMany(allCommits);
      }
      syncResults.commits = allCommits.length;

      // --- Fetch Changelogs (Issue Events) ---
      console.log("Fetching changelogs...");
      const allChangelogs = [];
      for (const repo of reposToSync) {
        try {
          const events = await fetchGitHubData(
            `repos/${repo.owner.login}/${repo.name}/issues/events?per_page=100`,
            token
          );
          allChangelogs.push(
            ...events.map((e) => ({
              eventId: e.id,
              event: e.event,
              action: e.action || e.event,
              issue: e.issue,
              actor: e.actor,
              repository: e.repository,
              created_at: e.created_at,
              url: e.url,
              repoName: repo.name,
            }))
          );
        } catch (err) {
          console.warn(
            `Changelogs fetch failed for ${repo.name}: ${err.message}`
          );
        }
      }
      await Changelog.deleteMany({});
      if (allChangelogs.length > 0) {
        await Changelog.insertMany(allChangelogs);
      }
      syncResults.changelogs = allChangelogs.length;

      // --- Fetch Organization Users ---
      console.log("Fetching organization users...");
      const allOrgUsers = [];
      for (const org of orgs.slice(0, 5)) {
        try {
          const members = await fetchGitHubData(
            `orgs/${org.login}/members?per_page=100`,
            token
          );
          allOrgUsers.push(
            ...members.map((m) => ({
              userId: m.id,
              login: m.login,
              name: m.name,
              avatar_url: m.avatar_url,
              html_url: m.html_url,
              type: m.type,
              email: m.email,
              company: m.company,
              location: m.location,
              bio: m.bio,
              followers: m.followers,
              following: m.following,
              public_repos: m.public_repos,
              orgName: org.login,
              orgId: org.id,
            }))
          );
        } catch (err) {
          console.warn(
            `OrgUsers fetch failed for ${org.login}: ${err.message}`
          );
        }
      }
      await OrgUser.deleteMany({});
      if (allOrgUsers.length > 0) {
        await OrgUser.insertMany(allOrgUsers);
      }
      syncResults.users = allOrgUsers.length;

      // Update integration with sync results
      integration.last_synced_at = new Date();
      integration.sync_status = "success";
      integration.data_counts = {
        organizations: syncResults.organizations,
        repos: syncResults.repos,
        commits: syncResults.commits,
        issues: syncResults.issues,
        pulls: syncResults.pulls,
        users: syncResults.users,
        changelogs: syncResults.changelogs,
      };
      await integration.save();

      res.status(200).json({
        message: "GitHub data synced successfully",
        ...syncResults,
        lastSyncedAt: integration.last_synced_at,
      });
    } catch (syncErr) {
      integration.sync_status = "failed";
      await integration.save();
      console.error("Sync error:", syncErr.message);
      res
        .status(500)
        .json({ error: "GitHub sync failed", details: syncErr.message });
    }
  } catch (err) {
    console.error("Sync endpoint error:", err.message);
    res.status(500).json({ error: "GitHub sync failed" });
  }
};

// Remove GitHub integration - FIXED VERSION
exports.removeGitHubIntegration = async (req, res) => {
  try {
    console.log("Starting integration removal process...");

    const integration = await Integration.findOne({ provider: "github" });

    if (!integration) {
      console.log(" No integration found to remove");
      return res.status(404).json({ error: "GitHub integration not found" });
    }

    const userId = integration.user;
    console.log("User ID from integration:", userId);

    // Step 1: Delete the Integration document
    await Integration.deleteOne({ _id: integration._id });
    console.log("Integration document deleted");

    // Step 2: Delete the User document
    if (userId) {
      await User.deleteOne({ _id: userId });
      console.log(" User document deleted");
    }

    // Step 3: Delete all GitHub data (Always clean data on removal)
    console.log("Cleaning all GitHub data from database...");

    await Promise.all([
      Repo.deleteMany({}),
      Commit.deleteMany({}),
      Pull.deleteMany({}),
      Issue.deleteMany({}),
      Organization.deleteMany({}),
      Changelog.deleteMany({}),
      OrgUser.deleteMany({}),
    ]);

    console.log("All GitHub data cleaned from database");

    res.json({
      message: "GitHub integration removed successfully",
      cleaned: true,
      deletedUser: !!userId,
    });
  } catch (err) {
    console.error("Remove integration error:", err.message);
    res.status(500).json({ error: "Failed to remove integration" });
  }
};

// Get sync statistics
exports.getSyncStats = async (req, res) => {
  try {
    const integration = await Integration.findOne({ provider: "github" });
    if (!integration) {
      return res.json({
        synced: false,
        stats: null,
      });
    }

    const stats = {
      synced: integration.sync_status === "success",
      lastSyncedAt: integration.last_synced_at,
      syncStatus: integration.sync_status,
      collections: {
        organizations: integration.data_counts.organizations,
        repos: integration.data_counts.repos,
        commits: integration.data_counts.commits,
        issues: integration.data_counts.issues,
        pulls: integration.data_counts.pulls,
        users: integration.data_counts.users,
        changelogs: integration.data_counts.changelogs,
      },
    };
    res.json(stats);
  } catch (err) {
    console.error("Error getting sync stats:", err.message);
    res.status(500).json({ error: "Failed to get sync stats" });
  }
};

/** NEW: Sync specific public organization data to MongoDB */
exports.syncPublicOrgData = async (req, res) => {
  try {
    const { orgName } = req.query;

    if (!orgName) {
      return res
        .status(400)
        .json({ error: "orgName query parameter required" });
    }

    const integration = await Integration.findOne({
      provider: "github",
    }).populate("user");

    if (!integration) {
      return res.status(404).json({ error: "GitHub integration not found" });
    }

    const token = integration.access_token;
    integration.sync_status = "syncing";
    await integration.save();

    let syncResults = {
      organizations: 0,
      repos: 0,
      commits: 0,
      issues: 0,
      pulls: 0,
      users: 0,
      changelogs: 0,
    };

    try {
      // --- Fetch Specific Organization ---
      console.log(`[SYNC] Fetching organization: ${orgName}`);
      const org = await fetchGitHubData(`orgs/${orgName}`, token);

      await Organization.deleteMany({});
      const orgDoc = {
        orgId: org.id,
        login: org.login,
        name: org.name || org.login,
        description: org.description || "",
        avatar_url: org.avatar_url,
        html_url: org.html_url,
        repos_url: org.repos_url,
        blog: org.blog,
        location: org.location,
        twitter_username: org.twitter_username,
        company: org.company,
        email: org.email,
        public_repos: org.public_repos,
        followers: org.followers,
        following: org.following,
        created_at: org.created_at,
        updated_at: org.updated_at,
        type: "Organization",
      };

      await Organization.insertMany([orgDoc]);
      syncResults.organizations = 1;

      // --- Fetch Organization Repos ---
      console.log(`[SYNC] Fetching repos for ${orgName}...`);
      const repos = await fetchGitHubData(
        `orgs/${orgName}/repos?per_page=100&sort=stars&direction=desc`,
        token
      );

      const reposToSync = repos.slice(0, 10);

      await Repo.deleteMany({});
      const repoDocs = reposToSync.map((r) => ({
        repoId: r.id,
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description,
        language: r.language,
        private: r.private,
        owner: r.owner,
        stargazers_count: r.stargazers_count,
        watchers_count: r.watchers_count,
        forks_count: r.forks_count,
        open_issues_count: r.open_issues_count,
        created_at: r.created_at,
        updated_at: r.updated_at,
        pushed_at: r.pushed_at,
        size: r.size,
        default_branch: r.default_branch,
        topics: r.topics || [],
      }));

      if (repoDocs.length > 0) {
        await Repo.insertMany(repoDocs);
      }
      syncResults.repos = repoDocs.length;

      // --- Fetch Issues ---
      console.log(`[SYNC] Fetching issues...`);
      const allIssues = [];

      for (const repo of reposToSync) {
        try {
          const issues = await fetchGitHubData(
            `repos/${repo.owner.login}/${repo.name}/issues?state=all&per_page=100`,
            token
          );

          allIssues.push(
            ...issues.map((i) => ({
              issueId: i.id,
              number: i.number,
              title: i.title,
              body: i.body,
              state: i.state,
              user: i.user,
              assignee: i.assignee,
              assignees: i.assignees,
              labels: i.labels,
              repoName: repo.name,
              repoId: repo.id,
              html_url: i.html_url,
              created_at: i.created_at,
              updated_at: i.updated_at,
              closed_at: i.closed_at,
              comments: i.comments,
              pull_request: i.pull_request,
            }))
          );
        } catch (err) {
          console.warn(
            `[SYNC] Issues fetch failed for ${repo.name}: ${err.message}`
          );
        }
      }

      await Issue.deleteMany({});
      if (allIssues.length > 0) {
        await Issue.insertMany(allIssues);
      }
      syncResults.issues = allIssues.length;

      // --- Fetch Pull Requests ---
      console.log(`[SYNC] Fetching pull requests...`);
      const allPulls = [];

      for (const repo of reposToSync) {
        try {
          const pulls = await fetchGitHubData(
            `repos/${repo.owner.login}/${repo.name}/pulls?state=all&per_page=100`,
            token
          );

          allPulls.push(
            ...pulls.map((p) => ({
              pullId: p.id,
              number: p.number,
              title: p.title,
              body: p.body,
              state: p.state,
              user: p.user,
              assignee: p.assignee,
              assignees: p.assignees,
              labels: p.labels,
              repoName: repo.name,
              repoId: repo.id,
              html_url: p.html_url,
              created_at: p.created_at,
              updated_at: p.updated_at,
              closed_at: p.closed_at,
              merged_at: p.merged_at,
              merged: p.merged,
              additions: p.additions,
              deletions: p.deletions,
              changed_files: p.changed_files,
              commits: p.commits,
              comments: p.comments,
            }))
          );
        } catch (err) {
          console.warn(
            `[SYNC] PRs fetch failed for ${repo.name}: ${err.message}`
          );
        }
      }

      await Pull.deleteMany({});
      if (allPulls.length > 0) {
        await Pull.insertMany(allPulls);
      }
      syncResults.pulls = allPulls.length;

      // --- Fetch Commits ---
      console.log(`[SYNC] Fetching commits...`);
      const allCommits = [];

      for (const repo of reposToSync.slice(0, 5)) {
        try {
          const commits = await fetchGitHubData(
            `repos/${repo.owner.login}/${repo.name}/commits?per_page=100`,
            token
          );

          allCommits.push(
            ...commits.map((c) => ({
              sha: c.sha,
              message: c.commit.message,
              author: c.commit.author,
              committer: c.commit.committer,
              url: c.url,
              html_url: c.html_url,
              repoName: repo.name,
              repoId: repo.id,
              timestamp: new Date(c.commit.author.date),
            }))
          );
        } catch (err) {
          console.warn(
            `[SYNC] Commits fetch failed for ${repo.name}: ${err.message}`
          );
        }
      }

      await Commit.deleteMany({});
      if (allCommits.length > 0) {
        await Commit.insertMany(allCommits);
      }
      syncResults.commits = allCommits.length;

      // --- Fetch Changelogs ---
      console.log(`[SYNC] Fetching changelogs...`);
      const allChangelogs = [];

      for (const repo of reposToSync.slice(0, 5)) {
        try {
          const events = await fetchGitHubData(
            `repos/${repo.owner.login}/${repo.name}/issues/events?per_page=100`,
            token
          );

          allChangelogs.push(
            ...events.map((e) => ({
              eventId: e.id,
              event: e.event,
              action: e.action || e.event,
              issue: e.issue,
              actor: e.actor,
              repository: e.repository,
              created_at: e.created_at,
              url: e.url,
              repoName: repo.name,
            }))
          );
        } catch (err) {
          console.warn(
            `[SYNC] Changelogs fetch failed for ${repo.name}: ${err.message}`
          );
        }
      }

      await Changelog.deleteMany({});
      if (allChangelogs.length > 0) {
        await Changelog.insertMany(allChangelogs);
      }
      syncResults.changelogs = allChangelogs.length;

      // --- Fetch Organization Members ---
      console.log(`[SYNC] Fetching organization members...`);
      const allOrgUsers = [];

      try {
        const members = await fetchGitHubData(
          `orgs/${orgName}/members?per_page=100`,
          token
        );

        allOrgUsers.push(
          ...members.map((m) => ({
            userId: m.id,
            login: m.login,
            name: m.name,
            avatar_url: m.avatar_url,
            html_url: m.html_url,
            type: m.type,
            email: m.email,
            company: m.company,
            location: m.location,
            bio: m.bio,
            followers: m.followers,
            following: m.following,
            public_repos: m.public_repos,
            orgName: orgName,
            orgId: org.id,
          }))
        );
      } catch (err) {
        console.warn(
          `[SYNC] Members fetch failed for ${orgName}: ${err.message}`
        );
      }

      await OrgUser.deleteMany({});
      if (allOrgUsers.length > 0) {
        await OrgUser.insertMany(allOrgUsers);
      }
      syncResults.users = allOrgUsers.length;

      // Update integration
      integration.last_synced_at = new Date();
      integration.sync_status = "success";
      integration.synced_organization = orgName;
      integration.data_counts = syncResults;
      await integration.save();

      res.status(200).json({
        message: `GitHub data for ${orgName} synced successfully`,
        organization: orgName,
        ...syncResults,
        lastSyncedAt: integration.last_synced_at,
      });
    } catch (syncErr) {
      integration.sync_status = "failed";
      await integration.save();
      console.error(`[SYNC] Error: ${syncErr.message}`);
      res.status(500).json({
        error: "GitHub sync failed",
        details: syncErr.message,
      });
    }
  } catch (err) {
    console.error("[SYNC] Endpoint error:", err.message);
    res.status(500).json({ error: "GitHub sync failed" });
  }
};
