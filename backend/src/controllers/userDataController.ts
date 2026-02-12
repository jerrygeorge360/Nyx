import type { Request, Response } from "express";
import type { Repository } from "@prisma/client";
import {
  deleteRepoById,
  deleteIssueById,
  deletePreferenceByRepoId,
  deleteReviewById,
  deleteUserById,
  listUserIssues,
  listUserNotifications,
  listUserPreferences,
  listUserRepos,
  listUserReviews,
} from "../services/userDataService.js";
import { HttpError } from "../utils/httpError.js";
import { toCsv } from "../utils/exportUtils.js";

interface UserQuery {
  userId?: string;
  format?: "json" | "csv";
}

interface RepoIdParams {
  repoId: string;
}

interface IssueIdParams {
  issueId: string;
}

interface ReviewIdParams {
  reviewId: string;
}

interface UserIdParams {
  userId: string;
}

interface ReposResponse {
  repos: Repository[];
}

interface ReviewsResponse {
  reviews: Awaited<ReturnType<typeof listUserReviews>>;
}

interface IssuesResponse {
  issues: Awaited<ReturnType<typeof listUserIssues>>;
}

interface PreferencesResponse {
  preferences: Awaited<ReturnType<typeof listUserPreferences>>;
}

interface NotificationsResponse {
  notifications: Awaited<ReturnType<typeof listUserNotifications>>;
}

interface DeleteResponse {
  success: true;
}

const getUserIdFromQuery = (query: UserQuery) => {
  if (!query.userId) {
    throw new HttpError(400, "userId query parameter is required");
  }
  return query.userId;
};

const resolveFormat = (format?: string) => {
  if (!format) return "json";
  if (format === "json" || format === "csv") return format;
  throw new HttpError(400, "format must be 'json' or 'csv'");
};

export const inspectRepos = async (
  req: Request<Record<string, never>, ReposResponse, Record<string, never>, UserQuery>,
  res: Response<ReposResponse>
) => {
  const userId = getUserIdFromQuery(req.query);
  const repos = await listUserRepos(userId);
  res.status(200).json({ repos });
};

export const inspectReviews = async (
  req: Request<Record<string, never>, ReviewsResponse, Record<string, never>, UserQuery>,
  res: Response<ReviewsResponse>
) => {
  const userId = getUserIdFromQuery(req.query);
  const reviews = await listUserReviews(userId);
  res.status(200).json({ reviews });
};

export const inspectIssues = async (
  req: Request<Record<string, never>, IssuesResponse, Record<string, never>, UserQuery>,
  res: Response<IssuesResponse>
) => {
  const userId = getUserIdFromQuery(req.query);
  const issues = await listUserIssues(userId);
  res.status(200).json({ issues });
};

export const inspectPreferences = async (
  req: Request<Record<string, never>, PreferencesResponse, Record<string, never>, UserQuery>,
  res: Response<PreferencesResponse>
) => {
  const userId = getUserIdFromQuery(req.query);
  const preferences = await listUserPreferences(userId);
  res.status(200).json({ preferences });
};

export const inspectNotifications = async (
  req: Request<Record<string, never>, NotificationsResponse, Record<string, never>, UserQuery>,
  res: Response<NotificationsResponse>
) => {
  const userId = getUserIdFromQuery(req.query);
  const notifications = await listUserNotifications(userId);
  res.status(200).json({ notifications });
};

export const exportRepos = async (
  req: Request<Record<string, never>, unknown, Record<string, never>, UserQuery>,
  res: Response
) => {
  const userId = getUserIdFromQuery(req.query);
  const format = resolveFormat(req.query.format);
  const repos = await listUserRepos(userId);

  if (format === "csv") {
    const rows = repos.map((repo) => ({
      id: repo.id,
      githubId: repo.githubId,
      name: repo.name,
      url: repo.url,
      ownerId: repo.ownerId,
      createdAt: repo.createdAt.toISOString(),
    }));
    const csv = toCsv(rows, ["id", "githubId", "name", "url", "ownerId", "createdAt"]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=repos.csv");
    res.status(200).send(csv);
    return;
  }

  res.status(200).json({ repos });
};

export const exportReviews = async (
  req: Request<Record<string, never>, unknown, Record<string, never>, UserQuery>,
  res: Response
) => {
  const userId = getUserIdFromQuery(req.query);
  const format = resolveFormat(req.query.format);
  const reviews = await listUserReviews(userId);

  if (format === "csv") {
    const rows = reviews.map((review) => ({
      id: review.id,
      repoId: review.repoId,
      commitSha: review.commitSha,
      prNumber: review.prNumber ?? "",
      summary: review.summary,
      issues: review.issues,
      source: review.source ?? "",
      agent: review.agent ?? "",
      createdAt: review.createdAt.toISOString(),
    }));
    const csv = toCsv(rows, [
      "id",
      "repoId",
      "commitSha",
      "prNumber",
      "summary",
      "issues",
      "source",
      "agent",
      "createdAt",
    ]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=reviews.csv");
    res.status(200).send(csv);
    return;
  }

  res.status(200).json({ reviews });
};

export const exportIssues = async (
  req: Request<Record<string, never>, unknown, Record<string, never>, UserQuery>,
  res: Response
) => {
  const userId = getUserIdFromQuery(req.query);
  const format = resolveFormat(req.query.format);
  const issues = await listUserIssues(userId);

  if (format === "csv") {
    const rows = issues.map((issue) => ({
      id: issue.id,
      repoId: issue.repoId,
      reviewId: issue.reviewId,
      commitSha: issue.commitSha,
      title: issue.title,
      details: issue.details ?? "",
      severity: issue.severity ?? "",
      source: issue.source ?? "",
      createdAt: issue.createdAt.toISOString(),
    }));
    const csv = toCsv(rows, [
      "id",
      "repoId",
      "reviewId",
      "commitSha",
      "title",
      "details",
      "severity",
      "source",
      "createdAt",
    ]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=issues.csv");
    res.status(200).send(csv);
    return;
  }

  res.status(200).json({ issues });
};

export const exportPreferences = async (
  req: Request<Record<string, never>, unknown, Record<string, never>, UserQuery>,
  res: Response
) => {
  const userId = getUserIdFromQuery(req.query);
  const format = resolveFormat(req.query.format);
  const preferences = await listUserPreferences(userId);

  if (format === "csv") {
    const rows = preferences.map((pref) => ({
      id: pref.id,
      repoId: pref.repoId,
      userId: pref.userId,
      settings: pref.settings,
      reason: pref.reason ?? "",
      source: pref.source ?? "",
      createdAt: pref.createdAt.toISOString(),
      updatedAt: pref.updatedAt.toISOString(),
    }));
    const csv = toCsv(rows, [
      "id",
      "repoId",
      "userId",
      "settings",
      "reason",
      "source",
      "createdAt",
      "updatedAt",
    ]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=preferences.csv");
    res.status(200).send(csv);
    return;
  }

  res.status(200).json({ preferences });
};

export const removeReview = async (
  req: Request<ReviewIdParams, DeleteResponse>,
  res: Response<DeleteResponse>
) => {
  await deleteReviewById(req.params.reviewId);
  res.status(204).json({ success: true });
};

export const removeIssue = async (
  req: Request<IssueIdParams, DeleteResponse>,
  res: Response<DeleteResponse>
) => {
  await deleteIssueById(req.params.issueId);
  res.status(204).json({ success: true });
};

export const removePreference = async (
  req: Request<RepoIdParams, DeleteResponse>,
  res: Response<DeleteResponse>
) => {
  await deletePreferenceByRepoId(req.params.repoId);
  res.status(204).json({ success: true });
};

export const removeRepo = async (
  req: Request<RepoIdParams, DeleteResponse>,
  res: Response<DeleteResponse>
) => {
  await deleteRepoById(req.params.repoId);
  res.status(204).json({ success: true });
};

export const removeUser = async (
  req: Request<UserIdParams, DeleteResponse>,
  res: Response<DeleteResponse>
) => {
  await deleteUserById(req.params.userId);
  res.status(204).json({ success: true });
};
