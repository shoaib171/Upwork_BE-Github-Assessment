const axios = require("axios");
const Integration = require("../models/Integration");
const User = require("../models/User");

const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const callbackUrl = process.env.GITHUB_CALLBACK_URL;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";

// Step 1 – Redirect to GitHub
exports.githubRedirect = (req, res) => {
  const state = Math.random().toString(36).substring(2);
  const scope = "repo read:org user read:user";
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=${encodeURIComponent(scope)}&state=${state}`;

  console.log("🔗 Redirecting to GitHub OAuth:", url);
  res.redirect(url);
};

// Step 2 – Handle GitHub Callback
exports.githubCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    console.error("❌ No code in callback");
    return res.redirect(`${frontendUrl}/?error=no_code`);
  }

  try {
    console.log("🔄 Exchanging code for access token...");

    // Exchange code for access token
    const tokenResp = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackUrl,
      },
      { headers: { Accept: "application/json" } }
    );

    const token = tokenResp.data;
    if (!token.access_token) {
      console.error("❌ Token not returned:", token);
      return res.redirect(`${frontendUrl}/?error=token_exchange_failed`);
    }

    console.log("✅ Access token received");

    // Fetch GitHub user info with more details
    console.log("🔄 Fetching user info from GitHub...");
    const userResp = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    const {
      id,
      login,
      avatar_url,
      name,
      email,
      html_url,
      bio,
      location,
      company,
      blog,
      twitter_username,
      followers,
      following,
      public_repos,
      public_gists,
      type,
    } = userResp.data;

    console.log("✅ User info received:", { login, name, email });

    // Save or update user with all details
    let user = await User.findOne({ githubId: id });
    if (!user) {
      console.log("🆕 Creating new user...");
      user = await User.create({
        githubId: id,
        username: login,
        name,
        email,
        avatarUrl: avatar_url,
        profileUrl: html_url,
        bio,
        location,
        company,
        blog,
        twitter_username,
        followers,
        following,
        public_repos,
        public_gists,
        type,
      });
      console.log("✅ User created:", user._id);
    } else {
      console.log("🔄 Updating existing user...");
      user.username = login;
      user.name = name;
      user.email = email;
      user.avatarUrl = avatar_url;
      user.profileUrl = html_url;
      user.bio = bio;
      user.location = location;
      user.company = company;
      user.blog = blog;
      user.twitter_username = twitter_username;
      user.followers = followers;
      user.following = following;
      user.public_repos = public_repos;
      user.public_gists = public_gists;
      user.type = type;
      user.updatedAt = new Date();
      await user.save();
      console.log("✅ User updated:", user._id);
    }

    // Save or update integration
    console.log("🔄 Creating/updating integration...");
    const integration = await Integration.findOneAndUpdate(
      { user: user._id, provider: "github" },
      {
        provider: "github",
        access_token: token.access_token,
        scope: token.scope,
        token_type: token.token_type,
        user: user._id,
        connected_at: new Date(),
        sync_status: "pending",
      },
      { upsert: true, new: true }
    );

    console.log("✅ Integration saved:", integration._id);

    // Redirect back to frontend with success flag and auto-sync trigger
    console.log("🔗 Redirecting back to frontend with auto-sync flag...");
    res.redirect(
      `${frontendUrl}/?integrated=true&userId=${user._id}&autoSync=true`
    );
  } catch (err) {
    console.error("❌ GitHub Auth Error:", err.response?.data || err.message);
    res.redirect(`${frontendUrl}/?error=auth_failed`);
  }
};

// Get current user info
exports.getCurrentUser = async (req, res) => {
  try {
    const integration = await Integration.findOne({
      provider: "github",
    }).populate("user");

    if (!integration) {
      return res.status(404).json({ error: "No GitHub integration found" });
    }

    res.json({
      user: integration.user,
      integration: {
        connected_at: integration.connected_at,
        last_synced_at: integration.last_synced_at,
        sync_status: integration.sync_status,
        data_counts: integration.data_counts,
      },
    });
  } catch (err) {
    console.error("Error fetching current user:", err.message);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};
