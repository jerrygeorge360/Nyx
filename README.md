# Nyx

Autonomous code review bounty platform with:
- **Backend API** (Node.js/TypeScript, Prisma)
- **Shade Agent** (NEAR Shade Agent Framework) for GitHub review + NEAR bounty payouts

## Repository Structure

- backend/ — API server and data store
- shadeagent/shade-agent-v2/ — Shade agent + agent contract
- frontend/ — placeholder (Next.js)

## Backend

The backend is the primary API and data layer. It stores users, repositories, reviews, issues, preferences, and notifications, and provides endpoints for managing and exporting that data.

## Shade Agent

The Shade Agent listens for GitHub pull request events, performs automated reviews, posts review comments, and triggers NEAR bounty payouts through the agent contract.

## Agent Contract

The agent contract holds bounty funds, tracks repo maintainers, and enforces permissions for funding, releasing, and withdrawing bounties.
