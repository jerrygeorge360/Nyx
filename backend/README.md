# Holy Backend

The Holy backend is a REST API that stores and manages code review data, repositories, user preferences, and notifications. It provides complete control over stored data—inspect, export, delete, or revoke at any time.

**What the backend does:**
- Stores users, repositories, reviews, issues, and preferences in PostgreSQL
- Provides REST endpoints for data access and management
- Handles data export in CSV/JSON formats
- Manages user privacy controls (delete/revoke)
- Fetches GitHub repository metadata via Octokit

**What the Shade Agent does (separate service):**
- Listens for GitHub webhook events (PRs, commits)
- Performs AI code reviews using Groq LLM
- Posts review comments directly on GitHub PRs
- Sends review data to this backend via POST /reviews
- Triggers NEAR bounty releases through the agent contract

## Backend Features

- REST API for review data management
- GitHub repository metadata ingestion
- Review storage with scoring, approval status, and suggestions
- Repository lookup by full name (owner/repo) or UUID
- User-owned memory: inspect/export/delete/revoke
- Data export pipeline (CSV, JSON)
- Notification storage and management

## Stack

- Node.js + Express (ESM)
- TypeScript
- Prisma + PostgreSQL
- Octokit (GitHub API)

## Data model (simplified)

- User → Repositories → Reviews → Issues
- User → Preferences
- Review → Notifications
- Repository: stores GitHub repo metadata with `fullName` (unique) for easy lookup
- Review: includes `approved` (boolean), `score` (0-100), `suggestions` (JSON array), and optional `commitSha`

## Architecture

```mermaid
flowchart TD
    subgraph ShadeAgent[Shade Agent - separate service]
        A[GitHub Webhook Listener]
        B[Groq LLM Reviewer]
        C[Post Comments to GitHub]
        D[Trigger NEAR Bounty Release]
    end

    subgraph Backend[Backend API]
        E[REST Endpoints]
        F[Prisma ORM]
        G[(PostgreSQL)]
    end

    subgraph GitHub
        H[Pull Requests]
    end

    subgraph Users
        I[Inspect/Export/Delete Data]
    end

    H -->|Webhook Events| A
    A --> B
    B --> C
    B -->|POST /reviews| E
    B --> D
    E --> F
    F --> G
    I -->|API Calls| E
    E -->|GET /repos/:user| H
```

The backend is a stateless API layer. The Shade Agent is a separate service that sends review data to the backend after performing analysis.

## Endpoints

### Users
- POST /users — Create user
- GET /users/:id — Get user by ID
- PUT /users/:id — Update user
- DELETE /users/:id — Delete user and all data

### Repositories
- GET /repos/:user — Get user's GitHub repos
- POST /repos — Register repository
- GET /repos — List repositories

### Reviews
- POST /reviews — Submit review (accepts `repoFullName` or `repoId`)
- GET /reviews/:repoId — Get reviews for repository
- GET /reviews — Query reviews by userId
- DELETE /reviews/:id — Delete review

### Issues
- POST /issues — Create issue
- GET /issues — Query issues by userId or reviewId
- DELETE /issues/:id — Delete issue

### Preferences
- POST /preferences — Set repository preferences
- GET /preferences — Get preferences by userId or repoId
- DELETE /preferences/:id — Delete preferences

### Notifications
- POST /notifications — Create notification
- GET /notifications — Query notifications by userId
- PUT /notifications/:id — Update notification status

### Memory (export)
- GET /export/reviews?userId=&format=csv|json
- GET /export/issues?userId=&format=csv|json
- GET /export/preferences?userId=&format=csv|json

## Example

POST /reviews

The backend accepts reviews from the Shade Agent with repository lookup by full name:

```json
{
	"repoFullName": "owner/repo",
	"commitSha": "abc123",
	"prNumber": 42,
	"summary": "Code looks good with minor suggestions.",
	"approved": true,
	"score": 85,
	"suggestions": [
		"Consider adding error handling in line 42",
		"Add unit tests for the new function"
	],
	"issues": [
		{ "title": "Missing error handling", "details": "Function may throw unhandled exception", "severity": "medium" }
	],
	"source": "shade-agent",
	"agent": "holy-groq-reviewer"
}
```

Alternatively, use `repoId` instead of `repoFullName` if you have the UUID.

## Setup

### Requirements
- Node.js 18+
- PostgreSQL

### Environment
Create a .env file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/holy
GITHUB_TOKEN=your_github_token
PORT=3000
```

### Install
```
npm install
```

### Prisma
```
./node_modules/.bin/prisma generate
```

### Run
```
npm run dev
```


## Privacy
Memory can be inspected, exported, deleted, and revoked. Revocation prevents future storage and clears existing data for the user.