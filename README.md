# Backend - GitHub Integration (Express + MongoDB)

## Overview
This backend implements the GitHub integration required by the assessment:
- Node.js + Express REST API
- MongoDB collections for integrations and GitHub entities (orgs, repos, commits, issues, pulls, users)
- GitHub OAuth v2 flow (server-side)
- Sync helper to fetch data via GitHub REST API and store raw JSON documents

## Included Files
- `app.js` - Express server, routes registration, MongoDB connection
- `routes/` - `auth.js`, `integrations.js`, `data.js`
- `controllers/` - `authController.js`, `integrationController.js`, `dataController.js`
- `models/` - `Integration.js`, `Repo.js`, `Commit.js`, `Issue.js`, `Pull.js`, `User.js`, `Organization.js`
- `helpers/githubService.js` - functions to fetch GitHub data and perform fullSync
- `.env.example` - sample environment variables
- `package.json` - dependencies and scripts

## Quickstart (inside VM)
1. Copy the folder into the VM Desktop (or generate here).
2. Create `.env` from `.env.example` and set `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` and `MONGO_URI`.
3. Install dependencies:
   ```bash
   cd backend_full
   npm install
   ```
4. Ensure MongoDB is running inside the VM:
   ```bash
   sudo apt update
   sudo apt install -y mongodb
   sudo systemctl enable --now mongodb
   # or use mongod depending on distro
   ```
5. Start the server:
   ```bash
   npm run dev
   ```
6. Verify health:
   ```bash
   curl http://localhost:3000/api/health
   ```

## OAuth Setup (GitHub)
1. Create a GitHub OAuth App for testing (https://github.com/settings/developers).
2. Set Authorization callback URL to:
   - `http://localhost:3000/api/auth/github/callback` if you perform OAuth in the VM browser.
3. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env` and restart server.
4. Visit in VM browser:
   - `http://localhost:3000/api/auth/github` to start the flow.

## API Endpoints
- `GET /api/health` - health check
- `GET /api/auth/github` - redirect to GitHub OAuth
- `GET /api/auth/github/callback` - GitHub callback to save integration
- `GET /api/integrations` - list stored integrations
- `POST /api/integrations/:id/remove` - remove integration
- `POST /api/integrations/:id/resync` - trigger full sync (blocking)
- `GET /api/data/collections` - list collections
- `GET /api/data/:collection` - query collection with pagination/filtering

## Design Notes & Recommended Production Changes
This implementation is a monolithic prototype built for the assessment. Production improvements:
- **Use background workers/queues** (e.g., BullMQ, RabbitMQ) for heavy sync operations; don't block HTTP.
- **Rate limit and backoff** when calling GitHub API; implement retry/exponential backoff.
- **Store tokens securely** (e.g., encrypted at rest or in a secrets manager).
- **Pagination cursors** instead of page/skip for very large collections.
- **Webhook-driven updates**: use GitHub webhooks to keep data in sync incrementally.
- **Separate microservices** for ingestion, API, and web UI if scaling needs require it.
- **Add authentication** (JWT/session) for users accessing the dashboard.
- **Add logging/observability** (structured logs, metrics, tracing).
- **Implement tests** (integration + unit) and CI/CD pipeline.

## How to demo
1. Start backend and frontend inside VM.
2. In VM browser: go to `http://localhost:3000/api/auth/github` and perform OAuth.
3. Show saved integration: `curl http://localhost:3000/api/integrations`
4. Trigger resync and show collections: `curl http://localhost:3000/api/data/repos?page=1&limit=10`

