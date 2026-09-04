/**
 * @file notification.service.ts
 * @description Creates in-app notifications and pushes them to the recipient in
 * real time over the existing Socket.IO `user:<id>` room. Every write is
 * best-effort — a failure here must never break the action that triggered it.
 */

import { NotificationType } from '@prisma/client';
import { prisma } from '../config/db.config';
import { emitToUser } from '../realtime/socket';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  jobId?: string | null;
  link?: string | null;
}

export function toNotificationDTO(n: {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  jobId: string | null;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    jobId: n.jobId,
    link: n.link,
    read: Boolean(n.readAt),
    createdAt: n.createdAt,
  };
}

/** Insert one notification and emit `notification:new` to that user. */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    const row = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        jobId: input.jobId ?? null,
        link: input.link ?? null,
      },
    });
    emitToUser(input.userId, 'notification:new', { notification: toNotificationDTO(row) });
  } catch (err: any) {
    console.error('[notifications] failed to create notification:', err?.message || err);
  }
}

/** Fan a single notification payload out to many recipients (deduped). */
export async function createNotifications(
  userIds: string[],
  build: (userId: string) => Omit<CreateNotificationInput, 'userId'>
): Promise<void> {
  const unique = Array.from(new Set(userIds));
  await Promise.all(unique.map((userId) => createNotification({ userId, ...build(userId) })));
}
