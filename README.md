# 🚀 GitHub Data Integration Backend

A **Node.js + Express + MongoDB** backend that connects with **GitHub APIs** using OAuth 2.0 to sync and manage GitHub data (users, repos, commits, issues, pulls, orgs, etc.) securely and efficiently.

---

## 🧩 Features
-  GitHub OAuth Authentication  
-  Full GitHub Data Sync (repos, commits, issues, pulls, orgs, changelogs)  
- Smart Pagination & Batch Insert (handles 5000+ commits safely)  
-  Memory Leak Prevention with batching and async streaming  
-  Dynamic Querying, Filtering & Global Search APIs  
-  Integration Removal with Full Data Cleanup  
-  Sync Stats & Data Counts per collection  

---

## Setup
```bash
git clone <repo-url>
cd github-BE
npm install

## Project structure
controllers/       # Auth, Integration, Data, Organization logic
helpers/           # GitHub API & Token utilities
models/            # MongoDB schemas (Repo, Commit, Issue, etc.)
routes/            # Express routes
app.js             # Main entry point
.env               # Environment configuration



Auth Flow

User redirected to GitHub → /api/auth/github/redirect

GitHub returns code → /api/auth/github/callback

Backend exchanges code → gets access_token

User + Integration saved in DB

Redirects to frontend → starts auto sync

 Sync Process

Fetches paginated GitHub data (per_page=100)

Inserts each batch via insertMany

Handles repos/issues/pulls/commits/orgs concurrently

Updates sync status and data counts in Integration collection

 Memory & Performance

Batched processing to avoid large arrays

Promise.all with concurrency limit for API calls

Paginated requests prevent heap overflow

Uses lean() queries for faster Mongo reads

Cleans memory references after inserts

🧹 Remove Integration

API: DELETE /api/integrations/github/remove
Cleans:

Integration

User

All related GitHub data (repos, commits, pulls, issues, orgs, changelogs, users)
