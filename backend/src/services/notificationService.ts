import type { Notification, NotificationType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export interface NotificationInput {
  reviewId: string;
  type: NotificationType;
  sent?: boolean;
}

export const createNotification = async (
  input: NotificationInput
): Promise<Notification> => {
  return prisma.notification.create({
    data: {
      reviewId: input.reviewId,
      type: input.type,
      sent: input.sent ?? false,
    },
  });
};

export const getNotificationsByReview = async (
  reviewId: string
): Promise<Notification[]> => {
  return prisma.notification.findMany({
    where: { reviewId },
    orderBy: { createdAt: "desc" },
  });
};
