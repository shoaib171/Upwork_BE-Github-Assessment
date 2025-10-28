
const axios = require("axios");
const API_BASE_URL = "https://api.github.com";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Fetch data from GitHub API with retry logic
 * @param {string} endpoint - GitHub API endpoint
 * @param {string} token - GitHub access token
 * @param {number} retries - Number of retries (default: 3)
 * @returns {Promise<any>} API response data
 */
exports.fetchGitHubData = async (endpoint, token, retries = MAX_RETRIES) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    // Check rate limiting
    if (err.response?.status === 403) {
      const rateLimitReset = err.response.headers["x-ratelimit-reset"];
      console.error(
        `GitHub API rate limit exceeded. Reset at: ${new Date(
          rateLimitReset * 1000
        )}`
      );
      throw new Error(
        `Rate limit exceeded. Reset at ${new Date(
          rateLimitReset * 1000
        ).toISOString()}`
      );
    }

    // Retry logic for server errors
    if (err.response?.status >= 500 && retries > 0) {
      console.warn(
        `GitHub API error (${err.response.status}), retrying in ${RETRY_DELAY}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return exports.fetchGitHubData(endpoint, token, retries - 1);
    }

    console.error(
      `GitHub API error at ${endpoint}:`,
      err.response?.data || err.message
    );
    throw new Error(
      `GitHub API error: ${err.response?.data?.message || err.message}`
    );
  }
};

/**
 * Get remaining rate limit
 * @param {string} token - GitHub access token
 * @returns {Promise<object>} Rate limit info
 */
exports.getRateLimit = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rate_limit`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    return response.data.resources;
  } catch (err) {
    console.error("Error fetching rate limit:", err.message);
    throw err;
  }
};

/**
 * Fetch paginated data from GitHub API
 * @param {string} endpoint - GitHub API endpoint
 * @param {string} token - GitHub access token
 * @param {number} maxPages - Maximum pages to fetch (default: 1)
 * @returns {Promise<array>} Combined data from all pages
 */
exports.fetchPaginatedGitHubData = async (endpoint, token, maxPages = 1) => {
  let allData = [];
  let page = 1;

  try {
    while (page <= maxPages) {
      const separator = endpoint.includes("?") ? "&" : "?";
      const paginatedEndpoint = `${endpoint}${separator}page=${page}&per_page=100`;

      const data = await exports.fetchGitHubData(paginatedEndpoint, token);

      if (!Array.isArray(data)) {
        allData.push(data);
        break;
      }

      if (data.length === 0) break;

      allData = allData.concat(data);
      page++;
    }

    return allData;
  } catch (err) {
    console.error("Error fetching paginated data:", err.message);
    throw err;
  }
};
