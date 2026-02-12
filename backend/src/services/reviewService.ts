import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../utils/httpError.js";

export interface IssueInput {
  title: string;
  details?: string;
  severity?: string;
  source?: string;
}

export interface ReviewInput {
  repoId: string;
  commitSha: string;
  prNumber?: number;
  summary: string;
  issues: Prisma.JsonValue;
  source?: string;
  agent?: string;
  issuesList: IssueInput[];
}

export type ReviewWithIssues = Prisma.ReviewGetPayload<{
  include: { issuesList: true; repository: true };
}>;

const ensureRepoExists = async (repoId: string) => {
  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    include: { owner: true },
  });
  if (!repo) {
    throw new HttpError(404, "Repository not found");
  }
  if (repo.owner.memoryRevokedAt) {
    throw new HttpError(403, "User has revoked memory storage");
  }
  return repo;
};

export const addReview = async (input: ReviewInput): Promise<ReviewWithIssues> => {
  await ensureRepoExists(input.repoId);

  const [review] = await prisma.$transaction([
    prisma.review.create({
      data: {
        repoId: input.repoId,
        commitSha: input.commitSha,
        prNumber: input.prNumber ?? null,
        summary: input.summary,
        issues: (input.issues ?? []) as Prisma.InputJsonValue,
        source: input.source ?? null,
        agent: input.agent ?? null,
      },
    }),
  ]);

  if (input.issuesList.length > 0) {
    await prisma.issue.createMany({
      data: input.issuesList.map((issue) => ({
        repoId: input.repoId,
        reviewId: review.id,
        commitSha: input.commitSha,
        title: issue.title,
        details: issue.details ?? null,
        severity: issue.severity ?? null,
        source: issue.source ?? null,
      })),
    });
  }

  return prisma.review.findUniqueOrThrow({
    where: { id: review.id },
    include: { issuesList: true, repository: true },
  });
};

export const getReviewsByRepo = async (repoId: string): Promise<ReviewWithIssues[]> => {
  return prisma.review.findMany({
    where: { repoId },
    include: { issuesList: true, repository: true },
    orderBy: { createdAt: "desc" },
  });
};
