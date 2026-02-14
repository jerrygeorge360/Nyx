import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { addReview, getReviewsByRepo } from "../services/reviewService.js";
import type { IssueInput, ReviewInput } from "../services/reviewService.js";
import { HttpError } from "../utils/httpError.js";

interface CreateReviewBody {
  repoId?: string;
  repoFullName?: string;
  commitSha?: string;
  prNumber?: number;
  summary: string;
  approved?: boolean;
  score?: number;
  issues: unknown[];
  suggestions?: unknown[];
  source?: string;
  agent?: string;
}

interface CreateReviewResponse {
  review: Awaited<ReturnType<typeof addReview>>;
}

interface GetReviewsParams {
  repoId: string;
}

interface GetReviewsResponse {
  repoId: string;
  reviews: Awaited<ReturnType<typeof getReviewsByRepo>>;
}

export const createReview = async (
  req: Request<Record<string, never>, CreateReviewResponse, CreateReviewBody>,
  res: Response<CreateReviewResponse>
) => {
  const {
    repoId,
    repoFullName,
    commitSha,
    prNumber,
    summary,
    approved,
    score,
    issues,
    suggestions,
    source,
    agent,
  } = req.body;

  if ((!repoId && !repoFullName) || !summary) {
    throw new HttpError(400, "repoId or repoFullName and summary are required");
  }

  if (!Array.isArray(issues)) {
    throw new HttpError(400, "issues must be an array");
  }

  if (suggestions !== undefined && !Array.isArray(suggestions)) {
    throw new HttpError(400, "suggestions must be an array");
  }

  const normalizedIssues: IssueInput[] = issues.map((issue) => {
    if (typeof issue === "string") {
      return { title: issue };
    }
    if (issue && typeof issue === "object") {
      const issueObj = issue as Record<string, unknown>;
      const title = typeof issueObj.title === "string" ? issueObj.title : "Untitled issue";
      const details = typeof issueObj.details === "string" ? issueObj.details : undefined;
      const severity = typeof issueObj.severity === "string" ? issueObj.severity : undefined;
      const issueSource = typeof issueObj.source === "string" ? issueObj.source : undefined;
      return {
        title,
        ...(details !== undefined ? { details } : {}),
        ...(severity !== undefined ? { severity } : {}),
        ...(issueSource !== undefined ? { source: issueSource } : {}),
      };
    }
    return { title: "Untitled issue" };
  });

  const reviewInput: ReviewInput = {
    ...(repoId ? { repoId } : {}),
    ...(repoFullName ? { repoFullName } : {}),
    ...(commitSha !== undefined ? { commitSha } : {}),
    summary,
    ...(approved !== undefined ? { approved } : {}),
    ...(score !== undefined ? { score } : {}),
    issues: issues as Prisma.JsonArray,
    ...(suggestions !== undefined ? { suggestions: suggestions as Prisma.JsonArray } : {}),
    issuesList: normalizedIssues,
    ...(prNumber !== undefined ? { prNumber } : {}),
    ...(source !== undefined ? { source } : {}),
    ...(agent !== undefined ? { agent } : {}),
  };

  const review = await addReview(reviewInput);

  res.status(201).json({ review });
};

export const listReviews = async (
  req: Request<GetReviewsParams, GetReviewsResponse>,
  res: Response<GetReviewsResponse>
) => {
  const { repoId } = req.params;

  if (!repoId) {
    throw new HttpError(400, "repoId is required");
  }

  const reviews = await getReviewsByRepo(repoId);

  res.status(200).json({ repoId, reviews });
};
