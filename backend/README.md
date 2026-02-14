# Holy

Holy is a backend for GitHub‑connected AI code reviews. It pulls repo metadata, stores review output with clear provenance (commit SHA, timestamps, source/agent), and gives users control over their stored memory—inspect, export, delete, or revoke at any time. Future plan: connect to the NEAR Shade Agent, which will act as the AI reviewer.

## Highlights

- GitHub repo ingestion and storage
- AI review storage with issues and provenance
- User-owned memory: inspect/export/delete/revoke
- Notifications pipeline (Slack, email, GitHub comments)

## Stack

- Node.js + Express (ESM)
- TypeScript
- Prisma + PostgreSQL
- Octokit (GitHub API)

## Data model (simplified)

- User → Repositories → Reviews → Issues
- User → Preferences
- Review → Notifications

## Architecture

```mermaid
flowchart TD
    subgraph GitHub
        A[GitHub Repo/PR]
    end

    subgraph ShadeAgent
        B[Monitor PRs & Commits]
        C[Run AI Code Review]
        D[Post Comments on PR]
        E[Send Review Results to Backend]
    end

    subgraph Backend
        F[API Endpoints]
        G[Prisma DB: Reviews, Repos, Notifications]
    end

    subgraph User
        H[Inspect/Export/Delete Memory]
    end

    A -->|Events / Commits| B
    B --> C
    C --> D
    C --> E
    E --> F
    F --> G
    H --> F
```

## Endpoints

### GitHub
- GET /repos/:user

### Reviews
- POST /reviews
- GET /reviews/:repoId

### Memory (inspect)
- GET /reviews?userId=
- GET /issues?userId=
- GET /preferences?userId=
- GET /notifications?userId=

### Memory (export)
- GET /export/reviews?userId=&format=csv|json
- GET /export/issues?userId=&format=csv|json
- GET /export/preferences?userId=&format=csv|json

### Memory (delete/revoke)
- DELETE /reviews/:reviewId
- DELETE /issues/:issueId
- DELETE /preferences/:repoId
- DELETE /user/:userId

## Example

POST /reviews

```
{
	"repoId": "<repo-uuid>",
	"commitSha": "abc123",
	"prNumber": 42,
	"summary": "Found missing null checks.",
	"issues": [
		{ "title": "Null check missing", "details": "user is undefined", "severity": "high" }
	],
	"source": "ci-bot",
    "agent": "holy-ai"
}
```

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