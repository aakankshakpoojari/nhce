/**
 * @file notification.controller.ts
 * @description Read + mark-read endpoints for the authenticated user's in-app
 * notifications. Writes happen in notification.service.ts off the back of job /
 * application events.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/db.config';
import { toNotificationDTO } from '../services/notification.service';

const MAX_PAGE = 50;

export class NotificationController {
  /** GET /api/notifications — newest first, plus the unread count. */
  public async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const [rows, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId: req.user.id },
          orderBy: { createdAt: 'desc' },
          take: MAX_PAGE,
        }),
        prisma.notification.count({ where: { userId: req.user.id, readAt: null } }),
      ]);

      res.json({ notifications: rows.map(toNotificationDTO), unreadCount });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch notifications', message: error.message });
    }
  }

  /** POST /api/notifications/:id/read — mark one as read (caller must own it). */
  public async markRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const id = String(req.params.id);
      const result = await prisma.notification.updateMany({
        where: { id, userId: req.user.id, readAt: null },
        data: { readAt: new Date() },
      });
      res.json({ updated: result.count });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update notification', message: error.message });
    }
  }

  /** POST /api/notifications/read-all — mark every unread notification read. */
  public async markAllRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const result = await prisma.notification.updateMany({
        where: { userId: req.user.id, readAt: null },
        data: { readAt: new Date() },
      });
      res.json({ updated: result.count });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update notifications', message: error.message });
    }
  }
}

export const notificationController = new NotificationController();
