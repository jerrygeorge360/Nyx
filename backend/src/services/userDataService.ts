import type { Prisma } from "@prisma/client";
import { Prisma as PrismaNamespace } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../utils/httpError.js";

const ensureUserExists = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return user;
};

export type UserReview = Prisma.ReviewGetPayload<{
  include: { repository: true; issuesList: true };
}>;

export type UserIssue = Prisma.IssueGetPayload<{
  include: { repository: true; review: true };
}>;

export type UserPreference = Prisma.PreferenceGetPayload<{
  include: { repository: true };
}>;

export const listUserRepos = async (userId: string) => {
  await ensureUserExists(userId);
  return prisma.repository.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });
};

export const listUserReviews = async (userId: string): Promise<UserReview[]> => {
  await ensureUserExists(userId);
  return prisma.review.findMany({
    where: { repository: { ownerId: userId } },
    include: { repository: true, issuesList: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listUserIssues = async (userId: string): Promise<UserIssue[]> => {
  await ensureUserExists(userId);
  return prisma.issue.findMany({
    where: { repository: { ownerId: userId } },
    include: { repository: true, review: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listUserPreferences = async (userId: string): Promise<UserPreference[]> => {
  await ensureUserExists(userId);
  return prisma.preference.findMany({
    where: { userId },
    include: { repository: true },
    orderBy: { updatedAt: "desc" },
  });
};

export const listUserNotifications = async (userId: string) => {
  await ensureUserExists(userId);
  return prisma.notification.findMany({
    where: { review: { repository: { ownerId: userId } } },
    include: { review: true },
    orderBy: { createdAt: "desc" },
  });
};

const handleDeleteNotFound = (error: unknown, message: string) => {
  if (error instanceof PrismaNamespace.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new HttpError(404, message);
    }
  }
  throw error;
};

export const deleteReviewById = async (reviewId: string) => {
  try {
    return await prisma.review.delete({ where: { id: reviewId } });
  } catch (error) {
    handleDeleteNotFound(error, "Review not found");
  }
};

export const deleteIssueById = async (issueId: string) => {
  try {
    return await prisma.issue.delete({ where: { id: issueId } });
  } catch (error) {
    handleDeleteNotFound(error, "Issue not found");
  }
};

export const deletePreferenceByRepoId = async (repoId: string) => {
  try {
    return await prisma.preference.delete({ where: { repoId } });
  } catch (error) {
    handleDeleteNotFound(error, "Preference not found");
  }
};

export const deleteRepoById = async (repoId: string) => {
  try {
    return await prisma.repository.delete({ where: { id: repoId } });
  } catch (error) {
    handleDeleteNotFound(error, "Repository not found");
  }
};

export const deleteUserById = async (userId: string) => {
  try {
    await ensureUserExists(userId);
    await prisma.$transaction([
      prisma.notification.deleteMany({
        where: { review: { repository: { ownerId: userId } } },
      }),
      prisma.issue.deleteMany({ where: { repository: { ownerId: userId } } }),
      prisma.review.deleteMany({ where: { repository: { ownerId: userId } } }),
      prisma.preference.deleteMany({ where: { userId } }),
      prisma.repository.deleteMany({ where: { ownerId: userId } }),
      prisma.user.update({
        where: { id: userId },
        data: { memoryRevokedAt: new Date() },
      }),
    ]);
    return { id: userId };
  } catch (error) {
    handleDeleteNotFound(error, "User not found");
  }
};
